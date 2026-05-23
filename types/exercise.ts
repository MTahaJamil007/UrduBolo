export type ExerciseType =
  | "INTRODUCE"
  | "L_TO_I"
  | "L_TO_M"
  | "LISTEN_REPEAT"
  | "SPEAK"
  | "SCENARIO_TURN";

export interface BaseExercise {
  id: string;
  type: ExerciseType;
}

export interface IntroduceExercise extends BaseExercise {
  type: "INTRODUCE";
  phraseId: string;
}

export interface ListenToMeaningExercise extends BaseExercise {
  type: "L_TO_M";
  phraseId: string;
  distractorPhraseIds: string[];
  prompt: string;
  hint?: string | null;
}

export interface ListenToImageExercise extends BaseExercise {
  type: "L_TO_I";
  phraseId: string;
  distractorPhraseIds: string[];
  prompt: string;
  hint?: string | null;
}

export interface ListenRepeatExercise extends BaseExercise {
  type: "LISTEN_REPEAT";
  phraseId: string;
}

export interface SpeakExercise extends BaseExercise {
  type: "SPEAK";
  phraseId: string;
  prompt: string;
  hint?: string | null;
}

export interface ScenarioTurnExercise extends BaseExercise {
  type: "SCENARIO_TURN";
  speakerLine: {
    audio: string;
    urdu: string;
    roman: string;
    english: string;
  };
  expectedPhraseId: string;
  prompt: string;
  hint: string | null;
}

export type Exercise =
  | IntroduceExercise
  | ListenToMeaningExercise
  | ListenToImageExercise
  | ListenRepeatExercise
  | SpeakExercise
  | ScenarioTurnExercise;
