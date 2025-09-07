import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../supabaseClient"; // Make sure your supabaseClient is setup
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
  
    try {
      setLoading(true);
  
      // 1️⃣ Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("No user found");
  
      // 2️⃣ Fetch role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profileError) throw profileError;
  
      // 3️⃣ Check role
      if (profile.role === "admin") {
        Alert.alert(
          "Admin Access",
          "Admins cannot use the mobile app. Please use the web admin portal.",
          [
            {
              text: "Open Portal",
              onPress: () =>
                Linking.openURL("https://your-admin-portal.com"), // <-- replace with your admin portal URL
            },
            { text: "OK", style: "cancel" },
          ]
        );
      } else {
        // normal user
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#FFF9F0", "#FFF1C6"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          <View style={styles.header}>
            <Image source={require("../assets/images/splash-icon.png")} style={styles.logo} />
            <Text style={styles.title}>ReportIT</Text>
            <Text style={styles.subtitle}>Your City. Your Voice.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue making a difference</Text>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In →</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Feature coming soon!")}>
                <Text style={styles.link}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/Signup")}>
              <Text style={styles.footerLink}> Sign up here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// 🎨 Theme Colors
const COLORS = {
  backgroundGradient: ["#FFF9F0", "#FFF1C6"],
  card: "#FFFFFF",
  primary: "#FFA500",
  textHeader: "#333333",
  textSub: "#555555",
  buttonText: "#FFFFFF",
};

// Styles
const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "flex-start", paddingHorizontal: 20, paddingTop: 100, paddingBottom: 30 },
  header: { alignItems: "center", marginBottom: 20 },
  logo: { width: 80, height: 80, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.textHeader },
  subtitle: { fontSize: 14, color: COLORS.textSub, marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 6, marginBottom: 20 },
  welcome: { fontSize: 22, fontWeight: "bold", color: COLORS.textHeader, textAlign: "center", marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: COLORS.textSub, textAlign: "center", marginBottom: 20 },
  form: { marginBottom: 10 },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#ddd" },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  eyeButton: { padding: 8 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  buttonText: { color: COLORS.buttonText, fontSize: 16, fontWeight: "600" },
  link: { color: COLORS.primary, fontWeight: "500", textAlign: "center", marginTop: 8 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  footerText: { color: COLORS.textSub },
  footerLink: { color: COLORS.textHeader, fontWeight: "600" },
});
