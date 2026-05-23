import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProgress, ChapterProgress, LevelProgress } from "../types/progress";

interface ProgressStore extends UserProgress {
  setUserName: (name: string) => void;
  setGenderPreference: (gender: "m" | "f" | "prefer-not-to-say" | null) => void;
  startLevel: (levelId: string) => void;
  completeLevel: (levelId: string, score: number) => void;
  completeChapter: (chapterId: string) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  isLevelUnlocked: (levelId: string) => boolean;
  isLevelComplete: (levelId: string) => boolean;
  isChapterComplete: (chapterId: string) => boolean;
  getCurrentLevel: () => { chapterId: string; levelId: string } | null;
  reset: () => void;
}

const DEFAULT_STATE: UserProgress = {
  userName: null,
  genderPreference: null,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  chaptersCompleted: [],
  chapterProgress: {},
  preferences: {
    hintsEnabled: true,
    autoplayEnabled: true,
    reduceMotion: false,
    theme: "system",
  },
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setUserName: (name) => set({ userName: name }),

      setGenderPreference: (gender) => set({ genderPreference: gender }),

      startLevel: (levelId) => {
        const [chapterPart] = levelId.split("-");
        const chapterId = `C${chapterPart.slice(1).padStart(2, "0")}`;
        
        set((state) => {
          const chapterProgress = { ...state.chapterProgress };
          
          if (!chapterProgress[chapterId]) {
            chapterProgress[chapterId] = {
              chapterId,
              startedAt: Date.now(),
              completedAt: null,
              levelProgress: {},
            };
          }
          
          const levelProgress = { ...chapterProgress[chapterId].levelProgress };
          if (!levelProgress[levelId]) {
            levelProgress[levelId] = {
              levelId,
              chapterId,
              startedAt: Date.now(),
              completedAt: null,
              bestScore: 0,
              attemptCount: 0,
            };
          }
          
          levelProgress[levelId].attemptCount += 1;
          chapterProgress[chapterId].levelProgress = levelProgress;

          return { chapterProgress };
        });
      },

      completeLevel: (levelId, score) => {
        const [chapterPart] = levelId.split("-");
        const chapterId = `C${chapterPart.slice(1).padStart(2, "0")}`;
        
        set((state) => {
          const chapterProgress = { ...state.chapterProgress };
          
          if (!chapterProgress[chapterId]) {
            chapterProgress[chapterId] = {
              chapterId,
              startedAt: Date.now(),
              completedAt: null,
              levelProgress: {},
            };
          }
          
          const levelProgress = { ...chapterProgress[chapterId].levelProgress };
          const existingLvl = levelProgress[levelId] || {
            levelId,
            chapterId,
            startedAt: Date.now(),
            completedAt: null,
            bestScore: 0,
            attemptCount: 0,
          };
          
          const newScore = Math.max(existingLvl.bestScore, score);
          const wasCompleted = existingLvl.completedAt !== null;
          const isCompletedNow = score >= 0.75;
          
          levelProgress[levelId] = {
            ...existingLvl,
            bestScore: newScore,
            completedAt: isCompletedNow && !wasCompleted ? Date.now() : existingLvl.completedAt,
          };
          
          chapterProgress[chapterId].levelProgress = levelProgress;
          
          // Award base XP (10 XP) for standard or boss passing the first time
          let xpAwarded = 0;
          if (isCompletedNow && !wasCompleted) {
            xpAwarded = 10;
          }

          return {
            chapterProgress,
            totalXP: state.totalXP + xpAwarded,
          };
        });
        
        get().updateStreak();
      },

      completeChapter: (chapterId) => {
        set((state) => {
          const chaptersCompleted = [...state.chaptersCompleted];
          if (!chaptersCompleted.includes(chapterId)) {
            chaptersCompleted.push(chapterId);
          }
          
          const chapterProgress = { ...state.chapterProgress };
          if (chapterProgress[chapterId]) {
            chapterProgress[chapterId].completedAt = Date.now();
          }

          return {
            chaptersCompleted,
            chapterProgress,
          };
        });
      },

      addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),

      updateStreak: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastActivityDate === today) {
          return; // Already practiced today
        }
        
        set((state) => {
          let currentStreak = state.currentStreak;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (state.lastActivityDate === null || state.lastActivityDate === yesterdayStr) {
            currentStreak += 1;
          } else {
            currentStreak = 1; // Streak broken, reset to 1
          }
          
          const longestStreak = Math.max(state.longestStreak, currentStreak);
          
          return {
            currentStreak,
            longestStreak,
            lastActivityDate: today,
          };
        });
      },

      isLevelUnlocked: (levelId) => {
        const [chapterPart, levelPart] = levelId.split("-");
        const chapterNum = parseInt(chapterPart.slice(1), 10);
        const levelNum = parseInt(levelPart, 10);

        // First level of first chapter is always unlocked
        if (chapterNum === 1 && levelNum === 1) return true;

        // First level of any other chapter: previous chapter must be complete
        if (levelNum === 1) {
          const prevChapterId = `C${(chapterNum - 1).toString().padStart(2, "0")}`;
          return get().chaptersCompleted.includes(prevChapterId);
        }

        // Any other level: previous level in same chapter must be complete
        const prevLevelId = `L${chapterNum}-${levelNum - 1}`;
        return get().isLevelComplete(prevLevelId);
      },

      isLevelComplete: (levelId) => {
        const [chapterPart] = levelId.split("-");
        const chapterId = `C${chapterPart.slice(1).padStart(2, "0")}`;
        const chProgress = get().chapterProgress[chapterId];
        if (!chProgress) return false;
        
        const lvlProgress = chProgress.levelProgress[levelId];
        if (!lvlProgress) return false;
        
        return lvlProgress.completedAt !== null && lvlProgress.bestScore >= 0.75;
      },

      isChapterComplete: (chapterId) => {
        return get().chaptersCompleted.includes(chapterId);
      },

      getCurrentLevel: () => {
        // Iterate through all 10 chapters, and find the first unlocked but incomplete level
        for (let c = 1; c <= 10; c++) {
          const chapterId = `C${c.toString().padStart(2, "0")}`;
          for (let l = 1; l <= 5; l++) {
            const levelId = `L${c}-${l}`;
            if (get().isLevelUnlocked(levelId) && !get().isLevelComplete(levelId)) {
              return { chapterId, levelId };
            }
          }
        }
        
        // If all completed, return level 1.1 or last completed
        return { chapterId: "C01", levelId: "L1-1" };
      },

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: "bolo-progress-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
