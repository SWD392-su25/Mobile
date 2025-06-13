import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import styles from "../Login/LoginStyles";
import { ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import FPT from "../../assets/img/FPT.jpeg";

// Hàm đăng nhập mock
const mockLogin = (email, password) => {
  const users = [
    { email: "duong@fpt.edu.vn", password: "123456", token: "token1" },
    { email: "lolichua2k4@gmail.com", password: "1234", token: "token2" },
    { email: "minh@fpt.edu.vn", password: "abc123", token: "token3" },
    { email: "thu@fpt.edu.vn", password: "pass123", token: "token4" },
    { email: "tuan@fpt.edu.vn", password: "fpt2024", token: "token5" },
  ];

  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    return { success: true, token: user.token };
  } else {
    return { success: false, message: "Invalid credentials" };
  }
};

// Component Checkbox Tùy chỉnh
const CustomCheckBox = ({ value, onChange }) => {
  return (
    <Pressable style={styles.checkbox} onPress={() => onChange(!value)}>
      <Ionicons
        name={value ? "checkbox-outline" : "square-outline"}
        size={20}
        color="black"
      />
    </Pressable>
  );
};

export default function Login() {
  const route = useRoute();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load credentials khi mở lại màn hình
  useFocusEffect(
    useCallback(() => {
      const loadCredentials = async () => {
        try {
          const savedEmail = await SecureStore.getItemAsync("savedEmail");
          const savedPassword = await SecureStore.getItemAsync("savedPassword");
          const savedRememberMe = await SecureStore.getItemAsync("rememberMe");

          if (savedRememberMe === "true" && savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
          }
        } catch (error) {
          console.error("Error loading saved credentials:", error);
        }
      };
      loadCredentials();
    }, [route])
  );

  // Xử lý đăng nhập mock
  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Please enter your email.");
      hasError = true;
    }
    // else if (!email.endsWith("@fpt.edu.vn")) {
    //   setEmailError("Email must end with @fpt.edu.vn.");
    //   hasError = true;
    // }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    }

    if (hasError) return;

    const result = mockLogin(email, password);

    if (result.success) {
      try {
        if (rememberMe) {
          await SecureStore.setItemAsync("savedEmail", email);
          await SecureStore.setItemAsync("savedPassword", password);
          await SecureStore.setItemAsync("rememberMe", "true");
        } else {
          await SecureStore.deleteItemAsync("savedEmail");
          await SecureStore.deleteItemAsync("savedPassword");
          await SecureStore.deleteItemAsync("rememberMe");
        }

        navigation.navigate("HomePage", { screen: "Home" });
      } catch (error) {
        console.error("SecureStore error:", error);
      }
    } else {
      setPasswordError("Please enter again your password");
    }
  };

  return (
    <ImageBackground source={FPT} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome FPT event</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {emailError !== "" && (
          <Text style={styles.errorText}>{emailError}</Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {passwordError !== "" && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}

        <View style={styles.rememberContainer}>
          <View style={styles.rememberGroup}>
            <CustomCheckBox value={rememberMe} onChange={setRememberMe} />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Forgot Password")}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.LoginButton} onPress={handleLogin}>
          <Text style={styles.LoginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.googleButtonText}>Sign In with Google</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
