import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SpeakExercise as ExerciseType } from "../../types/exercise";
import { Chapter } from "../../types/chapter";
import { getPhraseById } from "../../services/contentService";
import { startSpeechRecording, stopSpeechRecording } from "../../services/speechService";
import { scoreSpeech } from "../../services/scoringService";
import { playAudio, stopAllAudio } from "../../services/audioService";
import RecordButton, { RecordButtonState } from "../RecordButton";
import { colors } from "../../constants/colors";
import { Mic, Eye, EyeOff, AlertCircle, HelpCircle, CheckCircle2, ChevronRight } from "lucide-react-native";

interface SpeakExerciseProps {
  exercise: ExerciseType;
  parentChapter: Chapter;
  onNext: (passed: boolean, score: number, attempts: number) => void;
}

export default function SpeakExercise({
  exercise,
  parentChapter,
  onNext,
}: SpeakExerciseProps) {
  const phrase = getPhraseById(parentChapter, exercise.phraseId);

  if (!phrase) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Phrase not found in chapter content.</Text>
      </View>
    );
  }

  // State managers
  const [recordState, setRecordState] = useState<RecordButtonState>("idle");
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Feedback results states
  const [transcript, setTranscript] = useState("");
  const [similarity, setSimilarity] = useState(0);
  const [hasPassed, setHasPassed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleHintPress = () => {
    setShowHint((prev) => !prev);
    setHintUsed(true);
  };

  const handleRecordPress = async () => {
    if (recordState === "recording") {
      // 1. Stop recording and analyze results
      setRecordState("processing");
      try {
        const resultText = await stopSpeechRecording();
        setTranscript(resultText);

        if (!resultText.trim()) {
          setRecordState("idle");
          setErrorMessage("Silence detected. Please speak clearly into the microphone.");
          return;
        }

        setErrorMessage("");
        
        // Score spoken transcript against Urdu/Roman expected phrase
        const scoreResult = scoreSpeech(resultText, phrase, 0.70); // Lenient 70% threshold
        setSimilarity(scoreResult.score);
        setAttempts((prev) => prev + 1);

        if (scoreResult.passed) {
          // Speak attempt passes!
          setHasPassed(true);
          setIsFinished(true);
          setRecordState("done");
          playAudio("", "Excellent", "normal");
        } else {
          // Failed attempt
          const nextAttemptCount = attempts + 1;
          
          if (nextAttemptCount >= 3) {
            // Failed all 3 attempts: Reveal correct answer and soft-fail
            setIsFinished(true);
            setRecordState("idle");
            playAudio("", "Let's move on", "normal");
          } else {
            setRecordState("idle");
            playAudio("", "Try again", "normal");
          }
        }
      } catch (err: any) {
        console.error(err);
        setRecordState("idle");
        setErrorMessage("Microphone connection failed. Make sure you granted permissions.");
      }
    } else {
      // 2. Start speech recording
      setRecordState("recording");
      setErrorMessage("");
      setTranscript("");
      try {
        // Pass phrase roman as dynamic mock trigger text so it operates cleanly on simulators
        await startSpeechRecording(phrase.roman);
      } catch (err: any) {
        console.error(err);
        setRecordState("idle");
        setErrorMessage("Microphone unavailable. Make sure permissions are granted.");
      }
    }
  };

  const handleContinue = () => {
    // Score calculations:
    // Pass on first try: 1.0 (or 0.7 if hint used)
    // Pass on second try: 0.7 (or 0.5 if hint used)
    // Pass on third try: 0.5 (or 0.3 if hint used)
    // Failed all 3 tries (reveal): 0.3 (soft-fail)
    let score = 0.3;
    if (hasPassed) {
      if (attempts === 1) {
        score = hintUsed ? 0.7 : 1.0;
      } else if (attempts === 2) {
        score = hintUsed ? 0.5 : 0.7;
      } else {
        score = hintUsed ? 0.3 : 0.5;
      }
    }

    onNext(hasPassed, score, attempts);
  };

  const renderFeedbackMessage = () => {
    if (errorMessage) {
      return (
        <View style={[styles.feedbackBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)" }]}>
          <AlertCircle size={18} color="#ef4444" />
          <Text style={[styles.feedbackText, { color: "#fdba74" }]}>{errorMessage}</Text>
        </View>
      );
    }

    if (attempts > 0) {
      if (hasPassed) {
        return (
          <View style={styles.feedbackBanner}>
            <CheckCircle2 size={18} color="#10b981" />
            <Text style={styles.feedbackText}>
              Passed! Matched "{phrase.roman}" ({Math.round(similarity * 100)}% similarity)
            </Text>
          </View>
        );
      }

      if (attempts >= 3) {
        return (
          <View style={[styles.feedbackBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
            <AlertCircle size={18} color="#ef4444" />
            <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
              Attempts exhausted. Correct answer: "{phrase.roman}"
            </Text>
          </View>
        );
      }

      return (
        <View style={[styles.feedbackBanner, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
          <AlertCircle size={18} color="#f59e0b" />
          <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
            Heard: "{transcript || "..."}" ({Math.round(similarity * 100)}% match). Try again! (Attempt {attempts}/3)
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Speaking Exercise</Text>
        
        {/* The prompt context */}
        <Text style={styles.promptText}>{exercise.prompt}</Text>
        
        {/* Dynamic Hint Toggle with Score Capping */}
        {exercise.hint && (
          <View style={styles.hintContainer}>
            {showHint ? (
              <View style={styles.hintBox}>
                <Text style={styles.hintTitle}>Speak this:</Text>
                <Text style={styles.hintText}>{exercise.hint}</Text>
                <Text style={styles.hintWarning}>⚠️ Using hint caps maximum score to 70%</Text>
              </View>
            ) : null}
            
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleHintPress}
              style={styles.hintBtn}
            >
              {showHint ? (
                <>
                  <EyeOff size={16} color="#2dd4bf" />
                  <Text style={styles.hintBtnText}>Hide Hint</Text>
                </>
              ) : (
                <>
                  <Eye size={16} color="#2dd4bf" />
                  <Text style={styles.hintBtnText}>Show Hint</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Central mic controller */}
        <View style={styles.micSection}>
          <RecordButton
            state={recordState}
            onPress={handleRecordPress}
            disabled={isFinished}
          />
          <Text style={styles.micLabel}>
            {recordState === "idle"
              ? "Tap microphone to speak"
              : recordState === "recording"
              ? "Tap square to stop speaking"
              : recordState === "processing"
              ? "Processing speech ASR..."
              : "Completed!"}
          </Text>
        </View>

        {/* Real-time speech scoring feedback */}
        {renderFeedbackMessage()}
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
          {isFinished ? "Continue" : "Practice Speaking"}
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
  sectionHeading: {
    color: "#2dd4bf",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  promptText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  hintContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  hintBox: {
    width: "100%",
    backgroundColor: "#092e2b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.15)",
    marginBottom: 12,
    alignItems: "center",
  },
  hintTitle: {
    color: "#a7f3d0",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
    opacity: 0.8,
  },
  hintText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  hintWarning: {
    color: "#fdba74",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 6,
    opacity: 0.9,
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 184, 166, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.2)",
  },
  hintBtnText: {
    color: "#2dd4bf",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  micSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  micLabel: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
    marginTop: 10,
  },
  feedbackText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
    textAlign: "center",
    flex: 1,
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
