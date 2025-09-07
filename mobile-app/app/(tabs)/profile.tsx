import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../supabaseClient";

const ProfileScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  // ✅ Fetch user info (name + email)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error.message);
          } else {
            setUser({
              name: data?.name || "Unknown",
              email: data?.email || "No email",
            });
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  // Light & Dark themes
  const LIGHT_COLORS = {
    backgroundGradient: ["#FFF9F0", "#FFF1C6"],
    card: "#FFFFFF",
    primary: "#FFA500",
    secondary: "#FFE4B5",
    textHeader: "#333333",
    textSub: "#555555",
    buttonText: "#FFFFFF",
    pending: "#FFB347",
    resolved: "#32CD32",
  };

  const DARK_COLORS = {
    backgroundGradient: ["#1e1e1e", "#333333"],
    card: "#2a2a2a",
    primary: "#FFA500",
    secondary: "#616161",
    textHeader: "#FFFFFF",
    textSub: "#D0D0D0",
    buttonText: "#FFFFFF",
    pending: "#FFB347",
    resolved: "#2ECC71",
  };

  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Edit profile functionality coming soon!");
  };

  const handleLanguageSelect = () => {
    Alert.alert("Language Selection", "Choose your preferred language", [
      { text: "English", onPress: () => setSelectedLanguage("English") },
      { text: "Marathi", onPress: () => setSelectedLanguage("Marathi") },
      { text: "Hindi", onPress: () => setSelectedLanguage("Hindi") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    //@ts-ignore
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: COLORS.card }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://via.placeholder.com/100x100/E3F2FD/2196F3?text=JD",
              }}
              style={[styles.avatar, { backgroundColor: COLORS.secondary }]}
            />
          </View>
          <Text style={[styles.userName, { color: COLORS.textHeader }]}>
            {user?.name || "Loading..."}
          </Text>
          <Text style={[styles.userEmail, { color: COLORS.textSub }]}>
            {user?.email || ""}
          </Text>
          <TouchableOpacity
            style={[
              styles.editButton,
              { borderColor: COLORS.primary, backgroundColor: COLORS.secondary },
            ]}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={16} color={COLORS.primary} />
            <Text style={[styles.editButtonText, { color: COLORS.primary }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `rgba(255, 179, 71, 0.2)` },
              ]}
            >
              <MaterialIcons
                name="report-problem"
                size={24}
                color={COLORS.pending}
              />
            </View>
            <Text style={[styles.statNumber, { color: COLORS.textHeader }]}>
              24
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSub }]}>
              Issues Reported
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `rgba(50, 205, 50, 0.2)` },
              ]}
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={COLORS.resolved}
              />
            </View>
            <Text style={[styles.statNumber, { color: COLORS.textHeader }]}>
              18
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSub }]}>
              Issues Resolved
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `rgba(255, 165, 0, 0.2)` },
              ]}
            >
              <MaterialIcons name="stars" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.statNumber, { color: COLORS.textHeader }]}>
              12
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSub }]}>
              My Rewards
            </Text>
          </View>
        </View>

        {/* My Rewards */}
        <View style={[styles.rewardsContainer, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textHeader }]}>
            My Rewards
          </Text>

          <View style={styles.rewardItem}>
            <MaterialIcons name="star" size={22} color="#FFD700" />
            <View style={styles.rewardTextContainer}>
              <Text style={[styles.rewardTitle, { color: COLORS.textHeader }]}>
                Gold Badge
              </Text>
              <Text style={[styles.rewardSubtitle, { color: COLORS.textSub }]}>
                Earned for 10+ reports resolved
              </Text>
            </View>
          </View>

          <View style={styles.rewardItem}>
            <MaterialIcons name="emoji-events" size={22} color="#FF9800" />
            <View style={styles.rewardTextContainer}>
              <Text style={[styles.rewardTitle, { color: COLORS.textHeader }]}>
                Top Reporter
              </Text>
              <Text style={[styles.rewardSubtitle, { color: COLORS.textSub }]}>
                24 issues reported
              </Text>
            </View>
          </View>

          <View style={styles.rewardItem}>
            <MaterialIcons name="military-tech" size={22} color="#9C27B0" />
            <View style={styles.rewardTextContainer}>
              <Text style={[styles.rewardTitle, { color: COLORS.textHeader }]}>
                Community Hero
              </Text>
              <Text style={[styles.rewardSubtitle, { color: COLORS.textSub }]}>
                Helping resolve 18 issues
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.settingsContainer, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textHeader }]}>
            Settings
          </Text>

          {/* Dark Mode */}
          <View
            style={[
              styles.settingItem,
              { borderBottomColor: isDarkMode ? "#444" : "#F0F0F0" },
            ]}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: COLORS.secondary },
                ]}
              >
                <Ionicons
                  name={isDarkMode ? "moon" : "sunny"}
                  size={20}
                  color={COLORS.textSub}
                />
              </View>
              <Text style={[styles.settingText, { color: COLORS.textHeader }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#E0E0E0", true: COLORS.primary }}
              thumbColor={isDarkMode ? COLORS.buttonText : "#f4f3f4"}
            />
          </View>

          {/* Language */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageSelect}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: COLORS.secondary },
                ]}
              >
                <MaterialIcons name="language" size={20} color={COLORS.textSub} />
              </View>
              <Text style={[styles.settingText, { color: COLORS.textHeader }]}>
                Language
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: COLORS.textSub }]}>
                {selectedLanguage}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={20}
                color={COLORS.textSub}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: COLORS.primary }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={COLORS.buttonText} />
          <Text style={[styles.logoutText, { color: COLORS.buttonText }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;

// ✅ Base Styles (theme-independent)
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingVertical: 30, paddingBottom: 75 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainer: { paddingTop: 30, borderRadius: 50, marginBottom: 15 },
  avatar: { width: 150, height: 150, borderRadius: 50 },
  userName: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  userEmail: { fontSize: 16, marginBottom: 15 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
  },
  editButtonText: { fontSize: 14, fontWeight: "500", marginLeft: 5 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statIconContainer: {
    marginBottom: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  statLabel: { fontSize: 12, textAlign: "center", lineHeight: 16 },
  settingsContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  settingText: { fontSize: 16, fontWeight: "500" },
  settingRight: { flexDirection: "row", alignItems: "center" },
  settingValue: { fontSize: 14, marginRight: 5 },
  rewardsContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  rewardItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  rewardTextContainer: { marginLeft: 15 },
  rewardTitle: { fontSize: 16, fontWeight: "600" },
  rewardSubtitle: { fontSize: 13, marginTop: 2 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 75,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});