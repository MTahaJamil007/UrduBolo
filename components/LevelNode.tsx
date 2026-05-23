import React, { useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { Lock, Play, Check, Crown } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Level } from "../types/level";
import { colors } from "../constants/colors";

interface LevelNodeProps {
  level: Level;
  state: "locked" | "unlocked" | "completed" | "current";
  offset: number; // Wave horizontal offset
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export default function LevelNode({
  level,
  state,
  offset,
  onPress,
  onLayout,
}: LevelNodeProps) {
  const isBoss = level.type === "BOSS";
  const size = isBoss ? 100 : 72;
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const isCurrent = state === "current";

  // Pulse animation values for active/current node
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (isCurrent) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 1200 }),
          withTiming(1.0, { duration: 1200 })
        ),
        -1, // Loop infinitely
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 1200 }),
          withTiming(0.6, { duration: 1200 })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
      opacity.value = 0;
    }
  }, [isCurrent]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Color resolutions based on level states
  let bgColor = colors.locked;
  let borderColor = colors.lockedBorder;
  let iconColor = colors.lockedText;

  if (isCompleted) {
    bgColor = isBoss ? colors.accent : colors.primary;
    borderColor = isBoss ? colors.accentLight : colors.primaryLight;
    iconColor = "#ffffff";
  } else if (isCurrent || state === "unlocked") {
    bgColor = isBoss ? colors.accent : colors.primary;
    borderColor = "#ffffff";
    iconColor = "#ffffff";
  }

  const renderIcon = () => {
    const iconSize = isBoss ? 32 : 24;
    
    if (isLocked) {
      return <Lock size={iconSize} color={iconColor} />;
    }
    if (isCompleted) {
      return <Check size={iconSize} color={iconColor} strokeWidth={3} />;
    }
    if (isBoss) {
      return <Crown size={iconSize} color={iconColor} fill="#ffffff" />;
    }
    return <Play size={iconSize} color={iconColor} fill="#ffffff" />;
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          transform: [{ translateX: offset }],
        },
      ]}
    >
      <View style={styles.nodeWrapper}>
        {/* Animated outer pulsing glow ring for active/frontier levels */}
        {isCurrent && (
          <Animated.View
            style={[
              styles.pulseGlow,
              {
                width: size + 24,
                height: size + 24,
                borderRadius: (size + 24) / 2,
                backgroundColor: isBoss ? colors.accent : colors.primaryLight,
              },
              animatedGlowStyle,
            ]}
          />
        )}

        {/* The main circular node */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: isCurrent ? 4 : 2,
              shadowColor: isBoss ? colors.accent : colors.primaryLight,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isCurrent ? 0.4 : 0.1,
              shadowRadius: isCurrent ? 8 : 4,
              elevation: isCurrent ? 8 : 2,
            },
          ]}
        >
          {renderIcon()}
        </TouchableOpacity>
      </View>

      {/* Floating level metadata labels */}
      <Text
        className={`text-center font-bold text-xs mt-2 tracking-wide uppercase ${
          isLocked ? "text-gray-500" : isBoss ? "text-[#fcd34d]" : "text-[#2dd4bf]"
        }`}
      >
        Level {level.chapterId.slice(1)}.{level.number}
      </Text>
      
      <Text
        numberOfLines={1}
        className={`text-center font-semibold text-sm max-w-[130px] ${
          isLocked ? "text-gray-600" : "text-white"
        }`}
      >
        {isBoss ? "Boss Challenge" : level.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 14,
  },
  nodeWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseGlow: {
    position: "absolute",
    zIndex: -1,
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
