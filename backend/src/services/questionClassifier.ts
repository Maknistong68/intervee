// Question Classifier Service
// Classifies questions as SPECIFIC, GENERIC, or PROCEDURAL for tailored responses
// Enhanced with DEFINITION, SCENARIO, COMPARISON, EXCEPTION, LIST, SECTION_QUERY, CITATION_QUERY

import {
  EnhancedQuestionType,
  EnhancedClassificationResult,
  LegalReference,
  NumericalQuery,
  LawType,
} from '../knowledge/types/legalDocument.js';

// Legacy type for backward compatibility
export type QuestionType = 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL';

export interface ClassificationResult {
  type: QuestionType;
  confidence: number;
  topic?: string;
  isFollowUp?: boolean;
}

// Re-export enhanced types
export type { EnhancedQuestionType, EnhancedClassificationResult };

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
  'penalty', 'fine', 'violation', 'prohibited',
  'registration', 'register', 'dole',
  'accident', 'report', 'wair',
  'rule', '1020', '1030', '1040', '1050', '1060', '1070', '1080', '1090',
  'construction', 'scaffold', 'fall', 'excavation',
  'physician', 'nurse', 'first aid', 'medical',
  // RA 11058 specific keywords
  'ra 11058', '11058', 'osh law', 'osh act',
  'imminent danger', 'work stoppage', 'joint liability',
  'employer duty', 'worker rights', 'right to refuse',
  'right to know', 'welfare facilities', 'tesda', 'competency',
  'visitorial power', 'enforcement', 'mse', 'micro enterprise',
  // Department Orders and Labor Advisories keywords
  'do 252', 'do 136', 'do 160', 'do 224', 'do 53', 'do 73', 'do 102',
  'do 178', 'do 184', 'do 208', 'do 235', 'da 05',
  'la 07', 'la 01', 'la 08', 'la 19', 'la 20', 'la 21', 'la 22', 'la 23',
  'drug free', 'drug test', 'tuberculosis', 'tb', 'dots',
  'hiv', 'aids', 'hepatitis', 'mental health', 'cancer',
  'ghs', 'chemical safety', 'sds', 'safety data sheet',
  'wem', 'work environment measurement', 'ventilation',
  'standing at work', 'sitting at work', 'ergonomic', 'sedentary',
  'heat stress', 'heat stroke', 'hydration',
  'first aider', 'first aid certification', 'fatpro',
  'food safety', 'waterborne', 'cholera', 'diarrhea',
  'covid', 'vaccination', 'no vaccine no work',
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
  // RA 11058 - OSH Law (comprehensive detection)
  { pattern: /ra\s*11058|\b11058\b|republic act.*(11058|osh)/i, topic: 'ra11058' },
  { pattern: /osh\s*(law|act|standards act)/i, topic: 'ra11058' },
  // RA 11058 specific topics
  { pattern: /imminent danger|work stoppage|stop work/i, topic: 'ra11058' },
  { pattern: /joint.*(liability|solidar)|solidar.*liab/i, topic: 'ra11058' },
  { pattern: /employer.*(duty|duties|obligation|responsibility)/i, topic: 'ra11058' },
  { pattern: /worker.*(right|rights)/i, topic: 'ra11058' },
  { pattern: /right to (refuse|know|report|ppe)/i, topic: 'ra11058' },
  { pattern: /visitorial power|enforcement.*osh/i, topic: 'ra11058' },
  { pattern: /welfare facilities|drinking water|sanitary facilities/i, topic: 'ra11058' },
  { pattern: /competency certification|tesda.*osh|critical occupation/i, topic: 'ra11058' },
  { pattern: /osh program|safety.*(and|&)\s*health program/i, topic: 'ra11058' },
  { pattern: /prohibited act|retaliatory measure|misrepresentation.*osh/i, topic: 'ra11058' },
  { pattern: /mse|micro.*enterprise|small.*enterprise.*osh/i, topic: 'ra11058' },
  { pattern: /declaration.*policy.*osh|osh.*coverage/i, topic: 'ra11058' },
  { pattern: /toolbox meeting/i, topic: 'ra11058' },
  { pattern: /8.hour.*(seminar|training).*worker/i, topic: 'ra11058' },
  // Cost-benefit analysis and safety decisions -> always RA 11058 (employer duty)
  { pattern: /control measure.*(cost|million|peso)/i, topic: 'ra11058' },
  { pattern: /damage.*(loss|cost|million).*(safety|control)/i, topic: 'ra11058' },
  { pattern: /(cost|million|peso).*(safety|control|measure)/i, topic: 'ra11058' },
  { pattern: /anong pipiliin|what.*(choose|pick|prefer)/i, topic: 'ra11058' },
  { pattern: /high.?risk.*(work|site|trabaho).*(control|measure|cost)/i, topic: 'ra11058' },
  { pattern: /(\d+).*(worker|katao|employee).*(risk|hazard)/i, topic: 'ra11058' },
  { pattern: /(safety|control).*(vs|versus|or).*(cost|budget|money)/i, topic: 'ra11058' },
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

  // Generic Department Order questions (when asking for multiple DOs or DOs in general)
  { pattern: /\b(give|list|name|what).*(department\s*order|d\.?o\.?s?\b)|(department\s*order|d\.?o\.?s?\b).*(related|about|for)/i, topic: 'department_orders' },
  { pattern: /\b(three|two|four|five|\d+)\s*(department|do|d\.o\.|dos)\b/i, topic: 'department_orders' },
  { pattern: /\bthe\s*(do|dos|d\.o\.)\b.*health|health.*(do|dos|d\.o\.)\b/i, topic: 'department_orders' },
  { pattern: /\bor\s*do\b.*health|health.*\bor\s*do\b/i, topic: 'department_orders' }, // Catches speech-to-text "the or do" -> "the DO"

  // Generic Labor Advisory questions
  { pattern: /\b(give|list|name|what).*(labor\s*advisor|l\.?a\.?s?\b)|(labor\s*advisor|l\.?a\.?s?\b).*(related|about|for)/i, topic: 'labor_advisories' },
  { pattern: /\b(three|two|four|five|\d+)\s*(labor\s*advisor|la|l\.a\.)\b/i, topic: 'labor_advisories' },

  // Department Orders detection
  { pattern: /do\s*252|department\s*order\s*252|revised\s*irr/i, topic: 'do252' },
  { pattern: /do\s*136|ghs|globally\s*harmonized|chemical\s*safety|safety\s*data\s*sheet|sds|msds/i, topic: 'do136' },
  { pattern: /do\s*160|wem|work\s*environment\s*measurement/i, topic: 'do160' },
  { pattern: /do\s*224|ventilation.*covid|hvac/i, topic: 'do224' },
  { pattern: /do\s*53|drug.?free|drug\s*test|ra\s*9165|dangerous\s*drugs/i, topic: 'do53' },
  { pattern: /do\s*73|tuberculosis|tb\s*(prevention|control|dots|workplace)/i, topic: 'do73' },
  { pattern: /do\s*102|hiv|aids|ra\s*8504/i, topic: 'do102' },
  { pattern: /do\s*178|standing\s*at\s*work|prolonged\s*standing|high\s*heel/i, topic: 'do178' },
  { pattern: /do\s*184|sitting\s*at\s*work|sedentary|prolonged\s*sitting|desk\s*work/i, topic: 'do184' },
  { pattern: /do\s*208|mental\s*health|ra\s*11036|psychological|stress\s*at\s*work|bullying|mobbing/i, topic: 'do208' },
  { pattern: /do\s*235|first\s*aid(er)?\s*(certification|training|provider)|fatpro|prc\s*first\s*aid/i, topic: 'do235' },
  { pattern: /da\s*05|hepatitis\s*b|hbsag/i, topic: 'da05' },

  // Labor Advisories detection
  { pattern: /la\s*07|wair|work\s*accident.*report|monthly\s*report.*accident/i, topic: 'la07' },
  { pattern: /la\s*01|food.*borne|water.*borne|cholera|diarrhea.*workplace/i, topic: 'la01' },
  { pattern: /la\s*08|heat\s*stress|heat\s*stroke|heat\s*exhaustion|hydration/i, topic: 'la08' },
  { pattern: /la\s*19|mental\s*health.*supplement|lusog.?isip/i, topic: 'la19' },
  { pattern: /la\s*20|cancer\s*(prevention|control|workplace)/i, topic: 'la20' },
  { pattern: /la\s*21|tb\s*supplement/i, topic: 'la21' },
  { pattern: /la\s*22|hiv.*supplement|aids.*supplement/i, topic: 'la22' },
  { pattern: /la\s*23|covid.*post.*emergency|no\s*vaccine\s*no\s*work|vaccination\s*policy/i, topic: 'la23' },
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

