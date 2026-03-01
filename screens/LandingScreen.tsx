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
};

type LandingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Landing">;
};

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const features = [
    { icon: "generating-tokens", title: "Namso Generator" },
    { icon: "fact-check", title: "Namso Checker" },
    { icon: "search", title: "Bin Checkup" },
    { icon: "lock", title: "Private Gate" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Background Blurs */}
          <View style={styles.blurTop} />
          <View style={styles.blurBottom} />

          {/* Hero Icon */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={["#10B981", "#047857"]}
              style={styles.heroIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="credit-card" size={56} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.checkBadge}>
              <MaterialIcons name="check-circle" size={28} color="#10B981" />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Master Your</Text>
            <Text style={styles.gradientTitle}>Validation Workflow</Text>
            <Text style={styles.description}>
              The ultimate toolkit for developers and QA engineers. Generate,
              validate, and check BINs securely on your device.
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featureGrid}>
            {features.map((feature, index) => {
              const isPrivateGate = feature.title === "Private Gate";
              return (
                <View
                  key={index}
                  style={[
                    styles.featureCard,
                    isPrivateGate && styles.premiumFeatureCard,
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconBg,
                      isPrivateGate && styles.premiumIconBg,
                    ]}
                  >
                    <MaterialIcons
                      name={feature.icon as any}
                      size={24}
                      color={isPrivateGate ? "#EAB308" : "#10B981"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.featureTitle,
                      isPrivateGate && styles.premiumFeatureTitle,
                    ]}
                  >
                    {feature.title}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            activeOpacity={0.8}
            onPress={() => navigation.replace("Dashboard")}
          >
            <LinearGradient
              colors={["#10B981", "#047857"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
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
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    position: "relative",
    maxWidth: 448,
    width: "100%",
    alignSelf: "center",
  },
  blurTop: {
    position: "absolute",
    top: 40,
    left: -50,
    width: 256,
    height: 256,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 128,
  },
  blurBottom: {
    position: "absolute",
    bottom: 80,
    right: -20,
    width: 192,
    height: 192,
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    borderRadius: 96,
  },
  heroContainer: {
    marginBottom: 40,
    position: "relative",
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "3deg" }],
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  checkBadge: {
    position: "absolute",
    bottom: -16,
    right: -16,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold" as "bold",
    color: "#111827",
    textAlign: "center",
    lineHeight: 38,
  },
  gradientTextWrapper: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradientTitle: {
    fontSize: 30,
    fontWeight: "bold" as "bold",
    color: "#10B981",
    textAlign: "center",
    lineHeight: 38,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
    width: "100%",
  },
  featureCard: {
    width: (width - 72) / 2,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "rgba(16, 185, 129, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  premiumFeatureCard: {
    backgroundColor:  "#14171db4",
    borderColor: "#faf4d1",
    shadowColor: "rgba(234, 179, 8, 0.2)",
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  premiumIconBg: {
    backgroundColor: "#faf4d1",
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: "600" as "600",
    color: "#374151",
    textAlign: "center",
  },
  premiumFeatureTitle: {
    color: "#EAB308",
  },
  getStartedButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  footerLinks: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500" as "500",
  },
  copyright: {
    fontSize: 10,
    color: "#D1D5DB",
  },
});
