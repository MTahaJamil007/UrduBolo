import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="audio-test" />
      <Stack.Screen name="level/[levelId]" />
      <Stack.Screen name="level/result" />
    </Stack>
  );
}
