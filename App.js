import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";

import LoginScreen from "./components/Login/LoginScreen";
import HomePage from "./components/Home/HomePage";
import ProfileScreen from "./screens/ProfileScreen";
import ChangeInfoScreen from "./screens/ChangeInfoScreen";
import Register from "./components/Register/Register";
import DetailScreen from "./screens/DetailScreen";

import ScanScreen from "./screens/Scan";
import CheckInScreen from "./screens/CheckIn";
import PaymentScreen from "./screens/Payment";
import EventList from "./screens/EventList";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({ route }) => {
  const { username } = route.params || {};

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "#E0E0E0",
      }}
    >
      <Tab.Screen
        name="Home"
        children={(props) => <HomePage {...props} username={username} />}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen} // Updated component for scanning
        options={{
          title: 'Scan QR Code',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="qrcode" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EventList"
        component={EventList} // Updated component for scanning
        options={{
          title: 'Registered Event',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomePage"
          children={(props) => <TabNavigator {...props} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Change Info" component={ChangeInfoScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="DetailScreen" component={DetailScreen} />

        <Stack.Screen
          name="CheckIn"
          component={CheckInScreen}
          options={{ title: "Check-In" }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: "Payment" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}