// ============================================
// ENHANCED QUESTION CLASSIFIER (New Patterns)
// ============================================

// Patterns for DEFINITION questions ("What is...", "Define...")
const DEFINITION_PATTERNS = [
  /^what is (a |an |the )?/i,
  /^define\b/i,
  /what does .* mean/i,
  /meaning of/i,
  /^ano (ang|ba ang) /i,
  /kahulugan ng/i,
];

// Patterns for SCENARIO questions ("If...", "What if...", "When a worker...")
const SCENARIO_PATTERNS = [
  /^if (a |an |the )?/i,
  /^what if\b/i,
  /^when (a |an |the )?(worker|employee|employer|company|establishment)/i,
  /^in (case|the event|a situation)/i,
  /what (should|would|happens|will happen) if/i,
  /suppose\b/i,
  /^kung\b/i,
  /^paano kung/i,
  /^sakaling\b/i,
  // Cost-benefit and decision scenarios
  /control measure.*(cost|million|peso)/i,
  /damage.*(loss|cost|million|peso)/i,
  /(cost|million|peso).*(control|measure|safety)/i,
  /high.?risk.*(work|job|site|trabaho)/i,
];

// Patterns for DECISION/ETHICAL questions - requires clear stance
const DECISION_PATTERNS = [
  /anong pipiliin/i,
  /ano.*(pipiliin|pumili|piliin)/i,
  /what.*(would|will|should) you (choose|pick|select|prefer)/i,
  /which.*(would|will|should) you (choose|pick|select|prefer)/i,
  /what is (your|the best|the right) (choice|decision)/i,
  /which (option|one|is better)/i,
  /alin.*(pipiliin|mas|better)/i,
  /cost.*(vs|versus|or|vs\.|against).*(safety|control|measure)/i,
  /safety.*(vs|versus|or|vs\.|against).*(cost|money|budget)/i,
  /(2\.5|2\.5m|million).*(1\.5|1\.5m|million)/i, // Specific cost-benefit numbers
];

