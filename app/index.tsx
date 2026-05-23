import React from "react";
import { View, Text, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useProgressStore } from "../stores/useProgressStore";
import { useUserStore } from "../stores/useUserStore";
import StreakBadge from "../components/StreakBadge";
import XPCounter from "../components/XPCounter";
import PathView from "../components/PathView";
import { colors } from "../constants/colors";

export default function HomeScreen() {
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
        <Text style={styles.logo}>Bolo</Text>
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
