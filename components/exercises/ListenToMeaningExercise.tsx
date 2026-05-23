import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ListenToMeaningExercise as ExerciseType } from "../../types/exercise";
import { Chapter } from "../../types/chapter";
import { getPhraseById } from "../../services/contentService";
import { playAudio, stopAllAudio } from "../../services/audioService";
import AudioButton from "../AudioButton";
import ChoiceButton from "../ChoiceButton";
import { colors } from "../../constants/colors";
import { HelpCircle, AlertTriangle, CheckCircle2 } from "lucide-react-native";

interface ListenToMeaningExerciseProps {
  exercise: ExerciseType;
  parentChapter: Chapter;
  onNext: (passed: boolean, score: number, attempts: number) => void;
}

interface ChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export default function ListenToMeaningExercise({
  exercise,
  parentChapter,
  onNext,
}: ListenToMeaningExerciseProps) {
  const phrase = getPhraseById(parentChapter, exercise.phraseId);

  if (!phrase) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Phrase not found in chapter content.</Text>
      </View>
    );
  }

  // State managers
  const [shuffledOptions, setShuffledOptions] = useState<ChoiceOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);

  // Setup options once on mount
  useEffect(() => {
    const distractors = exercise.distractorPhraseIds
      .map((id) => getPhraseById(parentChapter, id))
      .filter((p): p is any => p !== null);

    const optionsList: ChoiceOption[] = [
      { id: phrase.id, label: phrase.englishContextual, isCorrect: true },
      ...distractors.map((d) => ({
        id: d.id,
        label: d.englishContextual,
        isCorrect: false,
      })),
    ];

    // Shuffles list
    setShuffledOptions(optionsList.sort(() => Math.random() - 0.5));
    setSelectedId(null);
    setIsFinished(false);
    setFailedIds([]);
    setAttempts(0);

    // Auto play audio once on mount
    const timer = setTimeout(() => {
      const speakText = phrase.urdu || phrase.roman;
      playAudio(phrase.audio.normal, speakText, "normal");
    }, 450);

    return () => clearTimeout(timer);
  }, [exercise.id]);

  const handleSelectOption = (option: ChoiceOption) => {
    if (isFinished || failedIds.includes(option.id)) return;

    setSelectedId(option.id);

    if (option.isCorrect) {
      // 1. Correct selection
      setIsFinished(true);
      
      // Calculate score based on total attempts:
      // 0 failed attempts = 100% score
      // 1 failed attempt = 50% score
      // 2+ failed attempts = 0% score (soft-fail)
      const finalAttemptsCount = attempts + 1;
      const score = failedIds.length === 0 ? 1.0 : failedIds.length === 1 ? 0.5 : 0.2;
      
      // Play a short correct feedback TTS or native chime
      playAudio("", "Correct", "normal");
    } else {
      // 2. Incorrect selection - track failed items for retry support
      setFailedIds((prev) => [...prev, option.id]);
      setAttempts((prev) => prev + 1);
      setSelectedId(null);
      
      // Play brief incorrect buzz TTS/phrase
      playAudio("", "Wrong, try again", "normal");
    }
  };

  const handleContinue = () => {
    const passed = failedIds.length < 2; // Pass if made less than 2 mistakes
    const score = failedIds.length === 0 ? 1.0 : failedIds.length === 1 ? 0.5 : 0.2;
    onNext(passed, score, failedIds.length);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.promptText}>{exercise.prompt}</Text>
        
        {/* Visual Help Cue */}
        <View style={styles.iconContainer}>
          <HelpCircle size={40} color="#2dd4bf" />
        </View>

        {/* Listen Replay Controller */}
        <View style={styles.listenSection}>
          <AudioButton phrase={phrase} speed="normal" size="large" />
          <Text style={styles.listenLabel}>Listen to Audio</Text>
        </View>

        {/* Choices buttons layout */}
        <View style={styles.choicesList}>
          {shuffledOptions.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isFailed = failedIds.includes(opt.id);
            const isCorrectAndFinished = opt.isCorrect && isFinished;

            return (
              <ChoiceButton
                key={opt.id}
                label={opt.label}
                isSelected={isSelected}
                isCorrect={isCorrectAndFinished}
                isIncorrect={isFailed}
                onPress={() => handleSelectOption(opt)}
                disabled={isFinished || isFailed}
              />
            );
          })}
        </View>

        {/* Bottom Banner feedback alerts */}
        {isFinished && (
          <View style={styles.feedbackBanner}>
            <CheckCircle2 size={18} color="#10b981" />
            <Text style={styles.feedbackText}>
              {failedIds.length === 0
                ? "Excellent! First attempt correct."
                : "Good job! You corrected it."}
            </Text>
          </View>
        )}
        
        {failedIds.length > 0 && !isFinished && (
          <View style={[styles.feedbackBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
            <AlertTriangle size={18} color="#ef4444" />
            <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
              Oops! That wasn't correct. Try another choice.
            </Text>
          </View>
        )}
      </View>

      {/* Continuation Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleContinue}
        disabled={!isFinished}
        style={[
          styles.continueButton,
          {
            backgroundColor: isFinished ? colors.primaryLight : "rgba(20, 184, 166, 0.2)",
          },
        ]}
      >
        <Text
          style={[
            styles.continueButtonText,
            { color: isFinished ? "#ffffff" : "rgba(255, 255, 255, 0.3)" },
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#0d5c56",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  promptText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  listenSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  listenLabel: {
    color: "#a7f3d0",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  choicesList: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
  },
  feedbackText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
    textAlign: "center",
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
