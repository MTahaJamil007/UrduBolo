import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Alert,
  useWindowDimensions,
  LayoutChangeEvent,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useProgressStore } from "../stores/useProgressStore";
import { loadManifest, loadChapter } from "../services/contentService";
import { Chapter } from "../types/chapter";
import { Level } from "../types/level";
import ChapterHeader from "./ChapterHeader";
import LevelNode from "./LevelNode";
import Connector from "./Connector";

export default function PathView() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  // Progress store hooks
  const isLevelUnlocked = useProgressStore((state) => state.isLevelUnlocked);
  const isLevelComplete = useProgressStore((state) => state.isLevelComplete);
  const getCurrentLevel = useProgressStore((state) => state.getCurrentLevel);

  // Manifest and chapter loaders
  const manifest = loadManifest();
  const [chaptersData, setChaptersData] = useState<Record<string, Chapter>>({});
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Pre-load Chapter 1 (Greetings) which is fully authored.
      // Other chapters return null and get dynamic path placeholders.
      const c1 = await loadChapter("C01");
      if (c1) {
        setChaptersData((prev) => ({ ...prev, C01: c1 }));
      }
    }
    loadData();
  }, []);

  // Wavy horizontal offsets for the Duolingo path.
  // 5 levels wavy sequence: Center, Left, Center, Right, Center (Boss)
  const WAVE_OFFSETS = [0, -50, 0, 50, 0];

  const getChapterLevels = (chapterId: string): Level[] => {
    const data = chaptersData[chapterId];
    if (data) return data.levels;

    // Dynamically scaffold C02-C10 placeholder levels
    const levels: Level[] = [];
    const chapterNum = parseInt(chapterId.slice(1), 10);
    for (let l = 1; l <= 5; l++) {
      levels.push({
        id: `L${chapterNum}-${l}`,
        chapterId,
        number: l,
        title: l === 5 ? "Boss Challenge" : `Vocabulary Practice`,
        subtitle: l === 5 ? "Apply your skills" : "Practice your words",
        type: l === 5 ? "BOSS" : "STANDARD",
        estimatedMinutes: l === 5 ? 5 : 2,
        newPhraseIds: [],
        reviewPhraseIds: [],
        exerciseSequence: [],
        rewards: {
          xp: l === 5 ? 25 : 10,
        },
      });
    }
    return levels;
  };

  const handleNodePress = (lvl: Level) => {
    const unlocked = isLevelUnlocked(lvl.id);
    if (!unlocked) {
      Alert.alert("Locked Level", "Complete the previous levels first to unlock this practice!");
      return;
    }
    router.push(`/level/${lvl.id}`);
  };

  const handleCurrentLevelLayout = (event: LayoutChangeEvent) => {
    // Scroll to active/frontier level on launch once coordinates are resolved
    if (hasScrolled) return;
    const y = event.nativeEvent.layout.y;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y - 220),
        animated: true,
      });
      setHasScrolled(true);
    }, 150);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      className="bg-[#092e2b]"
    >
      {manifest.chapters.map((chManifestItem) => {
        const levels = getChapterLevels(chManifestItem.id);
        
        return (
          <View key={chManifestItem.id} style={{ width: "100%" }}>
            {/* Chapter goals header */}
            <ChapterHeader
              number={chManifestItem.number}
              title={chManifestItem.title}
              subtitle={chManifestItem.subtitle}
              goal={
                chaptersData[chManifestItem.id]?.goal ||
                "Practice vocabulary, numbers, structures, and speak with Pakistani locals."
              }
            />

            {/* Scrolling levels node sequences */}
            <View style={styles.levelsContainer}>
              {levels.map((level, index) => {
                const isUnlocked = isLevelUnlocked(level.id);
                const isComplete = isLevelComplete(level.id);
                const currentLevel = getCurrentLevel();
                const isCurrent = currentLevel?.levelId === level.id;

                let nodeState: "locked" | "unlocked" | "completed" | "current" = "locked";
                if (isComplete) {
                  nodeState = "completed";
                } else if (isCurrent) {
                  nodeState = "current";
                } else if (isUnlocked) {
                  nodeState = "unlocked";
                }

                const currentOffset = WAVE_OFFSETS[index % WAVE_OFFSETS.length];

                return (
                  <View key={level.id} style={{ width: "100%" }}>
                    <LevelNode
                      level={level}
                      state={nodeState}
                      offset={currentOffset}
                      onPress={() => handleNodePress(level)}
                      onLayout={isCurrent ? handleCurrentLevelLayout : undefined}
                    />

                    {/* Render connector to next node if not the last node of Chapter 10 */}
                    {index < levels.length - 1 && (
                      <Connector
                        fromOffset={currentOffset}
                        toOffset={WAVE_OFFSETS[(index + 1) % WAVE_OFFSETS.length]}
                        state={
                          isLevelUnlocked(levels[index + 1].id)
                            ? levels[index + 1].type === "BOSS"
                              ? "boss"
                              : "unlocked"
                            : "locked"
                        }
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 80,
  },
  levelsContainer: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
});
