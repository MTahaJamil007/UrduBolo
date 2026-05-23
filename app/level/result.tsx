import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Star, RefreshCw, X, Award, Flame } from "lucide-react-native";
import { colors } from "../../constants/colors";
import { useProgressStore } from "../../stores/useProgressStore";

export default function LevelResultScreen() {
  const router = useRouter();
  const { levelId, score: rawScore } = useLocalSearchParams<{ levelId: string; score: string }>();

  const score = parseFloat(rawScore || "0.0");
  const passed = score >= 0.75;

  const totalXP = useProgressStore((state) => state.totalXP);
  const streak = useProgressStore((state) => state.currentStreak);

  // Decompose levelId
  const [chapterPart, levelPart] = (levelId || "L1-1").split("-");
  const chapterNum = parseInt(chapterPart.slice(1), 10);
  const levelNum = parseInt(levelPart, 10);

  const handleContinue = () => {
    router.dismissAll(); // Return to the Home Screen wavy path
  };

  const handleRetry = () => {
    router.replace(`/level/${levelId}`); // Restart level
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Victory Celebration Card */}
        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: passed ? colors.success : colors.error,
                borderColor: passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
              },
            ]}
          >
            {passed ? (
              <Check size={48} color="#ffffff" strokeWidth={4} />
            ) : (
              <X size={48} color="#ffffff" strokeWidth={4} />
            )}
          </View>

          <Text style={styles.subtitle}>
            Chapter {chapterNum} • Level {chapterNum}.{levelNum}
          </Text>
          
          <Text style={styles.title}>
            {passed ? "Practice Complete!" : "Almost There!"}
          </Text>

          <Text style={styles.scoreText}>
            Accuracy: {Math.round(score * 100)}%
          </Text>

          <Text style={styles.description}>
            {passed
              ? "Assalam alaikum! You passed this level successfully. Your pronunciation and vocabulary skills are progressing beautifully."
              : "Don't worry! Heritage learning requires practice. Let's try again to build your confidence and polish your pronunciation."}
          </Text>

          {/* Reward Badges Panel */}
          {passed && (
            <View style={styles.rewardsPanel}>
              <View style={styles.rewardBadge}>
                <Star size={24} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.rewardValue}>+10 XP</Text>
                <Text style={styles.rewardLabel}>Total: {totalXP} XP</Text>
              </View>
              
              <View style={styles.rewardDivider} />
              
              <View style={styles.rewardBadge}>
                <Flame size={24} color="#f97316" fill="#f97316" />
                <Text style={styles.rewardValue}>{streak} Day</Text>
                <Text style={styles.rewardLabel}>Streak</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.actions}>
          {passed ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleContinue}
              style={styles.primaryBtn}
            >
              <Award size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Continue to Path</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRetry}
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              >
                <RefreshCw size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleContinue}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Back to Path</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#0d5c56",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 40,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitle: {
    color: "#2dd4bf",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },
  scoreText: {
    color: "#fecdd3",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  description: {
    color: "#a7f3d0",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
    maxWidth: 280,
    marginBottom: 24,
  },
  rewardsPanel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#092e2b",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  rewardBadge: {
    flex: 1,
    alignItems: "center",
  },
  rewardValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  rewardLabel: {
    color: "#a7f3d0",
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.7,
  },
  rewardDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  actions: {
    width: "100%",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(20, 184, 166, 0.3)",
    marginTop: 12,
  },
  secondaryBtnText: {
    color: "#2dd4bf",
    fontSize: 16,
    fontWeight: "800",
  },
});
