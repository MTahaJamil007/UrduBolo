import { Phrase } from "../types/phrase";
import { calculateSimilarity } from "../utils/similarity";

interface ScoreResult {
  score: number;
  passed: boolean;
  matchedAgainst: "roman" | "urdu";
  transcript: string;
}

/**
 * Scores a user's speech transcript against a target phrase.
 * Computes similarities against both Roman and Urdu scripts and returns the highest score.
 * This guarantees robust support across devices whose ASR engines decide to output either
 * Urdu characters or Roman transliterations.
 *
 * @param transcript The raw text recognized from the microphone
 * @param phrase The expected target Phrase object
 * @param threshold The passing boundary, defaults to 0.70 (lenient ASR scoring)
 */
export function scoreSpeech(
  transcript: string,
  phrase: Phrase,
  threshold = 0.70
): ScoreResult {
  const romanScore = calculateSimilarity(transcript, phrase.roman);
  const urduScore = calculateSimilarity(transcript, phrase.urdu);

  const finalScore = Math.max(romanScore, urduScore);
  const matchedAgainst = urduScore >= romanScore ? "urdu" : "roman";

  return {
    score: parseFloat(finalScore.toFixed(3)),
    passed: finalScore >= threshold,
    matchedAgainst,
    transcript,
  };
}
