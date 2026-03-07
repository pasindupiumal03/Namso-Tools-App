import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearHistory } from "../utils/historyUtils";
import { UserSettings, getSettings, saveSettings as saveSettingsUtil } from "../utils/settingsUtils";

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

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

const defaultSettings: UserSettings = {
  pushNotifications: true,
  autoCopyResults: false,
  saveHistory: true,
  compactCards: false,
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setSettings(settings);
    } catch (error) {
      console.warn("Could not load settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await saveSettingsUtil(settings);
      Alert.alert("Saved", "Settings updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Could not save settings.");
      console.warn("Could not save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert("Reset Settings", "Reset all settings to default values?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => setSettings(defaultSettings),
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert("Clear History", "Remove all saved activity history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await clearHistory();
            Alert.alert("Done", "History cleared successfully.");
          } catch (error) {
            Alert.alert("Error", "Failed to clear history.");
          }
        },
      },
    ]);
  };

  const renderToggleRow = (
    icon: keyof typeof MaterialIcons.glyphMap,
    title: string,
    subtitle: string,
    value: boolean,
    onChange: (next: boolean) => void
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          <MaterialIcons name={icon} size={18} color="#10B981" />
        </View>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#D1D5DB", true: "#6EE7B7" }}
        thumbColor={value ? "#059669" : "#9CA3AF"}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.iconBox}>
              <MaterialIcons name="settings" size={20} color="#10B981" />
            </View>
            <Text style={styles.logoText}>Settings</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {renderToggleRow(
            "notifications-active",
            "Push Notifications",
            "Get updates about new features and alerts.",
            settings.pushNotifications,
            (next) => setSettings((prev) => ({ ...prev, pushNotifications: next }))
          )}

          {renderToggleRow(
            "content-copy",
            "Auto Copy Results",
            "Automatically copy generated output to clipboard.",
            settings.autoCopyResults,
            (next) => setSettings((prev) => ({ ...prev, autoCopyResults: next }))
          )}

          {renderToggleRow(
            "history",
            "Save Activity History",
            "Store your Generator, Checker and BIN activities.",
            settings.saveHistory,
            (next) => setSettings((prev) => ({ ...prev, saveHistory: next }))
          )}

          {renderToggleRow(
            "view-compact",
            "Compact Cards",
            "Use dense layout for result cards.",
            settings.compactCards,
            (next) => setSettings((prev) => ({ ...prev, compactCards: next }))
          )}

          <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={saveSettings}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <MaterialIcons name="save" size={18} color="#FFF" />
              <Text style={styles.saveText}>{saving ? "Saving..." : "Save Settings"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleClearHistory}>
            <MaterialIcons name="delete-sweep" size={18} color="#B91C1C" />
            <Text style={styles.actionTextDanger}>Clear History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleResetSettings}>
            <MaterialIcons name="restart-alt" size={18} color="#6B7280" />
            <Text style={styles.actionText}>Reset to Default</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate("Dashboard")}>
          <MaterialIcons name="dashboard" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate("History")}>
          <MaterialIcons name="history" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => navigation.navigate("Profile")}>
          <MaterialIcons name="account-circle" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="settings" size={26} color="#10B981" />
          <Text style={styles.navLabel}>Settings</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
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
  card: {
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
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  saveButton: {
    marginTop: 14,
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  actionText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  actionTextDanger: {
    color: "#B91C1C",
    fontWeight: "600",
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
