import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Button } from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function RegistrationHistoryScreen() {
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("registrationHistory");
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu từ AsyncStorage:", error);
      }
    };

    loadHistory();
  }, []);

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Bạn chưa đăng ký sự kiện nào.</Text>
        <View style={{ marginTop: 20 }}>
          <Button
            title="Quay về trang chủ"
            onPress={() => navigation.navigate("HomePage", { screen: "Home" })}
            color="#1976d2"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lịch sử đăng ký sự kiện</Text>

      {history.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>
            <Text style={styles.bold}>Tên sự kiện:</Text> {item.eventName}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.bold}>Người đăng ký:</Text> {item.name}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.bold}>Email:</Text> {item.email}
          </Text>

          <Text style={[styles.bold, { marginTop: 10 }]}>Mã QR:</Text>
          <View style={styles.qr}>
            <QRCode value={JSON.stringify(item)} size={160} />
          </View>
        </View>
      ))}

      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Button
          title="Quay về trang chủ"
          onPress={() => navigation.navigate("HomePage", { screen: "Home" })}
          color="#1976d2"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1976d2",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  qr: {
    marginTop: 10,
    alignItems: "center",
  },
});
