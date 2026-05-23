import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { Phrase } from "../types/phrase";
import { playAudio, stopAllAudio } from "../services/audioService";
import { useAudioStore } from "../stores/useAudioStore";
import { colors } from "../constants/colors";

interface AudioButtonProps {
  phrase: Phrase;
  speed?: "normal" | "slow";
  size?: "small" | "large";
}

export default function AudioButton({
  phrase,
  speed = "normal",
  size = "large",
}: AudioButtonProps) {
  const activeAudioId = useAudioStore((state) => state.activeAudioId);
  const setActiveAudioId = useAudioStore((state) => state.setActiveAudioId);

  // We can track normal vs slow as separate identifiers so each is discrete
  const buttonPlaybackId = `${phrase.id}-${speed}`;
  const isPlaying = activeAudioId === buttonPlaybackId;

  // Dimensions setup
  const buttonSize = size === "large" ? 56 : 40;
  const iconSize = size === "large" ? 22 : 16;
  const borderRadius = buttonSize / 2;

  const handlePlayPress = async (forcedSpeed?: "normal" | "slow") => {
    const targetSpeed = forcedSpeed || speed;
    const targetPlaybackId = `${phrase.id}-${targetSpeed}`;

    // If already playing this exact ID, stop it
    if (activeAudioId === targetPlaybackId) {
      await stopAllAudio();
      setActiveAudioId(null);
      return;
    }

    // Set globally active ID
    setActiveAudioId(targetPlaybackId);

    try {
      // Trigger native audio with TTS fallback
      // Play Urdu text if available for better TTS accents, falling back to Roman
      const speakText = phrase.urdu || phrase.roman;
      await playAudio(phrase.audio[targetSpeed], speakText, targetSpeed, () => {
        // Reset when audio finishes
        if (useAudioStore.getState().activeAudioId === targetPlaybackId) {
          setActiveAudioId(null);
        }
      });
    } catch (error) {
      console.error("[AudioButton] Playback failed:", error);
      setActiveAudioId(null);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handlePlayPress()}
      onLongPress={() => handlePlayPress("slow")} // Play in slow speed on long press
      delayLongPress={500}
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: borderRadius,
          backgroundColor: isPlaying ? colors.primaryLight : colors.primary,
          shadowColor: isPlaying ? colors.primaryLight : "#000000",
          shadowOpacity: isPlaying ? 0.4 : 0.15,
          shadowRadius: isPlaying ? 6 : 3,
          elevation: isPlaying ? 5 : 2,
        },
      ]}
    >
      {isPlaying ? (
        <Pause size={iconSize} color="#ffffff" fill="#ffffff" />
      ) : (
        <Play size={iconSize} color="#ffffff" fill="#ffffff" style={{ marginLeft: size === "large" ? 2 : 1 }} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
