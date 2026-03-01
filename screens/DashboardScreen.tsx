import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Generator: undefined;
};

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Dashboard">;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const tools = [
    {
      icon: "credit-card",
      title: "Namso Generator",
      description: "Generate test card numbers.",
    },
    {
      icon: "list-alt",
      title: "Namso Checker",
      description: "Check validity of generated cards.",
    },
    {
      icon: "search",
      title: "BIN Checkup",
      description: "Identify bank info from BIN numbers.",
    },
    {
      icon: "dns",
      title: "Private Gate",
      description: "Exclusive access for Namso Pro members.",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="security" size={24} color="#10B981" />
          <Text style={styles.logoText}>
            Namso<Text style={styles.logoAccent}>Tools</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Card */}
        <TouchableOpacity style={styles.premiumCard} activeOpacity={0.8}>
          <LinearGradient
            colors={["#1F2937", "#0F1115"]}
            style={styles.premiumGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Background decorations */}
            <View style={styles.premiumBgTop} />
            <View style={styles.premiumBgBottom} />

            <View style={styles.premiumContent}>
              {/* Elite Status Badge */}
              <View style={styles.eliteBadge}>
                <View style={styles.eliteDot} />
                <Text style={styles.eliteText}>ELITE STATUS AVAILABLE</Text>
              </View>

              {/* Title */}
              <View style={styles.premiumTitleContainer}>
                <Text style={styles.premiumTitle}>Unlock the</Text>
                <Text style={styles.premiumTitle}>
                  <Text style={styles.premiumTitleAccent}>Namso Pro</Text>{" "}
                  Experience
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.premiumDescription}>
                Upgrade to premium for exclusive access to advanced tools and
                higher limits, and priority support.
              </Text>

              {/* Activate Button */}
              <TouchableOpacity
                style={styles.activateButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#EAB308", "#CA8A04"]}
                  style={styles.activateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialIcons
                    name="workspace-premium"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.activateText}>Activate Elite Access</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Security Badge */}
              <View style={styles.securityBadge}>
                <MaterialIcons
                  name="verified-user"
                  size={14}
                  color="#9CA3AF"
                />
                <Text style={styles.securityText}>100% Secure Transaction</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* All Tools Section */}
        <View style={styles.allToolsHeader}>
          <Text style={styles.allToolsTitle}>All Tools</Text>
          <View style={styles.toolsBadge}>
            <Text style={styles.toolsBadgeText}>4</Text>
          </View>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool, index) => {
            const isPrivateGate = tool.title === "Private Gate";
            const isNamsoGen = tool.title === "Namso Generator";

            if (isNamsoGen) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.toolCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Generator")}
                >
                  <View style={styles.toolIconBg}>
                    <MaterialIcons
                      name={tool.icon as any}
                      size={28}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </TouchableOpacity>
              );
            }

            if (isPrivateGate) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.privateGateCard}
                  activeOpacity={0.9}
                >
                  <View style={styles.privateGateGlow} />

                  <View style={styles.privateGateIconBg}>
                    <MaterialIcons name="lock-open" size={26} color="#EAB308" />
                  </View>

                  <View style={styles.privateGateHeaderRow}>
                    <Text style={styles.privateGateTitle}>Private Gate</Text>
                    <MaterialIcons name="star" size={16} color="#EAB308" />
                  </View>

                  <Text style={styles.privateGateDescription}>
                    Exclusive access for <Text style={styles.privateGateAccent}>Namso Pro</Text> members.
                  </Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={index}
                style={styles.toolCard}
                activeOpacity={0.7}
              >
                <View style={styles.toolIconBg}>
                  <MaterialIcons
                    name={tool.icon as any}
                    size={28}
                    color="#10B981"
                  />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* System Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDotOuter} />
              <View style={styles.statusDot} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>All System Operational</Text>
              <Text style={styles.statusSubtitle}>
                Gateway: US-East-1 · Latency: 24ms
              </Text>
            </View>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.uptimeContainer}>
            <Text style={styles.uptimeValue}>99.9%</Text>
            <Text style={styles.uptimeLabel}>UPTIME</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="dashboard" size={26} color="#10B981" />
          <Text style={styles.navLabel}>Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="history" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="account-circle" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
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
    paddingBottom: 70,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#111827",
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: "#10B981",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dashboardHeader: {
    marginTop: 32,
    marginBottom: 32,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 8,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  premiumCard: {
    marginTop: 32,
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1F2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  premiumGradient: {
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  premiumBgTop: {
    position: "absolute",
    top: -64,
    right: -64,
    width: 192,
    height: 192,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: 96,
  },
  premiumBgBottom: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 128,
    height: 128,
    backgroundColor: "rgba(234, 179, 8, 0.05)",
    borderRadius: 64,
  },
  premiumContent: {
    position: "relative",
    zIndex: 10,
    alignItems: "center",
  },
  eliteBadge: {
    backgroundColor: "#2a2d36",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  eliteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EAB308",
  },
  eliteText: {
    color: "#EAB308",
    fontSize: 10,
    fontWeight: "bold" as "bold",
    letterSpacing: 1,
  },
  premiumTitleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "bold" as "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 32,
  },
  premiumTitleAccent: {
    fontSize: 24,
    fontWeight: "bold" as "bold",
    color: "#EAB308",
    textAlign: "center",
    lineHeight: 32,
  },
  premiumDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  activateButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#CA8A04",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  activateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  activateText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold" as "bold",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  allToolsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  allToolsTitle: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#111827",
  },
  toolsBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  toolsBadgeText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "600" as "600",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  toolCard: {
    width: (width - 64) / 2,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "rgba(16, 185, 129, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  toolIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  privateGateCard: {
    width: (width - 64) / 2,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
    overflow: "hidden",
    shadowColor: "rgba(202, 138, 4, 0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 3,
  },
  privateGateGlow: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(234, 179, 8, 0.12)",
  },
  privateGateIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(234, 179, 8, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  privateGateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  privateGateTitle: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#FFFFFF",
  },
  privateGateDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  privateGateAccent: {
    color: "#EAB308",
    fontWeight: "600" as "600",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  statusContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIndicator: {
    position: "relative",
    width: 8,
    height: 8,
  },
  statusDotOuter: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    opacity: 0.75,
  },
  statusDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600" as "600",
    color: "#111827",
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  uptimeContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  uptimeValue: {
    fontSize: 16,
    fontWeight: "bold" as "bold",
    color: "#10B981",
    marginBottom: 2,
  },
  uptimeLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500" as "500",
    letterSpacing: 1,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 2,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "600" as "600",
    color: "#10B981",
  },
});
