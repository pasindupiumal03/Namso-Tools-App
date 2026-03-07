import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaskedView from "@react-native-masked-view/masked-view";

type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Generator: undefined;
  Checker: undefined;
  BINCheckup: undefined;
  PrivateGate: undefined;
};

type PrivateGateScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PrivateGate">;
};

type Transaction = {
  id: string;
  status: "LIVE" | "DIE";
  cardNumber: string;
  expiry: string;
  message: string;
};

export default function PrivateGateScreen({ navigation }: PrivateGateScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeFeed, setActiveFeed] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [liveHits, setLiveHits] = useState(6327);
  const [declined, setDeclined] = useState(45432);
  const [checked, setChecked] = useState(778766);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Really unlimited cards for $49?",
      answer:
        "Yes. We provide a lifetime license for a one-time fee. No recurring charges.",
    },
    {
      question: "Do you guarantee balances?",
      answer:
        "Absolutely. The $49 tier includes access to our Gold/Platinum bin database with guaranteed $1000+ balances.",
    },
    {
      question: "Do you provide addresses?",
      answer:
        "Yes, full info (Fullz) including billing address and CVV is included with every card generated in the premium tier.",
    },
  ];

  const generateCardNumber = () => {
    const prefixes = ["4147", "5420", "5342", "3782", "4532", "5105"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = "xxxxxxxx";
    const last4 = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${middle}${last4}`;
  };

  const generateExpiry = () => {
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, "0");
    const year = String(26 + Math.floor(Math.random() * 4));
    return `${month}/${year}`;
  };

  const generateTransaction = (): Transaction => {
    const isLive = Math.random() > 0.7; // 30% live rate
    const liveMessages = [
      "Charged $2.04 ✅",
      "Charged $4.51 ✅",
      "Charged $4.58 ✅",
      "Charged $3.22 ✅",
      "Charged $5.00 ✅",
    ];
    const dieMessages = [
      "Do Not Honor",
      "Declined",
      "Insufficient Funds",
      "Invalid CVV",
      "Card Blocked",
    ];

    return {
      id: Date.now().toString() + Math.random(),
      status: isLive ? "LIVE" : "DIE",
      cardNumber: generateCardNumber(),
      expiry: generateExpiry(),
      message: isLive
        ? liveMessages[Math.floor(Math.random() * liveMessages.length)]
        : dieMessages[Math.floor(Math.random() * dieMessages.length)],
    };
  };

  useEffect(() => {
    const pulse = setInterval(() => {
      setActiveFeed((prev) => !prev);
    }, 1000);
    return () => clearInterval(pulse);
  }, []);

  useEffect(() => {
    // Initialize with some transactions
    const initial: Transaction[] = [];
    for (let i = 0; i < 6; i++) {
      initial.push(generateTransaction());
    }
    setTransactions(initial);

    // Add new transaction every 800ms
    const feedInterval = setInterval(() => {
      const newTransaction = generateTransaction();
      
      setTransactions((prev) => {
        const updated = [newTransaction, ...prev];
        return updated.slice(0, 10); // Keep only last 10
      });

      // Update stats
      if (newTransaction.status === "LIVE") {
        setLiveHits((prev) => prev + 1);
      } else {
        setDeclined((prev) => prev + 1);
      }
      setChecked((prev) => prev + 1);
    }, 800);

    return () => clearInterval(feedInterval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={["rgba(212, 175, 55, 0.2)", "transparent"]}
            style={styles.iconBox}
          >
            <MaterialIcons name="lock" size={18} color="#D4AF37" />
          </LinearGradient>
          <Text style={styles.logoText}>
            Namso<Text style={styles.logoAccent}>Pro</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Glow */}
        <LinearGradient
          colors={[
            "rgba(212, 175, 55, 0.22)",
            "rgba(212, 175, 55, 0.06)",
            "rgba(212, 175, 55, 0)",
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 1, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGlow}
        />

        {/* Status Badge */}
        <View style={styles.statusBadgeContainer}>
          <View style={[styles.statusDot, activeFeed && styles.statusDotActive]} />
          <Text style={styles.statusText}>System Database Updated: Today</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Stop Paying{" "}
            <Text style={styles.strikethrough}>$20</Text> Per Card.
          </Text>
          <MaskedView
            maskElement={
              <Text style={styles.heroGradientText}>
                Get Unlimited Lifetime Access.
              </Text>
            }
          >
            <LinearGradient
              colors={["#A78BFA", "#60A5FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextWrapper}
            >
              <Text style={[styles.heroGradientText, { opacity: 0 }]}>
                Get Unlimited Lifetime Access.
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text style={styles.heroSubtitle}>
            Replace credit card shops that are always dead. Stop wasting money on
            single cards. Get guaranteed unlimited valid cards for a one-time payment.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <LinearGradient
              colors={["#D4AF37", "#FDE68A", "#D4AF37"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              <MaterialIcons name="bolt" size={20} color="#000" />
              <Text style={styles.primaryButtonText}>Get Unlimited Access</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <MaterialIcons name="chat" size={18} color="#FFF" />
            <Text style={styles.secondaryButtonText}>Join VIP Channel</Text>
          </TouchableOpacity>
        </View>

        {/* Terminal Feed */}
        <View style={styles.terminalCard}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.terminalDot, { backgroundColor: "#EF4444" }]} />
              <View style={[styles.terminalDot, { backgroundColor: "#F59E0B" }]} />
              <View style={[styles.terminalDot, { backgroundColor: "#10B981" }]} />
            </View>
            <View style={styles.activeFeedBadge}>
              <View style={[styles.feedDot, activeFeed && styles.feedDotActive]} />
              <Text style={styles.activeFeedText}>ACTIVE FEED</Text>
            </View>
          </View>

          <View style={styles.terminalStats}>
            <View style={styles.terminalStat}>
              <Text style={styles.terminalStatValue}>{liveHits.toLocaleString()}</Text>
              <Text style={styles.terminalStatLabel}>Live Hits</Text>
            </View>
            <View style={styles.terminalStat}>
              <Text style={[styles.terminalStatValue, { color: "#EF4444" }]}>{declined.toLocaleString()}</Text>
              <Text style={styles.terminalStatLabel}>Declined</Text>
            </View>
            <View style={styles.terminalStat}>
              <Text style={[styles.terminalStatValue, { color: "#60A5FA" }]}>{checked.toLocaleString()}</Text>
              <Text style={styles.terminalStatLabel}>Checked</Text>
            </View>
          </View>

          <View style={styles.terminalFeed}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <Text
                  style={[
                    styles.transactionStatus,
                    transaction.status === "LIVE"
                      ? styles.statusLive
                      : styles.statusDie,
                  ]}
                >
                  {transaction.status}
                </Text>
                <Text
                  style={[
                    styles.transactionCard,
                    transaction.status === "DIE" && styles.transactionCardDie,
                  ]}
                >
                  {transaction.cardNumber}
                </Text>
                <Text style={styles.transactionSeparator}>|</Text>
                <Text style={styles.transactionExpiry}>{transaction.expiry}</Text>
                <Text style={styles.transactionSeparator}>|</Text>
                <Text
                  style={[
                    styles.transactionMessage,
                    transaction.status === "LIVE"
                      ? styles.messageLive
                      : styles.messageDie,
                  ]}
                >
                  {transaction.message}
                </Text>
              </View>
            ))}
            <View style={styles.terminalInput}>
              <Text style={styles.terminalPrompt}>➜</Text>
              <Text style={styles.terminalPath}>~</Text>
              <Text style={styles.terminalCursor}>_</Text>
            </View>
          </View>
        </View>

        {/* Why Choose Section */}
        <Text style={styles.sectionTitle}>
          Stop Wasting Money on <Text style={styles.redText}>Dead Shops</Text>
        </Text>

        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
              <MaterialIcons name="money-off" size={24} color="#EF4444" />
            </View>
            <Text style={styles.featureTitle}>Save Hundreds</Text>
            <Text style={styles.featureDesc}>
              Stop spending $15-$25 on single cards that die in one hit. One payment solves this forever.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
              <MaterialIcons name="account-balance" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.featureTitle}>High Balances</Text>
            <Text style={styles.featureDesc}>
              We only provide cards with money. Expect $1000+ balances on Gold/Platinum cards.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
              <MaterialIcons name="all-inclusive" size={24} color="#22C55E" />
            </View>
            <Text style={styles.featureTitle}>Truly Unlimited</Text>
            <Text style={styles.featureDesc}>
              Generate as many cards as you need. No daily limits. No hidden fees. Just unlimited access.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "rgba(168, 85, 247, 0.1)" }]}>
              <MaterialIcons name="vpn-key" size={24} color="#A855F7" />
            </View>
            <Text style={styles.featureTitle}>Private Gateway</Text>
            <Text style={styles.featureDesc}>
              Access the same private source we use. Bypassing public dead bins for maximum validity.
            </Text>
          </View>
        </View>

        {/* Pricing Section */}
        <Text style={styles.pricingTitle}>One Price. Lifetime Access.</Text>
        <Text style={styles.pricingSubtitle}>
          Join 10,000+ users who stopped overpaying for dead cards.
        </Text>

        {/* Gold Tier */}
        <View style={styles.pricingCard}>
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <View style={styles.goldBorder} />

          <Text style={styles.tierLabel}>Unlimited CC + Balance</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>$49</Text>
            <Text style={styles.priceLabel}> / one-time</Text>
          </View>
          <View style={styles.saveBadge}>
            <Text style={styles.saveText}>Save $950+ per year</Text>
          </View>

          <View style={styles.slotsContainer}>
            <View style={styles.slotsTextRow}>
              <Text style={styles.slotsText}>Spots filling fast</Text>
              <Text style={styles.slotsText}>8/100 remaining today</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.featuresList}>
            <Text style={styles.unlimitedText}>
              <Text style={styles.boldText}>Unlimited</Text> Live Cards with Money
            </Text>

            <View style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={12} color="#22C55E" />
              </View>
              <Text style={styles.featureText}>
                <Text style={styles.boldText}>$1000+</Text> Guaranteed Balance
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={12} color="#22C55E" />
              </View>
              <Text style={styles.featureText}>Full Info (CVV + Address) Included</Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={12} color="#22C55E" />
              </View>
              <Text style={styles.featureText}>Auto-Replacement (No Dead Cards)</Text>
            </View>

            <View style={styles.goldFeature}>
              <MaterialIcons name="lock" size={16} color="#D4AF37" />
              <Text style={styles.goldFeatureText}>Private Telegram Group Access</Text>
              <View style={styles.goldTag}>
                <Text style={styles.goldTagText}>GOLD</Text>
              </View>
            </View>

            <View style={styles.goldFeature}>
              <MaterialIcons name="tips-and-updates" size={16} color="#D4AF37" />
              <View style={{ flex: 1 }}>
                <Text style={styles.goldFeatureText}>Binance VIP Crypto Signals</Text>
                <Text style={styles.winRateText}>92% Win Rate</Text>
              </View>
              <View style={styles.goldTag}>
                <Text style={styles.goldTagText}>GOLD</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.cryptoButton} activeOpacity={0.8}>
            <MaterialIcons name="currency-bitcoin" size={20} color="#FFF" />
            <Text style={styles.cryptoButtonText}>Pay with Crypto ($49)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminButton} activeOpacity={0.8}>
            <MaterialIcons name="support-agent" size={20} color="#FFF" />
            <Text style={styles.adminButtonText}>Contact Admin</Text>
          </TouchableOpacity>

          <Text style={styles.deliveryText}>Automated instant delivery after payment.</Text>
        </View>

        {/* Additional Plans */}
        <View style={[styles.altPlansGrid, isTablet && styles.altPlansGridTablet]}>
          {isTablet ? (
            <>
              <View style={[styles.altPlanCard, styles.altPlanCardBasic]}>
                <View style={styles.altPlanHead}>
                  <Text style={styles.altPlanTitle}>Ultimate</Text>
                  <Text style={styles.altPlanSub}>PERFECT FOR BEGINNERS</Text>
                  <View style={styles.altPlanPriceRow}>
                    <Text style={styles.altPlanPrice}>$19</Text>
                    <Text style={styles.altPlanPriceLabel}>/ 1 year</Text>
                  </View>
                </View>

                <View style={styles.altPlanFeatures}>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Check Limit: <Text style={styles.altPlanFeatureStrong}>Unlimited</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Access: <Text style={styles.altPlanFeatureStrong}>1 Year</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Private Gateway: <Text style={styles.altPlanFeatureStrong}>Included</Text>
                    </Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Balance / Money</Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Support</Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Updates</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.altPlanButtonBasic} activeOpacity={0.85}>
                  <MaterialIcons name="shopping-cart" size={16} color="#FFF" />
                  <Text style={styles.altPlanButtonText}>Get Ultimate ($19)</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.altPlanCard, styles.altPlanCardPro]}>
                <LinearGradient
                  colors={[
                    "rgba(59, 130, 246, 0.32)",
                    "rgba(59, 130, 246, 0.12)",
                    "rgba(59, 130, 246, 0)",
                  ]}
                  locations={[0, 0.55, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.altPlanGlow}
                />
                <View style={styles.altPlanHead}>
                  <Text style={styles.altPlanTitle}>Ultimate PRO</Text>
                  <Text style={[styles.altPlanSub, styles.altPlanSubBlue]}>FOR PROFESSIONALS</Text>
                  <View style={styles.altPlanPriceRow}>
                    <Text style={styles.altPlanPrice}>$29</Text>
                    <Text style={styles.altPlanPriceLabel}>/ one-time</Text>
                  </View>
                </View>

                <View style={styles.altPlanFeatures}>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Check Limit: <Text style={styles.altPlanFeatureStrong}>Unlimited</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Access: <Text style={styles.altPlanFeatureStrong}>Lifetime 24/7</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="verified" size={15} color="#3B82F6" />
                    <Text style={styles.altPlanFeatureText}>
                      Priority Support: <Text style={styles.altPlanFeatureStrong}>VIP</Text>
                    </Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Balance / Money</Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="verified" size={15} color="#3B82F6" />
                    <Text style={styles.altPlanFeatureText}>
                      Internal Updates: <Text style={styles.altPlanFeatureStrong}>First</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.altPlanButtonPro} activeOpacity={0.85}>
                  <MaterialIcons name="shopping-cart" size={16} color="#FFF" />
                  <Text style={styles.altPlanButtonText}>Get PRO ($29)</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.altPlanCard, styles.altPlanCardPro]}>
                <LinearGradient
                  colors={[
                    "rgba(59, 130, 246, 0.32)",
                    "rgba(59, 130, 246, 0.12)",
                    "rgba(59, 130, 246, 0)",
                  ]}
                  locations={[0, 0.55, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.altPlanGlow}
                />
                <View style={styles.altPlanHead}>
                  <Text style={styles.altPlanTitle}>Ultimate PRO</Text>
                  <Text style={[styles.altPlanSub, styles.altPlanSubBlue]}>FOR PROFESSIONALS</Text>
                  <View style={styles.altPlanPriceRow}>
                    <Text style={styles.altPlanPrice}>$29</Text>
                    <Text style={styles.altPlanPriceLabel}>/ one-time</Text>
                  </View>
                </View>

                <View style={styles.altPlanFeatures}>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Check Limit: <Text style={styles.altPlanFeatureStrong}>Unlimited</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Access: <Text style={styles.altPlanFeatureStrong}>Lifetime 24/7</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="verified" size={15} color="#3B82F6" />
                    <Text style={styles.altPlanFeatureText}>
                      Priority Support: <Text style={styles.altPlanFeatureStrong}>VIP</Text>
                    </Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Balance / Money</Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="verified" size={15} color="#3B82F6" />
                    <Text style={styles.altPlanFeatureText}>
                      Internal Updates: <Text style={styles.altPlanFeatureStrong}>First</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.altPlanButtonPro} activeOpacity={0.85}>
                  <MaterialIcons name="shopping-cart" size={16} color="#FFF" />
                  <Text style={styles.altPlanButtonText}>Get PRO ($29)</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.altPlanCard, styles.altPlanCardBasic]}>
                <View style={styles.altPlanHead}>
                  <Text style={styles.altPlanTitle}>Ultimate</Text>
                  <Text style={styles.altPlanSub}>PERFECT FOR BEGINNERS</Text>
                  <View style={styles.altPlanPriceRow}>
                    <Text style={styles.altPlanPrice}>$19</Text>
                    <Text style={styles.altPlanPriceLabel}>/ 1 year</Text>
                  </View>
                </View>

                <View style={styles.altPlanFeatures}>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Check Limit: <Text style={styles.altPlanFeatureStrong}>Unlimited</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Access: <Text style={styles.altPlanFeatureStrong}>1 Year</Text>
                    </Text>
                  </View>
                  <View style={styles.altPlanFeatureRow}>
                    <MaterialIcons name="check-circle" size={15} color="#22C55E" />
                    <Text style={styles.altPlanFeatureText}>
                      Private Gateway: <Text style={styles.altPlanFeatureStrong}>Included</Text>
                    </Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Balance / Money</Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Support</Text>
                  </View>
                  <View style={[styles.altPlanFeatureRow, styles.altPlanFeatureMuted]}>
                    <MaterialIcons name="cancel" size={15} color="#EF4444" />
                    <Text style={styles.altPlanFeatureMutedText}>No Updates</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.altPlanButtonBasic} activeOpacity={0.85}>
                  <MaterialIcons name="shopping-cart" size={16} color="#FFF" />
                  <Text style={styles.altPlanButtonText}>Get Ultimate ($19)</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Included with Premium */}
        <View style={styles.includedSection}>
          <Text style={styles.includedTitle}>Included with Premium Access</Text>

          <View style={[styles.includedCard, styles.includedCardGold]}>
            <LinearGradient
              colors={[
                "rgba(212, 175, 55, 0.22)",
                "rgba(212, 175, 55, 0.12)",
                "rgba(212, 175, 55, 0.04)",
                "rgba(212, 175, 55, 0.01)",
              ]}
              locations={[0, 0.35, 0.75, 1]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.includedGlowGold}
            />
            <View style={styles.includedIconWrapGold}>
              <MaterialIcons name="candlestick-chart" size={19} color="#D4AF37" />
            </View>
            <View style={styles.includedBody}>
              <Text style={styles.includedCardTitle}>Binance VIP Signals</Text>
              <Text style={styles.includedCardDesc}>
                Copy our exact trades. Our VIP signal group prints money daily with high-accuracy crypto calls.
              </Text>
              <View style={styles.winBadge}>
                <MaterialIcons name="verified" size={11} color="#D4AF37" />
                <Text style={styles.winBadgeText}>92% Win Rate</Text>
              </View>
            </View>
          </View>

          <View style={[styles.includedCard, styles.includedCardBlue]}>
            <LinearGradient
              colors={[
                "rgba(59, 130, 246, 0.22)",
                "rgba(59, 130, 246, 0.12)",
                "rgba(59, 130, 246, 0.04)",
                "rgba(59, 130, 246, 0.01)",
              ]}
              locations={[0, 0.35, 0.75, 1]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.includedGlowBlue}
            />
            <View style={styles.includedIconWrapBlue}>
              <MaterialIcons name="groups" size={19} color="#3B82F6" />
            </View>
            <View style={styles.includedBody}>
              <Text style={styles.includedCardTitle}>Private Telegram Community</Text>
              <Text style={styles.includedCardDesc}>
                Join an elite community of users and traders. Share methods, get support, and network with pros.
              </Text>
            </View>
          </View>

          <View style={styles.includedCard}> 
            <View style={styles.miniGridIcon}>
              <View style={[styles.miniGridCell, { backgroundColor: "#DC2626" }]}>
                <Text style={styles.miniGridText}>N</Text>
              </View>
              <View style={[styles.miniGridCell, { backgroundColor: "#16A34A" }]}>
                <Text style={styles.miniGridText}>S</Text>
              </View>
              <View style={[styles.miniGridCell, { backgroundColor: "#FFFFFF" }]}>
                <MaterialIcons name="ios-share" size={10} color="#000" />
              </View>
              <View style={[styles.miniGridCell, { backgroundColor: "#2563EB" }]}>
                <Text style={styles.miniGridText}>eb</Text>
              </View>
            </View>
            <View style={styles.includedBody}>
              <Text style={styles.includedCardTitle}>Free Premium Methods</Text>
              <Text style={styles.includedCardDesc}>
                Stop paying subscriptions. Get working methods for Netflix, Spotify, Apple, eBay and more.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Questions?</Text>
          <View style={styles.faqList}>
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <View key={item.question} style={styles.faqItem}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.faqQuestionRow}
                    onPress={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <MaterialIcons
                      name={isOpen ? "expand-less" : "expand-more"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  {isOpen ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <View style={styles.footerLinks}>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.footerLinkText}>Contact Us</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSupportBadge}>
            <View style={styles.footerSupportDot} />
            <Text style={styles.footerSupportText}>Telegram Support Active</Text>
          </View>

          <Text style={styles.footerCopy}>
            © 2025 NamsoPro Security. All rights reserved.{"\n"}Encrypted connection established.
          </Text>
        </View>

        {/* Space for bottom nav */}
        <View style={{ height: 118 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavInner}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <MaterialIcons name="construction" size={24} color="#9CA3AF" />
            <Text style={styles.navLabel}>Tools</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <MaterialIcons name="history" size={24} color="#9CA3AF" />
            <Text style={styles.navLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItemActive} activeOpacity={0.7}>
            <LinearGradient
              colors={["rgba(212, 175, 55, 0.12)", "rgba(212, 175, 55, 0)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.navActiveGlow}
            />
            <MaterialIcons name="diamond" size={32} color="#D4AF37" />
            <Text style={styles.navLabelActive}>Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <MaterialIcons name="person" size={24} color="#9CA3AF" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <MaterialIcons name="settings" size={24} color="#9CA3AF" />
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050507",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#050507",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#F5F5F5",
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: "#D4AF37",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backgroundGlow: {
    position: "absolute",
    top: -150,
    right: -170,
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.45,
  },
  statusBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1A3828",
    borderWidth: 1,
    borderColor: "rgba(39, 201, 63, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#27C93F",
    opacity: 0.3,
  },
  statusDotActive: {
    opacity: 1,
  },
  statusText: {
    color: "#27C93F",
    fontSize: 10,
    fontWeight: "bold" as "bold",
    letterSpacing: 1,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800" as "800",
    color: "#F5F5F5",
    textAlign: "center",
    lineHeight: 36,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    textDecorationColor: "#EF4444",
    color: "#EF4444",
  },
  gradientTextWrapper: {
    alignSelf: "center",
  },
  heroGradientText: {
    fontSize: 28,
    fontWeight: "800" as "800",
    color: "#000",
    textAlign: "center",
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 10,
  },
  ctaButtons: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold" as "bold",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#18181B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600" as "600",
  },
  terminalCard: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    marginBottom: 32,
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  terminalDots: {
    flexDirection: "row",
    gap: 6,
  },
  terminalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeFeedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  feedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    opacity: 0.3,
  },
  feedDotActive: {
    opacity: 1,
  },
  activeFeedText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "bold" as "bold",
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  terminalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  terminalStat: {
    alignItems: "center",
  },
  terminalStatValue: {
    fontSize: 18,
    fontWeight: "bold" as "bold",
    color: "#10B981",
    fontFamily: "monospace",
  },
  terminalStatLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 2,
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  terminalFeed: {
    padding: 16,
    minHeight: 200,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.03)",
    flexWrap: "wrap",
    gap: 8,
  },
  transactionStatus: {
    fontSize: 10,
    fontWeight: "bold" as "bold",
    fontFamily: "monospace",
    width: 40,
  },
  statusLive: {
    color: "#10B981",
  },
  statusDie: {
    color: "#EF4444",
  },
  transactionCard: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#9CA3AF",
  },
  transactionCardDie: {
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  transactionSeparator: {
    fontSize: 10,
    color: "#4B5563",
    fontFamily: "monospace",
  },
  transactionExpiry: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  transactionMessage: {
    fontSize: 10,
    fontFamily: "monospace",
    flex: 1,
  },
  messageLive: {
    color: "#10B981",
  },
  messageDie: {
    color: "#7F1D1D",
  },
  terminalInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    gap: 8,
  },
  terminalPrompt: {
    fontSize: 14,
    color: "#10B981",
    fontFamily: "monospace",
  },
  terminalPath: {
    fontSize: 14,
    color: "#60A5FA",
    fontFamily: "monospace",
  },
  terminalCursor: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "monospace",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as "bold",
    color: "#F5F5F5",
    textAlign: "center",
    marginBottom: 24,
  },
  redText: {
    color: "#EF4444",
  },
  featuresGrid: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    width: "100%",
    backgroundColor: "#18181B",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "bold" as "bold",
    color: "#F5F5F5",
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 11,
    color: "#A1A1AA",
    lineHeight: 16,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: "bold" as "bold",
    color: "#F5F5F5",
    textAlign: "center",
    marginBottom: 8,
  },
  pricingSubtitle: {
    fontSize: 11,
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: 32,
  },
  pricingCard: {
    backgroundColor: "#0E0E11",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    shadowColor: "rgba(212, 175, 55, 0.1)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  bestValueBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    zIndex: 10,
  },
  bestValueText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "bold" as "bold",
    letterSpacing: 1,
  },
  goldBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#D4AF37",
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: "bold" as "bold",
    color: "#A1A1AA",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: "800" as "800",
    color: "#FFF",
    letterSpacing: -2,
  },
  priceLabel: {
    fontSize: 14,
    color: "#A1A1AA",
    fontWeight: "500" as "500",
  },
  saveBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 24,
  },
  saveText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "600" as "600",
  },
  slotsContainer: {
    marginBottom: 24,
  },
  slotsTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  slotsText: {
    fontSize: 9,
    color: "#6B7280",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "92%",
    height: "100%",
    backgroundColor: "#EF4444",
    borderRadius: 3,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  unlimitedText: {
    fontSize: 11,
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: 8,
  },
  boldText: {
    fontWeight: "bold" as "bold",
    color: "#FFF",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#D1D5DB",
    flex: 1,
  },
  goldFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  goldFeatureText: {
    fontSize: 12,
    color: "#D1D5DB",
    flex: 1,
  },
  winRateText: {
    fontSize: 9,
    color: "#10B981",
    fontFamily: "monospace",
    marginTop: 2,
  },
  goldTag: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goldTagText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "bold" as "bold",
  },
  cryptoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cryptoButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold" as "bold",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  adminButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold" as "bold",
  },
  deliveryText: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    opacity: 0.6,
  },
  altPlansGrid: {
    gap: 20,
    marginTop: 24,
    marginBottom: 28,
  },
  altPlansGridTablet: {
    flexDirection: "row",
  },
  altPlanCard: {
    flex: 1,
    backgroundColor: "#17171D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 22,
    overflow: "hidden",
  },
  altPlanCardPro: {
    borderColor: "rgba(59, 130, 246, 0.35)",
    position: "relative",
  },
  altPlanCardBasic: {
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  altPlanGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
    opacity: 0.38,
  },
  altPlanHead: {
    alignItems: "center",
    marginBottom: 18,
  },
  altPlanTitle: {
    fontSize: 21,
    fontWeight: "800" as "800",
    color: "#FFF",
    marginBottom: 4,
  },
  altPlanSub: {
    fontSize: 10,
    fontWeight: "700" as "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 12,
  },
  altPlanSubBlue: {
    color: "#60A5FA",
  },
  altPlanPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  altPlanPrice: {
    fontSize: 32,
    fontWeight: "800" as "800",
    color: "#FFF",
  },
  altPlanPriceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  altPlanFeatures: {
    gap: 10,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  altPlanFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  altPlanFeatureText: {
    fontSize: 12,
    color: "#9CA3AF",
    flex: 1,
  },
  altPlanFeatureStrong: {
    color: "#FFF",
    fontWeight: "700" as "700",
  },
  altPlanFeatureMuted: {
    opacity: 0.55,
  },
  altPlanFeatureMutedText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  altPlanButtonPro: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  altPlanButtonBasic: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  altPlanButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700" as "700",
  },
  includedSection: {
    marginBottom: 32,
  },
  includedTitle: {
    fontSize: 20,
    fontWeight: "800" as "800",
    color: "#F5F5F5",
    textAlign: "center",
    marginBottom: 16,
  },
  includedCard: {
    backgroundColor: "#111217",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  includedCardGold: {
    borderColor: "rgba(212, 175, 55, 0.3)",
    overflow: "hidden",
    position: "relative",
  },
  includedCardBlue: {
    borderColor: "rgba(59, 130, 246, 0.3)",
    overflow: "hidden",
    position: "relative",
  },
  includedGlowGold: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 14,
    opacity: 0.35,
  },
  includedGlowBlue: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 14,
    opacity: 0.35,
  },
  includedIconWrapGold: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  includedIconWrapBlue: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  includedBody: {
    flex: 1,
  },
  includedCardTitle: {
    fontSize: 14,
    fontWeight: "700" as "700",
    color: "#FFF",
    marginBottom: 6,
  },
  includedCardDesc: {
    fontSize: 12,
    color: "#A1A1AA",
    lineHeight: 17,
  },
  winBadge: {
    marginTop: 9,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.24)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  winBadgeText: {
    fontSize: 10,
    fontWeight: "700" as "700",
    color: "#D4AF37",
  },
  miniGridIcon: {
    width: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 2,
  },
  miniGridCell: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  miniGridText: {
    fontSize: 8,
    fontWeight: "700" as "700",
    color: "#FFF",
  },
  faqSection: {
    marginBottom: 28,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: "800" as "800",
    color: "#F5F5F5",
    textAlign: "center",
    marginBottom: 14,
  },
  faqList: {
    gap: 10,
  },
  faqItem: {
    backgroundColor: "#17171D",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  faqQuestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600" as "600",
    color: "#F3F4F6",
  },
  faqAnswer: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 24,
    paddingBottom: 8,
    marginBottom: 10,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  footerLinkText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600" as "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  footerSupportBadge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  footerSupportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  footerSupportText: {
    fontSize: 12,
    color: "#60A5FA",
    fontWeight: "500" as "500",
  },
  footerCopy: {
    textAlign: "center",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.35)",
    lineHeight: 15,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(14, 14, 17, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 8,
    paddingBottom: 24,
  },
  bottomNavInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: 8,
  },
  navItem: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  navItemActive: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 2,
    marginTop: -24,
    backgroundColor: "#0E0E11",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    position: "relative",
    shadowColor: "rgba(212, 175, 55, 0.8)",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  navActiveGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500" as "500",
    color: "#9CA3AF",
  },
  navLabelActive: {
    fontSize: 10,
    fontWeight: "bold" as "bold",
    color: "#D4AF37",
  },
});
