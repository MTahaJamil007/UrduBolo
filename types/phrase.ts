export type Gender = "m" | "f" | "neutral";

export type PhraseCategory =
  | "greeting"
  | "response"
  | "courtesy"
  | "farewell"
  | "vocabulary"
  | "pronoun"
  | "number"
  | "color"
  | "object"
  | "other";

export interface AudioAssets {
  normal: string;
  slow: string;
}

export interface Phrase {
  id: string;
  chapterId: string;
  levelId: string;
  order: number;
  urdu: string;
  roman: string;
  english: string;
  englishContextual: string;
  gender: Gender;
  category: PhraseCategory;
  audio: AudioAssets;
  image: string | null;
  exerciseTypes: string[];
  notes: string;
}
