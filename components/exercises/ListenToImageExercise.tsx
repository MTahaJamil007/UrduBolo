import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { ListenToImageExercise as ExerciseType } from "../../types/exercise";
import { Chapter } from "../../types/chapter";
import { getPhraseById } from "../../services/contentService";
import { playAudio } from "../../services/audioService";
import AudioButton from "../AudioButton";
import { colors } from "../../constants/colors";
import { HelpCircle, AlertTriangle, CheckCircle2, Image as ImageIcon, Heart, Star, Sparkles, Hash } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface ListenToImageExerciseProps {
  exercise: ExerciseType;
  parentChapter: Chapter;
  onNext: (passed: boolean, score: number, attempts: number) => void;
}

interface ImageChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
  image: string | null;
  category: string;
}

export default function ListenToImageExercise({
  exercise,
  parentChapter,
  onNext,
}: ListenToImageExerciseProps) {
  const phrase = getPhraseById(parentChapter, exercise.phraseId);

  if (!phrase) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Phrase not found in chapter content.</Text>
      </View>
    );
  }

  // State managers
  const [shuffledOptions, setShuffledOptions] = useState<ImageChoiceOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);

  // Setup options once on mount
  useEffect(() => {
    const distractors = exercise.distractorPhraseIds
      .map((id) => getPhraseById(parentChapter, id))
      .filter((p): p is any => p !== null);

    const optionsList: ImageChoiceOption[] = [
      {
        id: phrase.id,
        label: phrase.englishContextual,
        isCorrect: true,
        image: phrase.image,
        category: phrase.category || "general",
      },
      ...distractors.map((d) => ({
        id: d.id,
        label: d.englishContextual,
        isCorrect: false,
        image: d.image,
        category: d.category || "general",
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

  const handleSelectOption = (option: ImageChoiceOption) => {
    if (isFinished || failedIds.includes(option.id)) return;

    setSelectedId(option.id);

    if (option.isCorrect) {
      setIsFinished(true);
      playAudio("", "Correct", "normal");
    } else {
      setFailedIds((prev) => [...prev, option.id]);
      setAttempts((prev) => prev + 1);
      setSelectedId(null);
      playAudio("", "Wrong, try again", "normal");
    }
  };

  const handleContinue = () => {
    const passed = failedIds.length < 2; // Pass if made less than 2 mistakes
    const score = failedIds.length === 0 ? 1.0 : failedIds.length === 1 ? 0.5 : 0.2;
    onNext(passed, score, failedIds.length);
  };

  // Render a nice category icon if there's no custom image
  const renderCategoryIcon = (category: string) => {
    const size = 32;
    const color = "#2dd4bf";
    switch (category.toLowerCase()) {
      case "greeting":
      case "farewell":
        return <Sparkles size={size} color={color} />;
      case "family":
        return <Heart size={size} color={color} fill="rgba(45, 212, 191, 0.1)" />;
      case "number":
        return <Hash size={size} color={color} />;
      case "color":
        return <Star size={size} color={color} fill="rgba(45, 212, 191, 0.1)" />;
      default:
        return <ImageIcon size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.promptText}>{exercise.prompt}</Text>
        
        {/* Listen Replay Controller */}
        <View style={styles.listenSection}>
          <AudioButton phrase={phrase} speed="normal" size="large" />
          <Text style={styles.listenLabel}>Listen to Prompt</Text>
        </View>

        {/* 2x2 Grid of Image/Typographic Cards */}
        <View style={styles.grid}>
          {shuffledOptions.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isFailed = failedIds.includes(opt.id);
            const isCorrectAndFinished = opt.isCorrect && isFinished;

            let cardStyle: any[] = [styles.gridCard];
            let textStyle: any[] = [styles.cardText];

            if (isSelected) {
              cardStyle.push(styles.cardSelected);
            }
            if (isFailed) {
              cardStyle.push(styles.cardFailed);
              textStyle.push(styles.textFailed);
            }
            if (isCorrectAndFinished) {
              cardStyle.push(styles.cardSuccess);
              textStyle.push(styles.textSuccess);
            }

            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                disabled={isFinished || isFailed}
                onPress={() => handleSelectOption(opt)}
                style={cardStyle}
              >
                {opt.image ? (
                  <Image source={{ uri: opt.image }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderIconContainer}>
                    {renderCategoryIcon(opt.category)}
                  </View>
                )}
                
                <Text numberOfLines={2} style={textStyle}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
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
              Oops! That wasn't correct. Try another card.
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
    marginBottom: 12,
  },
  listenSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  listenLabel: {
    color: "#a7f3d0",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    flex: 1,
    alignContent: "center",
  },
  gridCard: {
    width: "48%",
    height: "45%",
    minHeight: 110,
    backgroundColor: "#092e2b",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 12,
  },
  cardImage: {
    width: "100%",
    height: "60%",
    borderRadius: 8,
  },
  placeholderIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  cardSelected: {
    borderColor: colors.primaryLight,
    backgroundColor: "rgba(20, 184, 166, 0.15)",
  },
  cardSuccess: {
    borderColor: colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  cardFailed: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  textSuccess: {
    color: colors.success,
  },
  textFailed: {
    color: colors.error,
    textDecorationLine: "line-through",
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
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
