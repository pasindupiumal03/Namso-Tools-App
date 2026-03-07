import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoadingScreen from "./screens/LoadingScreen";
import LandingScreen from "./screens/LandingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import GeneratorScreen from "./screens/GeneratorScreen";
import CheckerScreen from "./screens/CheckerScreen";
import BINCheckupScreen from "./screens/BINCheckupScreen";
import PrivateGateScreen from "./screens/PrivateGateScreen";

export type RootStackParamList = {
  Loading: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Generator: undefined;
  Checker: undefined;
  BINCheckup: undefined;
  PrivateGate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Generator" component={GeneratorScreen} />
        <Stack.Screen name="Checker" component={CheckerScreen} />
        <Stack.Screen name="BINCheckup" component={BINCheckupScreen} />
        <Stack.Screen name="PrivateGate" component={PrivateGateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
