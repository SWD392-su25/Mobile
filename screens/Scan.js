import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function Wallet() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); 

  const [scanned, setScanned] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarcodeScanned = ({ data }) => {
    // Prevent navigating multiple times from one scan
    if (scanned) {
        return;
    }
    setScanned(true);

    if (data.toLowerCase().includes('check-in')) {
      navigation.navigate('CheckIn', { qrData: data });
    } else {
      navigation.navigate('Payment', { qrData: data });
    }

    // Allow scanning again after a short delay, in case the user comes back
    setTimeout(() => {
        setScanned(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        type={facing}
        onBarcodeScanned={handleBarcodeScanned}
        isFocused={isFocused}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.button}>
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#000', 
    },
    message: {
      textAlign: 'center',
      paddingBottom: 10,
      color: 'white', 
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
  });