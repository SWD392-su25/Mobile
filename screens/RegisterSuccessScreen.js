// screens/RegisterSuccessScreen.js
import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";

export default function RegisterSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { name, email, eventName } = route.params || {};

  useEffect(() => {
    if (!name || !email || !eventName) {
      navigation.dispatch(CommonActions.navigate("Home"));
    }

    // 📩 TODO: Gửi email xác nhận tại đây nếu cần
    console.log("✅ Đã đăng ký:", { name, email, eventName });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký thành công!</Text>
      <Text style={styles.text}>
        Cảm ơn <Text style={styles.bold}>{name}</Text> đã đăng ký tham gia sự
        kiện:
      </Text>
      <Text style={styles.eventName}>{eventName}</Text>
      <Text style={styles.text}>
        Email xác nhận sẽ được gửi đến: <Text style={styles.bold}>{email}</Text>
      </Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Quay về trang chủ"
          onPress={() => navigation.navigate("Home")}
          color="#1976d2"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  eventName: {
    fontSize: 17,
    color: "#5A4032",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
});
