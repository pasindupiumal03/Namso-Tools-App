import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Generator: undefined;
};

type GeneratorScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Generator">;
};

export default function GeneratorScreen({
  navigation,
}: GeneratorScreenProps) {
  const [bin, setBin] = useState("453598");
  const [month, setMonth] = useState("Random");
  const [year, setYear] = useState("Random");
  const [cvv, setCvv] = useState("");
  const [quantity] = useState("10");
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [results, setResults] = useState([
    "4535983421923012|05|2026|341",
    "4535981293847561|08|2025|112",
    "4535985612340987|12|2027|993",
    "4535980987123456|02|2024|452",
    "4535986543210987|11|2026|784",
    "4535983210987654|03|2028|235",
    "4535987890123456|07|2025|678",
    "4535982345678901|09|2029|019",
    "4535989012345678|01|2024|340",
    "4535984567890123|06|2027|567",
  ]);

  const months = [
    "Random",
    "01 - Jan",
    "02 - Feb",
    "03 - Mar",
    "04 - Apr",
    "05 - May",
    "06 - Jun",
    "07 - Jul",
    "08 - Aug",
    "09 - Sep",
    "10 - Oct",
    "11 - Nov",
    "12 - Dec",
  ];

  // Generate years: Random, current year (2026), and next 9 years
  const generateYears = () => {
    const currentYear = 2026;
    const yearsList = ["Random"];
    for (let i = 0; i < 10; i++) {
      yearsList.push((currentYear + i).toString());
    }
    return yearsList;
  };

  const years = generateYears();

  // Input validation handlers
  const handleBinChange = (value: string) => {
    const numOnly = value.replace(/[^0-9]/g, "");
    if (numOnly.length <= 6) {
      setBin(numOnly);
    }
  };

  const handleCvvChange = (value: string) => {
    const numOnly = value.replace(/[^0-9]/g, "");
    if (numOnly.length <= 3) {
      setCvv(numOnly);
    }
  };

  const calculateLuhnCheckDigit = (numberPartial: string) => {
    let sum = 0;
    let isSecond = true;

    for (let i = numberPartial.length - 1; i >= 0; i--) {
      let digit = parseInt(numberPartial.charAt(i), 10);

      if (isSecond) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isSecond = !isSecond;
    }

    return (sum * 9) % 10;
  };

  const generateCardNumber = (binPattern: string) => {
    let number = binPattern;

    while (number.includes("x") || number.includes("X")) {
      number = number.replace(/[xX]/, Math.floor(Math.random() * 10).toString());
    }

    let targetLength = 16;
    if (number.startsWith("34") || number.startsWith("37")) {
      targetLength = 15;
    }

    while (number.length < targetLength - 1) {
      number += Math.floor(Math.random() * 10).toString();
    }

    if (number.length >= targetLength) {
      number = number.substring(0, targetLength - 1);
    }

    const checkDigit = calculateLuhnCheckDigit(number);
    return `${number}${checkDigit}`;
  };

  const getRandomMonth = () => {
    const m = Math.floor(Math.random() * 12) + 1;
    return m.toString().padStart(2, "0");
  };

  const getRandomYear = () => {
    const currentYear = new Date().getFullYear();
    return (currentYear + Math.floor(Math.random() * 5)).toString();
  };

  const getRandomCVV = (cardNumber: string) => {
    const len = cardNumber.startsWith("34") || cardNumber.startsWith("37") ? 4 : 3;
    let generatedCvv = "";

    for (let i = 0; i < len; i++) {
      generatedCvv += Math.floor(Math.random() * 10).toString();
    }

    return generatedCvv;
  };

  const getMonthValue = (selectedMonth: string) => {
    if (!selectedMonth || selectedMonth === "Random") {
      return getRandomMonth();
    }

    return selectedMonth.split(" - ")[0].padStart(2, "0");
  };

  const generateBatch = () => {
    let binValue = (bin.trim() || "453590").replace(/[^0-9x]/gi, "");
    const quantityValue = parseInt(quantity, 10) || 10;
    const generatedResults: string[] = [];

    for (let i = 0; i < quantityValue; i++) {
      const cardNumber = generateCardNumber(binValue);
      const generatedMonth = getMonthValue(month);
      const generatedYear = !year || year === "Random" ? getRandomYear() : year;
      const generatedCvv = cvv.trim() === "" ? getRandomCVV(cardNumber) : cvv.trim();

      generatedResults.push(`${cardNumber}|${generatedMonth}|${generatedYear}|${generatedCvv}`);
    }

    return generatedResults;
  };

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyResults = async () => {
    if (!results.length) {
      return;
    }

    await Clipboard.setStringAsync(results.join("\n"));
    setCopyMessage(`Copied ${results.length} cards to clipboard`);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyMessage("");
    }, 3000);
  };

  // Generate handler with loading animation
  const handleGenerateCards = () => {
    setCopyMessage("");
    setIsLoading(true);
    const generatedCards = generateBatch();

    // Simulate generation delay (3 seconds)
    setTimeout(() => {
      setResults(generatedCards);
      setIsLoading(false);
    }, 3000);
  };

  // Spinner animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isLoading, spinValue]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const spinnerRotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <MaterialIcons name="credit-card" size={20} color="#10B981" />
          </View>
          <Text style={styles.logoText}>
            Namso<Text style={styles.logoAccent}>Gen</Text>
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
            <View style={styles.premiumBgTop} />
            <View style={styles.premiumBgBottom} />

            <View style={styles.premiumContent}>
              <View style={styles.eliteBadge}>
                <View style={styles.eliteDot} />
                <Text style={styles.eliteText}>ELITE STATUS AVAILABLE</Text>
              </View>

              <View style={styles.premiumTitleContainer}>
                <Text style={styles.premiumTitle}>Unlock the</Text>
                <Text style={styles.premiumTitle}>
                  <Text style={styles.premiumTitleAccent}>Namso Pro</Text>{" "}
                  Experience
                </Text>
              </View>

              <Text style={styles.premiumDescription}>
                Upgrade to premium for exclusive access to advanced tools and
                higher limits.
              </Text>

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

        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Namso Generator</Text>
          <Text style={styles.subtitle}>
            Generate valid test credit card numbers with the Luhn algorithm.
          </Text>
        </View>

        {/* Generator Form */}
        <View style={styles.formCard}>
          {/* BIN Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>ENTER BIN</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="search"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 453598"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={bin}
                onChangeText={handleBinChange}
                maxLength={6}
              />
            </View>
            <Text style={styles.helperText}>
              First 6 digits of a card number.
            </Text>
          </View>

          {/* Month & Year */}
          <View style={styles.twoColGrid}>
            {/* Month Dropdown */}
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>MONTH</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMonthDropdown(true)}
              >
                <Text style={[styles.dropdownButtonText, !month && { color: "#9CA3AF" }]}>
                  {month || "Random"}
                </Text>
                <MaterialIcons name="expand-more" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Year Dropdown */}
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>YEAR</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowYearDropdown(true)}
              >
                <Text style={[styles.dropdownButtonText, !year && { color: "#9CA3AF" }]}>
                  {year || "Random"}
                </Text>
                <MaterialIcons name="expand-more" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CVV & Quantity */}
          <View style={styles.twoColGrid}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={[styles.textInput, styles.textCenter]}
                placeholder="Random"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={cvv}
                onChangeText={handleCvvChange}
                maxLength={3}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>QUANTITY</Text>
              <View style={[styles.textInput, styles.textCenter, styles.disabledInput]}>
                <Text style={styles.disabledInputText}>{quantity}</Text>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateButton}
            activeOpacity={0.8}
            onPress={handleGenerateCards}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#10B981", "#047857"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>GENERATE CARDS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        <View style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <View style={styles.resultsTitle}>
              <MaterialIcons
                name="terminal"
                size={18}
                color="#9CA3AF"
              />
              <Text style={styles.resultsTitleText}>Results</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopyResults}>
                <MaterialIcons name="content-copy" size={14} color="#6B7280" />
                <Text style={styles.actionButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.resultsBox}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                  <Text style={styles.loadingText}>Generating...</Text>
                  <Animated.View
                    style={[
                      styles.loadingSpinner,
                      { transform: [{ rotate: spinnerRotation }] },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <>
                {copyMessage ? (
                  <View style={styles.copyFeedback}>
                    <MaterialIcons name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.copyFeedbackText}>{copyMessage}</Text>
                  </View>
                ) : null}
                <ScrollView style={styles.resultsScroll}>
                  <Text style={styles.resultsText}>
                    {results.join("\n")}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoBadge}>
                <MaterialIcons
                  name="info"
                  size={20}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.infoTitle}>How it Works</Text>
            </View>
            <Text style={styles.infoText}>
              This tool uses the Luhn algorithm to generate mathematically valid
              credit card numbers. These numbers are for testing purposes only
              (e.g., verifying form validation on your development projects).
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoBadge, { backgroundColor: "rgba(168, 85, 247, 0.1)" }]}>
                <MaterialIcons
                  name="verified-user"
                  size={20}
                  color="#A855F7"
                />
              </View>
              <Text style={styles.infoTitle}>Safe & Client-Side</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoListItem}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color="#10B981"
                />
                <Text style={styles.infoListText}>
                  No data is sent to any server.
                </Text>
              </View>
              <View style={styles.infoListItem}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color="#10B981"
                />
                <Text style={styles.infoListText}>
                  Runs completely in your browser.
                </Text>
              </View>
              <View style={styles.infoListItem}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color="#10B981"
                />
                <Text style={styles.infoListText}>
                  Generates valid Luhn checksums.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Month Dropdown Modal */}
        {showMonthDropdown && (
          <View style={styles.dropdownModal}>
            <TouchableOpacity
              style={styles.dropdownOverlay}
              onPress={() => setShowMonthDropdown(false)}
            />
            <View style={styles.dropdownContent}>
              <ScrollView style={styles.dropdownList}>
                {months.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.dropdownItem,
                      month === m && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setMonth(m);
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        month === m && styles.dropdownItemTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Year Dropdown Modal */}
        {showYearDropdown && (
          <View style={styles.dropdownModal}>
            <TouchableOpacity
              style={styles.dropdownOverlay}
              onPress={() => setShowYearDropdown(false)}
            />
            <View style={styles.dropdownContent}>
              <ScrollView style={styles.dropdownList}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.dropdownItem,
                      year === y && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setYear(y);
                      setShowYearDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        year === y && styles.dropdownItemTextActive,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Month Dropdown Modal - Overlay */}
      {showMonthDropdown && (
        <View style={styles.dropdownModalOverlay}>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            onPress={() => setShowMonthDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownContent}>
            <ScrollView style={styles.dropdownList}>
              {months.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.dropdownItem,
                    month === m && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setMonth(m);
                    setShowMonthDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      month === m && styles.dropdownItemTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Year Dropdown Modal - Overlay */}
      {showYearDropdown && (
        <View style={styles.dropdownModalOverlay}>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            onPress={() => setShowYearDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownContent}>
            <ScrollView style={styles.dropdownList}>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.dropdownItem,
                    year === y && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setYear(y);
                    setShowYearDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      year === y && styles.dropdownItemTextActive,
                    ]}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="construction" size={24} color="#10B981" />
          <Text style={styles.navLabel}>Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="history" size={24} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="person" size={24} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="settings" size={24} color="#9CA3AF" />
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
    backgroundColor: "rgba(16, 185, 129, 0.1)",
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
    marginTop: 24,
    marginBottom: 24,
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
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold" as "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "600" as "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingLeft: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#111827",
    height: 48,
  },
  textCenter: {
    textAlign: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500" as "500",
  },
  disabledInput: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
  },
  disabledInputText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as "500",
  },
  dropdownModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: "flex-end",
  },
  dropdownModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 350,
    overflow: "hidden",
  },
  dropdownList: {
    maxHeight: 350,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#D1FAE5",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#6B7280",
  },
  dropdownItemTextActive: {
    color: "#10B981",
    fontWeight: "600" as "600",
  },
  helperText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
    paddingLeft: 4,
  },
  twoColGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  generateButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold" as "bold",
    letterSpacing: 0.5,
  },
  resultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 24,
    marginBottom: 24,
    overflow: "hidden",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultsTitleText: {
    fontSize: 11,
    fontWeight: "bold" as "bold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as "500",
  },
  resultsBox: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    position: "relative",
  },
  resultsScroll: {
    flex: 1,
  },
  resultsText: {
    fontSize: 13,
    color: "#10B981",
    fontFamily: "monospace",
    lineHeight: 20,
  },
  copyFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  copyFeedbackText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600" as "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingContent: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600" as "600",
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderTopColor: "#10B981",
    borderRightColor: "#10B981",
  },
  infoCardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
  },
  infoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600" as "600",
    color: "#111827",
    marginBottom: 0,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  infoList: {
    gap: 10,
  },
  infoListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoListText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    flex: 1,
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
