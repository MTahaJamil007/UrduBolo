import { Chapter, ChapterManifest } from "../types/chapter";
import { Level } from "../types/level";
import { Phrase } from "../types/phrase";
import manifestData from "../content/manifest.json";

// Statically map chapter require statements to comply with Metro bundler constraints.
// Since React Native does not support dynamic import paths at runtime, we list them explicitly.
const CHAPTER_FILES: Record<string, any> = {
  C01: require("../content/chapters/chapter_01.json"),
  C02: require("../content/chapters/chapter_02.json"),
  C03: require("../content/chapters/chapter_03.json"),
  C04: require("../content/chapters/chapter_04.json"),
  C05: require("../content/chapters/chapter_05.json"),
  C06: require("../content/chapters/chapter_06.json"),
  C07: require("../content/chapters/chapter_07.json"),
  C08: require("../content/chapters/chapter_08.json"),
  C09: require("../content/chapters/chapter_09.json"),
  C10: require("../content/chapters/chapter_10.json"),
};

/**
 * Loads the application content manifest which lists all Stage 1 chapters.
 */
export function loadManifest(): ChapterManifest {
  return manifestData as ChapterManifest;
}

/**
 * Asynchronously loads a chapter's full data by ID.
 * Returns null if the chapter is not yet implemented or bundled.
 */
export async function loadChapter(chapterId: string): Promise<Chapter | null> {
  const chapterData = CHAPTER_FILES[chapterId];
  if (!chapterData) {
    console.warn(`loadChapter: Chapter data for ${chapterId} is not bundled or not yet authored.`);
    return null;
  }
  return chapterData as Chapter;
}

/**
 * Utility to find a level by ID inside a loaded Chapter.
 */
export function getLevelById(chapter: Chapter, levelId: string): Level | null {
  return chapter.levels.find((level) => level.id === levelId) || null;
}

/**
 * Utility to find a phrase by ID inside a loaded Chapter.
 */
export function getPhraseById(chapter: Chapter, phraseId: string): Phrase | null {
  return chapter.phrases.find((phrase) => phrase.id === phraseId) || null;
}
