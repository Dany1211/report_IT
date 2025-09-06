import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function SignupScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={["#FFF9F0", "#FFF1C6"]}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Logo / Header */}
          <View style={styles.header}>
            {/* The user provided a relative path for the image, which may not work.
                A placeholder URL or a local asset must be used.
                For demonstration, we will use a placeholder URL. */}
            <Image
              source={{ uri: "https://placehold.co/80x80/FFA500/FFFFFF?text=Logo" }}
              style={styles.logo}
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ReportIT and help your city</Text>
          </View>

          {/* Card */}
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
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                secureTextEntry
              />

              <TouchableOpacity style={styles.button} onPress={() => router.replace("/(tabs)")}>
                <Text style={styles.buttonText}>Sign Up →</Text>
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

// 🎨 Theme Colors
const COLORS = {
  backgroundGradient: ["#FFF9F0", "#FFF1C6"],
  card: "#FFFFFF",
  primary: "#FFA500", // warm orange
  secondary: "#FFE4B5", // light warm beige
  textHeader: "#333333",
  textSub: "#555555",
  buttonText: "#FFFFFF",
  pending: "#FFB347",
  resolved: "#32CD32",
  alert: "#FF4500",
};

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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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