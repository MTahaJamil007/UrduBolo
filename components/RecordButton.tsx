import React, { useEffect } from "react";
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from "react-native";
import { Mic, Square, Check } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { colors } from "../constants/colors";

export type RecordButtonState = "idle" | "recording" | "processing" | "done";

interface RecordButtonProps {
  state: RecordButtonState;
  onPress: () => void;
  disabled?: boolean;
}

export default function RecordButton({
  state,
  onPress,
  disabled,
}: RecordButtonProps) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isDone = state === "done";

  // Reanimated pulse values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 900 }),
          withTiming(1.0, { duration: 900 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 900 }),
          withTiming(0.5, { duration: 900 })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
      opacity.value = 0;
    }
  }, [isRecording]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Color mappings
  let bgColor = "#ef4444"; // Red-500 for idle record
  let shadowColor = "#ef4444";

  if (isRecording) {
    bgColor = "#dc2626"; // Red-600 active
  } else if (isProcessing) {
    bgColor = colors.primary; // Teal-700 loading
    shadowColor = colors.primaryLight;
  } else if (isDone) {
    bgColor = colors.success; // Emerald-500 complete
    shadowColor = colors.success;
  }

  const renderIcon = () => {
    if (isProcessing) {
      return <ActivityIndicator size="small" color="#ffffff" />;
    }
    if (isRecording) {
      return <Square size={24} color="#ffffff" fill="#ffffff" />;
    }
    if (isDone) {
      return <Check size={28} color="#ffffff" strokeWidth={3} />;
    }
    return <Mic size={28} color="#ffffff" />;
  };

  return (
    <View style={styles.container}>
      {/* Pulse Outer Red Halo for Recording */}
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseHalo,
            animatedGlowStyle,
            {
              backgroundColor: "rgba(239, 68, 68, 0.4)",
            },
          ]}
        />
      )}

      {/* Primary Mic Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || isProcessing}
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            shadowColor: shadowColor,
            shadowOpacity: isRecording || isDone ? 0.4 : 0.2,
            shadowRadius: isRecording ? 8 : 4,
            elevation: isRecording ? 8 : 3,
          },
        ]}
      >
        {renderIcon()}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 110,
    height: 110,
  },
  pulseHalo: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    zIndex: -1,
  },
  button: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
