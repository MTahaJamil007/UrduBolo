import React from "react";
import { View, StyleSheet } from "react-native";

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress * 100));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percentage}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    width: "100%",
    backgroundColor: "#0d5c56",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  fill: {
    height: "100%",
    backgroundColor: "#2dd4bf",
    borderRadius: 4,
  },
});
