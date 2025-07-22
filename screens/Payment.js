import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = 'http://103.90.227.51:8080/api'; 


const StoreDetailsCard = ({ storeInfo }) => (
  <View style={styles.card}>
    <View style={styles.avatar}>
      <MaterialIcons name="storefront" size={32} color="#1E90FF" />
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.storeName}>{storeInfo.name}</Text>
      <Text style={styles.storeDescription}>{storeInfo.description}</Text>
    </View>
  </View>
);

export default function PaymentScreen({ route }) {
  const { qrData } = route.params; // This is the store ID from the QR code
  const navigation = useNavigation();

  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const fetchStoreDetails = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${qrData}`);
      if (!response.ok) {
        throw new Error(`Store with ID "${qrData}" not found.`);
      }
      const data = await response.json();
      setStoreInfo(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch store details.');
    } finally {
      setLoading(false);
    }
  }, [qrData]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  const handleFinalTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to transfer.");
      return;
    }
    if (!storeInfo?.wallet?.id) {
        Alert.alert("Error", "The destination wallet is not available.");
        return;
    }

    setIsTransferring(true);
    setError('');

    const payload = {
      toWalletId: storeInfo.wallet.id,
      amount: amount,
    };

    try {
const CURRENT_USER_ID = await SecureStore.getItemAsync("accountId");
      const response = await fetch(`${API_BASE_URL}/pay?currentUserId=${CURRENT_USER_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Transfer failed.');
      }
      
      Alert.alert(
        "Success",
        `Successfully transferred $${amount.toFixed(2)} to ${storeInfo.name}!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Fetching Store Details...</Text>
      </View>
    );
  }

  if (error && !storeInfo) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="exclamation-triangle" size={48} color="orange" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchStoreDetails}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!storeInfo) {
    return null; // Should not happen if error handling is correct
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.headerTitle}>Confirm Transfer</Text>
            <Text style={styles.subtitle}>You are paying:</Text>
            
            <StoreDetailsCard storeInfo={storeInfo} />

            <Text style={styles.label}>Amount to Transfer</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={transferAmount}
                onChangeText={setTransferAmount}
                keyboardType="numeric"
                returnKeyType="done"
                />
            </View>

            {error && <Text style={styles.inlineErrorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, (isTransferring || !transferAmount) && styles.buttonDisabled]}
              onPress={handleFinalTransfer}
              disabled={isTransferring || !transferAmount}
            >
              {isTransferring ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                    Transfer ${parseFloat(transferAmount) > 0 ? parseFloat(transferAmount).toFixed(2) : '0.00'}
                </Text>
              )}
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F6F8',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  storeDescription: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gray',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  inlineErrorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  }
});