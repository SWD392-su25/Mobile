import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

function ProfileScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/img/FPT.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header with greeting and avatar */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Xin chào</Text>
            <Image
              source={require("../assets/img/avarta.jpeg")}
              style={styles.avatar}
            />
          </View>

          {/* Profile title */}
          <Text style={styles.title}>Profile Information</Text>

          {/* Option buttons */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("Change Info")}
          >
            <FontAwesome
              name="edit"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.optionText}>Thay đổi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("RegistrationHistoryScreen")}
          >
            <FontAwesome
              name="history"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.optionText}>Lịch sử đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <FontAwesome
              name="eye"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.optionText}>Thông báo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("HomePage", { screen: "Home" })}
          >
            <FontAwesome
              name="arrow-left"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.optionText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(131, 127, 127, 0.63)",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  greeting: {
    fontSize: 25,
    color: "#fff",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 20,
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    textAlign: "left",
  },
});

export default ProfileScreen;
