import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSetting } from "./settingsUtils";

export type HistoryItem = {
  id: string;
  type: "generator" | "checker" | "bin";
  timestamp: string;
  data: string;
  status?: "success" | "failed" | "live" | "die";
  details?: string;
};

const HISTORY_STORAGE_KEY = "@namso_history";
const MAX_HISTORY_ITEMS = 100;

/**
 * Save a new history item (respects saveHistory setting)
 */
export const saveHistoryItem = async (
  type: "generator" | "checker" | "bin",
  data: string,
  status?: "success" | "failed" | "live" | "die",
  details?: string
): Promise<void> => {
  try {
    // Check if history saving is enabled
    const saveHistoryEnabled = await getSetting("saveHistory");
    if (!saveHistoryEnabled) {
      return; // Don't save if disabled
    }

    // Load existing history
    const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    let history: HistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

    // Create new history item
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      data,
      status,
      details,
    };

    // Add to beginning of array
    history.unshift(newItem);

    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    // Save back to storage
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    // Silently fail - don't crash the app if storage isn't available
    console.warn("Could not save history item:", error);
  }
};

/**
 * Get all history items
 */
export const getHistoryItems = async (): Promise<HistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyJson) {
      return JSON.parse(historyJson);
    }
    return [];
  } catch (error) {
    console.warn("Could not load history:", error);
    return [];
  }
};

/**
 * Clear all history
 */
export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
    throw error;
  }
};

/**
 * Delete a specific history item
 */
export const deleteHistoryItem = async (id: string): Promise<void> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyJson) {
      let history: HistoryItem[] = JSON.parse(historyJson);
      history = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error("Error deleting history item:", error);
  }
};
