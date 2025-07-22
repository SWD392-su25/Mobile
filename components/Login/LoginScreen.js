import React, { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../Login/LoginStyles";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import FPT from "../../assets/img/FPT.jpeg";
import { loginUser } from "../api/authAPI";
const CustomCheckBox = ({ value, onChange }) => (
  <Pressable style={styles.checkbox} onPress={() => onChange(!value)}>
    <Ionicons
      name={value ? "checkbox-outline" : "square-outline"}
      size={20}
      color="#fff"
    />
  </Pressable>
);

export default function LoginScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const savedEmail = await SecureStore.getItemAsync("savedEmail");
        const savedPassword = await SecureStore.getItemAsync("savedPassword");
        const savedRememberMe = await SecureStore.getItemAsync("rememberMe");

        if (savedRememberMe === "true" && savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      })();
    }, [route])
  );

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Please enter your email.");
      hasError = true;
    } else if (!email.endsWith("@gmail.com")) {
      setEmailError("Email must end with @gmail.com.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

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
        console.log("Login successful:", result);
        await SecureStore.setItemAsync("accessToken", result.token);
        await SecureStore.setItemAsync("accountId", result.id+'');

        navigation.navigate("HomePage", {
          username: result.username,
        });
      } catch (error) {
        console.error("SecureStore error:", error);
        Alert.alert("Storage Error", "Failed to save login credentials.");
      }
    } else {
      setPasswordError(result.message);
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
          autoCapitalize="none"
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
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.LoginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.LoginText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
        )}

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.googleButtonText}>Sign In with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Register")}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}
