// Question Classifier Service
// Classifies questions as SPECIFIC, GENERIC, or PROCEDURAL for tailored responses

export type QuestionType = 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL';

export interface ClassificationResult {
  type: QuestionType;
  confidence: number;
  topic?: string;
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
  { pattern: /safety officer|so[1-4]|training hours/i, topic: 'safety_officer' },
  { pattern: /hsc|health and safety committee|committee/i, topic: 'hsc' },
  { pattern: /accident|injury|report|notification/i, topic: 'accident_reporting' },
  { pattern: /ppe|protective equipment|helmet|gloves/i, topic: 'ppe' },
  { pattern: /registration|register|dole/i, topic: 'registration' },
  { pattern: /penalty|fine|violation|sanction/i, topic: 'penalties' },
  { pattern: /first aid|nurse|physician|clinic/i, topic: 'health_services' },
  { pattern: /boiler|pressure vessel/i, topic: 'boiler' },
  { pattern: /confined space|hazardous work/i, topic: 'hazardous_work' },
  { pattern: /noise|illumination|ventilation|temperature/i, topic: 'environmental' },
  { pattern: /drug|drug-free|substance/i, topic: 'drug_free' },
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

export function classifyQuestion(question: string): ClassificationResult {
  const q = question.toLowerCase().trim();
  const topic = detectTopic(q);

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
    };
  }

  if (proceduralMatches > 0 && proceduralMatches > genericMatches) {
    return {
      type: 'PROCEDURAL',
      confidence: Math.min(0.7 + proceduralMatches * 0.1, 0.9),
      topic,
    };
  }

  if (genericMatches > 0) {
    return {
      type: 'GENERIC',
      confidence: Math.min(0.6 + genericMatches * 0.1, 0.85),
      topic,
    };
  }

  // Default to GENERIC for unrecognized patterns
  return {
    type: 'GENERIC',
    confidence: 0.5,
    topic,
  };
}

// Export for testing
export const patterns = {
  SPECIFIC_PATTERNS,
  PROCEDURAL_PATTERNS,
  GENERIC_PATTERNS,
  TOPIC_PATTERNS,
};
