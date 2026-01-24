/**
 * Transcript Normalizer for Filipino Number Shortcuts
 *
 * Filipinos often speak numbers in shortcut format during voice input:
 * - "10,20" or "10 20" instead of "1020"
 * - "1,2,3" or "1 2 3" instead of "123"
 * - "11 0 5 8" instead of "11058"
 *
 * This utility normalizes these patterns when they appear near policy keywords.
 */

// Policy keywords that precede policy numbers
const POLICY_KEYWORDS = ['rule', 'do', 'ra', 'la', 'oshs'];

// Build regex pattern for keywords (case-insensitive)
const KEYWORD_PATTERN = POLICY_KEYWORDS.join('|');

/**
 * Normalizes Filipino number shortcuts in transcripts
 *
 * @param text - The transcript text to normalize
 * @returns The normalized text with joined numbers after policy keywords
 *
 * @example
 * normalizeTranscript("Rule 10 20") // Returns "Rule 1020"
 * normalizeTranscript("RA 11,0,5,8") // Returns "RA 11058"
 * normalizeTranscript("DO 1 9 8, series 2024") // Returns "DO 198, series 2024"
 * normalizeTranscript("There are 10 20 workers") // Returns unchanged (no keyword)
 */
export function normalizeTranscript(text: string): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  let result = text;

  // Pattern: keyword followed by separated digits (spaces, commas, or colons)
  // Matches: "Rule 10 20", "Rule 10,20", "Rule 10:20", "RA 1 2 3 4"
  // The number portion must start and end with a digit, with separators in between
  const keywordNumberPattern = new RegExp(
    `(${KEYWORD_PATTERN})\\s+([\\d][\\d\\s,:]*[\\d])`,
    'gi'
  );

  result = result.replace(keywordNumberPattern, (match, keyword, numbers) => {
    // Check if this looks like a series notation we should preserve
    // e.g., "DO 198, s" should only join digits before the comma if followed by series indicator
    const afterMatch = result.slice(result.indexOf(match) + match.length);
    const isSeriesNotation = /^,\s*s\.?\s*\d/i.test(afterMatch);

    if (isSeriesNotation) {
      // For series notation, only join the digits before the comma
      const parts = numbers.split(',');
      const mainNumber = parts[0].replace(/[\s:]+/g, '');
      // Return keyword + joined main number, preserving the rest for the series
      return `${keyword} ${mainNumber}`;
    }

    // Join all digits, removing separators (spaces, commas, colons)
    const joined = numbers.replace(/[\s,:]+/g, '');
    return `${keyword} ${joined}`;
  });

  // Handle edge case: single digit after keyword
  // Pattern: keyword followed by single digit then space then more digits
  // e.g., "Rule 1 020" should become "Rule 1020"
  const singleDigitPattern = new RegExp(
    `(${KEYWORD_PATTERN})\\s+(\\d)(?:\\s+(\\d+))`,
    'gi'
  );

  result = result.replace(singleDigitPattern, (match, keyword, firstDigit, restDigits) => {
    return `${keyword} ${firstDigit}${restDigits}`;
  });

  return result;
}

/**
 * Checks if text contains any policy keywords
 *
 * @param text - The text to check
 * @returns True if text contains policy keywords
 */
export function containsPolicyKeyword(text: string): boolean {
  if (!text) return false;
  const pattern = new RegExp(`\\b(${KEYWORD_PATTERN})\\b`, 'i');
  return pattern.test(text);
}

/**
 * Extracts potential policy references from text
 *
 * @param text - The text to extract from
 * @returns Array of found policy references
 */
export function extractPolicyReferences(text: string): string[] {
  if (!text) return [];

  const normalizedText = normalizeTranscript(text);
  const references: string[] = [];

  // Pattern to match keyword followed by number
  const pattern = new RegExp(
    `(${KEYWORD_PATTERN})\\s+(\\d+)`,
    'gi'
  );

  let match;
  while ((match = pattern.exec(normalizedText)) !== null) {
    references.push(`${match[1]} ${match[2]}`);
  }

  return references;
}

export default normalizeTranscript;
