import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Volume2, ShieldAlert } from "lucide-react-native";
import { useChapterStore } from "../../stores/useChapterStore";
import { useProgressStore } from "../../stores/useProgressStore";
import { loadChapter, getPhraseById } from "../../services/contentService";
import { stopAllAudio, playAudio } from "../../services/audioService";
import ProgressBar from "../../components/ProgressBar";
import IntroduceExercise from "../../components/exercises/IntroduceExercise";
import ListenToMeaningExercise from "../../components/exercises/ListenToMeaningExercise";
import SpeakExercise from "../../components/exercises/SpeakExercise";
import ListenRepeatExercise from "../../components/exercises/ListenRepeatExercise";
import ScenarioTurnExercise from "../../components/exercises/ScenarioTurnExercise";
import ListenToImageExercise from "../../components/exercises/ListenToImageExercise";
import { colors } from "../../constants/colors";
import { Crown } from "lucide-react-native";

export default function LevelPlayerScreen() {
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();

  const [loading, setLoading] = useState(true);

  // Zustand Store mappings
  const {
    activeChapter,
    activeLevel,
    currentExerciseIndex,
    exercises,
    results,
    setActive,
    recordResult,
    advance,
    reset,
  } = useChapterStore();

  const completeLevel = useProgressStore((state) => state.completeLevel);

  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    async function initLevel() {
      setLoading(true);
      await stopAllAudio();

      const [chapterPart] = levelId.split("-");
      const chapterId = `C${chapterPart.slice(1).padStart(2, "0")}`;

      const chapter = await loadChapter(chapterId);
      if (chapter) {
        const level = chapter.levels.find((l) => l.id === levelId);
        if (level) {
          setActive(chapter, level);
          
          // Trigger BOSS Intro Splash Screen
          if (level.type === "BOSS") {
            setShowSplash(true);
            playAudio("", "Pehla baab, boss challenge! Chapter Boss Challenge, prepare yourself.", "normal");
          }
        } else {
          Alert.alert("Error", `Level ${levelId} not found in Chapter ${chapterId}`);
          router.back();
        }
      } else {
        Alert.alert("Error", `Failed to load parent chapter ${chapterId}`);
        router.back();
      }
      setLoading(false);
    }

    initLevel();

    return () => {
      reset();
      stopAllAudio();
    };
  }, [levelId]);

  if (loading || !activeChapter || !activeLevel) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  const exercise = exercises[currentExerciseIndex];
  const progress = exercises.length > 0 ? currentExerciseIndex / exercises.length : 0;

  const handleExerciseComplete = (passed: boolean, score: number, attempts: number) => {
    if (!exercise) return;
    
    // 1. Record individual exercise result
    recordResult(exercise.id, passed, score, attempts);

    // 2. Advance to the next exercise or finish
    const hasMore = advance();
    if (!hasMore) {
      handleLevelFinished();
    }
  };

  const handleLevelFinished = () => {
    // Calculate overall mastery score
    const currentResults = useChapterStore.getState().results;
    const totalScore = currentResults.reduce((sum, r) => sum + r.score, 0);
    const averageScore = currentResults.length > 0 ? totalScore / currentResults.length : 0.0;

    // Persist level completion state in progress store
    completeLevel(activeLevel.id, averageScore);

    // Navigate to victory result screen
    router.replace(`/level/result?levelId=${activeLevel.id}&score=${averageScore}`);
  };

  const renderActiveExercise = () => {
    if (!exercise) return null;

    switch (exercise.type) {
      case "INTRODUCE": {
        const phrase = getPhraseById(activeChapter, exercise.phraseId);
        if (!phrase) return null;
        return (
          <IntroduceExercise
            phrase={phrase}
            onNext={() => handleExerciseComplete(true, 1.0, 1)}
          />
        );
      }
      case "L_TO_M": {
        return (
          <ListenToMeaningExercise
            exercise={exercise as any}
            parentChapter={activeChapter}
            onNext={(passed, score, attempts) => handleExerciseComplete(passed, score, attempts)}
          />
        );
      }
      case "L_TO_I": {
        return (
          <ListenToImageExercise
            exercise={exercise as any}
            parentChapter={activeChapter}
            onNext={(passed, score, attempts) => handleExerciseComplete(passed, score, attempts)}
          />
        );
      }
      case "LISTEN_REPEAT": {
        return (
          <ListenRepeatExercise
            exercise={exercise as any}
            parentChapter={activeChapter}
            onNext={(passed, score, attempts) => handleExerciseComplete(passed, score, attempts)}
          />
        );
      }
      case "SPEAK": {
        return (
          <SpeakExercise
            exercise={exercise as any}
            parentChapter={activeChapter}
            onNext={(passed, score, attempts) => handleExerciseComplete(passed, score, attempts)}
          />
        );
      }
      case "SCENARIO_TURN": {
        return (
          <ScenarioTurnExercise
            exercise={exercise as any}
            parentChapter={activeChapter}
            sceneIndex={currentExerciseIndex}
            totalScenes={exercises.length}
            onNext={(passed, score, attempts) => handleExerciseComplete(passed, score, attempts)}
          />
        );
      }
      default: {
        return (
          <View style={styles.placeholderCard}>
            <ShieldAlert size={48} color={colors.warning} style={{ marginBottom: 16 }} />
            <Text style={styles.placeholderType}>
              Exercise type: {(exercise as any).type}
            </Text>
            <Text style={styles.placeholderTitle}>
              Interactive Practice
            </Text>
            <Text style={styles.placeholderDesc}>
              This exercise type ({(exercise as any).type}) will be fully unlocked in subsequent sprints.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleExerciseComplete(true, 1.0, 1)}
              style={styles.simulateBtn}
            >
              <Text style={styles.simulateBtnText}>Simulate Progress</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  };

  const isBoss = activeLevel.type === "BOSS";

  return (
    <SafeAreaView style={[styles.safeArea, isBoss && styles.bossSafeArea]}>
      {/* 1. Header controls & progress tracking */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Quit Session", "Are you sure you want to quit this practice session? Your progress will not be saved.", [
              { text: "Cancel", style: "cancel" },
              { text: "Quit", style: "destructive", onPress: () => router.back() },
            ]);
          }}
          style={styles.closeButton}
        >
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.progressWrapper}>
          <ProgressBar progress={progress} />
          <Text style={[styles.progressText, isBoss && styles.bossProgressText]}>
            {isBoss ? "👑 BOSS SCENARIO" : `Level ${activeLevel.number}`} • {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>

        {isBoss ? (
          <View style={styles.bossHeaderIcon}>
            <Crown size={20} color="#f59e0b" fill="#f59e0b" />
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* 2. Primary Exercise view port */}
      <View style={styles.content}>
        {renderActiveExercise()}
      </View>

      {/* 3. BOSS Intro Splash Overlay Screen */}
      {showSplash && (
        <View style={styles.splashOverlay}>
          <View style={styles.splashHeader}>
            <Crown size={64} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.splashBadge}>Stage 1 Boss</Text>
          </View>
          <Text style={styles.splashTitle}>{activeLevel.title}</Text>
          <Text style={styles.splashSubtitle}>Chapter {activeChapter.number}: {activeChapter.title}</Text>
          
          <View style={styles.splashDivider} />
          
          <Text style={styles.splashDesc}>
            {activeLevel.scenarioIntro}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setShowSplash(false);
              stopAllAudio();
            }}
            style={styles.startBtn}
          >
            <Text style={styles.startBtnText}>Start Conversation</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bossSafeArea: {
    backgroundColor: "#051b19", // Darker dark-teal overlay for boss levels
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d5c56",
    borderRadius: 22,
  },
  bossHeaderIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d97706",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  progressWrapper: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: "center",
  },
  progressText: {
    color: "#a7f3d0",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 4,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  bossProgressText: {
    color: "#fdba74", // Amber text for boss levels progress indicator
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  placeholderCard: {
    flex: 1,
    backgroundColor: "#0d5c56",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  placeholderType: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  placeholderTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  placeholderDesc: {
    color: "#a7f3d0",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.85,
    maxWidth: 260,
    marginBottom: 32,
  },
  simulateBtn: {
    backgroundColor: colors.primaryLight,
    height: 52,
    borderRadius: 26,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  simulateBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  splashOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#051b19",
    zIndex: 1000,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  splashHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  splashBadge: {
    backgroundColor: "#d97706",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  splashTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  splashSubtitle: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  splashDivider: {
    width: 60,
    height: 4,
    backgroundColor: "#d97706",
    borderRadius: 2,
    marginVertical: 24,
  },
  splashDesc: {
    color: "#a7f3d0",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 290,
    marginBottom: 40,
    opacity: 0.95,
  },
  startBtn: {
    backgroundColor: colors.accent,
    height: 56,
    borderRadius: 28,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#d97706",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  startBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
