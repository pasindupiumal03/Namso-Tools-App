import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";

const { width } = Dimensions.get("window");

type BINData = {
  brand: string;
  bank: string;
  type: string;
  level: string;
  country: string;
  countryCode: string;
};

type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Generator: undefined;
  Checker: undefined;
  BINCheckup: undefined;
  PrivateGate: undefined;
};

type BINCheckupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "BINCheckup">;
};

// In-memory cache for BIN CSV content
let binCsvContentCache: string | null = null;

export default function BINCheckupScreen({ navigation }: BINCheckupScreenProps) {
  const [binInput, setBinInput] = useState("");
  const [binData, setBinData] = useState<BINData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    loadBINDatabase();
  }, []);

  const loadBINDatabase = async () => {
    try {
      console.log("Loading BIN database...");

      if (binCsvContentCache) {
        console.log("Using cached BIN database");
        setDbLoading(false);
        return;
      }

      const asset = Asset.fromModule(require("../assets/bins.csv"));
      await asset.downloadAsync();

      const fileUri = asset.localUri || asset.uri;
      if (!fileUri) {
        throw new Error("BIN file URI unavailable");
      }

      console.log("Reading CSV...");
      binCsvContentCache = await FileSystem.readAsStringAsync(fileUri);

      console.log("BIN database loaded from CSV");
      setDbError(null);
      setDbLoading(false);
    } catch (error) {
      console.error("Failed to load BIN database:", error);
      setDbError("Failed to load database");
      setDbLoading(false);
    }
  };

  const parseCsvLineToBinData = (line: string): BINData | null => {
    const parts = line.split(";");
    if (parts.length < 6) return null;

    const brand = (parts[1] || "UNKNOWN").trim();
    const bank = (parts[2] || "UNKNOWN BANK").trim();

    const knownTypes = ["CREDIT", "DEBIT", "CHARGE", "PREPAID"];
    const typeField = (parts[3] || "").trim();

    let type = "";
    let level = "";
    let country = "UNKNOWN";
    let countryCode = "US";

    if (knownTypes.includes(typeField.toUpperCase())) {
      type = typeField;
      level = (parts[4] || "STANDARD").trim();
      country = (parts[5] || "UNKNOWN").trim();
      countryCode = (parts[6] || "US").trim().toUpperCase();
    } else {
      type = "UNKNOWN";
      level = (parts[3] || "STANDARD").trim();
      country = (parts[4] || "UNKNOWN").trim();
      countryCode = (parts[5] || "US").trim().toUpperCase();
    }

    return {
      brand,
      bank,
      type,
      level,
      country,
      countryCode,
    };
  };

  const getCountryFlag = (countryCode: string): string => {
    const normalizedCode = countryCode.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalizedCode)) {
      return "🌍";
    }

    const REGIONAL_INDICATOR_A = 0x1f1e6;
    const firstChar = normalizedCode.charCodeAt(0) - 65 + REGIONAL_INDICATOR_A;
    const secondChar = normalizedCode.charCodeAt(1) - 65 + REGIONAL_INDICATOR_A;

    return String.fromCodePoint(firstChar, secondChar);
  };

  const lookupBIN = async (bin: string) => {
    if (!binCsvContentCache) {
      setDbError("Database not loaded");
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setBinData(null);

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const match = binCsvContentCache.match(new RegExp(`(?:^|\\n)${bin};([^\\n\\r]*)`));

      if (match) {
        const line = `${bin};${match[1]}`;
        const parsed = parseCsvLineToBinData(line);

        if (!parsed) {
          setNotFound(true);
          setBinData(null);
          return;
        }

        setBinData(parsed);
        setNotFound(false);
      } else {
        setNotFound(true);
        setBinData(null);
      }
    } catch (error) {
      console.error("Lookup error:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckBIN = () => {
    if (binInput.trim().length === 6) {
      lookupBIN(binInput.trim());
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <MaterialIcons name="search" size={20} color="#10B981" />
          </View>
          <Text style={styles.logoText}>
            Namso<Text style={styles.logoAccent}>BIN</Text>
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
        {/* Database Loading State */}
        {dbLoading && (
          <View style={styles.dbLoadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.dbLoadingText}>Loading BIN Database...</Text>
            <Text style={styles.dbLoadingSubtext}>This may take a moment</Text>
          </View>
        )}

        {/* Database Error State */}
        {dbError && !dbLoading && (
          <View style={styles.dbErrorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.dbErrorTitle}>Database Error</Text>
            <Text style={styles.dbErrorText}>{dbError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadBINDatabase}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!dbLoading && !dbError && (
          <>
            {/* Premium Card */}
            <TouchableOpacity style={styles.premiumCard} activeOpacity={0.8}>
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumCardBorder}
          >
            <View style={styles.premiumCardInner}>
              <LinearGradient
                colors={[
                  "rgba(245, 158, 11, 0.22)",
                  "rgba(245, 158, 11, 0.12)",
                  "rgba(245, 158, 11, 0.04)",
                  "rgba(245, 158, 11, 0.01)",
                ]}
                locations={[0, 0.35, 0.75, 1]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.premiumCardGlow}
              />
              
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
                    Unlock Namso Pro
                  </Text>
                  <Text style={styles.premiumCardSubtitle}>
                    Get unlimited lookups, API access, and advanced bulk validation tools.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.premiumActivateButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("PrivateGate")}
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  style={styles.premiumActivateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.premiumActivateText}>
                    Activate Elite Access
                  </Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Validate BIN Number</Text>
          <Text style={styles.subtitle}>
            Enter the first 6 digits of any credit card to instantly check issuer details.
          </Text>
        </View>

        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <MaterialIcons name="credit-card" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.binInput}
              placeholder="e.g. 453201"
              placeholderTextColor="#9CA3AF"
              value={binInput}
              onChangeText={(text) => {
                const numericOnly = text.replace(/[^0-9]/g, "");
                setBinInput(numericOnly);
              }}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              (binInput.length !== 6 || isLoading) && styles.checkButtonDisabled
            ]}
            activeOpacity={0.8}
            onPress={handleCheckBIN}
            disabled={binInput.length !== 6 || isLoading}
          >
            <LinearGradient
              colors={
                binInput.length !== 6 || isLoading
                  ? ["#9CA3AF", "#6B7280"]
                  : ["#10B981", "#059669"]
              }
              style={styles.checkGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.checkButtonText}>CHECK NOW</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <View style={styles.pulseOuter}>
              <View style={styles.pulseInner} />
            </View>
            <Text style={styles.statusText}>Database Updated: Just now</Text>
          </View>
        </View>

        {/* Lookup Results */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Looking up BIN...</Text>
          </View>
        )}

        {notFound && !isLoading && (
          <View style={styles.notFoundContainer}>
            <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
            <Text style={styles.notFoundTitle}>BIN Not Found</Text>
            <Text style={styles.notFoundText}>
              The BIN "{binInput}" was not found in our database. Please check the number and try again.
            </Text>
          </View>
        )}

        {binData && !isLoading && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <MaterialIcons name="analytics" size={20} color="#10B981" />
              <Text style={styles.resultsHeaderText}>Lookup Results</Text>
            </View>

            <View style={styles.resultsCard}>
              {/* BIN Header */}
              <View style={styles.resultsBanner}>
                <View style={styles.binLabelRow}>
                  <Text style={styles.binLabel}>BIN:</Text>
                  <Text style={styles.binValue}>{binInput}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoCell, styles.infoCellBorderRight, styles.infoCellBorderBottom]}>
                  <Text style={styles.infoCellLabel}>BRAND</Text>
                  <View style={styles.infoCellValue}>
                    <MaterialIcons name="payment" size={18} color="#3B82F6" />
                    <Text style={styles.infoCellText}>{binData.brand}</Text>
                  </View>
                </View>

                <View style={[styles.infoCell, styles.infoCellBorderBottom]}>
                  <Text style={styles.infoCellLabel}>TYPE</Text>
                  <View style={styles.infoCellValue}>
                    <MaterialIcons name="credit-score" size={18} color="#10B981" />
                    <Text style={[styles.infoCellText, { color: "#10B981" }]}>
                      {binData.type}
                    </Text>
                  </View>
                </View>

                <View style={[styles.infoCell, styles.infoCellBorderRight]}>
                  <Text style={styles.infoCellLabel}>LEVEL</Text>
                  <View style={styles.infoCellValue}>
                    <MaterialIcons name="stars" size={18} color="#A855F7" />
                    <Text style={[styles.infoCellText, { color: "#A855F7" }]}>
                      {binData.level || "STANDARD"}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCell}>
                  <Text style={styles.infoCellLabel}>CURRENCY</Text>
                  <View style={styles.infoCellValue}>
                    <MaterialIcons name="attach-money" size={18} color="#10B981" />
                    <Text style={styles.infoCellText}>USD</Text>
                  </View>
                </View>
              </View>

              {/* Bank Info */}
              <View style={styles.bankInfoSection}>
                <View style={styles.bankIconContainer}>
                  <MaterialIcons name="account-balance" size={28} color="#10B981" />
                </View>
                <View style={styles.bankDetails}>
                  <Text style={styles.bankLabel}>ISSUING BANK</Text>
                  <Text style={styles.bankName}>{binData.bank}</Text>
                  
                  <View style={styles.countryRow}>
                    <Text style={styles.countryLabel}>Country:</Text>
                    <View style={styles.countryBadge}>
                      <Text style={styles.countryFlag}>
                        {getCountryFlag(binData.countryCode)}
                      </Text>
                      <Text style={styles.countryName}>{binData.country}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Feature Cards */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBg, { backgroundColor: "rgba(168, 85, 247, 0.1)" }]}>
              <MaterialIcons name="bolt" size={24} color="#A855F7" />
            </View>
            <Text style={styles.featureTitle}>Fast Lookup</Text>
            <Text style={styles.featureDesc}>Instant results from our global database.</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBg, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
              <MaterialIcons name="security" size={24} color="#10B981" />
            </View>
            <Text style={styles.featureTitle}>Secure</Text>
            <Text style={styles.featureDesc}>We do not store full card numbers.</Text>
          </View>
        </View>

        {/* CTA Section */}
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Generator")}
        >
          <LinearGradient
            colors={["#1E293B", "#0F172A"]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ctaGlow} />
            <Text style={styles.ctaTitle}>Need test cards?</Text>
            <Text style={styles.ctaDescription}>
              Use our advanced generator to create valid test credit card numbers for development.
            </Text>
            <View style={styles.ctaButton}>
              <MaterialIcons name="add-card" size={18} color="#FFFFFF" />
              <Text style={styles.ctaButtonText}>Go to Generator</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Dashboard")}
        >
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
  premiumCardGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 12,
    opacity: 0.42,
  },
  premiumCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 12,
    width: "100%",
  },
  premiumIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumTextColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
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
    flexDirection: "row",
    gap: 8,
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
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  binInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
  },
  checkButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  checkButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  checkGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold" as "bold",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pulseOuter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  pulseInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500" as "500",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 40,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as "500",
  },
  notFoundContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 40,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#111827",
  },
  notFoundText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  dbLoadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 60,
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  dbLoadingText: {
    fontSize: 16,
    fontWeight: "600" as "600",
    color: "#111827",
  },
  dbLoadingSubtext: {
    fontSize: 13,
    color: "#6B7280",
  },
  dbErrorContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    padding: 40,
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  dbErrorTitle: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#EF4444",
  },
  dbErrorText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold" as "bold",
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  resultsHeaderText: {
    fontSize: 16,
    fontWeight: "600" as "600",
    color: "#111827",
  },
  resultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultsBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(249, 250, 251, 0.5)",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  binLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  binLabel: {
    fontSize: 11,
    fontWeight: "bold" as "bold",
    color: "#6B7280",
    letterSpacing: 1,
  },
  binValue: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#111827",
    fontFamily: "monospace",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  activeText: {
    fontSize: 11,
    fontWeight: "bold" as "bold",
    color: "#10B981",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoCell: {
    width: "50%",
    padding: 16,
  },
  infoCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: "#F3F4F6",
  },
  infoCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoCellLabel: {
    fontSize: 10,
    fontWeight: "600" as "600",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoCellValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoCellText: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#111827",
  },
  bankInfoSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "rgba(249, 250, 251, 0.3)",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  bankDetails: {
    flex: 1,
  },
  bankLabel: {
    fontSize: 10,
    fontWeight: "600" as "600",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 4,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#111827",
    lineHeight: 20,
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  countryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as "500",
  },
  countryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countryFlag: {
    fontSize: 14,
  },
  countryName: {
    fontSize: 12,
    fontWeight: "600" as "600",
    color: "#374151",
  },
  linksRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderStyle: "dashed" as "dashed",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600" as "600",
    color: "#10B981",
  },
  featuresGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
  ctaCard: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaGradient: {
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: "85%",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold" as "bold",
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
