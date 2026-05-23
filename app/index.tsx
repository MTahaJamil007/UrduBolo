import React from "react";
import { Text, View, StatusBar } from "react-native";

export default function HomePlaceholder() {
  return (
    <View className="flex-1 items-center justify-center bg-[#092e2b] px-6">
      <StatusBar barStyle="light-content" />
      <View className="items-center">
        {/* Decorative Urdu character block */}
        <View className="w-20 h-20 bg-[#0f766e] rounded-3xl items-center justify-center border border-[#14b8a6]/20 shadow-2xl mb-6">
          <Text className="text-white text-4xl font-semibold">ب</Text>
        </View>

        <Text className="text-white text-5xl font-extrabold tracking-wider text-center">
          Bolo
        </Text>
        
        <Text className="text-[#2dd4bf] text-2xl font-bold tracking-wide text-center mt-2">
          Pakistani Urdu
        </Text>

        {/* Decorative divider */}
        <View className="h-[2px] w-16 bg-[#d97706] rounded-full mt-6 mb-6" />

        <Text className="text-[#a7f3d0] text-base font-medium text-center max-w-[280px] opacity-90 leading-6">
          Speak your heritage. One level at a time.
        </Text>
        
        <Text className="text-[#5eead4] text-xs font-semibold uppercase tracking-widest text-center mt-12 bg-[#0f766e]/30 px-4 py-2 rounded-full border border-[#0f766e]/40">
          Sprint 0 — Setup Complete
        </Text>
      </View>
    </View>
  );
}
