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
import { supabase } from "../supabaseClient"; // Make sure this points to mobile-app/supabaseClient.ts

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
  
    try {
      setLoading(true);
  
      // 1️⃣ Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (signUpError) {
        Alert.alert("Signup Error", signUpError.message);
        return;
      }
  
      // 2️⃣ Insert into profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          { id: signUpData.user?.id, email: email, role: "user" },
        ]);
  
      if (profileError) {
        Alert.alert("Profile Error", profileError.message);
        return;
      }
  
      Alert.alert(
        "Success",
        "Signup successful! Please check your email for verification."
      );
      router.replace("/login");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: "https://placehold.co/80x80/FFA500/FFFFFF?text=Logo" }}
              style={styles.logo}
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ReportIT and help your city</Text>
          </View>

          {/* Signup Card */}
          <View style={styles.card}>
            <Text style={styles.welcome}>Get Started</Text>
            <Text style={styles.cardSubtitle}>Sign up to start reporting issues</Text>

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
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up →</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.link}>Already have an account?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By signing up, you agree to our</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// Theme colors
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textHeader,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSub,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
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
  form: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: "600",
  },
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
  },
  footerText: {
    color: COLORS.textSub,
  },
  footerLink: {
    color: COLORS.textHeader,
    fontWeight: "600",
  },
});
