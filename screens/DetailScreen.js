import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const allEvents = [
  {
    id: "1",
    title: "Khóa học Trí tuệ nhân tạo",
    image: require("../assets/imgHome/study1.jpg"),
    description:
      "Khám phá kiến thức AI hiện đại và ứng dụng thực tế trong cuộc sống.",
  },
  {
    id: "2",
    title: "Định hướng tương lai",
    image: require("../assets/imgHome/study2.jpg"),
    description: "Hội thảo định hướng nghề nghiệp dành cho sinh viên năm nhất.",
  },
  {
    id: "3",
    title: "Tận hưởng âm nhạc FPT",
    image: require("../assets/imgHome/fun1.jpg"),
    description: "Sân khấu âm nhạc sôi động cùng các ban nhạc sinh viên.",
  },
  {
    id: "4",
    title: "Giới thiệu các chuyên ngành 2025",
    image: require("../assets/imgHome/fun2.jpg"),
    description: "Tìm hiểu chi tiết các chuyên ngành mới sẽ mở vào năm 2025.",
  },
];

export default function DetailScreen({ route, navigation }) {
  const { eventID } = route.params;

  const event = allEvents.find((item) => item.id === eventID);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy sự kiện</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image source={event.image} style={styles.image} />
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>

        {/* Nút đăng ký tham gia */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() =>
            navigation.navigate("RegisterEvent", {
              title: event.title,
              eventID: event.id,
            })
          }
        >
          <Text style={styles.registerButtonText}>Đăng ký tham gia</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E7",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A4032",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#3D2B1F",
    textAlign: "center",
    lineHeight: 22,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: "#8F6B4A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
