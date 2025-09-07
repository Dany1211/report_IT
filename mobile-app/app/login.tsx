import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user found");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role === "admin") {
        Alert.alert(
          "Admin Access",
          "Admins cannot use the mobile app. Please use the web admin portal.",
          [
            {
              text: "Open Portal",
              onPress: () =>
                Linking.openURL(
                  "https://www.linkedin.com/in/shubham-kendre-23b605285/"
                ),
            },
            { text: "OK", style: "cancel" },
          ]
        );
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={["#FFF9F0", "#FFF1C6"]} style={{ flex: 1 }}>


        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.subtitle}>Your City. Your Voice.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to continue making a difference
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
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
                    size={20}
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

              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Forgot Password", "Feature coming soon!")
                }
              >
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
        </KeyboardAwareScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

// 🎨 Theme Colors
const COLORS = {
  card: "#FFFFFF",
  primary: "#FFA500",
  textHeader: "#333333",
  textSub: "#555555",
  buttonText: "#FFFFFF",
};

// Styles
const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 60,
  },
  logo: { width: 200, height: 200, marginBottom: 12 },
  subtitle: { fontSize: 14, color: COLORS.textSub, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textHeader,
    textAlign: "center",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSub,
    textAlign: "center",
    marginBottom: 20,
  },
  form: { marginBottom: 10 },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingRight: 40,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -16 }],
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: COLORS.buttonText, fontSize: 16, fontWeight: "600" },
  link: {
    color: COLORS.primary,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  footerText: { color: COLORS.textSub },
  footerLink: { color: COLORS.textHeader, fontWeight: "600" },
});
