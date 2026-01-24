/**
 * Transcript Normalizer for Filipino Number Shortcuts and Whisper Misheard Patterns
 *
 * Filipinos often speak numbers in shortcut format during voice input:
 * - "10,20" or "10 20" instead of "1020"
 * - "1,2,3" or "1 2 3" instead of "123"
 * - "11 0 5 8" instead of "11058"
 *
 * Whisper also commonly mishears OSH terminology:
 * - "D.O." or "DO" as "theos", "theo", "dios", "deal", "the o", "d o", "geo"
 * - "Department Order" as "department or there", "department order", "the partment order"
 * - "DOs" (plural) as "theos", "deals", "dios", "the o's"
 *
 * This utility normalizes these patterns.
 */

// Policy keywords that precede policy numbers
const POLICY_KEYWORDS = ['rule', 'do', 'ra', 'la', 'oshs', 'department order', 'department orders'];

// Build regex pattern for keywords (case-insensitive)
const KEYWORD_PATTERN = POLICY_KEYWORDS.join('|');

/**
 * Common Whisper misheard patterns for OSH terminology
 * Maps misheard text to correct text
 */
const MISHEARD_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // "D.O." / "DO" misheard patterns (singular)
  { pattern: /\b(theo|theos|dios|dio|the o|d\.?\s*o|geo|deal)\b(?!\s*(?:log|ry|ries))/gi, replacement: 'DO' },

  // "DOs" / "D.O.s" misheard patterns (plural)
  { pattern: /\b(theos|deals|dios|the o'?s|d\.?\s*o'?s|geos)\b/gi, replacement: 'DOs' },

  // "Department Order" misheard as "department or there/their/the"
  { pattern: /\bdepartment\s+or\s+(?:there|their|the|they're)\b/gi, replacement: 'Department Order' },
  { pattern: /\bthe\s*partment\s+order/gi, replacement: 'Department Order' },

  // "Department Orders" misheard patterns
  { pattern: /\bdepartment\s+or\s+(?:there|their|the|they're)s?\s+(?:related|about|on|for|regarding)/gi, replacement: 'Department Orders related' },
  { pattern: /\bdepartment\s+orders?\s+or\s+(?:there|their|the)\b/gi, replacement: 'Department Orders' },

  // "three DOs" misheard as "three theos" or "3 theos"
  { pattern: /\b(\d+|three|two|four|five)\s+(?:theos|deals|dios)\b/gi, replacement: '$1 DOs' },

  // "give me 3 theos" -> "give me 3 DOs"
  { pattern: /\bgive\s+me\s+(\d+)\s+(?:theos|deals|dios)\b/gi, replacement: 'give me $1 DOs' },

  // Common Filipino accent: "order" sounds like "or there"
  { pattern: /\bor\s+there\s+(?:related|about|on|for|regarding)/gi, replacement: 'Orders related' },

  // "Labor Advisory" misheard patterns
  { pattern: /\blabor\s+(?:ad\s*vice|ad\s*vise|at\s*vice)(?:ory|ories)?\b/gi, replacement: 'Labor Advisory' },

  // "RA 11058" common mishearings
  { pattern: /\b(?:are\s*a|r\.?\s*a\.?)\s*(?:eleven|11)\s*(?:thousand|0)?\s*(?:fifty[\s-]?eight|58)\b/gi, replacement: 'RA 11058' },

  // "OSHS" / "OSH Standards" misheard patterns
  { pattern: /\b(?:o\s*s\s*h\s*s|osh\s*es|oh\s*shes)\b/gi, replacement: 'OSHS' },

  // "Rule" misheard as "roll" or "role"
  { pattern: /\b(roll|role)\s+(\d{4})\b/gi, replacement: 'Rule $2' },

  // Additional patterns for "a three department or there" -> "3 Department Orders"
  { pattern: /\ba\s+three\s+department\s+or\s+(?:there|their|the)\b/gi, replacement: '3 Department Orders' },
  { pattern: /\bthree\s+department\s+or\s+(?:there|their|the)\b/gi, replacement: '3 Department Orders' },

  // "give me a three department or there" patterns
  { pattern: /\bgive\s+me\s+(?:a\s+)?three\s+department\s+or\s+(?:there|their|the)\b/gi, replacement: 'give me 3 Department Orders' },
  { pattern: /\bgive\s+me\s+(\d+)\s+department\s+or\s+(?:there|their|the)\b/gi, replacement: 'give me $1 Department Orders' },
];

/**
 * Fixes common Whisper misheard OSH terminology
 */
function fixMisheardPatterns(text: string): string {
  let result = text;

  for (const { pattern, replacement } of MISHEARD_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

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

  // First, fix common Whisper misheard patterns for OSH terminology
  let result = fixMisheardPatterns(text);

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
