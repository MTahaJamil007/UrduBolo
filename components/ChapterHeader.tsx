import React from "react";
import { View, Text } from "react-native";

interface ChapterHeaderProps {
  number: number;
  title: string;
  subtitle: string;
  goal: string;
}

export default function ChapterHeader({
  number,
  title,
  subtitle,
  goal,
}: ChapterHeaderProps) {
  return (
    <View className="items-center px-5 py-5 mt-8 mb-4 bg-[#0f766e]/15 border border-[#14b8a6]/20 rounded-3xl mx-4 shadow-lg">
      <Text className="text-[#2dd4bf] font-extrabold text-xs uppercase tracking-widest mb-1.5">
        Chapter {number}
      </Text>
      <Text className="text-white font-black text-2xl text-center mb-1 leading-8">
        {title}
      </Text>
      <Text className="text-[#a7f3d0] font-semibold text-sm text-center mb-4 leading-5 opacity-95">
        {subtitle}
      </Text>
      <View className="h-[1px] w-full bg-[#0f766e]/40 mb-3.5" />
      <Text className="text-[#a7f3d0]/80 font-medium text-xs text-center leading-5 px-3">
        Goal: {goal}
      </Text>
    </View>
  );
}
