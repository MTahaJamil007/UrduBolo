import React from "react";
import { View, Text } from "react-native";
import { Flame } from "lucide-react-native";

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  return (
    <View className="flex-row items-center bg-[#ea580c]/15 border border-[#f97316]/30 px-3.5 py-1.5 rounded-full shadow-sm">
      <Flame
        size={18}
        color="#f97316"
        fill={count > 0 ? "#ea580c" : "transparent"}
      />
      <Text className="text-[#fdba74] font-extrabold text-sm ml-1.5 tracking-wide">
        {count}
      </Text>
    </View>
  );
}
