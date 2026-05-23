import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Volume2 } from "lucide-react-native";
import { loadChapter } from "../services/contentService";
import { playAudio, stopAllAudio } from "../services/audioService";
import { useAudioStore } from "../stores/useAudioStore";
import { Chapter } from "../types/chapter";
import { colors } from "../constants/colors";
import AudioButton from "../components/AudioButton";

export default function AudioTestScreen() {
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  // For testing custom scenario turn audios
  const activeAudioId = useAudioStore((state) => state.activeAudioId);
  const setActiveAudioId = useAudioStore((state) => state.setActiveAudioId);

  useEffect(() => {
    async function load() {
      const data = await loadChapter("C01");
      setChapter(data);
      setLoading(false);
    }
    load();
    return () => {
      stopAllAudio();
    };
  }, []);

  const handlePlayScenarioTurn = async (turnId: string, audioPath: string, textFallback: string) => {
    if (activeAudioId === turnId) {
      await stopAllAudio();
      setActiveAudioId(null);
      return;
    }

    setActiveAudioId(turnId);
    try {
      await playAudio(audioPath, textFallback, "normal", () => {
        if (useAudioStore.getState().activeAudioId === turnId) {
          setActiveAudioId(null);
        }
      });
    } catch (error) {
      console.error(error);
      setActiveAudioId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load Chapter 1 content data.</Text>
      </View>
    );
  }

  // Get the boss level (level 5) scenario turns
  const bossLevel = chapter.levels.find((l) => l.type === "BOSS");
  const scenarioTurns = bossLevel ? bossLevel.exerciseSequence : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audio Test Studio</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          Testing Chapter 1: "{chapter.title}". Tapping plays native audio if present, or falls back to Urdu TTS dynamically. Long-press buttons for 0.75x slow speed practice.
        </Text>

        {/* Section 1: Standard Phrases */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chapter Vocabulary Phrases</Text>
        </View>

        {chapter.phrases.map((phrase) => (
          <View key={phrase.id} style={styles.phraseCard}>
            <View style={styles.phraseInfo}>
              <Text style={styles.phraseUrdu}>{phrase.urdu}</Text>
              <Text style={styles.phraseRoman}>"{phrase.roman}"</Text>
              <Text style={styles.phraseEnglish}>{phrase.englishContextual}</Text>
              <Text style={styles.phraseMeta}>
                Level {phrase.levelId} • {phrase.category} • {phrase.gender}
              </Text>
            </View>
            <View style={styles.controls}>
              <View style={styles.controlItem}>
                <AudioButton phrase={phrase} speed="normal" size="small" />
                <Text style={styles.controlLabel}>Normal</Text>
              </View>
              <View style={{ width: 14 }} />
              <View style={styles.controlItem}>
                <AudioButton phrase={phrase} speed="slow" size="small" />
                <Text style={styles.controlLabel}>Slow</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Section 2: Boss Level Scenario dialogue lines */}
        {bossLevel && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Boss Scenario Speaker Lines</Text>
            </View>

            {scenarioTurns.map((turn, index) => {
              if (turn.type !== "SCENARIO_TURN") return null;
              
              const isPlaying = activeAudioId === turn.id;

              return (
                <View key={turn.id} style={styles.phraseCard}>
                  <View style={styles.phraseInfo}>
                    <Text style={styles.turnLabel}>Turn {index + 1}: Neighbor Line</Text>
                    <Text style={styles.phraseUrdu}>{turn.speakerLine.urdu}</Text>
                    <Text style={styles.phraseRoman}>"{turn.speakerLine.roman}"</Text>
                    <Text style={styles.phraseEnglish}>Meaning: {turn.speakerLine.english}</Text>
                    <Text style={styles.phraseMeta}>Prompt: {turn.prompt}</Text>
                  </View>
                  <View style={styles.controls}>
                    <View style={styles.controlItem}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          handlePlayScenarioTurn(
                            turn.id,
                            turn.speakerLine.audio,
                            turn.speakerLine.urdu || turn.speakerLine.roman
                          )
                        }
                        style={[
                          styles.scenarioPlayBtn,
                          {
                            backgroundColor: isPlaying ? colors.accentLight : colors.accent,
                          },
                        ]}
                      >
                        <Volume2 size={20} color="#ffffff" />
                      </TouchableOpacity>
                      <Text style={styles.controlLabel}>Speaker</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d5c56",
    borderRadius: 22,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introText: {
    color: "#a7f3d0",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    opacity: 0.85,
    marginBottom: 20,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
    paddingLeft: 10,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  phraseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0d5c56",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  phraseInfo: {
    flex: 1,
    marginRight: 12,
  },
  phraseUrdu: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  phraseRoman: {
    color: "#2dd4bf",
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
    marginBottom: 2,
  },
  phraseEnglish: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  phraseMeta: {
    color: "#5eead4",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.7,
  },
  turnLabel: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlItem: {
    alignItems: "center",
  },
  controlLabel: {
    color: "#2dd4bf",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  scenarioPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
