import React from "react";
import { View, Text } from "react-native";
import { Star } from "lucide-react-native";

interface XPCounterProps {
  amount: number;
}

export default function XPCounter({ amount }: XPCounterProps) {
  return (
    <View className="flex-row items-center bg-[#d97706]/15 border border-[#d97706]/30 px-3.5 py-1.5 rounded-full shadow-sm">
      <Star
        size={18}
        color="#d97706"
        fill="#f59e0b"
      />
      <Text className="text-[#fcd34d] font-extrabold text-sm ml-1.5 tracking-wide">
        {amount} XP
      </Text>
    </View>
  );
}
