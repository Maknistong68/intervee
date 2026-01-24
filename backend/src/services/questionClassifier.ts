// Question Classifier Service
// Classifies questions as SPECIFIC, GENERIC, or PROCEDURAL for tailored responses

export type QuestionType = 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL';

export interface ClassificationResult {
  type: QuestionType;
  confidence: number;
  topic?: string;
  isFollowUp?: boolean;
}

// Patterns that indicate a follow-up question
const FOLLOW_UP_PATTERNS = [
  // Explicit follow-up markers
  /^(what about|how about|and|but|also|then)/i,
  /^(same|similar|related|another|more)/i,
  // Pronouns referring to previous context
  /^(what|how|when|where|who|why) (is|are|do|does|did|was|were) (it|that|they|this|those|these)/i,
  // Short questions needing context
  /^(and|or) (the|that|this|what)/i,
  // Tagalog follow-up markers
  /^(paano (naman|yung)|ano (naman|yung)|kamusta)/i,
  /^(tapos|saka|pati|din|rin)\b/i,
];

// Keywords to extract from text for topic matching
const TOPIC_KEYWORDS = [
  'safety', 'officer', 'so1', 'so2', 'so3', 'cosh',
  'hsc', 'committee', 'meeting',
  'training', 'hours', 'certification',
  'ppe', 'equipment', 'harness', 'helmet',
  'penalty', 'fine', 'violation',
  'registration', 'register', 'dole',
  'accident', 'report', 'wair',
  'rule', '1020', '1030', '1040', '1050', '1060', '1070', '1080', '1090',
  'construction', 'scaffold', 'fall', 'excavation',
  'physician', 'nurse', 'first aid', 'medical',
];

/**
 * Extract topic keywords from text
 */
export function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  return TOPIC_KEYWORDS.filter(kw => lowerText.includes(kw));
}

/**
 * Check if a question is a follow-up based on patterns and context
 */
export function isFollowUp(question: string, lastTopic?: string): boolean {
  const q = question.toLowerCase().trim();

  // Check follow-up patterns
  if (FOLLOW_UP_PATTERNS.some(p => p.test(q))) {
    return true;
  }

  // Very short questions (4 words or less) often need context
  const wordCount = q.split(/\s+/).filter(w => w.length > 1).length;
  if (wordCount <= 4 && q.endsWith('?')) {
    return true;
  }

  // Check if question references previous topic
  if (lastTopic) {
    const topicKeywords = extractKeywords(lastTopic);
    const questionKeywords = extractKeywords(q);

    // If question shares keywords with last topic but is short, it's a follow-up
    const sharedKeywords = questionKeywords.filter(kw => topicKeywords.includes(kw));
    if (sharedKeywords.length > 0 && wordCount <= 6) {
      return true;
    }
  }

  return false;
}

