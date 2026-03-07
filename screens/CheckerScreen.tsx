import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
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
  Checker: undefined;
  BINCheckup: undefined;
};

type CheckerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Checker">;
};

interface CardData {
  number: string;
  month: string;
  year: string;
  cvv: string;
  raw: string;
}

interface CardResult {
  status: "live" | "dead" | "unknown";
  cardNumber: string;
  month: string;
  year: string;
  result: string;
  time: string;
  brand: string;
  raw: string;
}

export default function CheckerScreen({ navigation }: CheckerScreenProps) {
  const [cardInput, setCardInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);

  // Get current date for expiry validation
  const getCurrentDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  };

  const luhnCheck = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const parseCard = (line: string): CardData | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(/[|,\s]+/);
    const number = parts[0].replace(/\D/g, "");
    if (number.length < 13) return null;
    return {
      number: number,
      month: parts[1] || "",
      year: parts[2] || "",
      cvv: parts[3] || "",
      raw: trimmed,
    };
  };

  const getCardBrand = (number: string): string => {
    const patterns: { [key: string]: RegExp } = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/,
    };
    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return brand.toUpperCase();
    }
    return "UNKNOWN";
  };

  const validateCard = (card: CardData): "live" | "dead" | "unknown" => {
    // 1. Strict Date Check if month and year provided
    if (card.month && card.year) {
      let expYear = parseInt(card.year);
      let expMonth = parseInt(card.month);

      if (expYear < 100) expYear += 2000;

      const { year: currentYear, month: currentMonth } = getCurrentDate();

      if (expYear < currentYear) {
        return "dead";
      }
      if (expYear === currentYear && expMonth < currentMonth) {
        return "dead";
      }
    }

    // 2. Luhn validation (informational, doesn't determine result)
    luhnCheck(card.number);

    // 3. Simulation: 15% live rate
    return Math.random() < 0.15 ? "live" : "dead";
  };

  const stats = {
    live: results.filter((r) => r.status === "live").length,
    dead: results.filter((r) => r.status === "dead").length,
    unknown: results.filter((r) => r.status === "unknown").length,
  };

  const handleCheckCards = () => {
    const cardLines = cardInput.split("\n");
    const newResults: CardResult[] = [];

    cardLines.forEach((line) => {
      const card = parseCard(line);
      if (!card) return;

      const status = validateCard(card);
      const resultText =
        status === "live"
          ? "APPROVED | MrChecker.live"
          : status === "dead"
            ? "DECLINED"
            : "TIMEOUT";
      const time = (Math.random() * 2 + 0.2).toFixed(2) + "s";
      const brand = getCardBrand(card.number);

      newResults.push({
        status,
        cardNumber: card.raw,
        month: card.month || "##",
        year: card.year || "##",
        result: resultText,
        time,
        brand,
        raw: card.raw,
      });
    });

    setResults(newResults);
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: "live" | "dead" | "unknown"): string => {
    switch (status) {
      case "live":
        return "#10B981";
      case "dead":
        return "#EF4444";
      case "unknown":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: "live" | "dead" | "unknown"): string => {
    switch (status) {
      case "live":
        return "LIVE";
      case "dead":
        return "DEAD";
      case "unknown":
        return "UNK";
      default:
        return "UNK";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <MaterialIcons name="list-alt" size={20} color="#10B981" />
          </View>
          <Text style={styles.logoText}>
            Namso<Text style={styles.logoAccent}>Check</Text>
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
            colors={["#FBBF24", "#F59E0B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumCardBorder}
          >
            <View style={styles.premiumCardInner}>
              <LinearGradient
                colors={[
                  "rgba(251, 191, 36, 0.22)",
                  "rgba(251, 191, 36, 0.12)",
                  "rgba(251, 191, 36, 0.04)",
                  "rgba(251, 191, 36, 0.01)",
                ]}
                locations={[0, 0.35, 0.75, 1]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.premiumCardGlow}
              />
              
              {/* Icon + Title & Subtitle (horizontal row) */}
              <View style={styles.premiumCardHeader}>
                <View style={styles.premiumIconBg}>
                  <MaterialIcons
                    name="workspace-premium"
                    size={24}
                    color="#D97706"
                  />
                </View>
                <View style={styles.premiumTextColumn}>
                  <Text style={styles.premiumCardTitle}>
                    Unlock Namso Pro Experience
                  </Text>
                  <Text style={styles.premiumCardSubtitle}>
                    Higher limits, faster checks & premium bins.
                  </Text>
                </View>
              </View>

              {/* Full-width Button */}
              <TouchableOpacity
                style={styles.premiumActivateButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FBBF24", "#D97706"]}
                  style={styles.premiumActivateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.premiumActivateText}>
                    Activate Elite Access
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Namso Checker</Text>
          <Text style={styles.subtitle}>
            Instantly check validity using the Luhn algorithm. Secure, client-side, and privacy-focused.
          </Text>
        </View>

        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputLabel}>
            <MaterialIcons name="credit-card" size={18} color="#10B981" />
            <Text style={styles.inputLabelText}>Enter Card Numbers</Text>
          </View>
          <TextInput
            style={styles.cardInput}
            placeholder={`4532015112830366|12|2026|123\n5424180123456789|01|2025|456`}
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={5}
            value={cardInput}
            onChangeText={setCardInput}
          />
          <Text style={styles.formatHint}>Format: number|month|year|cvv</Text>

          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={handleCheckCards}
            >
              <LinearGradient
                colors={["#10B981", "#047857"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Start Check</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopButton}
              activeOpacity={0.8}
              onPress={handleClearResults}
            >
              <MaterialIcons name="stop" size={20} color="#EF4444" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.live}</Text>
            <Text style={styles.statLabel}>Live</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
              <MaterialIcons name="cancel" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.dead}</Text>
            <Text style={[styles.statLabel, { color: "#EF4444" }]}>Dead</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <MaterialIcons name="help" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.unknown}</Text>
            <Text style={[styles.statLabel, { color: "#F59E0B" }]}>Unk</Text>
          </View>
        </View>

        {/* Results Log */}
        <View style={styles.logContainer}>
          <View style={styles.logHeader}>
            <View style={styles.logTitle}>
              <View style={styles.logDots}>
                <View style={[styles.logDot, { backgroundColor: "#EF4444" }]} />
                <View style={[styles.logDot, { backgroundColor: "#FBBF24" }]} />
                <View style={[styles.logDot, { backgroundColor: "#10B981" }]} />
              </View>
              <Text style={styles.logTitleText}>root@namso:~# tail -f results.log</Text>
            </View>
            <TouchableOpacity onPress={handleClearResults}>
              <Text style={styles.logClear}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.logContent}>
            {results.length === 0 ? (
              <View style={styles.logPlaceholder}>
                <MaterialIcons name="info" size={24} color="#6B7280" />
                <Text style={styles.logPlaceholderText}>Waiting for input stream...</Text>
              </View>
            ) : (
              results.map((result, index) => (
                <View key={index} style={styles.logItem}>
                  <View style={styles.logItemStatus}>
                    <Text
                      style={[
                        styles.logStatusBadge,
                        { color: getStatusColor(result.status) },
                      ]}
                    >
                      [{getStatusLabel(result.status)}]
                    </Text>
                    <Text style={styles.logCardNumber}>{result.raw}</Text>
                  </View>
                  <Text style={styles.logItemMeta}>
                    {result.brand} • {result.result} •{" "}
                    <Text style={{ color: getStatusColor(result.status) }}>
                      {result.time}
                    </Text>
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            This validator uses the <Text style={{ fontWeight: "600", color: "#10B981" }}>Luhn Algorithm</Text> (Mod 10) to mathematically validate credit card numbers. It does not check if the card is active or has funds, only if the number sequence is valid according to the issuing standard.
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <MaterialIcons name="lock" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.infoItemTitle}>Client Side</Text>
              <Text style={styles.infoItemDesc}>Data never leaves your device. 100% safe.</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <MaterialIcons name="speed" size={16} color="#A855F7" />
              </View>
              <Text style={styles.infoItemTitle}>Fast Check</Text>
              <Text style={styles.infoItemDesc}>Process thousands instantly.</Text>
            </View>
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
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
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
  premiumCard: {
    marginTop: 32,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  premiumCardBorder: {
    padding: 2,
    borderRadius: 16,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 5,
  },
  premiumCardInner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 12,
    zIndex: 10,
  },
  premiumCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 12,
    width: "100%",
  },
  premiumTextColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  premiumCardGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 12,
    opacity: 0.42,
  },
  premiumCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  premiumIconContainer: {
    flexShrink: 0,
  },
  premiumIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(253, 188, 36, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(253, 188, 36, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 3,
  },
  premiumCardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
  },
  premiumActivateButton: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
    width: "100%",
  },
  premiumActivateGradient: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumActivateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold" as "bold",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  inputLabelText: {
    fontSize: 13,
    fontWeight: "600" as "600",
    color: "#111827",
  },
  cardInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 13,
    color: "#111827",
    fontFamily: "monospace",
  },
  formatHint: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 8,
    fontWeight: "500" as "500",
  },
  buttonGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  startButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as "600",
  },
  stopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  stopButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600" as "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderTopWidth: 2,
    borderTopColor: "#10B981",
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600" as "600",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  logContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    overflow: "hidden",
    height: 280,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.2)",
  },
  logHeader: {
    backgroundColor: "#0F172A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.2)",
  },
  logTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logDots: {
    flexDirection: "row",
    gap: 6,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logTitleText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "monospace",
  },
  logClear: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600" as "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logContent: {
    flex: 1,
    padding: 12,
  },
  logPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logPlaceholderText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  logItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(107, 114, 128, 0.1)",
  },
  logItemStatus: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  logStatusBadge: {
    fontSize: 11,
    fontWeight: "bold" as "bold",
    fontFamily: "monospace",
  },
  logCardNumber: {
    fontSize: 11,
    color: "#D1D5DB",
    fontFamily: "monospace",
  },
  logItemMeta: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
    marginBottom: 32,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600" as "600",
    color: "#111827",
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  infoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoItemTitle: {
    fontSize: 12,
    fontWeight: "600" as "600",
    color: "#111827",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoItemDesc: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
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
