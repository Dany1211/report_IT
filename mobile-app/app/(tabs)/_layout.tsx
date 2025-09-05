import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFA500",   // bright orange for active tab
        tabBarInactiveTintColor: "#999999", // soft gray for inactive
        tabBarStyle: {
          backgroundColor: "white",       // pale cream background
          borderTopWidth: 0,                // remove top border
          elevation: 20,                     // shadow on Android
          shadowColor: "#000",              // shadow on iOS
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
          height: 70,
          borderRadius: 20,
          marginHorizontal: 10,
          position: "absolute",
          bottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myReports"
        options={{
          tabBarLabel: "My Reports",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
