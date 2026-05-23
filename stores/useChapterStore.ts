import { create } from "zustand";
import { Chapter } from "../types/chapter";
import { Level } from "../types/level";
import { Exercise } from "../types/exercise";

export interface ExerciseResult {
  exerciseId: string;
  passed: boolean;
  score: number;
  attempts: number;
}

interface ChapterStore {
  activeChapter: Chapter | null;
  activeLevel: Level | null;
  currentExerciseIndex: number;
  exercises: Exercise[];
  results: ExerciseResult[];
  
  setActive: (chapter: Chapter, level: Level) => void;
  recordResult: (exerciseId: string, passed: boolean, score: number, attempts: number) => void;
  advance: () => boolean; // Returns true if advanced, false if reached the end
  reset: () => void;
}

export const useChapterStore = create<ChapterStore>((set, get) => ({
  activeChapter: null,
  activeLevel: null,
  currentExerciseIndex: 0,
  exercises: [],
  results: [],

  setActive: (chapter, level) => {
    set({
      activeChapter: chapter,
      activeLevel: level,
      currentExerciseIndex: 0,
      exercises: level.exerciseSequence,
      results: [],
    });
  },

  recordResult: (exerciseId, passed, score, attempts) => {
    set((state) => {
      // Avoid duplicate results for the same exercise
      const results = state.results.filter((r) => r.exerciseId !== exerciseId);
      results.push({ exerciseId, passed, score, attempts });
      return { results };
    });
  },

  advance: () => {
    const { currentExerciseIndex, exercises } = get();
    if (currentExerciseIndex < exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 });
      return true;
    }
    return false; // Already at the end
  },

  reset: () => {
    set({
      activeChapter: null,
      activeLevel: null,
      currentExerciseIndex: 0,
      exercises: [],
      results: [],
    });
  },
}));
