import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_BASE_URL = 'http://103.90.227.51:8080/api';

// --- Helper & UI Components ---

const WalletSummary = ({ wallet, onScanPress, onAddMoneyPress }) => (
  <LinearGradient
    colors={['#2196F3', '#21CBF3']}
    style={styles.walletCard}
  >
    <View style={styles.walletHeader}>
      <View>
        <Text style={styles.walletTitle}>My Wallet</Text>
        <Text style={styles.walletBalance}>
          ${(wallet?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <FontAwesome name="money" size={48} color="rgba(255, 255, 255, 0.5)" />
    </View>
    <View style={styles.walletActions}>
        <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
            <MaterialIcons name="qr-code-scanner" size={20} color="white" />
            <Text style={styles.scanButtonText}>Scan to Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.scanButton, {marginLeft: 10}]} onPress={onAddMoneyPress}>
            <MaterialIcons name="add-card" size={20} color="white" />
            <Text style={styles.scanButtonText}>Add Money</Text>
        </TouchableOpacity>
    </View>
  </LinearGradient>
);

const ProfileDetails = ({ user }) => {
  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
      <MaterialIcons name={icon} size={24} color="#555" style={{ marginRight: 15 }} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "Not provided"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.avatarText}>{user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}</Text>
        </View>
        <View>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{user.role}</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <DetailRow icon="email" label="Email Address" value={user.email} />
      <View style={styles.divider} />
      <DetailRow icon="phone" label="Phone Number" value={user.phone} />
      <View style={styles.divider} />
      <DetailRow icon="person" label="Gender" value={user.gender} />
      <TouchableOpacity style={styles.editButton}>
        <MaterialIcons name="edit" size={20} color="white" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const TransactionHistory = ({ transactions }) => {
    const TransactionItem = ({ item }) => {
        const isDeposit = item.type === "DEPOSIT";
        const style = {
          icon: isDeposit ? 'arrow-upward' : 'arrow-downward',
          color: isDeposit ? '#4CAF50' : '#D32F2F',
          bgColor: isDeposit ? '#E8F5E9' : '#FFEBEE',
          sign: isDeposit ? '+' : '-',
        };
        return (
          <View style={styles.txItem}>
            <View style={[styles.txAvatar, { backgroundColor: style.bgColor }]}>
              <MaterialIcons name={style.icon} size={24} color={style.color} />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>{isDeposit ? "Funds Deposited" : "Purchase"}</Text>
              <Text style={styles.txSubtitle}>{`${new Date(item.createdAt).toLocaleDateString()} - ID: ${item.id}`}</Text>
            </View>
            <Text style={[styles.txAmount, { color: style.color }]}>
              {`${style.sign}$${Math.abs(item.amount).toFixed(2)}`}
            </Text>
          </View>
        );
    };
    return (
        <View style={styles.txCard}>
          <View style={styles.txCardHeader}>
            <MaterialIcons name="receipt-long" size={24} color="#555" />
            <Text style={styles.txCardTitle}>Transaction History</Text>
          </View>
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={TransactionItem}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noTxText}>No transactions found yet.</Text>
          )}
        </View>
    );
};

