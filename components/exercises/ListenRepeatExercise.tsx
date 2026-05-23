import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { ListenRepeatExercise as ExerciseType } from "../../types/exercise";
import { Chapter } from "../../types/chapter";
import { getPhraseById } from "../../services/contentService";
import { startSpeechRecording, stopSpeechRecording } from "../../services/speechService";
import { scoreSpeech } from "../../services/scoringService";
import { playAudio, stopAllAudio } from "../../services/audioService";
import AudioButton from "../AudioButton";
import RecordButton, { RecordButtonState } from "../RecordButton";
import { colors } from "../../constants/colors";
import { Mic, AlertCircle, HelpCircle, CheckCircle2, Headphones } from "lucide-react-native";

interface ListenRepeatExerciseProps {
  exercise: ExerciseType;
  parentChapter: Chapter;
  onNext: (passed: boolean, score: number, attempts: number) => void;
}

export default function ListenRepeatExercise({
  exercise,
  parentChapter,
  onNext,
}: ListenRepeatExerciseProps) {
  const phrase = getPhraseById(parentChapter, exercise.phraseId);

  if (!phrase) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Phrase not found in chapter content.</Text>
      </View>
    );
  }

  // State managers
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [recordState, setRecordState] = useState<RecordButtonState>("idle");
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Feedback results states
  const [transcript, setTranscript] = useState("");
  const [similarity, setSimilarity] = useState(0);
  const [hasPassed, setHasPassed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Play audio on mount
  useEffect(() => {
    setIsAudioFinished(false);
    setRecordState("idle");
    setAttempts(0);
    setIsFinished(false);
    setTranscript("");
    setSimilarity(0);
    setHasPassed(false);
    setErrorMessage("");

    const timer = setTimeout(() => {
      handlePlayPromptAudio();
    }, 450);

    return () => {
      clearTimeout(timer);
      stopAllAudio();
    };
  }, [exercise.id]);

  const handlePlayPromptAudio = async () => {
    setIsAudioFinished(false);
    const speakText = phrase.urdu || phrase.roman;
    
    try {
      await playAudio(phrase.audio.normal, speakText, "normal", () => {
        setIsAudioFinished(true); // Enable mic recording button when audio concludes
      });
    } catch (err) {
      console.error(err);
      setIsAudioFinished(true);
    }
  };

  const handleRecordPress = async () => {
    if (!isAudioFinished) return;

    if (recordState === "recording") {
      setRecordState("processing");
      try {
        const resultText = await stopSpeechRecording();
        setTranscript(resultText);

        if (!resultText.trim()) {
          setRecordState("idle");
          setErrorMessage("Silence detected. Listen and repeat clearly.");
          return;
        }

        setErrorMessage("");
        
        // Lenient ASR threshold: 0.50 for Listen & Repeat!
        const scoreResult = scoreSpeech(resultText, phrase, 0.50);
        setSimilarity(scoreResult.score);
        setAttempts((prev) => prev + 1);

        if (scoreResult.passed) {
          setHasPassed(true);
          setIsFinished(true);
          setRecordState("done");
          playAudio("", "Excellent", "normal");
        } else {
          const nextAttemptCount = attempts + 1;
          if (nextAttemptCount >= 3) {
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
      setRecordState("recording");
      setErrorMessage("");
      setTranscript("");
      try {
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
    // First try complete: 1.0
    // Second try complete: 0.7
    // Third try complete: 0.5
    // Failed all 3 (reveal): 0.3 (soft-fail)
    let score = 0.3;
    if (hasPassed) {
      if (attempts === 1) score = 1.0;
      else if (attempts === 2) score = 0.7;
      else score = 0.5;
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
              Passed! Excellent repetition ({Math.round(similarity * 100)}% match)
            </Text>
          </View>
        );
      }

      if (attempts >= 3) {
        return (
          <View style={[styles.feedbackBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
            <AlertCircle size={18} color="#ef4444" />
            <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
              Oops! Revealing expected phrase: "{phrase.roman}"
            </Text>
          </View>
        );
      }

      return (
        <View style={[styles.feedbackBanner, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
          <AlertCircle size={18} color="#f59e0b" />
          <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
            Heard: "{transcript || "..."}" ({Math.round(similarity * 100)}% match). Repeat again! (Attempt {attempts}/3)
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Listen & Repeat</Text>
        
        {/* Instructional Header */}
        <Text style={styles.promptText}>
          Listen to the native voice, then repeat it back.
        </Text>
        
        {/* Large Visual Headphones indicator */}
        <View style={styles.headphonesSection}>
          <Headphones size={36} color={isAudioFinished ? colors.primaryLight : colors.warning} />
          <Text style={[styles.headphonesStatus, { color: isAudioFinished ? "#a7f3d0" : "#fdba74" }]}>
            {isAudioFinished ? "Now your turn to repeat!" : "Listen carefully..."}
          </Text>
        </View>

        {/* Listen controller */}
        <View style={styles.listenSection}>
          <AudioButton phrase={phrase} speed="normal" size="large" />
          <Text style={styles.listenLabel}>Replay Native Voice</Text>
        </View>

        {/* Recording controller - locked until prompt finishes */}
        <View style={styles.micSection}>
          <View style={{ opacity: isAudioFinished ? 1.0 : 0.4 }}>
            <RecordButton
              state={recordState}
              onPress={handleRecordPress}
              disabled={isFinished || !isAudioFinished}
            />
          </View>
          <Text style={styles.micLabel}>
            {!isAudioFinished
              ? "Audio playing..."
              : recordState === "idle"
              ? "Tap microphone to speak"
              : recordState === "recording"
              ? "Tap square to stop"
              : recordState === "processing"
              ? "Processing ASR..."
              : "Completed!"}
          </Text>
        </View>

        {/* Real-time scoring feedback */}
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
          {isFinished ? "Continue" : "Practice Repeating"}
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
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 14,
  },
  headphonesSection: {
    alignItems: "center",
    marginBottom: 14,
  },
  headphonesStatus: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  listenSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  listenLabel: {
    color: "#a7f3d0",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
    letterSpacing: 0.5,
    opacity: 0.8,
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
    marginTop: 6,
    letterSpacing: 0.5,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 10,
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
