export interface LevelProgress {
  levelId: string;
  chapterId: string;
  startedAt: number | null;
  completedAt: number | null;
  bestScore: number;
  attemptCount: number;
}

export interface ChapterProgress {
  chapterId: string;
  startedAt: number | null;
  completedAt: number | null;
  levelProgress: Record<string, LevelProgress>;
}

export interface UserPreferences {
  hintsEnabled: boolean;
  autoplayEnabled: boolean;
  reduceMotion: boolean;
  theme: "light" | "dark" | "system";
}

export interface UserProgress {
  userName: string | null;
  genderPreference: "m" | "f" | "prefer-not-to-say" | null;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  chaptersCompleted: string[];
  chapterProgress: Record<string, ChapterProgress>;
  preferences: UserPreferences;
}
