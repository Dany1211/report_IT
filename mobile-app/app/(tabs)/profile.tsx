import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  // Placeholder user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // TODO: Connect with auth backend
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Profile</Text>

      {/* User Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.editButton]}>
        <Text style={[styles.buttonText, styles.editButtonText]}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F0", padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", color: "#FFA500", marginBottom: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 30,
  },
  label: { fontSize: 14, color: "#555555", marginTop: 10 },
  value: { fontSize: 16, color: "#333333", fontWeight: "500", marginTop: 2 },
  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  editButton: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#FFA500" },
  editButtonText: { color: "#FFA500" },
});
