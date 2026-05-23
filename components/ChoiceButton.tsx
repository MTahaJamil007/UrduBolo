import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

interface ChoiceButtonProps {
  label: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export default function ChoiceButton({
  label,
  isSelected,
  isCorrect,
  isIncorrect,
  onPress,
  disabled,
}: ChoiceButtonProps) {
  // Dynamic color state resolution
  let bgColor = "#0d5c56";
  let borderColor = "rgba(255, 255, 255, 0.1)";
  let textColor = "#a7f3d0";

  if (isCorrect) {
    bgColor = colors.success;
    borderColor = colors.success;
    textColor = "#ffffff";
  } else if (isIncorrect) {
    bgColor = colors.error;
    borderColor = colors.error;
    textColor = "#ffffff";
  } else if (isSelected) {
    bgColor = colors.primary;
    borderColor = colors.primaryLight;
    textColor = "#ffffff";
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: isSelected || isCorrect || isIncorrect ? 2 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontWeight: isSelected || isCorrect || isIncorrect ? "800" : "600",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});
