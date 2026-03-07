import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHistoryItems } from "../utils/historyUtils";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Generator: undefined;
  Checker: undefined;
  BINCheckup: undefined;
  PrivateGate: undefined;
  History: undefined;
  Profile: undefined;
  Settings: undefined;
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
};

type UserProfile = {
  fullName: string;
  username: string;
  email: string;
  telegram: string;
  country: string;
  memberSince: string;
};

const PROFILE_STORAGE_KEY = "@namso_profile";

const defaultProfile: UserProfile = {
  fullName: "Namso User",
  username: "@namsouser",
  email: "",
  telegram: "",
  country: "",
  memberSince: new Date().toISOString(),
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    email: "",
  });
  const [activityStats, setActivityStats] = useState({
    total: 0,
    generated: 0,
    checked: 0,
    binLookups: 0,
  });

  useEffect(() => {
    loadProfile();

    const unsubscribe = navigation.addListener("focus", () => {
      loadProfile();
      loadStats();
    });

    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        setProfile(parsed);
      }
    } catch (error) {
      console.warn("Could not load profile:", error);
    }
  };

  const loadStats = async () => {
    try {
      const history = await getHistoryItems();
      setActivityStats({
        total: history.length,
        generated: history.filter((item) => item.type === "generator").length,
        checked: history.filter((item) => item.type === "checker").length,
        binLookups: history.filter((item) => item.type === "bin").length,
      });
    } catch (error) {
      console.warn("Could not load profile stats:", error);
    }
  };

  const validateEmail = (email: string): boolean => {
    // Email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: "",
      username: "",
      email: "",
    };

    let isValid = true;

    // Validate Full Name
    if (!profile.fullName || profile.fullName.trim() === "") {
      newErrors.fullName = "* Full Name can't be empty";
      isValid = false;
    }

    // Validate Username
    if (!profile.username || profile.username.trim() === "") {
      newErrors.username = "* Username can't be empty";
      isValid = false;
    }

    // Validate Email
    if (!profile.email || profile.email.trim() === "") {
      newErrors.email = "* Email can't be empty";
      isValid = false;
    } else if (!validateEmail(profile.email.trim())) {
      newErrors.email = "* Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveProfile = async () => {
    // Clear previous errors
    setErrors({ fullName: "", username: "", email: "" });

    // Validate form
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again.");
      return;
    }

    setIsSaving(true);
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      Alert.alert("Saved", "Your profile has been updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Could not save your profile. Please try again.");
      console.warn("Could not save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = new Date(profile.memberSince).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.iconBox}>
              <MaterialIcons name="account-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.logoText}>My Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.historyShortcut}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("History")}
          >
            <MaterialIcons name="history" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Hero Card */}
        <View style={styles.profileHeroWrap}>
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHero}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(profile.fullName || "User").trim().charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{profile.fullName || "Namso User"}</Text>
              <Text style={styles.heroUsername}>{profile.username || "@namsouser"}</Text>
              <Text style={styles.heroMember}>Member since {memberSince}</Text>
            </View>
            <View style={styles.onlineDot} />
          </LinearGradient>
        </View>

        {/* Activity Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityStats.generated}</Text>
              <Text style={styles.statLabel}>Generated</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityStats.checked}</Text>
              <Text style={styles.statLabel}>Checked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityStats.binLookups}</Text>
              <Text style={styles.statLabel}>BIN</Text>
            </View>
          </View>
        </View>

        {/* Editable Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Profile Details</Text>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            value={profile.fullName}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, fullName: text }))}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, errors.fullName ? styles.inputError : null]}
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            value={profile.username}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, username: text }))}
            placeholder="@username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            style={[styles.input, errors.username ? styles.inputError : null]}
          />
          {errors.username ? (
            <Text style={styles.errorText}>{errors.username}</Text>
          ) : null}

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            value={profile.email}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, errors.email ? styles.inputError : null]}
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          <Text style={styles.inputLabel}>Telegram</Text>
          <TextInput
            value={profile.telegram}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, telegram: text }))}
            placeholder="@telegram_username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Country</Text>
          <TextInput
            value={profile.country}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, country: text }))}
            placeholder="Your country"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={saveProfile}
            disabled={isSaving}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <MaterialIcons name="save" size={18} color="#FFF" />
              <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save Profile"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Space for bottom nav */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <MaterialIcons name="dashboard" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("History")}
        >
          <MaterialIcons name="history" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="account-circle" size={26} color="#10B981" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialIcons name="settings" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: -0.5,
  },
  historyShortcut: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeroWrap: {
    marginBottom: 16,
  },
  profileHero: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  heroInfo: {
    marginLeft: 14,
    flex: 1,
  },
  heroName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  heroUsername: {
    marginTop: 2,
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
  },
  heroMember: {
    marginTop: 6,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: "#ECFDF5",
    position: "absolute",
    right: 16,
    top: 16,
  },
  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    columnGap: 10,
  },
  statItem: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveGradient: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
    fontWeight: "600",
  },
});
