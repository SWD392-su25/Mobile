import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import EventRow from '../components/EventRow';

const API_BASE_URL = 'http://103.90.227.51:8080/api';

export default function EventRegistrationScreen() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setError('');
    try {
      const accountId = await SecureStore.getItemAsync('accountId');
      if (!accountId) {
        throw new Error("User not found. Please log in again.");
      }
      const response = await axios.get(`${API_BASE_URL}/register-event/student?accountId=${accountId}`);
      setRegistrations(response.data);
    } catch (e) {
      console.error("Failed to fetch event registrations:", e);
      setError(e.response?.data?.message || "Could not load your event registrations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRegistrations();
  }, [fetchRegistrations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleEventUpdate = useCallback((updatedRegistration) => {
    setRegistrations((prev) =>
      prev.map((reg) => (reg.id === updatedRegistration.id ? updatedRegistration : reg))
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <EventRow registration={item} onUpdate={handleEventUpdate} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={<Text style={styles.header}>Your Event Registrations</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't registered for any events.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 10,
    backgroundColor: 'transparent',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15,
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: 'gray'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    padding: 20,
    textAlign: 'center'
  }
});