import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Swiper from "react-native-swiper";

export default function HomePage({ navigation, username = "USER" }) {
 
 // fake data
  const carouselItems = [
    {
      title: "Event 1",
      image: require("../../assets/imgHome/imgHome1.jpg"),
    },
    {
      title: "Event 2",
      image: require("../../assets/imgHome/imgHome1.jpg"),
    },
    {
      title: "Event 3",
      image: require("../../assets/imgHome/imgHome1.jpg"),
    },
  ];

  // fake data
  const studyEvents = [
    {
      id: "1",
      title: "Khóa học Trí tuệ nhân tạo",
      image: require("../../assets/imgHome/study1.jpg"),
    },
    {
      id: "2",
      title: "Định hướng tương lai",
      image: require("../../assets/imgHome/study2.jpg"),
    },
  ];

  const funEvents = [
    {
      id: "3",
      title: "Tận hưởng âm nhạc FPT",
      image: require("../../assets/imgHome/fun1.jpg"),
    },
    {
      id: "4",
      title: "Giới thiệu các chuyên ngành 2025",
      image: require("../../assets/imgHome/fun2.jpg"),
    },
  ];

  const renderEventItem = (item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() =>
        navigation.navigate("DetailScreen", {
          eventID: item.id,
          title: item.title,
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
        source={item.image}
        style={{ width: 60, height: 60, borderRadius: 8, marginRight: 10 }}
      />
      <Text style={{ fontSize: 16, color: "#000" }}>{item.title}</Text>
    </TouchableOpacity>
  );
  return (
    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 16, color: "#000" }}>Xin chào {username}</Text>

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
        <Swiper
          showsButtons={false}
          autoplay={true}
          autoplayTimeout={3}
          showsPagination={true}
          dotStyle={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          activeDotStyle={{ backgroundColor: "#fff" }}
        >
          {carouselItems.map((item, index) => (
            <View key={index} style={{ flex: 1 }}>
              <Image
                source={item.image}
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
                {item.title}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>

      {/* Danh sách sự kiện học tập */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#000",
          marginBottom: 10,
        }}
      >
        Sự kiện học tập
      </Text>
      {studyEvents.map((item) => renderEventItem(item))}

      {/* Danh sách sự kiện vui chơi */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#000",
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        Sự kiện vui chơi
      </Text>
      {funEvents.map((item) => renderEventItem(item))}
    </ScrollView>
  );
}
