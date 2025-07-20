import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import styles from "./RegisterStyles";
import fptBackground from "../../assets/img/FPT.jpeg";

import { registerUser } from "../api/authAPI";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("MALE");
  const [phone, setPhone] = useState("");

  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !phone) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const result = await registerUser({
      fullName,
      email,
      password,
      gender,
      phone,
    });

    if (result.success) {
      Alert.alert("Thành công", "Tạo tài khoản thành công");
      navigation.navigate("Login");
    } else {
      Alert.alert("Thất bại", result.message || "Đăng ký thất bại");
    }
  };

  return (
    <ImageBackground
      source={fptBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Điền thông tin để đăng ký</Text>

        {/* Full Name */}
        <TextInput
          placeholder="Họ và tên"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <TextInput
          placeholder="Số điện thoại"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Mật khẩu"
            style={styles.inputPassword}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="gray"
            style={styles.icon}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        {/* Gender Picker */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 10,
            marginBottom: 15,
          }}
        >
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={{ width: "100%", height: 50 }}
          >
            <Picker.Item label="Nam" value="MALE" />
            <Picker.Item label="Nữ" value="FEMALE" />
            <Picker.Item label="Khác" value="OTHER" />
          </Picker>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleRegister}
        >
          <Text style={styles.createAccountText}>Đăng ký</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Đã có tài khoản?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Login")}
          >
            Đăng nhập
          </Text>
        </Text>
      </ScrollView>
    </ImageBackground>
  );
};

export default Register;