// Patterns for SPECIFIC questions (exact values, numbers, limits)
const SPECIFIC_PATTERNS = [
  // English
  /how many|how much|what is the (number|requirement|limit|deadline|penalty|amount)/i,
  /how (long|often|frequently)/i,
  /what('s| is) the (max|min|minimum|maximum)/i,
  /exactly|specifically/i,
  // Tagalog
  /ilang|magkano|ano ang (bilang|requirement|limit)/i,
  /gaano (karami|katagal|kadalas)/i,
  // Technical patterns
  /\d+\s*(hours?|days?|workers?|years?|months?|meters?|percent|%)/i,
  /rule\s*\d+|do\s*\d+|la\s*\d+|ra\s*\d+/i,
  /so[1-4]\b/i, // Safety Officer levels
  /class\s*[a-e]/i, // HSC or physical exam classes
];

// Patterns for PROCEDURAL questions (how-to, steps, process)
const PROCEDURAL_PATTERNS = [
  // English
  /how (do|to|can|should|would)\s+(i|we|you|one)/i,
  /what are the steps|step by step|process for/i,
  /procedure|guidelines for|requirements for (registering|filing|reporting)/i,
  /how is .* done|how .* works/i,
  // Tagalog
  /paano\b|pano\b/i,
  /ano ang (proseso|hakbang|steps|procedure)/i,
  /kung (paano|pano)/i,
];

// Patterns for GENERIC questions (broad, conceptual)
const GENERIC_PATTERNS = [
  // English
  /what is|what are|what does/i,
  /explain|define|describe|tell me about/i,
  /meaning of|purpose of|importance of/i,
  /who is|who are/i,
  /why is|why are|why do/i,
  // Tagalog
  /ano (ang|ba ang|yung)/i,
  /ipaliwanag|sabihin mo|ano ba/i,
  /sino (ang|ba)/i,
  /bakit\b/i,
];

// OSH-specific topic detection
const TOPIC_PATTERNS: { pattern: RegExp; topic: string }[] = [
  // Direct rule number detection - check these FIRST for explicit rule queries
  { pattern: /rule\s*1020|\b1020\b/i, topic: 'registration' },
  { pattern: /rule\s*1030|\b1030\b/i, topic: 'safety_officer' },
  { pattern: /rule\s*1040|\b1040\b/i, topic: 'hsc' },
  { pattern: /rule\s*1050|\b1050\b/i, topic: 'accident' },
  { pattern: /rule\s*1060|\b1060\b/i, topic: 'premises' },
  { pattern: /rule\s*1070|\b1070\b/i, topic: 'environmental' },
  { pattern: /rule\s*1080|\b1080\b/i, topic: 'ppe' },
  { pattern: /rule\s*1090|\b1090\b/i, topic: 'hazardous_materials' },
  { pattern: /rule\s*1100|\b1100\b/i, topic: 'welding' },
  { pattern: /rule\s*1120|\b1120\b/i, topic: 'confined_space' },
  { pattern: /rule\s*1140|\b1140\b/i, topic: 'explosives' },
  { pattern: /rule\s*1160|\b1160\b/i, topic: 'boiler' },
  { pattern: /rule\s*1960|\b1960\b/i, topic: 'health_services' },
  { pattern: /ra\s*11058|\b11058\b/i, topic: 'penalty' },
  // Keyword-based detection for questions without explicit rule numbers
  { pattern: /safety officer|so[1-4]|training hours|cosh/i, topic: 'safety_officer' },
  { pattern: /hsc|health and safety committee|committee/i, topic: 'hsc' },
  { pattern: /accident|injury|report|notification|wair/i, topic: 'accident' },
  { pattern: /ppe|protective equipment|helmet|gloves|harness/i, topic: 'ppe' },
  { pattern: /registration|register/i, topic: 'registration' },
  { pattern: /penalty|fine|violation|sanction|offense/i, topic: 'penalty' },
  { pattern: /first aid|nurse|physician|clinic|health service/i, topic: 'health_services' },
  { pattern: /boiler|pressure vessel/i, topic: 'boiler' },
  { pattern: /confined space/i, topic: 'confined_space' },
  { pattern: /noise|illumination|ventilation|temperature/i, topic: 'environmental' },
  { pattern: /hazardous|chemical|material|acid/i, topic: 'hazardous_materials' },
  { pattern: /weld|cutting/i, topic: 'welding' },
  { pattern: /explosive|magazine|blast/i, topic: 'explosives' },
  { pattern: /premise|stair|railing|floor/i, topic: 'premises' },
];

function detectTopic(question: string): string | undefined {
  const q = question.toLowerCase();
  for (const { pattern, topic } of TOPIC_PATTERNS) {
    if (pattern.test(q)) {
      return topic;
    }
  }
  return undefined;
}

function countMatches(question: string, patterns: RegExp[]): number {
  return patterns.filter(p => p.test(question)).length;
}

export function classifyQuestion(question: string, lastTopic?: string): ClassificationResult {
  const q = question.toLowerCase().trim();
  const topic = detectTopic(q);
  const followUp = isFollowUp(q, lastTopic);

  // Count pattern matches for each type
  const specificMatches = countMatches(q, SPECIFIC_PATTERNS);
  const proceduralMatches = countMatches(q, PROCEDURAL_PATTERNS);
  const genericMatches = countMatches(q, GENERIC_PATTERNS);

  // Determine type based on highest match count and priority
  // Priority: SPECIFIC > PROCEDURAL > GENERIC (for accuracy)

  if (specificMatches > 0 && specificMatches >= proceduralMatches) {
    return {
      type: 'SPECIFIC',
      confidence: Math.min(0.7 + specificMatches * 0.1, 0.95),
      topic,
      isFollowUp: followUp,
    };
  }

  if (proceduralMatches > 0 && proceduralMatches > genericMatches) {
    return {
      type: 'PROCEDURAL',
      confidence: Math.min(0.7 + proceduralMatches * 0.1, 0.9),
      topic,
      isFollowUp: followUp,
    };
  }

  if (genericMatches > 0) {
    return {
      type: 'GENERIC',
      confidence: Math.min(0.6 + genericMatches * 0.1, 0.85),
      topic,
      isFollowUp: followUp,
    };
  }

  // Default to GENERIC for unrecognized patterns
  return {
    type: 'GENERIC',
    confidence: 0.5,
    topic,
    isFollowUp: followUp,
  };
}

// Export for testing
export const patterns = {
  SPECIFIC_PATTERNS,
  PROCEDURAL_PATTERNS,
  GENERIC_PATTERNS,
  TOPIC_PATTERNS,
  FOLLOW_UP_PATTERNS,
};
