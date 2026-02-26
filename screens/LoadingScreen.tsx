import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
};

type LoadingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Loading">;
};

export default function LoadingScreen({ navigation }: LoadingScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      navigation.replace("Landing");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#F6FFFB", "#E8FFF4"]} style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>✔</Text>
        </View>
      </Animated.View>

      <Text style={styles.title}>NamsoTools</Text>
      <Text style={styles.subtitle}>Initializing tools…</Text>

      <ActivityIndicator size="small" color="#14B87A" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: "#14B87A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#14B87A",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold" as "bold",
  },
  title: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: "bold" as "bold",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    color: "#64748B",
  },
});
