import React from "react";
import { View, Text, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Volume2, Settings } from "lucide-react-native";
import { useProgressStore } from "../stores/useProgressStore";
import { useUserStore } from "../stores/useUserStore";
import StreakBadge from "../components/StreakBadge";
import XPCounter from "../components/XPCounter";
import PathView from "../components/PathView";
import { colors } from "../constants/colors";

export default function HomeScreen() {
  const router = useRouter();
  
  // Read state from Zustand stores
  const userName = useUserStore((state) => state.name);
  const totalXP = useProgressStore((state) => state.totalXP);
  const streak = useProgressStore((state) => state.currentStreak);

  // Fallback greeting if name is not set
  const greeting = userName ? `Assalam alaikum, ${userName}!` : "Assalam alaikum!";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* 1. Sticky Header - Branding & Stats */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.logo}>Bolo</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/audio-test")}
            style={styles.debugAudioBtn}
          >
            <Volume2 size={16} color="#2dd4bf" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/settings")}
            style={styles.settingsBtn}
          >
            <Settings size={16} color="#2dd4bf" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <StreakBadge count={streak} />
          <View style={{ width: 10 }} />
          <XPCounter amount={totalXP} />
        </View>
      </View>

      {/* 2. Personalization greeting banner */}
      <View style={styles.greetingBanner}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.subGreetingText}>
          Let's practice your Urdu speaking skills today.
        </Text>
      </View>

      {/* 3. The vertical Duolingo wavy path list */}
      <View style={styles.pathContainer}>
        <PathView />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}40`, // 25% opacity border
  },
  logo: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  debugAudioBtn: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  settingsBtn: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingBanner: {
    backgroundColor: "#0d5c56",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.primaryLight}30`,
  },
  greetingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subGreetingText: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.8,
  },
  pathContainer: {
    flex: 1,
  },
});
