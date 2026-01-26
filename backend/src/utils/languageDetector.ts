// Common Tagalog words and particles
const TAGALOG_MARKERS = [
  // Question particles
  'ba', 'daw', 'raw', 'po', 'ho',
  // Common words
  'ang', 'ng', 'mga', 'sa', 'na', 'ay', 'at', 'kung',
  'ano', 'sino', 'saan', 'kailan', 'bakit', 'paano',
  'ito', 'iyon', 'yan', 'dito', 'diyan', 'doon',
  'ako', 'ikaw', 'siya', 'kami', 'tayo', 'kayo', 'sila',
  'ko', 'mo', 'niya', 'namin', 'natin', 'ninyo', 'nila',
  'dapat', 'kailangan', 'pwede', 'puwede', 'maari', 'maaari',
  'hindi', 'wala', 'may', 'meron', 'oo', 'hindi',
  'para', 'dahil', 'kasi', 'kaya', 'pero', 'subalit',
  'lang', 'lamang', 'din', 'rin', 'nga', 'pala', 'talaga',
  'naman', 'sana', 'yata', 'siguro', 'baka',
  // OSH-related Tagalog
  'kaligtasan', 'kalusugan', 'trabaho', 'manggagawa', 'opisina',
  'aksidente', 'peligro', 'panganib', 'sanhi', 'epekto',
];

// Common English words (excluding those that might appear in Tagalog text)
const ENGLISH_MARKERS = [
  'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall',
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  'this', 'that', 'these', 'those', 'here', 'there',
  'and', 'but', 'or', 'if', 'then', 'because', 'although',
  'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
  'requirements', 'according', 'establishment', 'committee',
  'training', 'registration', 'notification', 'compliance',
];

export type DetectedLanguage = 'en' | 'tl' | 'taglish';

/**
 * Convert user preference to DetectedLanguage
 * This ensures OUTPUT language matches user's SETTING
 */
export function preferenceToLanguage(preference: string | null | undefined): DetectedLanguage {
  switch (preference) {
    case 'fil':
      return 'tl';
    case 'mix':
      return 'taglish';
    case 'eng':
    default:
      return 'en';
  }
}

/**
 * Get the final language for response
 * USER PREFERENCE always wins - this ensures input/output language consistency
 */
export function getFinalLanguage(
  preference: string | null | undefined,
  detected: DetectedLanguage
): DetectedLanguage {
  // If user set a preference, ALWAYS use it
  if (preference) {
    return preferenceToLanguage(preference);
  }
  // Otherwise use detected language
  return detected;
}

export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }

  const words = text.toLowerCase().split(/[\s,.\-?!;:]+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return 'en';
  }

  let tagalogScore = 0;
  let englishScore = 0;

  for (const word of words) {
    if (TAGALOG_MARKERS.includes(word)) {
      tagalogScore++;
    }
    if (ENGLISH_MARKERS.includes(word)) {
      englishScore++;
    }
  }

  // Calculate percentages
  const tagalogPct = tagalogScore / words.length;
  const englishPct = englishScore / words.length;

  // Decision logic
  if (tagalogPct > 0.3 && englishPct > 0.2) {
    return 'taglish'; // Mixed language (code-switching)
  } else if (tagalogPct > englishPct && tagalogPct > 0.15) {
    return 'tl';
  } else {
    return 'en';
  }
}

export function getLanguagePromptHint(language: DetectedLanguage): string {
  switch (language) {
    case 'tl':
      return `## STRICT LANGUAGE REQUIREMENT - TAGALOG/FILIPINO ONLY ##
CRITICAL: You MUST respond ONLY in Tagalog (Filipino).

RULES:
1. Your ENTIRE response MUST be in Tagalog - NO EXCEPTIONS
2. DO NOT use English words except technical OSH terms (PPE, HSC, WAIR, SO1, etc.)
3. DO NOT switch to English mid-sentence
4. DO NOT respond in any other language (Indonesian, Spanish, etc.)
5. Sound like a Filipino OSH professional in an interview

VIOLATION = FAILURE. This is NON-NEGOTIABLE.`;

    case 'taglish':
      return `## STRICT LANGUAGE REQUIREMENT - TAGLISH (MIXED) ##
CRITICAL: You MUST respond in Taglish (Filipino-English mix).

RULES:
1. Mix Tagalog and English naturally - like how Filipino professionals speak
2. Use English for technical terms and Tagalog for conversational parts
3. DO NOT use pure English - mix in Filipino naturally
4. DO NOT respond in any other language (Indonesian, Spanish, etc.)
5. Sound confident and conversational like a real Filipino professional

VIOLATION = FAILURE. This is NON-NEGOTIABLE.`;

    case 'en':
    default:
      return `## STRICT LANGUAGE REQUIREMENT - ENGLISH ONLY ##
CRITICAL: You MUST respond ONLY in English.

RULES:
1. Your ENTIRE response MUST be in English - NO EXCEPTIONS
2. DO NOT use any Tagalog, Filipino, or foreign words
3. DO NOT mix languages at all - keep it 100% pure English
4. DO NOT respond in any other language (Indonesian, Spanish, Tagalog, etc.)
5. Sound professional like an experienced OSH practitioner

VIOLATION = FAILURE. This is NON-NEGOTIABLE.`;
  }
}

// Check if text contains primarily OSH-related content
export function isOSHRelated(text: string): boolean {
  const oshKeywords = [
    'osh', 'osha', 'safety', 'health', 'occupational',
    'dole', 'rule', 'regulation', 'standard',
    'hsc', 'committee', 'safety officer', 'so1', 'so2', 'so3',
    'ppe', 'protective', 'equipment',
    'accident', 'incident', 'hazard', 'risk',
    'training', 'certification', 'registration',
    'compliance', 'violation', 'penalty',
    'ra 11058', 'department order', 'labor advisory',
    'establishment', 'workplace', 'worker', 'employee', 'employer',
    'kaligtasan', 'kalusugan', 'manggagawa',
  ];

  const lowerText = text.toLowerCase();
  return oshKeywords.some(keyword => lowerText.includes(keyword));
}
