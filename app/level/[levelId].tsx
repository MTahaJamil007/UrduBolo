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
import { stopAllAudio } from "../../services/audioService";
import ProgressBar from "../../components/ProgressBar";
import IntroduceExercise from "../../components/exercises/IntroduceExercise";
import ListenToMeaningExercise from "../../components/exercises/ListenToMeaningExercise";
import { colors } from "../../constants/colors";

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
      default: {
        // Fallback placeholder card for exercise types not yet implemented in Sprint 4
        // (LISTEN_REPEAT, SPEAK, SCENARIO_TURN - built in Sprints 5 & 6)
        const phrase = "phraseId" in exercise ? getPhraseById(activeChapter, exercise.phraseId) : null;
        
        return (
          <View style={styles.placeholderCard}>
            <ShieldAlert size={48} color={colors.warning} style={{ marginBottom: 16 }} />
            <Text style={styles.placeholderType}>
              Exercise type: {exercise.type}
            </Text>
            <Text style={styles.placeholderTitle}>
              {phrase ? `Practice: "${phrase.roman}"` : "Interactive Practice"}
            </Text>
            <Text style={styles.placeholderDesc}>
              This exercise type ({exercise.type}) is configured for Level {activeLevel.number} and will be fully unlocked in subsequent sprints.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleExerciseComplete(true, 1.0, 1)}
              style={styles.simulateBtn}
            >
              <Text style={styles.simulateBtnText}>Simulate Correct Speaking</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* 2. Primary Exercise view port */}
      <View style={styles.content}>
        {renderActiveExercise()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
});
