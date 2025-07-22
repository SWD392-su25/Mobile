import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";


// A small component to display an icon with text for event details
const DetailItem = ({ iconName, text }) => (
  <View style={styles.detailItem}>
    <Icon name={iconName} size={22} color="#555" />
    <Text style={styles.detailItemText}>{text}</Text>
  </View>
);

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// --- Main DetailScreen Component ---
export default function DetailScreen({ route }) {
  const { eventID } = route.params;

  // State for event data
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for user and registration logic
  const [currentUser, setCurrentUser] = useState(null); // NOTE: Implement your own user retrieval
  const [isRegistering, setIsRegistering] =useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);

  // --- API Configuration ---
  const API_BASE_URL = "http://103.90.227.51:8080/api";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/events/${eventID}`);
        if (!response.ok) {
          throw new Error("Sự kiện không tồn tại hoặc có lỗi xảy ra.");
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sự kiện:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (eventID) {
      setCurrentUser({ id: 1, fullName: "Test User" });
      fetchEvent();
    }
  }, [eventID]);

  useEffect(() => {
    if (!currentUser || !event) {
        setIsCheckingRegistration(false);
        return;
    };

    const checkRegistrationStatus = async () => {
      setIsCheckingRegistration(true);
      try {
        const userRegistered = event.registers?.some(reg => reg.account.id === currentUser.id);
        if (userRegistered) {
             setIsAlreadyRegistered(true);
        } else {
             setIsAlreadyRegistered(false);
        }
      } catch (err) {
        setIsAlreadyRegistered(false);
        console.error("Lỗi khi kiểm tra đăng ký:", err);
      } finally {
        setIsCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, [currentUser, event]);


  const handleRegister = async () => {
    if (!currentUser) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đăng ký.");
      return;
    }
    setIsRegistering(true);
    try {
      const payload = { accountId: currentUser.id, eventId: Number(eventID) };
      const response = await fetch(`${API_BASE_URL}/register-event`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Đăng ký thất bại.");
      }
      
      Alert.alert("Thành công", "Bạn đã đăng ký sự kiện thành công!");
      setIsAlreadyRegistered(true); 

      const newResponse = await fetch(`${API_BASE_URL}/events/${eventID}`);
      const newData = await newResponse.json();
      setEvent(newData);

    } catch (err) {
      Alert.alert("Lỗi", err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8F6B4A" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Icon name="error-outline" size={60} color="#D32F2F" />
        <Text style={styles.errorText}>{error || "Không tìm thấy sự kiện"}</Text>
      </View>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "UPCOMING":
        return { backgroundColor: "#1976D2", color: "#fff" }; 
      case "ONGOING":
        return { backgroundColor: "#388E3C", color: "#fff" }; 
      case "FINISHED":
        return { backgroundColor: "#757575", color: "#fff" }; 
      case "CANCELLED":
        return { backgroundColor: "#D32F2F", color: "#fff" };
      default:
        return { backgroundColor: "#757575", color: "#fff" };
    }
  };

  const eventDate = new Date(event.startTime);
  const statusStyle = getStatusStyle(event.status);

  const renderRegistrationButton = () => {
    if (event.status !== "UPCOMING") {
      return (
          <View style={[styles.registerButton, styles.disabledButton, {marginTop: 20}]}>
              <Text style={styles.registerButtonText}>Đã đăng kí</Text>
          </View>
      );
    }
  
    let buttonContent;
    let buttonStyle = [styles.registerButton];
    let isDisabled = false;

    if (isCheckingRegistration || isRegistering) {
        buttonContent = <ActivityIndicator size="small" color="#fff" />;
        buttonStyle.push(styles.disabledButton);
        isDisabled = true;
    } else if (isAlreadyRegistered) {
        buttonContent = (
            <>
                <Icon name="check-circle" size={20} color="#fff" style={{marginRight: 8}}/>
                <Text style={styles.registerButtonText}>Bạn đã đăng ký</Text>
            </>
        );
        buttonStyle.push(styles.successButton);
        isDisabled = true;
    } else {
        buttonContent = <Text style={styles.registerButtonText}>Đăng ký tham gia</Text>;
    }
  
    return (
      <TouchableOpacity style={buttonStyle} onPress={handleRegister} disabled={isDisabled}>
        <View style={styles.buttonContentWrapper}>{buttonContent}</View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={
            event.image
              ? { uri: event.image }
              : require("../assets/img/FPT.jpeg")
          }
          style={styles.image}
        />
        <View style={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>{event.name}</Text>
                <View style={[styles.statusChip, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusChipText, {color: statusStyle.color}]}>{event.status}</Text>
                </View>
            </View>
            
            <View style={styles.detailsContainer}>
                <DetailItem
                    iconName="event"
                    text={eventDate.toLocaleDateString("vi-VN", {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                />
                <DetailItem
                    iconName="schedule"
                    text={eventDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                />
                <DetailItem iconName="location-on" text={event.location} />
                {event.category && <DetailItem iconName="category" text={event.category.name} />}
            </View>

            <Text style={styles.description}>{event.description}</Text>

            {/* --- Participating Stores --- */}
            {event.stores && event.stores.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cửa hàng tham gia</Text>
                    {event.stores.map(store => (
                        <View key={store.id} style={styles.storeItem}>
                           <Text style={styles.storeItemName}>{store.name}</Text>
                           <Text style={styles.storeItemDesc}>{store.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* --- Registered Participants --- */}
            {event.registers && event.registers.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Người tham gia ({event.registers.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {event.registers.map(reg => (
                            <View key={reg.account.id} style={styles.avatarContainer}>
                                <View style={[styles.avatar, {backgroundColor: stringToColor(reg.account.fullName)}]}>
                                    <Text style={styles.avatarText}>{reg.account.fullName.charAt(0).toUpperCase()}</Text>
                                </View>
                                <Text numberOfLines={1} style={styles.avatarName}>{reg.account.fullName}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {renderRegistrationButton()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8", // Light grey background
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  header: {
      marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusChip: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 16,
  },
  statusChipText: {
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 6,
  },
  detailItemText: {
      marginLeft: 15,
      fontSize: 16,
      color: '#333'
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 5,
  },
  storeItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  storeItemName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#444',
  },
  storeItemDesc: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
  },
  avatarContainer: {
      marginRight: 15,
      alignItems: 'center',
      maxWidth: 60,
  },
  avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
  },
  avatarText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
  },
  avatarName: {
      fontSize: 12,
      color: '#666',
  },
  registerButton: {
    backgroundColor: "#8F6B4A",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#BDBDBD', // Grey
  },
  successButton: {
    backgroundColor: '#388E3C', // Green
  }
});