import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Phrase } from "../../types/phrase";
import AudioButton from "../AudioButton";
import { playAudio } from "../../services/audioService";
import { colors } from "../../constants/colors";

interface IntroduceExerciseProps {
  phrase: Phrase;
  onNext: () => void;
}

export default function IntroduceExercise({
  phrase,
  onNext,
}: IntroduceExerciseProps) {
  useEffect(() => {
    // Auto-play the native voice file (with TTS fallback) on mount after a small transition delay
    const timer = setTimeout(() => {
      const speakText = phrase.urdu || phrase.roman;
      playAudio(phrase.audio.normal, speakText, "normal");
    }, 400);
    
    return () => clearTimeout(timer);
  }, [phrase.id]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>New Phrase Introduced</Text>
        
        {/* Large Urdu Script Display */}
        <Text style={styles.urduText}>{phrase.urdu}</Text>
        
        {/* Roman Transliteration */}
        <Text style={styles.romanText}>"{phrase.roman}"</Text>
        
        {/* English Translations */}
        <Text style={styles.englishText}>{phrase.englishContextual}</Text>
        <Text style={styles.meaningText}>Literal: {phrase.english}</Text>

        {/* Big Replay Buttons */}
        <View style={styles.audioContainer}>
          <View style={styles.audioRow}>
            <View style={styles.audioControl}>
              <AudioButton phrase={phrase} speed="normal" size="large" />
              <Text style={styles.audioLabel}>Normal</Text>
            </View>
            <View style={{ width: 40 }} />
            <View style={styles.audioControl}>
              <AudioButton phrase={phrase} speed="slow" size="large" />
              <Text style={styles.audioLabel}>Slow</Text>
            </View>
          </View>
        </View>

        {/* Culture/Usage Notes card */}
        {phrase.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Usage Context</Text>
            <Text style={styles.notesText}>{phrase.notes}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onNext} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
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
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  sectionHeading: {
    color: "#2dd4bf",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  urduText: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  romanText: {
    color: "#2dd4bf",
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 6,
  },
  englishText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 2,
  },
  meaningText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
  },
  audioContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioControl: {
    alignItems: "center",
  },
  audioLabel: {
    color: "#a7f3d0",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  notesCard: {
    width: "100%",
    backgroundColor: "#092e2b",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#ea580c", // Warm orange highlight
  },
  notesTitle: {
    color: "#fdba74",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  notesText: {
    color: "#a7f3d0",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  button: {
    backgroundColor: colors.primaryLight,
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
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
