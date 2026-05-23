/**
 * Normalizes a string by converting it to lowercase, removing punctuation,
 * stripping extra spaces, and removing Urdu-specific non-essential symbols
 * to allow lenient and robust pronunciation scoring.
 */
export function normalizeString(str: string): string {
  if (!str) return "";
  
  return str
    .toLowerCase()
    // Remove standard punctuation marks
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?!"'’]/g, "")
    // Remove Urdu specific punctuation
    .replace(/[؟۔،؛]/g, "")
    // Collapse multiple spaces into single space and trim edges
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes the Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const normA = normalizeString(a);
  const normB = normalizeString(b);

  if (normA.length === 0) return normB.length;
  if (normB.length === 0) return normA.length;

  const matrix: number[][] = [];

  // Increment along the first column of each row
  for (let i = 0; i <= normB.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= normA.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= normB.length; i++) {
    for (let j = 1; j <= normA.length; j++) {
      if (normB.charAt(i - 1) === normA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[normB.length][normA.length];
}

/**
 * Calculates a percentage similarity score between two strings.
 * Returns a value between 0.0 (completely different) and 1.0 (identical match).
 */
export function calculateSimilarity(a: string, b: string): number {
  const normA = normalizeString(a);
  const normB = normalizeString(b);

  if (normA === normB) return 1.0;

  const maxLength = Math.max(normA.length, normB.length);
  if (maxLength === 0) return 0.0;

  const distance = levenshteinDistance(normA, normB);
  const score = 1 - distance / maxLength;
  
  return Math.max(0, Math.min(1, score));
}
