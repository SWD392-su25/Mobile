// screens/RegisterEventScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterEventScreen({ route, navigation }) {
  const { title } = route.params;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    if (!name || !email) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ họ tên và email.");
      return;
    }

    const newRegistration = { name, email, eventName: title };

    try {
      const existing = await AsyncStorage.getItem("registrationHistory");
      const history = existing ? JSON.parse(existing) : [];
      history.push(newRegistration);
      await AsyncStorage.setItem(
        "registrationHistory",
        JSON.stringify(history)
      );

      navigation.navigate("RegisterSuccess", newRegistration);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu đăng ký vào lịch sử.");
      console.error("Lỗi lưu đăng ký:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng ký tham gia</Text>
      <Text style={styles.eventTitle}>{title}</Text>

      <TextInput
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email liên hệ"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Xác nhận đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E7",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A4032",
    marginBottom: 10,
    textAlign: "center",
  },
  eventTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#7A5D3F",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#8F6B4A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
