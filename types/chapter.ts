import { Phrase } from "./phrase";
import { Level } from "./level";

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  goal: string;
  estimatedMinutes: number;
  culturalNote: string;
  passingScore: number;
  phrases: Phrase[];
  levels: Level[];
  rewards: {
    xp: number;
    completionMessage: string;
  };
}

export interface ChapterManifestItem {
  id: string;
  number: number;
  stage: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  contentFile: string;
}

export interface ChapterManifest {
  chapters: ChapterManifestItem[];
}