// Patterns for COMPARISON questions ("Difference between...", "...vs...")
const COMPARISON_PATTERNS = [
  /difference(s)? between/i,
  /\bvs\.?\b|\bversus\b/i,
  /compare\b|comparison\b/i,
  /how (does|do|is|are) .* differ/i,
  /which is (better|more|higher|lower)/i,
  /so1.*(so2|so3)|so2.*(so1|so3)|so3.*(so1|so2)/i,
  /pagkakaiba (ng|sa)/i,
  /alin (ang|ba ang) (mas|better)/i,
];

// Patterns for EXCEPTION questions ("Are there exceptions...", "Exemptions...")
const EXCEPTION_PATTERNS = [
  /exception(s)?\b/i,
  /exempt(ion|ed|s)?\b/i,
  /excluded?\b/i,
  /not (apply|applicable|covered|required)/i,
  /when (does|is) .* not (apply|required)/i,
  /are there (any )?(exceptions|exemptions)/i,
  /hindi kasama/i,
  /hindi saklaw/i,
  /may exception ba/i,
];

// Patterns for LIST questions ("What are the...", "List the...", "Give me...")
const LIST_PATTERNS = [
  /^(what|list|give|name|enumerate) .*(the|all|different|various) .*(types|kinds|categories|requirements|steps|penalties|violations)/i,
  /^how many .* are there/i,
  /^there are .* (types|kinds|categories)/i,
  /what are (the |all )?(requirements|penalties|steps|types|kinds|duties|rights|obligations)/i,
  /give me .* (list|examples)/i,
  /ilan (ang|ba ang)/i,
  /magbigay ng/i,
  /ano-ano (ang|ba)/i,
];

// Patterns for SECTION_QUERY questions ("What does Section 28 say?")
const SECTION_QUERY_PATTERNS = [
  /what (does|do) section \d+/i,
  /section \d+.*(say|state|provide|cover)/i,
  /explain section \d+/i,
  /what is (in|under|stated in) section \d+/i,
  /rule \d+.*(section|state|say|provide)/i,
  /ano (ang|ba ang) section \d+/i,
];

