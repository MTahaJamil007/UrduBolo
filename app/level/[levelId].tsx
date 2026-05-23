import React from "react";
import { View, Text, TouchableOpacity, Alert, SafeAreaView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProgressStore } from "../../stores/useProgressStore";
import { useUserStore } from "../../stores/useUserStore";
import { colors } from "../../constants/colors";
import { Crown, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react-native";

export default function LevelPlayerPlaceholder() {
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();

  // Extract chapter and level numbers
  const [chapterPart, levelPart] = levelId.split("-");
  const chapterNum = parseInt(chapterPart.slice(1), 10);
  const levelNum = parseInt(levelPart, 10);
  const chapterId = `C${chapterNum.toString().padStart(2, "0")}`;
  const isBoss = levelNum === 5;

  // Progress store hooks
  const completeLevel = useProgressStore((state) => state.completeLevel);
  const completeChapter = useProgressStore((state) => state.completeChapter);
  const addXP = useProgressStore((state) => state.addXP);

  const handleMockComplete = () => {
    // 1. Complete this level with a mastery score of 90% (>= 75% passes)
    completeLevel(levelId, 0.9);

    // 2. If it is the BOSS level, trigger chapter completion
    if (isBoss) {
      completeChapter(chapterId);
      addXP(50); // Award Chapter Complete bonus XP
      Alert.alert(
        "🎉 Chapter Complete!",
        `Congratulations! You completed Chapter ${chapterNum} Boss Challenge and unlocked Chapter ${chapterNum + 1}!`,
        [{ text: "Back to Path", onPress: () => router.dismissAll() }]
      );
    } else {
      Alert.alert(
        "✅ Level Passed!",
        `You completed Level ${chapterNum}.${levelNum} and earned 10 XP!`,
        [{ text: "Back to Path", onPress: () => router.back() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Practice Session</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Level Details Panel */}
        <View style={styles.detailsCard}>
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-6 border-2 ${
              isBoss
                ? "bg-[#d97706]/20 border-[#f59e0b]"
                : "bg-[#0f766e]/20 border-[#14b8a6]"
            }`}
          >
            {isBoss ? (
              <Crown size={40} color="#f59e0b" fill="#f59e0b" />
            ) : (
              <BookOpen size={40} color="#2dd4bf" />
            )}
          </View>

          <Text style={styles.subtitle}>
            Chapter {chapterNum} • Level {chapterNum}.{levelNum}
          </Text>
          
          <Text style={styles.title}>
            {isBoss ? "BOSS: First Meeting" : `Level ${chapterNum}.${levelNum} Practice`}
          </Text>

          <Text style={styles.description}>
            {isBoss
              ? "Your neighbor has visited you. Complete all dialogue loops and respond in polite Urdu to pass this chapter challenge!"
              : "Learn new vocabulary items, practice hearing normal and slow pronunciations, and repeat aloud."}
          </Text>
        </View>

        {/* Action Triggers */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleMockComplete}
            style={[
              styles.primaryButton,
              { backgroundColor: isBoss ? colors.accent : colors.primaryLight },
            ]}
          >
            <CheckCircle2 size={22} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>
              {isBoss ? "Mock Complete Chapter Boss" : "Mock Complete Level"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Quit Practice</Text>
          </TouchableOpacity>
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
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d5c56",
    borderRadius: 22,
  },
  navTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  detailsCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d5c56",
    borderRadius: 32,
    padding: 30,
    marginVertical: 40,
    borderWidth: 1,
    borderColor: `${colors.primaryLight}20`,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  subtitle: {
    color: "#2dd4bf",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    color: "#a7f3d0",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.85,
    maxWidth: 280,
  },
  actionsContainer: {
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: `${colors.primaryLight}30`,
  },
  secondaryButtonText: {
    color: "#2dd4bf",
    fontSize: 16,
    fontWeight: "800",
  },
});
