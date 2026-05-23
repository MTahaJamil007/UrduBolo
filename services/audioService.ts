import { Audio } from "expo-av";
import * as Speech from "expo-speech";

const AUDIO_ASSETS: Record<string, any> = {
  // Static maps will be resolved here as the user records files
};

let currentSound: Audio.Sound | null = null;
let isPlayingTTS = false;

/**
 * Stop any ongoing audio playback (both expo-av sounds and expo-speech TTS).
 */
export async function stopAllAudio(): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
    if (isPlayingTTS) {
      await Speech.stop();
      isPlayingTTS = false;
    }
  } catch (error) {
    console.error("[AudioService] Error stopping audio:", error);
  }
}

/**
 * Plays an audio asset. If the file is missing from the static bundling map,
 * it automatically falls back to Expo Speech text-to-speech with Urdu locale.
 *
 * @param assetPath Path of the audio asset (e.g. 'audio/C01/C01-001-normal.m4a')
 * @param textFallback Text to speak if local file is missing
 * @param speed Audio speed modifier ('normal' = 1.0, 'slow' = 0.75)
 * @param onDone Callback fired when audio finishes playing or errors out
 */
export async function playAudio(
  assetPath: string,
  textFallback?: string,
  speed: "normal" | "slow" = "normal",
  onDone?: () => void
): Promise<void> {
  await stopAllAudio();

  const source = AUDIO_ASSETS[assetPath];

  if (source) {
    // 1. Play native audio file
    try {
      console.log(`[AudioService] Playing local file: ${assetPath} (${speed} speed)`);
      const rate = speed === "normal" ? 1.0 : 0.75;
      
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true, rate, shouldCorrectPitch: true }
      );
      currentSound = sound;
      
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
          if (currentSound === sound) {
            currentSound = null;
          }
          if (onDone) onDone();
        }
      });
    } catch (error) {
      console.error(`[AudioService] Error playing local audio ${assetPath}, falling back to TTS:`, error);
      if (textFallback) {
        await playTTS(textFallback, speed, onDone);
      } else if (onDone) {
        onDone();
      }
    }
  } else {
    // 2. TTS Fallback
    if (textFallback) {
      await playTTS(textFallback, speed, onDone);
    } else {
      console.warn(`[AudioService] Missing asset ${assetPath} and no text fallback provided.`);
      if (onDone) onDone();
    }
  }
}

/**
 * Speaks a text using Expo Speech engine.
 */
async function playTTS(
  text: string,
  speed: "normal" | "slow",
  onDone?: () => void
): Promise<void> {
  try {
    console.log(`[AudioService] [TTS Fallback] Speaking: "${text}" (${speed} speed)`);
    isPlayingTTS = true;

    const rate = speed === "normal" ? 0.9 : 0.65;

    await Speech.speak(text, {
      language: "ur-PK",
      rate,
      onDone: () => {
        isPlayingTTS = false;
        if (onDone) onDone();
      },
      onStopped: () => {
        isPlayingTTS = false;
        if (onDone) onDone();
      },
      onError: (err) => {
        console.error("[AudioService] TTS Error:", err);
        isPlayingTTS = false;
        if (onDone) onDone();
      },
    });
  } catch (error) {
    console.error("[AudioService] Failed to trigger speech fallback:", error);
    isPlayingTTS = false;
    if (onDone) onDone();
  }
}