const PaymentModal = ({ open, onClose, currentUserId, onSuccess }) => {
    const [view, setView] = useState('options');
    const [isTransferring, setIsTransferring] = useState(false);
    const [error, setError] = useState('');
    const [storeInfo, setStoreInfo] = useState(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [cameraPermission, requestPermission] = useCameraPermissions();
    useEffect(() => {
        if (open) { setView('options'); setStoreInfo(null); setError(''); setIsTransferring(false); setTransferAmount(''); }
    }, [open]);
    const startScanning = async () => {
        if (!cameraPermission?.granted) {
            const { status } = await requestPermission();
            if (status !== 'granted') { Alert.alert('Permission Required', 'Camera access is needed to scan QR codes.'); return; }
        }
        setView('scanning');
    };
    const handleScanSuccess = async ({ data: decodedText }) => {
        if (!decodedText || isTransferring) return;
        setView('loading');
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/stores/${decodedText}`);
            setStoreInfo(response.data);
            setView('transfer');
        } catch (err) {
            setError(`Store with ID "${decodedText}" not found. Please try again.`);
            setView('scanning');
        }
    };
    const handleFinalTransfer = async () => {
        if (isTransferring) return;
        setIsTransferring(true);
        setError("");
        const payload = { toWalletId: storeInfo.wallet.id, amount: parseFloat(transferAmount) };
        try {
            await axios.post(`${API_BASE_URL}/pay?currentUserId=${currentUserId}`, payload);
            Alert.alert('Success', `Successfully transferred $${transferAmount} to ${storeInfo.name}!`);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed. Please try again.');
        } finally {
            setIsTransferring(false);
        }
    };
    const getTitle = () => {
        if (view === 'transfer') return 'Confirm Transfer';
        if (view === 'scanning') return 'Scan Store QR Code';
        return 'Make a Payment';
    };
    return (
        <Modal visible={open} animationType="slide" transparent={true} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBackdrop}>
                <Pressable style={styles.pressableBackdrop} onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>{getTitle()}</Text><TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#555" /></TouchableOpacity></View>
                        <ScrollView>
                            {view === 'options' && (<TouchableOpacity style={styles.scanOptionButton} onPress={startScanning}><MaterialIcons name="qr-code-scanner" size={40} color="#1E90FF" /><Text style={styles.scanOptionText}>Scan with Camera</Text></TouchableOpacity>)}
                            {view === 'loading' && <ActivityIndicator size="large" color="#1E90FF" style={{ padding: 40 }} />}
                            {view === 'scanning' && (<><Text style={styles.modalErrorText}>{error}</Text><CameraView style={styles.camera} onBarcodeScanned={handleScanSuccess} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} /></>)}
                            {view === 'transfer' && storeInfo && (<View style={styles.transferContainer}><Text style={styles.transferLabel}>You are paying:</Text><View style={styles.storeInfoCard}><FontAwesome name="home" size={24} color="#1E90FF" /><View><Text style={styles.storeName}>{storeInfo.name}</Text><Text style={styles.storeDesc}>{storeInfo.description}</Text></View></View><Text style={styles.transferLabel}>Amount:</Text><TextInput style={styles.amountInput} placeholder="0.00" keyboardType="numeric" value={transferAmount} onChangeText={setTransferAmount} />{error && <Text style={styles.modalErrorText}>{error}</Text>}<TouchableOpacity style={[styles.confirmButton, (isTransferring || !transferAmount || parseFloat(transferAmount) <= 0) && styles.buttonDisabled]} onPress={handleFinalTransfer} disabled={isTransferring || !transferAmount || parseFloat(transferAmount) <= 0}>{isTransferring ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>{`Transfer $${parseFloat(transferAmount) || '0.00'}`}</Text>}</TouchableOpacity></View>)}
                        </ScrollView>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const AddMoneyModal = ({ open, onClose, currentUserId, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
      if (open) { setAmount(''); setError(''); setIsDepositing(false); }
    }, [open]);
    const handleDeposit = async () => {
      const money = parseFloat(amount);
      if (isNaN(money) || money <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount to deposit.'); return; }
      setIsDepositing(true);
      setError('');
      try {
        const url = `${API_BASE_URL}/add-money?currentUserId=${currentUserId}&money=${money}`;
        await axios.post(url);
        Alert.alert('Success', `Successfully added $${money.toFixed(2)} to your wallet!`);
        onSuccess();
        onClose();
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || 'Deposit failed. Please try again.');
      } finally {
        setIsDepositing(false);
      }
    };
    return (
      <Modal visible={open} animationType="slide" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBackdrop}>
            <Pressable style={styles.pressableBackdrop} onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}><Text style={styles.modalTitle}>Add Money to Wallet</Text><TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#555" /></TouchableOpacity></View>
                    <ScrollView>
                        <View style={styles.transferContainer}>
                            <Text style={styles.transferLabel}>Amount to Deposit:</Text>
                            <TextInput style={styles.amountInput} placeholder="100.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                            {error && <Text style={styles.modalErrorText}>{error}</Text>}
                            <TouchableOpacity style={[styles.confirmButton, (isDepositing || !amount || parseFloat(amount) <= 0) && styles.buttonDisabled]} onPress={handleDeposit} disabled={isDepositing || !amount || parseFloat(amount) <= 0}>
                                {isDepositing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>{`Deposit $${parseFloat(amount) || '0.00'}`}</Text>}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    );
};

// --- Main Profile Screen Component ---
export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const storedId = await SecureStore.getItemAsync("accountId");
      if (!storedId) {
        throw new Error("User not found. Please log in again.");
      }
      if (!currentUserId) setCurrentUserId(storedId);

      const response = await axios.get(`${API_BASE_URL}/account/${storedId}`);
      setProfileData(response.data);
    } catch (err) {
      setError(err.message || 'Could not load your profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      if (!profileData) {
          setLoading(true);
      }
      loadData();
    }, [loadData, profileData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const processedTransactions = React.useMemo(() => {
    if (!profileData?.wallet) return [];
    const sent = (profileData.wallet.sentTransactions || []).map((tx) => ({ ...tx, type: 'PURCHASE' }));
    const received = (profileData.wallet.receivedTransactions || []).map((tx) => ({ ...tx, type: 'DEPOSIT' }));
    return [...sent, ...received].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [profileData]);

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1E90FF" /></View>;
  }

  if (error && !profileData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.editButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { wallet, ...user } = profileData || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E90FF']}
            tintColor={'#1E90FF'}
          />
        }
      >
        <Text style={styles.pageTitle}>My Profile</Text>
        {profileData && (
          <>
            <WalletSummary
              wallet={wallet}
              onScanPress={() => setPaymentModalOpen(true)}
              onAddMoneyPress={() => setAddMoneyModalOpen(true)}
            />
            <ProfileDetails user={user} />
            <TransactionHistory transactions={processedTransactions} />
          </>
        )}
      </ScrollView>

      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        currentUserId={currentUserId}
        onSuccess={onRefresh}
      />
      <AddMoneyModal
        open={isAddMoneyModalOpen}
        onClose={() => setAddMoneyModalOpen(false)}
        currentUserId={currentUserId}
        onSuccess={onRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: { padding: 15, paddingBottom: 30 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#111' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  walletCard: { borderRadius: 16, padding: 20, marginBottom: 20, elevation: 5 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  walletTitle: { color: 'white', fontSize: 18, fontWeight: '600', opacity: 0.9 },
  walletBalance: { color: 'white', fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  walletActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  scanButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  scanButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  profileCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  profileName: { fontSize: 22, fontWeight: 'bold' },
  chip: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, alignSelf: 'flex-start', marginTop: 5 },
  chipText: { color: '#1E90FF', fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  detailLabel: { color: '#777', fontSize: 14 },
  detailValue: { color: '#000', fontSize: 16, fontWeight: '500' },
  editButton: { flexDirection: 'row', backgroundColor: '#1E90FF', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 8, marginTop: 15 },
  editButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  txCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  txCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  txCardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  txAvatar: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  txDetails: { flex: 1, marginLeft: 15 },
  txTitle: { fontSize: 16, fontWeight: '500' },
  txSubtitle: { fontSize: 12, color: '#777' },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  noTxText: { textAlign: 'center', color: 'gray', padding: 20 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  pressableBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  scanOptionButton: { height: 120, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#DDD', borderRadius: 8, borderStyle: 'dashed' },
  scanOptionText: { fontWeight: '500', marginTop: 8 },
  camera: { width: '100%', height: 250, borderRadius: 8, overflow: 'hidden' },
  modalErrorText: { color: 'red', textAlign: 'center', marginVertical: 10 },
  transferContainer: { padding: 10 },
  transferLabel: { color: 'gray', marginBottom: 5 },
  storeInfoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F8', padding: 15, borderRadius: 8, marginBottom: 15, gap: 15 },
  storeName: { fontSize: 18, fontWeight: 'bold' },
  storeDesc: { color: 'gray' },
  amountInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 15, fontSize: 20, marginBottom: 15 },
  confirmButton: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 8, alignItems: 'center' },
  confirmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  buttonDisabled: { backgroundColor: '#A9A9A9' },
});