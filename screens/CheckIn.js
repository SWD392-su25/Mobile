import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// --- API Configuration ---
const API_BASE_URL = 'http://103.90.227.51:8080/api'; 

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
      <MaterialIcons name={icon} size={24} color="#555" style={styles.detailIcon} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
);

export default function CheckInScreen({ route }) {
  const { qrData } = route.params;
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInData, setCheckInData] = useState(null);

  const handleCheckIn = useCallback(async (eventId) => {
    setLoading(true);
    setError('');

    try {
      // Corrected: Use getItemAsync to retrieve the stored accountId
      const accountId = await SecureStore.getItemAsync("accountId");

      if (!accountId) {
        throw new Error("Could not find user credentials. Please log in again.");
      }
      
      const url = `${API_BASE_URL}/register-event/check-in?accountId=${accountId}&eventId=${eventId}`;
      const response = await axios.patch(url);
      setCheckInData(response.data);

    } catch (err) {
      console.error('Check-in error:', err);
      const errorMessage = err.response?.data || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const match = qrData.match(/id=(\d+)/);
    const eventId = match ? match[1] : null;

    if (eventId) {
      handleCheckIn(eventId);
    } else {
      setError("Invalid QR Code. The format is incorrect.");
      setLoading(false);
    }
  }, [qrData, handleCheckIn]);


  // Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.statusText}>Processing Check-In...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="times-circle" size={64} color="#D32F2F" />
        <Text style={[styles.title, { color: '#D32F2F' }]}>Check-In Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Success State
  if (checkInData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.successIconContainer}>
                <FontAwesome name="check-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.title}>Check-In Successful!</Text>
            
            <View style={styles.detailsCard}>
                <DetailRow 
                    icon="event"
                    label="Event Name"
                    value={checkInData.event?.name}
                />
                <DetailRow 
                    icon="person"
                    label="Attendee"
                    value={checkInData.account?.fullName}
                />
                <DetailRow 
                    icon="access-time"
                    label="Check-In Time"
                    value={new Date(checkInData.checkInTime).toLocaleString()}
                />
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F6F8',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    color: 'gray',
  },
  errorText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginVertical: 10,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  detailIcon: {
      marginRight: 15,
      marginTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});