/**
 * Speech Recognition Service
 * 
 * Wraps @react-native-voice/voice with robust error handling.
 * Falls back to mock/simulator mode if the native module is unavailable
 * (e.g. emulators, older Android devices, or when the module fails to initialize).
 */

export class PermissionError extends Error {
  constructor(message = "Microphone permission denied") {
    super(message);
    this.name = "PermissionError";
  }
}

// Safely load the native Voice module. It will be null if native binding fails.
let Voice: any = null;
let isNativeVoiceAvailable = false;

try {
  // Use require instead of static import to allow clean runtime try-catch fallback
  Voice = require("@react-native-voice/voice").default;
  isNativeVoiceAvailable =
    typeof Voice !== "undefined" &&
    Voice !== null &&
    typeof Voice.start === "function";
  console.log(`[SpeechService] Native Voice module successfully loaded. Status: ${isNativeVoiceAvailable}`);
} catch (err) {
  console.warn("[SpeechService] Failed to dynamically load native Voice module. Falling back to MOCK mode.", err);
  Voice = null;
  isNativeVoiceAvailable = false;
}

let isListening = false;
let resolveSpeechPromise: ((transcript: string) => void) | null = null;
let rejectSpeechPromise: ((error: Error) => void) | null = null;
let speechTimeout: any = null;

// Initialize native event listeners ONCE if Voice is available
if (isNativeVoiceAvailable && Voice) {
  try {
    Voice.onSpeechStart = () => {
      console.log("[SpeechService] Native Speech started...");
    };

    Voice.onSpeechResults = (e: any) => {
      console.log("[SpeechService] Native Speech results returned:", e.value);
      if (e.value && e.value.length > 0 && resolveSpeechPromise) {
        clearSpeechTimeout();
        resolveSpeechPromise(e.value[0]);
        cleanupSpeechPromises();
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error("[SpeechService] Native Speech error code:", e.error);
      const errorMessage = e.error?.message || "Unknown voice error";
      
      if (errorMessage.toLowerCase().includes("permission") && rejectSpeechPromise) {
        rejectSpeechPromise(new PermissionError());
      } else if (resolveSpeechPromise) {
        // Fallback to empty string for typical timeouts/errors so the app handles it gracefully
        resolveSpeechPromise("");
      }
      
      clearSpeechTimeout();
      cleanupSpeechPromises();
    };

    Voice.onSpeechEnd = () => {
      console.log("[SpeechService] Native Speech ended.");
      isListening = false;
    };
  } catch (err) {
    console.error("[SpeechService] Failed to bind event listeners:", err);
  }
}

function clearSpeechTimeout() {
  if (speechTimeout) {
    clearTimeout(speechTimeout);
    speechTimeout = null;
  }
}

function cleanupSpeechPromises() {
  resolveSpeechPromise = null;
  rejectSpeechPromise = null;
  isListening = false;
}

/**
 * Checks if native speech recognition is available on the current device.
 */
export function isSpeechAvailable(): boolean {
  return isNativeVoiceAvailable;
}

/**
 * Starts recording audio from the microphone.
 * Sets up a 10-second absolute timeout to resolve if the user goes silent.
 */
export async function startSpeechRecording(mockExpectedText = ""): Promise<string> {
  if (isListening) {
    await stopSpeechRecording();
  }

  isListening = true;

  return new Promise<string>(async (resolve, reject) => {
    resolveSpeechPromise = resolve;
    rejectSpeechPromise = reject;

    // Start 10-second timeout
    speechTimeout = setTimeout(() => {
      console.warn("[SpeechService] Speech recording timed out (10s).");
      if (resolveSpeechPromise) {
        resolveSpeechPromise("");
      }
      cleanupSpeechPromises();
    }, 10000);

    if (isNativeVoiceAvailable && Voice) {
      // 1. Native microphone recording path
      try {
        await Voice.start("ur-PK"); // Bind Pakistani Urdu locale
      } catch (error: any) {
        console.error("[SpeechService] Voice.start native error:", error);
        clearSpeechTimeout();
        reject(error);
        cleanupSpeechPromises();
      }
    } else {
      // 2. Simulated mock recording path for simulator/browser
      console.log(`[SpeechService] [Mock Mode] Simulating recording for: "${mockExpectedText}"`);
      
      // Resolve after 1.5s recording animation finishes
      setTimeout(() => {
        if (resolveSpeechPromise) {
          clearSpeechTimeout();
          // Simulate 100% correct input or exactly matching the roman phrase
          resolveSpeechPromise(mockExpectedText);
          cleanupSpeechPromises();
        }
      }, 1800);
    }
  });
}

/**
 * Stops recording and triggers ASR completion.
 */
export async function stopSpeechRecording(): Promise<string> {
  clearSpeechTimeout();
  
  if (!isListening) {
    return "";
  }

  isListening = false;

  if (isNativeVoiceAvailable && Voice) {
    try {
      await Voice.stop();
      // Wait briefly for native speech results callback
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          if (resolveSpeechPromise) {
            resolveSpeechPromise("");
          }
          cleanupSpeechPromises();
          resolve("");
        }, 1000);
      });
    } catch (error) {
      console.error("[SpeechService] Voice.stop native error:", error);
      cleanupSpeechPromises();
      return "";
    }
  } else {
    // If stopped manually in mock mode, resolve empty or with prompt
    const resolveVal = "";
    if (resolveSpeechPromise) {
      resolveSpeechPromise(resolveVal);
    }
    cleanupSpeechPromises();
    return resolveVal;
  }
}
