import { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login"); // navigate after 1.5s
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Optional logo image */}
      {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}

      <Text style={styles.title}>ReportIT</Text>
      <Text style={styles.subtitle}>Making cities better, one report at a time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // original white theme
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFA500", // your orange accent
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
});
