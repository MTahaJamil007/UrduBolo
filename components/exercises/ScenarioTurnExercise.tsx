import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { ScenarioTurnExercise as ExerciseType } from "../../types/exercise";
import { Chapter } from "../../types/chapter";
import { getPhraseById } from "../../services/contentService";
import { startSpeechRecording, stopSpeechRecording } from "../../services/speechService";
import { scoreSpeech } from "../../services/scoringService";
import { playAudio, stopAllAudio } from "../../services/audioService";
import RecordButton, { RecordButtonState } from "../RecordButton";
import { colors } from "../../constants/colors";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Volume2, UserSquare2 } from "lucide-react-native";

interface ScenarioTurnExerciseProps {
  exercise: ExerciseType;
  parentChapter: Chapter;
  sceneIndex: number;
  totalScenes: number;
  onNext: (passed: boolean, score: number, attempts: number) => void;
}

export default function ScenarioTurnExercise({
  exercise,
  parentChapter,
  sceneIndex,
  totalScenes,
  onNext,
}: ScenarioTurnExerciseProps) {
  const expectedPhrase = getPhraseById(parentChapter, exercise.expectedPhraseId);

  if (!expectedPhrase) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Target phrase not found in chapter.</Text>
      </View>
    );
  }

  // State managers
  const [isSpeakerAudioFinished, setIsSpeakerAudioFinished] = useState(false);
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

  // Play neighbor's spoken line on mount
  useEffect(() => {
    setIsSpeakerAudioFinished(false);
    setRecordState("idle");
    setShowHint(false);
    setHintUsed(false);
    setAttempts(0);
    setIsFinished(false);
    setTranscript("");
    setSimilarity(0);
    setHasPassed(false);
    setErrorMessage("");

    const timer = setTimeout(() => {
      handlePlaySpeakerLine();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopAllAudio();
    };
  }, [exercise.id]);

  const handlePlaySpeakerLine = async () => {
    setIsSpeakerAudioFinished(false);
    const speakText = exercise.speakerLine.urdu || exercise.speakerLine.roman;
    
    try {
      await playAudio(exercise.speakerLine.audio, speakText, "normal", () => {
        setIsSpeakerAudioFinished(true); // Enable mic recording button when neighbor finishes
      });
    } catch (err) {
      console.error(err);
      setIsSpeakerAudioFinished(true);
    }
  };

  const handleHintPress = () => {
    setShowHint((prev) => !prev);
    setHintUsed(true);
  };

  const handleRecordPress = async () => {
    if (!isSpeakerAudioFinished) return;

    if (recordState === "recording") {
      setRecordState("processing");
      try {
        const resultText = await stopSpeechRecording();
        setTranscript(resultText);

        if (!resultText.trim()) {
          setRecordState("idle");
          setErrorMessage("Silence detected. Speak clearly to respond.");
          return;
        }

        setErrorMessage("");
        
        // Score response against expected phrase
        const scoreResult = scoreSpeech(resultText, expectedPhrase, 0.70);
        setSimilarity(scoreResult.score);
        const nextAttemptCount = attempts + 1;
        setAttempts(nextAttemptCount);

        if (scoreResult.passed) {
          setHasPassed(true);
          setIsFinished(true);
          setRecordState("done");
          playAudio("", "Excellent", "normal");
          
          // Auto-advance after 1.8 seconds feedback
          setTimeout(() => {
            const finalScore = hintUsed ? 0.7 : 1.0;
            onNext(true, finalScore, nextAttemptCount);
          }, 1800);
        } else {
          if (nextAttemptCount >= 3) {
            setIsFinished(true);
            setRecordState("idle");
            playAudio("", "Let's continue", "normal");
            
            // Auto-advance after 2.5 seconds showing correct answer
            setTimeout(() => {
              onNext(false, 0.3, nextAttemptCount);
            }, 2600);
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
        await startSpeechRecording(expectedPhrase.roman);
      } catch (err: any) {
        console.error(err);
        setRecordState("idle");
        setErrorMessage("Microphone unavailable. Make sure permissions are granted.");
      }
    }
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
              Perfect! Response matched ({Math.round(similarity * 100)}% similarity)
            </Text>
          </View>
        );
      }

      if (attempts >= 3) {
        return (
          <View style={[styles.feedbackBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
            <AlertCircle size={18} color="#ef4444" />
            <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
              Revealing correct response: "{expectedPhrase.roman}"
            </Text>
          </View>
        );
      }

      return (
        <View style={[styles.feedbackBanner, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
          <AlertCircle size={18} color="#f59e0b" />
          <Text style={[styles.feedbackText, { color: "#fdba74" }]}>
            Heard: "{transcript || "..."}" ({Math.round(similarity * 100)}% match). Speak again! (Attempt {attempts}/3)
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Scene Count */}
      <View style={styles.sceneHeader}>
        <Text style={styles.sceneText}>
          Scene {sceneIndex + 1} of {totalScenes}
        </Text>
      </View>

      {/* 2. Speaker Line Card */}
      <View style={styles.speakerCard}>
        <View style={styles.speakerTitleRow}>
          <UserSquare2 size={24} color="#f59e0b" />
          <Text style={styles.speakerName}>Pakistani Neighbor</Text>
        </View>
        
        <Text style={styles.speakerUrdu}>{exercise.speakerLine.urdu}</Text>
        <Text style={styles.speakerRoman}>"{exercise.speakerLine.roman}"</Text>
        <Text style={styles.speakerEnglish}>Meaning: {exercise.speakerLine.english}</Text>
        
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePlaySpeakerLine}
          style={styles.replaySpeakerBtn}
        >
          <Volume2 size={16} color="#2dd4bf" />
          <Text style={styles.replaySpeakerText}>Replay Neighbor Voice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.interactiveCard}>
        {/* Instruction prompt */}
        <Text style={styles.promptText}>{exercise.prompt}</Text>

        {/* Dynamic Hint Toggle */}
        {exercise.hint && (
          <View style={styles.hintContainer}>
            {showHint ? (
              <View style={styles.hintBox}>
                <Text style={styles.hintTitle}>Respond with:</Text>
                <Text style={styles.hintText}>{exercise.hint}</Text>
                <Text style={styles.hintWarning}>⚠️ Score capped to 70% for using hint</Text>
              </View>
            ) : null}
            
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleHintPress}
              style={styles.hintBtn}
            >
              {showHint ? (
                <>
                  <EyeOff size={14} color="#2dd4bf" />
                  <Text style={styles.hintBtnText}>Hide Help</Text>
                </>
              ) : (
                <>
                  <Eye size={14} color="#2dd4bf" />
                  <Text style={styles.hintBtnText}>Need Help?</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Circular mic recorder */}
        <View style={styles.micSection}>
          <View style={{ opacity: isSpeakerAudioFinished ? 1.0 : 0.4 }}>
            <RecordButton
              state={recordState}
              onPress={handleRecordPress}
              disabled={isFinished || !isSpeakerAudioFinished}
            />
          </View>
          <Text style={styles.micLabel}>
            {!isSpeakerAudioFinished
              ? "Listening to neighbor..."
              : recordState === "idle"
              ? "Respond now"
              : recordState === "recording"
              ? "Tap square to stop"
              : recordState === "processing"
              ? "Analyzing speech..."
              : "Completed!"}
          </Text>
        </View>

        {/* Real-time scoring feedback */}
        {renderFeedbackMessage()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
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
  sceneHeader: {
    alignSelf: "flex-start",
    backgroundColor: "#d97706",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  sceneText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  speakerCard: {
    backgroundColor: "#092e2b",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
    marginBottom: 12,
  },
  speakerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  speakerName: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  speakerUrdu: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 2,
  },
  speakerRoman: {
    color: "#2dd4bf",
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
    marginBottom: 2,
  },
  speakerEnglish: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
    marginBottom: 10,
  },
  replaySpeakerBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(20, 184, 166, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.15)",
  },
  replaySpeakerText: {
    color: "#2dd4bf",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  interactiveCard: {
    flex: 1,
    backgroundColor: "#0d5c56",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  promptText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  hintContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  hintBox: {
    width: "100%",
    backgroundColor: "#092e2b",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.15)",
    marginBottom: 8,
    alignItems: "center",
  },
  hintTitle: {
    color: "#a7f3d0",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
    opacity: 0.8,
  },
  hintText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  hintWarning: {
    color: "#fdba74",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.9,
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 184, 166, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.15)",
  },
  hintBtnText: {
    color: "#2dd4bf",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
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
    marginTop: 4,
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
  },
  feedbackText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
    textAlign: "center",
    flex: 1,
  },
});