// Patterns for CITATION_QUERY questions ("Under RA 11058...", "According to DO 252...")
const CITATION_QUERY_PATTERNS = [
  /^(under|according to|per|as stated in|based on) (ra|rule|do|la|da) \d+/i,
  /^(ra|rule|do|la|da) \d+.*(says|states|provides|requires)/i,
  /(what|who|how|when|where).*(ra|rule|do|la|da) \d+/i,
  /ayon sa (ra|rule|do|la|da) \d+/i,
];

/**
 * Extract legal references from question text
 */
export function extractLegalReferences(text: string): LegalReference[] {
  const refs: LegalReference[] = [];
  const q = text.toLowerCase();

  // RA patterns
  const raMatches = q.matchAll(/\b(?:ra|r\.a\.?|republic\s*act)\s*(?:no\.?\s*)?(\d+)/gi);
  for (const match of raMatches) {
    refs.push({
      type: 'ra',
      identifier: match[1],
      fullReference: `RA ${match[1]}`,
      confidence: 0.9,
    });
  }

  // Rule patterns
  const ruleMatches = q.matchAll(/\brule\s*(\d{4})/gi);
  for (const match of ruleMatches) {
    refs.push({
      type: 'oshs_rule',
      identifier: match[1],
      fullReference: `Rule ${match[1]}`,
      confidence: 0.9,
    });
  }

  // Section patterns
  const sectionMatches = q.matchAll(/\bsection\s*(\d+(?:\.\d+)?(?:\([a-z]\))?)/gi);
  for (const match of sectionMatches) {
    refs.push({
      type: 'section' as any,
      identifier: match[1],
      fullReference: `Section ${match[1]}`,
      confidence: 0.85,
    });
  }

  // DO patterns
  const doMatches = q.matchAll(/\bdo\s*(\d+)/gi);
  for (const match of doMatches) {
    refs.push({
      type: 'do',
      identifier: match[1],
      fullReference: `DO ${match[1]}`,
      confidence: 0.9,
    });
  }

  // LA patterns
  const laMatches = q.matchAll(/\bla\s*(\d+)/gi);
  for (const match of laMatches) {
    refs.push({
      type: 'la',
      identifier: match[1],
      fullReference: `LA ${match[1]}`,
      confidence: 0.9,
    });
  }

  return refs;
}

/**
 * Extract numerical queries from question text
 */
export function extractNumericalQuery(text: string): NumericalQuery | null {
  const q = text.toLowerCase();

  // PHP amount patterns
  const phpMatch = q.match(/(?:php|p|₱)\s*([\d,]+(?:\.\d{2})?)/i);
  if (phpMatch) {
    const value = parseFloat(phpMatch[1].replace(/,/g, ''));
    return { value, unit: 'PHP', operator: 'exact' };
  }

  // Hour patterns
  const hourMatch = q.match(/(\d+)\s*(?:hours?|hrs?)\b/i);
  if (hourMatch) {
    return { value: parseInt(hourMatch[1]), unit: 'hours', operator: 'exact' };
  }

  // Worker patterns
  const workerMatch = q.match(/(\d+)\s*(?:workers?|employees?)\b/i);
  if (workerMatch) {
    return { value: parseInt(workerMatch[1]), unit: 'workers', operator: 'exact' };
  }

  // Day patterns
  const dayMatch = q.match(/(\d+)\s*(?:days?|calendar\s*days?)\b/i);
  if (dayMatch) {
    return { value: parseInt(dayMatch[1]), unit: 'days', operator: 'exact' };
  }

  // Year patterns
  const yearMatch = q.match(/(\d+)\s*(?:years?)\b/i);
  if (yearMatch) {
    return { value: parseInt(yearMatch[1]), unit: 'years', operator: 'exact' };
  }

  // Percent patterns
  const percentMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:percent|%)/i);
  if (percentMatch) {
    return { value: parseFloat(percentMatch[1]), unit: 'percent', operator: 'exact' };
  }

  return null;
}

/**
 * Enhanced question classification with new types
 */
