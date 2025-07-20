import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Swiper from "react-native-swiper";

export default function HomePage({ navigation, username = "USER" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://103.90.227.51:8080/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API sự kiện:", err);
        setLoading(false);
      });
  }, []);

  const renderEventItem = (item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() =>
        navigation.navigate("DetailScreen", {
          eventID: item.id,
          title: item.name,
          image: item.image,
          description: item.description,
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
      }}
    >
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require("../../assets/img/FPT.jpeg")
        }
        style={{ width: 60, height: 60, borderRadius: 8, marginRight: 10 }}
      />
      <Text style={{ fontSize: 16, color: "#000" }}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      {/* Chào người dùng */}
      <Text style={{ fontSize: 16, color: "#000" }}>Xin chào {username}</Text>

      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 10,
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <FontAwesome
          name="search"
          size={20}
          color="#000"
          style={{ marginRight: 10 }}
        />
        <TextInput
          placeholder="Hãy tìm event bạn muốn"
          style={{ flex: 1 }}
          placeholderTextColor="#888"
        />
      </View>

      {/* Sự kiện nổi bật - Dùng 3 sự kiện đầu */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#000",
          marginTop: 30,
          marginBottom: 10,
        }}
      >
        Sự kiện nổi bật
      </Text>
      <View style={{ height: 200, marginBottom: 20 }}>
        <Swiper autoplay={true} autoplayTimeout={3} showsPagination={true}>
          {events.slice(0, 3).map((item, index) => (
            <View key={index} style={{ flex: 1 }}>
              <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: "100%", borderRadius: 10 }}
                resizeMode="cover"
              />
              <Text
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  textShadowColor: "rgba(0, 0, 0, 0.75)",
                  textShadowOffset: { width: -1, height: 1 },
                  textShadowRadius: 10,
                }}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>

      {/* Danh sách tất cả sự kiện */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#000",
          marginBottom: 10,
        }}
      >
        Tất cả sự kiện
      </Text>
      {events.map((item) => renderEventItem(item))}
    </ScrollView>
  );
}
