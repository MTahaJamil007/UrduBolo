import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Star, RefreshCw, X, Award, Flame, Crown, ArrowRight } from "lucide-react-native";
import { colors } from "../../constants/colors";
import { useProgressStore } from "../../stores/useProgressStore";
import { loadChapter } from "../../services/contentService";

const { width } = Dimensions.get("window");

export default function LevelResultScreen() {
  const router = useRouter();
  const { levelId, score: rawScore } = useLocalSearchParams<{ levelId: string; score: string }>();

  const score = parseFloat(rawScore || "0.0");
  const passed = score >= 0.75;

  const totalXP = useProgressStore((state) => state.totalXP);
  const streak = useProgressStore((state) => state.currentStreak);
  const completeChapter = useProgressStore((state) => state.completeChapter);
  const addXP = useProgressStore((state) => state.addXP);
  const chaptersCompleted = useProgressStore((state) => state.chaptersCompleted);

  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<any>(null);
  const [level, setLevel] = useState<any>(null);
  const [extraXpAwarded, setExtraXpAwarded] = useState(0);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Decompose levelId
  const [chapterPart, levelPart] = (levelId || "L1-1").split("-");
  const chapterNum = parseInt(chapterPart.slice(1), 10);
  const levelNum = parseInt(levelPart, 10);
  const isBossLevel = level?.type === "BOSS";

  useEffect(() => {
    async function loadData() {
      if (!levelId) return;
      const [chapterPart] = levelId.split("-");
      const chapterId = `C${chapterPart.slice(1).padStart(2, "0")}`;
      
      try {
        const ch = await loadChapter(chapterId);
        if (ch) {
          setChapter(ch);
          const lvl = ch.levels.find((l: any) => l.id === levelId);
          setLevel(lvl);
          
          if (passed && lvl && lvl.type === "BOSS") {
            const isAlreadyCompleted = chaptersCompleted.includes(chapterId);
            if (!isAlreadyCompleted) {
              // 1. Persist chapter complete state to progress store
              completeChapter(chapterId);
              
              // 2. Calculate extra boss XP rewards
              const bossXp = lvl.rewards?.xp || 25;
              const bonusXp = lvl.rewards?.chapterCompleteBonus || 50;
              const totalBonus = bossXp + bonusXp;
              
              addXP(totalBonus);
              setExtraXpAwarded(totalBonus);
            }
          }
        }
      } catch (err) {
        console.error("[ResultScreen] Error loading chapter details:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [levelId, passed]);

  // Run premium entry animations
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleContinue = () => {
    router.dismissAll(); // Return to the Home Screen wavy path
  };

  const handleRetry = () => {
    router.replace(`/level/${levelId}`); // Restart level
  };

  const getNextChapterInfo = () => {
    const nextChapterNum = chapterNum + 1;
    if (nextChapterNum <= 10) {
      return {
        exists: true,
        label: `Chapter ${nextChapterNum}`,
      };
    }
    return {
      exists: false,
      label: "",
    };
  };

  const nextChapter = getNextChapterInfo();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading celebration...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isBossLevel && passed && styles.bossSafeArea]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Victory Celebration Card */}
        <Animated.View
          style={[
            styles.card,
            isBossLevel && passed && styles.bossCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Badge Icon */}
          <View
            style={[
              styles.iconCircle,
              isBossLevel && passed ? styles.bossIconCircle : {
                backgroundColor: passed ? colors.success : colors.error,
                borderColor: passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
              },
            ]}
          >
            {passed ? (
              isBossLevel ? (
                <Crown size={48} color="#ffffff" strokeWidth={2.5} fill="#ffffff" />
              ) : (
                <Check size={48} color="#ffffff" strokeWidth={4} />
              )
            ) : (
              <X size={48} color="#ffffff" strokeWidth={4} />
            )}
          </View>

          {/* Subtitle / Header */}
          <Text style={[styles.subtitle, isBossLevel && passed && styles.bossSubtitle]}>
            {isBossLevel && passed
              ? `👑 BOSS LEVEL COMPLETE`
              : `Chapter ${chapterNum} • Level ${chapterNum}.${levelNum}`}
          </Text>
          
          {/* Main Title */}
          <Text style={styles.title}>
            {passed
              ? isBossLevel
                ? "Chapter Complete!"
                : "Practice Complete!"
              : "Almost There!"}
          </Text>

          {/* Accuracy Score */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              Accuracy: {Math.round(score * 100)}%
            </Text>
          </View>

          {/* Description / Cultural Completion message */}
          <Text style={[styles.description, isBossLevel && passed && styles.bossDescription]}>
            {passed
              ? isBossLevel
                ? chapter?.rewards?.completionMessage || "Excellent work! You have mastered these greetings."
                : `Assalam alaikum! You passed this level successfully. Your pronunciation and vocabulary skills are progressing beautifully.`
              : "Don't worry! Heritage learning requires practice. Let's try again to build your confidence and polish your pronunciation."}
          </Text>

          {/* Reward Badges Panel */}
          {passed && (
            <View style={[styles.rewardsPanel, isBossLevel && styles.bossRewardsPanel]}>
              {isBossLevel ? (
                // Boss Level rewards layout (expanded list of rewards)
                <View style={styles.bossRewardsList}>
                  <View style={styles.bossRewardItem}>
                    <Star size={20} color="#f59e0b" fill="#f59e0b" />
                    <View style={styles.bossRewardTextContainer}>
                      <Text style={styles.bossRewardValue}>+10 XP</Text>
                      <Text style={styles.bossRewardLabel}>Level Passed</Text>
                    </View>
                  </View>
                  
                  <View style={styles.bossRewardItem}>
                    <Crown size={20} color="#fbbf24" fill="#fbbf24" />
                    <View style={styles.bossRewardTextContainer}>
                      <Text style={styles.bossRewardValue}>+25 XP</Text>
                      <Text style={styles.bossRewardLabel}>Boss Defeated</Text>
                    </View>
                  </View>

                  <View style={styles.bossRewardItem}>
                    <Award size={20} color="#34d399" fill="#34d399" />
                    <View style={styles.bossRewardTextContainer}>
                      <Text style={styles.bossRewardValue}>+50 XP</Text>
                      <Text style={styles.bossRewardLabel}>Chapter Bonus</Text>
                    </View>
                  </View>

                  <View style={styles.bossRewardItem}>
                    <Flame size={20} color="#f97316" fill="#f97316" />
                    <View style={styles.bossRewardTextContainer}>
                      <Text style={styles.bossRewardValue}>{streak} Day</Text>
                      <Text style={styles.bossRewardLabel}>Active Streak</Text>
                    </View>
                  </View>

                  <View style={styles.totalXpSummary}>
                    <Text style={styles.totalXpSummaryText}>
                      Total Balance: <Text style={{ color: "#fbbf24", fontWeight: "900" }}>{totalXP} XP</Text>
                    </Text>
                  </View>
                </View>
              ) : (
                // Standard level rewards layout
                <>
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
                </>
              )}
            </View>
          )}
        </Animated.View>

        {/* Action Controls */}
        <Animated.View
          style={[
            styles.actions,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 20],
                  }),
                },
              ],
            },
          ]}
        >
          {passed ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleContinue}
              style={[styles.primaryBtn, isBossLevel && styles.bossPrimaryBtn]}
            >
              <Text style={styles.primaryBtnText}>
                {isBossLevel && nextChapter.exists
                  ? `Continue to ${nextChapter.label}`
                  : "Continue to Path"}
              </Text>
              <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
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
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bossSafeArea: {
    backgroundColor: "#031211", // Deep premium dark background for completed boss
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#2dd4bf",
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#0d5c56",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginTop: 20,
    marginBottom: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bossCard: {
    backgroundColor: "#073e3a", // Slightly lighter green with gold border for premium feel
    borderColor: "#fbbf24",
    borderWidth: 2,
    shadowColor: "#fbbf24",
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bossIconCircle: {
    backgroundColor: "#d97706",
    borderColor: "rgba(251, 191, 36, 0.2)",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 8,
  },
  subtitle: {
    color: "#2dd4bf",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  bossSubtitle: {
    color: "#fbbf24",
    fontSize: 14,
    letterSpacing: 2,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  scoreBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  scoreText: {
    color: "#fecdd3",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    color: "#a7f3d0",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
    maxWidth: 290,
    marginBottom: 24,
  },
  bossDescription: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
    paddingHorizontal: 10,
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
  bossRewardsPanel: {
    backgroundColor: "#051f1c",
    borderColor: "rgba(251, 191, 36, 0.15)",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bossRewardsList: {
    width: "100%",
  },
  bossRewardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bossRewardTextContainer: {
    marginLeft: 14,
  },
  bossRewardValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  bossRewardLabel: {
    color: "#a7f3d0",
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
  },
  totalXpSummary: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 10,
    marginTop: 4,
    alignItems: "center",
  },
  totalXpSummaryText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "700",
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
  bossPrimaryBtn: {
    backgroundColor: "#d97706",
    shadowColor: "#d97706",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#fbbf24",
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