export function classifyQuestionEnhanced(
  question: string,
  lastTopic?: string
): EnhancedClassificationResult {
  const q = question.toLowerCase().trim();
  const topic = detectTopic(q);
  const followUp = isFollowUp(q, lastTopic);
  const legalRefs = extractLegalReferences(q);
  const numericalQuery = extractNumericalQuery(q);

  // Check for specific question types (priority order)
  let type: EnhancedQuestionType = 'GENERIC';
  let confidence = 0.5;

  // 0. DECISION questions - HIGHEST priority (ethical/choice questions that need clear stance)
  if (DECISION_PATTERNS.some(p => p.test(q))) {
    type = 'DECISION';
    confidence = 0.95; // High confidence - these need decisive answers
  }
  // 1. Section query - for direct section lookups
  else if (SECTION_QUERY_PATTERNS.some(p => p.test(q))) {
    type = 'SECTION_QUERY';
    confidence = 0.9;
  }
  // 2. Citation query - questions about specific laws/regulations
  else if (CITATION_QUERY_PATTERNS.some(p => p.test(q))) {
    type = 'CITATION_QUERY';
    confidence = 0.85;
  }
  // 3. Scenario questions (includes cost-benefit scenarios)
  else if (SCENARIO_PATTERNS.some(p => p.test(q))) {
    type = 'SCENARIO';
    confidence = 0.85;
  }
  // 4. Comparison questions
  else if (COMPARISON_PATTERNS.some(p => p.test(q))) {
    type = 'COMPARISON';
    confidence = 0.85;
  }
  // 5. Exception questions
  else if (EXCEPTION_PATTERNS.some(p => p.test(q))) {
    type = 'EXCEPTION';
    confidence = 0.85;
  }
  // 6. List questions
  else if (LIST_PATTERNS.some(p => p.test(q))) {
    type = 'LIST';
    confidence = 0.8;
  }
  // 7. Definition questions
  else if (DEFINITION_PATTERNS.some(p => p.test(q))) {
    type = 'DEFINITION';
    confidence = 0.8;
  }
  // Fall back to legacy classification
  else {
    const legacyResult = classifyQuestion(question, lastTopic);
    type = legacyResult.type as EnhancedQuestionType;
    confidence = legacyResult.confidence;
  }

  // Boost confidence if legal references found
  if (legalRefs.length > 0) {
    confidence = Math.min(confidence + 0.05, 0.95);
  }

  // Determine if question requires context
  const requiresContext = followUp ||
    type === 'COMPARISON' ||
    q.match(/\b(it|this|that|these|those|the same|similar)\b/i) !== null;

  // Detect intent modifiers
  const wantsComparison = COMPARISON_PATTERNS.some(p => p.test(q));
  const wantsException = EXCEPTION_PATTERNS.some(p => p.test(q));
  const wantsExample = /example|sample|instance|halimbawa/i.test(q);
  const wantsSteps = PROCEDURAL_PATTERNS.some(p => p.test(q));

  return {
    type,
    confidence,
    topic,
    legalReferences: legalRefs,
    numericalQueries: numericalQuery ? [numericalQuery] : [],
    isFollowUp: followUp,
    requiresContext,
    wantsComparison,
    wantsException,
    wantsExample,
    wantsSteps,
  };
}

/**
 * Map enhanced type to legacy type for backward compatibility
 */
export function toLegacyType(enhancedType: EnhancedQuestionType): QuestionType {
  const mapping: Record<EnhancedQuestionType, QuestionType> = {
    SPECIFIC: 'SPECIFIC',
    PROCEDURAL: 'PROCEDURAL',
    GENERIC: 'GENERIC',
    DEFINITION: 'GENERIC',
    SCENARIO: 'PROCEDURAL',
    COMPARISON: 'GENERIC',
    EXCEPTION: 'SPECIFIC',
    LIST: 'GENERIC',
    SECTION_QUERY: 'SPECIFIC',
    CITATION_QUERY: 'SPECIFIC',
    DECISION: 'PROCEDURAL', // Decision questions need action-oriented answers
  };
  return mapping[enhancedType] || 'GENERIC';
}

// Export enhanced patterns for testing
export const enhancedPatterns = {
  DEFINITION_PATTERNS,
  SCENARIO_PATTERNS,
  COMPARISON_PATTERNS,
  EXCEPTION_PATTERNS,
  LIST_PATTERNS,
  SECTION_QUERY_PATTERNS,
  CITATION_QUERY_PATTERNS,
  DECISION_PATTERNS,
};
