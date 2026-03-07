import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteHistoryItem } from "../utils/historyUtils";

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

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "History">;
};

type HistoryFilter = "all" | "generator" | "checker" | "bin";

export type HistoryItem = {
  id: string;
  type: "generator" | "checker" | "bin";
  timestamp: string;
  data: string;
  status?: "success" | "failed" | "live" | "die";
  details?: string;
};

const HISTORY_STORAGE_KEY = "@namso_history";

// Swipeable History Item Component
type SwipeableHistoryItemProps = {
  item: HistoryItem;
  onDelete: (id: string) => void;
  getTypeIcon: (type: string) => string;
  getTypeColor: (type: string) => string;
  getStatusColor: (status?: string) => string;
  formatTimestamp: (dateString: string) => string;
  getTypeName: (type: string) => string;
};

const SwipeableHistoryItem = ({
  item,
  onDelete,
  getTypeIcon,
  getTypeColor,
  getStatusColor,
  formatTimestamp,
  getTypeName,
}: SwipeableHistoryItemProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if horizontal swipe is significant
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        setSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swipe to the left (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setSwiping(false);
        // If swiped more than 50px, snap to reveal delete button
        if (gestureState.dx < -50) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        } else {
          // Otherwise, snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    // Animate out
    Animated.timing(translateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(item.id);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Button Background */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.7}
          onPress={handleDelete}
        >
          <MaterialIcons name="delete" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Swipeable Card */}
      <Animated.View
        style={[
          styles.swipeableCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.historyCard}
          activeOpacity={swiping ? 1 : 0.7}
          disabled={swiping}
        >
          {/* Type Icon */}
          <View
            style={[
              styles.historyIcon,
              { backgroundColor: `${getTypeColor(item.type)}15` },
            ]}
          >
            <MaterialIcons
              name={getTypeIcon(item.type) as any}
              size={22}
              color={getTypeColor(item.type)}
            />
          </View>

          {/* Content */}
          <View style={styles.historyContent}>
            <View style={styles.historyTop}>
              <Text style={styles.historyType}>{getTypeName(item.type)}</Text>
              <Text style={styles.historyTime}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
            <Text style={styles.historyData}>{item.data}</Text>
            {item.details && (
              <Text style={styles.historyDetails}>{item.details}</Text>
            )}
            {item.status && (
              <View style={styles.historyFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.status)}15` },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Arrow */}
          <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    // Set up listener to reload history when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyJson) {
        const history: HistoryItem[] = JSON.parse(historyJson);
        // Sort by timestamp (newest first)
        history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistoryData(history);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      // Gracefully handle storage errors - continue with empty history
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
              setHistoryData([]);
              Alert.alert("Success", "History cleared successfully");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      // Update local state to remove the item
      setHistoryData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const filteredHistory =
    filter === "all"
      ? historyData
      : historyData.filter((item) => item.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "generator":
        return "credit-card";
      case "checker":
        return "list-alt";
      case "bin":
        return "search";
      default:
        return "help";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "generator":
        return "#10B981";
      case "checker":
        return "#F59E0B";
      case "bin":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "live":
      case "success":
        return "#10B981";
      case "die":
      case "failed":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "generator":
        return "Generator";
      case "checker":
        return "Checker";
      case "bin":
        return "BIN Lookup";
      default:
        return "Unknown";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <MaterialIcons name="history" size={20} color="#10B981" />
          </View>
          <Text style={styles.logoText}>Activity History</Text>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.7}
          onPress={clearHistory}
        >
          <MaterialIcons name="delete-sweep" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
            activeOpacity={0.7}
            onPress={() => setFilter("all")}
          >
            <MaterialIcons
              name="select-all"
              size={18}
              color={filter === "all" ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "generator" && styles.filterTabActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setFilter("generator")}
          >
            <MaterialIcons
              name="credit-card"
              size={18}
              color={filter === "generator" ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.filterText,
                filter === "generator" && styles.filterTextActive,
              ]}
            >
              Generator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "checker" && styles.filterTabActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setFilter("checker")}
          >
            <MaterialIcons
              name="list-alt"
              size={18}
              color={filter === "checker" ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.filterText,
                filter === "checker" && styles.filterTextActive,
              ]}
            >
              Checker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === "bin" && styles.filterTabActive]}
            activeOpacity={0.7}
            onPress={() => setFilter("bin")}
          >
            <MaterialIcons
              name="search"
              size={18}
              color={filter === "bin" ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.filterText,
                filter === "bin" && styles.filterTextActive,
              ]}
            >
              BIN Lookup
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <MaterialIcons name="history" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
              Your activity will appear here once you start using tools.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {filteredHistory.map((item) => (
              <SwipeableHistoryItem
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                getStatusColor={getStatusColor}
                formatTimestamp={formatTimestamp}
                getTypeName={getTypeName}
              />
            ))}

            {/* Load More */}
            <TouchableOpacity style={styles.loadMoreButton} activeOpacity={0.7}>
              <MaterialIcons name="refresh" size={20} color="#6B7280" />
              <Text style={styles.loadMoreText}>Load More History</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Activity Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="credit-card" size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                {historyData.filter((i) => i.type === "generator").length}
              </Text>
              <Text style={styles.statLabel}>Generated</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="list-alt" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {historyData.filter((i) => i.type === "checker").length}
              </Text>
              <Text style={styles.statLabel}>Checked</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="search" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>
                {historyData.filter((i) => i.type === "bin").length}
              </Text>
              <Text style={styles.statLabel}>BIN Lookups</Text>
            </View>
          </View>
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

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialIcons name="history" size={26} color="#10B981" />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Profile")}
        >
          <MaterialIcons name="account-circle" size={26} color="#9CA3AF" />
          <Text style={[styles.navLabel, { color: "#9CA3AF" }]}>Profile</Text>
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
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: -0.5,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "#10B981",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 280,
  },
  historyList: {
    gap: 12,
  },
  swipeableContainer: {
    position: "relative",
    marginBottom: 0,
  },
  deleteBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  swipeableCard: {
    backgroundColor: "#F9FAFB",
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  historyContent: {
    flex: 1,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  historyTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  historyData: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  statsCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
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
