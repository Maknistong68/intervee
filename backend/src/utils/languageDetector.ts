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
      return `CRITICAL LANGUAGE REQUIREMENT: You MUST respond ONLY in Tagalog (Filipino).
- DO NOT use English words except technical terms (PPE, HSC, WAIR)
- This is NON-NEGOTIABLE - your ENTIRE response must be in Tagalog
- Speak as a Filipino professional would answer in an interview - confident and natural`;
    case 'taglish':
      return `CRITICAL LANGUAGE REQUIREMENT: You MUST respond in Taglish (mixed).
- Mix both languages naturally as Filipino professionals speak
- This is NON-NEGOTIABLE - maintain Taglish style throughout
- Sound confident and conversational`;
    case 'en':
    default:
      return `CRITICAL LANGUAGE REQUIREMENT: You MUST respond ONLY in English.
- DO NOT use any Tagalog or Filipino words
- DO NOT mix languages - keep it 100% English
- This is NON-NEGOTIABLE - your ENTIRE response must be in English only
- Sound professional and confident like an experienced OSH practitioner`;
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
