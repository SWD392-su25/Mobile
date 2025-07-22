// In components/EventRow.js
import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import uploadFile from "../utils/file";

const API_BASE_URL = "http://103.90.227.51:8080/api";
const { width: screenWidth } = Dimensions.get("window");

const EventRow = ({ registration, onUpdate }) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [viewerState, setViewerState] = useState({ visible: false, index: 0 });

  const [cameraPermission, requestPermission] = useCameraPermissions();

  // (API call functions remain unchanged and are correct)
  const handleCheckIn = useCallback(
    async (eventId, accountId) => {
      setIsCheckingIn(true);
      setScanError("");
      try {
        const url = `${API_BASE_URL}/register-event/check-in?accountId=${accountId}&eventId=${eventId}`;
        const response = await axios.patch(url);
        onUpdate(response.data);
      } catch (error) {
        setScanError(
          error.response?.data?.message || "Check-in request failed."
        );
      } finally {
        setIsCheckingIn(false);
        setIsScanning(false);
      }
    },
    [onUpdate]
  );

  const handleScanSuccess = useCallback(
    ({ data: decodedText }) => {
      if (isCheckingIn) return;
      try {
        const match = decodedText.match(/id=(\d+)/);
        const scannedEventId = match ? parseInt(match[1], 10) : null;
        if (scannedEventId === registration.event.id) {
          handleCheckIn(registration.event.id, registration.account.id);
        } else {
          setScanError(
            `Incorrect Event QR. Expected code for "${registration.event.name}".`
          );
        }
      } catch (error) {
        setScanError("Invalid QR Code format.");
      }
      setTimeout(() => setScanError(""), 5000);
    },
    [registration, handleCheckIn, isCheckingIn]
  );

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to upload proofs."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    setIsUploading(true);
    try {
      const downloadURL = await uploadFile(result.assets[0], "event-proofs");
      const newImages = [...(registration.images || []), downloadURL];
      const response = await axios.patch(
        `${API_BASE_URL}/register-event/${registration.id}/images`,
        { imageUrls: newImages }
      );
      onUpdate(response.data);
      Alert.alert("Success", "Your proof has been uploaded!");
    } catch (error) {
      Alert.alert(
        "Upload Failed",
        error.response?.data?.message || "File upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const startScanning = async () => {
    if (!cameraPermission?.granted) {
      const { status } = await requestPermission();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to scan QR codes."
        );
        return;
      }
    }
    setIsScanning(true);
  };

  const openImageViewer = (index) => setViewerState({ visible: true, index });
  const closeImageViewer = () => setViewerState({ visible: false, index: 0 });

  const isCheckedIn = !!registration.checkInTime;
  const hasProofImages = registration.images && registration.images.length > 0;

  return (
    <View style={styles.container}>
      {/* --- Full-Screen Swipeable Image Gallery Modal (Unchanged) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={viewerState.visible}
        onRequestClose={closeImageViewer}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeImageViewer}
          >
            <MaterialIcons name="close" size={32} color="white" />
          </TouchableOpacity>
          <FlatList
            data={registration.images}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerState.index}
          />
        </View>
      </Modal>

      {/* --- Top Section: Event Info (Always Visible) --- */}
      <View style={styles.mainContent}>
        <Image
          source={{
            uri: registration.event?.image || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.eventName}>{registration.event?.name}</Text>
          <View style={styles.chipContainer}>
            <Chip icon="person" text={registration.account?.fullName} />
            <Chip
              icon="event"
              text={`Date: ${new Date(registration.event?.startTime).toLocaleDateString()}`}
            />
            <Chip
              icon={isCheckedIn ? "check-circle" : "hourglass-empty"}
              text={
                isCheckedIn
                  ? "Checked-In"
                  : registration.event.status.replace("_", " ")
              }
              color={isCheckedIn ? "#4CAF50" : "#2196F3"}
            />
          </View>
        </View>
      </View>

      {/* --- NEW: Conditional Proofs Carousel Section --- */}
      {hasProofImages && (
        <View style={styles.proofsSection}>
          <Text style={styles.proofsHeader}>My Submitted Proofs</Text>
          <FlatList
            data={registration.images}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => openImageViewer(index)}>
                <Image source={{ uri: item }} style={styles.thumbnail} />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* --- Bottom Section: Action Buttons --- */}
      <View style={styles.actionsContainer}>
        {isCheckedIn ? (
          <Text style={styles.checkedInText}>Check-In Complete</Text>
        ) : registration.event?.status === "IN_PROGRESS" ? (
          <ActionButton
            title="Check In"
            icon="qr-code-scanner"
            onPress={startScanning}
            loading={isCheckingIn}
            disabled={isCheckingIn}
          />
        ) : (
          <Chip text="Event Not In Progress" color="#757575" />
        )}
        <ActionButton
          title={hasProofImages ? "Add Proof" : "Upload Proof"}
          icon="file-upload"
          onPress={handleImageUpload}
          loading={isUploading}
          //   disabled={isUploading || isCheckedIn}
          style={{ marginLeft: 10 }}
        />
      </View>

      {scanError && <Text style={styles.errorText}>{scanError}</Text>}

      {/* --- Inline QR Scanner --- */}
      {isScanning && (
        <View style={styles.scannerWrapper}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={isCheckingIn ? undefined : handleScanSuccess}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <TouchableOpacity
            style={styles.cancelScanButton}
            onPress={() => setIsScanning(false)}
          >
            <Text style={styles.cancelScanText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// --- Helper Components (Unchanged) ---
const Chip = ({ icon, text, color = "#757575" }) => (
  <View style={[styles.chip, { borderColor: color }]}>
    {icon && <MaterialIcons name={icon} size={14} color={color} />}
    <Text style={[styles.chipText, { color }]}>{text}</Text>
  </View>
);
const ActionButton = ({ title, icon, onPress, loading, disabled, style }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.buttonDisabled, style]}
    onPress={onPress}
    disabled={disabled}
  >
    {loading ? (
      <ActivityIndicator size="small" color="#FFF" />
    ) : (
      <>
        <MaterialIcons name={icon} size={16} color="#FFF" />
        <Text style={styles.buttonText}>{title}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  mainContent: { flexDirection: "row" },
  avatar: { width: 64, height: 64, borderRadius: 8, marginRight: 15 },
  textContainer: { flex: 1, justifyContent: "center" },
  eventName: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { fontSize: 12, marginLeft: 4, fontWeight: "500" },
  // Styles for the new proofs section
  proofsSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
  proofsHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  thumbnail: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  // Styles for actions and scanner
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E90FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonDisabled: { backgroundColor: "#A9A9A9" },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  checkedInText: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontStyle: "italic",
    flex: 1,
  },
  scannerWrapper: { marginTop: 15, alignItems: "center" },
  camera: { width: "100%", height: 250, borderRadius: 8 },
  cancelScanButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  cancelScanText: { color: "white", fontWeight: "bold" },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
  },
  // Styles for the image viewer modal
  modalContainer: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.9)" },
  modalImage: { width: screenWidth, height: "100%" },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
});

export default memo(EventRow);
