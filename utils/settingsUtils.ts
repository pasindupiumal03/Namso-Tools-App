import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserSettings = {
  pushNotifications: boolean;
  autoCopyResults: boolean;
  saveHistory: boolean;
  compactCards: boolean;
};

const SETTINGS_STORAGE_KEY = "@namso_settings";

const defaultSettings: UserSettings = {
  pushNotifications: true,
  autoCopyResults: false,
  saveHistory: true,
  compactCards: false,
};

/**
 * Get current user settings with defaults
 */
export const getSettings = async (): Promise<UserSettings> => {
  try {
    const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as UserSettings;
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  } catch (error) {
    console.warn("Could not load settings:", error);
    return defaultSettings;
  }
};

/**
 * Get a specific setting value
 */
export const getSetting = async <K extends keyof UserSettings>(
  key: K
): Promise<UserSettings[K]> => {
  const settings = await getSettings();
  return settings[key];
};

/**
 * Save settings to storage
 */
export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Could not save settings:", error);
    throw error;
  }
};
