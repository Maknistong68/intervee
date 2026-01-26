/**
 * OSH Topic Intelligence Service (Layer 2)
 *
 * Purpose: Intelligently determine the OSH topic from the interpreted question.
 * Uses AI for semantic understanding instead of just regex patterns.
 *
 * This layer handles:
 * - Precise topic detection from questions
 * - Context-aware inference from conversation history
 * - Semantic matching against knowledge base topics
 * - Suggested follow-up questions
 */

import { getOpenAIClient } from '../config/openai.js';

const TOPIC_MODEL = 'gpt-4o-mini'; // Fast and cost-effective

export interface OSHTopicResult {
  primaryTopic: string;           // Main topic key (e.g., 'rule1030')
  secondaryTopics: string[];      // Related topics
  confidence: number;
  knowledgeKeys: string[];        // Exact keys in OSH_KNOWLEDGE to load
  suggestedFollowUps: string[];   // Questions user might ask next
  reasoning?: string;
}

// All available knowledge keys in the system
// Primary keys map directly to knowledge base entries
// Sub-topic keys (with _suffix) are aliases that map to their parent topics
export const AVAILABLE_KNOWLEDGE_KEYS = [
  // OSHS Rules
  'rule1020', // Registration
  'rule1030', // Safety Officers
  'rule1040', // HSC (Health and Safety Committee)
  'rule1050', // Accident Reporting
  'rule1060', // Premises
  'rule1070', // Environmental (noise, illumination, ventilation)
  'rule1080', // PPE
  'rule1090', // Hazardous Materials
  'rule1100', // Welding
  'rule1120', // Confined Space
  'rule1140', // Explosives
  'rule1160', // Boilers
  'rule1960', // Health Services
  // RA 11058
  'ra11058',  // OSH Law (penalties, rights, duties)
  // Department Orders
  'do252',    // Revised IRR for Safety Officers
  'do136',    // GHS/Chemical Safety
  'do160',    // Occupational Safety and Health Committee
  'do224',    // Child Labor
  'do53',     // Drug-Free Workplace
  'do73',     // TB Prevention
  'do102',    // HIV/AIDS Prevention
  'do178',    // COVID-19 Workplace Guidelines
  'do184',    // Solo Parents
  'do208',    // Mental Health
  'do235',    // First Aid Certification
  // Department Advisory
  'da05',     // Work From Home
  // Labor Advisories
  'la07',     // WAIR Reporting
  'la01',     // Occupational Health Programs
  'la08',     // Heat Stress
  'la19',     // COVID-19 Ventilation
  'la20',     // COVID-19 Vaccination
  'la21',     // MPOX Prevention
  'la22',     // Avian Influenza
  'la23',     // El Niño Heat Stress
] as const;

// Sub-topic aliases that map to their parent knowledge keys
// This allows more granular topic detection while using existing knowledge structure
export const SUBTOPIC_ALIASES: Record<string, string[]> = {
  // Rule 1030 sub-topics
  'rule1030_training_hours': ['rule1030', 'do252'],
  'rule1030_so1': ['rule1030', 'do252'],
  'rule1030_so2': ['rule1030', 'do252'],
  'rule1030_so3_cosh': ['rule1030', 'do252'],
  'rule1030_so4_consultant': ['rule1030', 'do252'],
  'rule1030_renewal': ['rule1030', 'do252'],
  'rule1030_worker_orientation': ['rule1030'],
  'rule1030_requirements_by_risk': ['rule1030', 'do252'],

  // Rule 1020 sub-topics
  'rule1020_deadline': ['rule1020'],
  'rule1020_fee': ['rule1020'],
  'rule1020_layout': ['rule1020'],
  'rule1020_reregistration': ['rule1020'],
  'rule1020_forms': ['rule1020'],

  // Rule 1040 sub-topics
  'rule1040_composition': ['rule1040', 'do252'],
  'rule1040_meetings': ['rule1040'],
  'rule1040_type_a': ['rule1040'],
  'rule1040_type_b': ['rule1040'],
  'rule1040_type_c': ['rule1040'],
  'rule1040_type_d': ['rule1040'],
  'rule1040_type_e': ['rule1040'],

  // Rule 1050 sub-topics
  'rule1050_fatal': ['rule1050', 'la07'],
  'rule1050_formulas': ['rule1050'],
  'rule1050_scheduled_charges': ['rule1050'],
  'rule1050_forms': ['rule1050'],
  'rule1050_deadlines': ['rule1050', 'la07'],

  // Rule 1070 sub-topics
  'rule1070_noise': ['rule1070'],
  'rule1070_illumination': ['rule1070'],
  'rule1070_ventilation': ['rule1070'],
  'rule1070_tlv': ['rule1070'],

  // Rule 1080 sub-topics
  'rule1080_fall_protection': ['rule1080'],
  'rule1080_head_protection': ['rule1080'],
  'rule1080_eye_protection': ['rule1080'],
  'rule1080_respiratory': ['rule1080'],

  // Rule 1960 sub-topics
  'rule1960_nurse': ['rule1960'],
  'rule1960_physician': ['rule1960'],
  'rule1960_first_aider': ['rule1960', 'do235'],
  'rule1960_dentist': ['rule1960'],

  // RA 11058 sub-topics
  'ra11058_penalties': ['ra11058'],
  'ra11058_imminent_danger': ['ra11058'],
  'ra11058_worker_rights': ['ra11058'],
  'ra11058_employer_duties': ['ra11058'],
  'ra11058_stop_work': ['ra11058'],
};

export type KnowledgeKey = typeof AVAILABLE_KNOWLEDGE_KEYS[number];

const OSH_TOPIC_INTELLIGENCE_PROMPT = `You are the OSH Topic Intelligence for INTERVEE, a Philippine OSH interview app.

Given a question about Philippine OSH, determine EXACTLY which knowledge base entries to retrieve.

## AVAILABLE TOPICS AND THEIR CONTENT:

### OSHS RULES:
- rule1020: Registration (who must register, where, fees, deadlines, DOLE-BWC forms)
- rule1030: Safety Officers (SO1-SO4, training hours, requirements by risk category, renewal)
- rule1040: HSC - Health and Safety Committee (composition, meetings, types, requirements)
- rule1050: Accident Reporting (WAIR, frequency rate, severity rate, reporting deadlines)
- rule1060: Premises (workplace requirements, housekeeping, aisles, exits)
- rule1070: Environmental (noise limits 85dB/90dB, illumination, ventilation, temperature)
- rule1080: PPE (types, requirements, employer duties)
- rule1090: Hazardous Materials (chemical safety, labeling, storage)
- rule1100: Welding (hot work, welding safety)
- rule1120: Confined Space (entry requirements, permit, hazards)
- rule1140: Explosives (handling, storage, licensing)
- rule1160: Boilers (pressure vessels, inspection, certification)
- rule1960: Health Services (nurses, physicians, first aiders, dentist requirements)

### RA 11058 - OSH LAW:
- ra11058: Penalties (PHP 100K-5M fines), imminent danger, worker rights, employer duties, stop work orders

### DEPARTMENT ORDERS:
- do252: Revised IRR for Safety Officers (2025 update, SO1-SO4, renewal requirements)
- do136: GHS Chemical Safety (labeling, SDS, classification)
- do160: OSH Committee Guidelines
- do224: Child Labor Protection
- do53: Drug-Free Workplace Program
- do73: TB Prevention and Control
- do102: HIV/AIDS Prevention
- do178: COVID-19 Workplace Guidelines
- do184: Solo Parents Leave
- do208: Mental Health Workplace Policies (2020)
- do235: First Aid Certification Requirements

### LABOR ADVISORIES:
- la07: WAIR Reporting Guidelines
- la01: Occupational Health Programs
- la08: Heat Stress Prevention
- la19: COVID-19 Ventilation Guidelines
- la20: COVID-19 Vaccination in Workplace
- la21: MPOX Prevention
- la22: Avian Influenza Prevention
- la23: El Niño Heat Stress

## YOUR TASK:
1. Identify the PRIMARY topic the question is about
2. List any SECONDARY topics that might provide additional context
3. List the EXACT knowledge keys to retrieve (from the list above)
4. Suggest 2-3 FOLLOW-UP questions the user might ask next
5. Rate your CONFIDENCE in the topic detection (0.0-1.0)

## TOPIC MAPPING HINTS:

### Safety Officer Training (Granular):
- "safety officer", "SO training", "how many hours" → rule1030, do252
- "SO1", "SO1 training", "40 hours", "basic OSH" → rule1030 (SO1 section)
- "SO2", "SO2 training", "80 hours" → rule1030 (SO2 section)
- "SO3", "COSH", "200 hours", "construction safety" → rule1030 (SO3/COSH section)
- "SO4", "consultant", "safety consultant" → rule1030 (SO4 section)
- "renewal", "SO renewal", "refresher", "continuing education" → rule1030, do252 (renewal section)
- "accredited training", "DOLE accredited", "training provider" → do252
- "worker orientation", "first day training" → rule1030 (worker training section)

### Registration (Granular):
- "registration", "DOLE registration", "BWC form", "IP-3" → rule1020
- "registration deadline", "when to register", "30 days" → rule1020 (deadline section)
- "registration fee", "free registration" → rule1020 (fee section)
- "layout plan", "floor plan", "1:100 scale" → rule1020 (layout section)
- "re-registration", "change of name", "change location" → rule1020 (re-registration section)

### Penalties (Granular):
- "penalty", "violation", "fine", "stop work" → ra11058
- "first offense", "second offense", "third offense" → ra11058 (penalty schedule)
- "imminent danger", "stop work order", "work stoppage" → ra11058 (imminent danger section)
- "worker rights", "right to refuse", "unsafe work" → ra11058 (worker rights section)
- "employer duties", "employer obligations" → ra11058 (employer duties section)

### Committee (Granular):
- "committee", "HSC", "health and safety committee" → rule1040
- "committee composition", "HSC members", "who are members" → rule1040 (composition section)
- "committee meetings", "monthly meetings", "quarterly meetings" → rule1040 (meetings section)
- "Type A committee", "over 400 workers" → rule1040 (Type A section)
- "Type B committee", "200-400 workers" → rule1040 (Type B section)
- "joint committee", "Type E", "multiple establishments" → rule1040 (Type E section)

### Accident Reporting (Granular):
- "accident", "WAIR", "injury report", "frequency rate" → rule1050, la07
- "fatal accident", "death report", "24 hours" → rule1050 (fatal section), la07
- "frequency rate formula", "severity rate formula", "compute" → rule1050 (formulas section)
- "scheduled charges", "days charged", "permanent disability" → rule1050 (scheduled charges)
- "IP-6 form", "annual report", "January 30" → rule1050 (forms section)

### Other Specific Topics:
- "PPE", "protective equipment", "safety gear" → rule1080
- "fall protection", "safety belt", "harness", "6 meters" → rule1080 (fall protection)
- "hard hat", "helmet", "head protection" → rule1080 (head protection)
- "noise", "decibel", "90 dB", "hearing protection" → rule1070 (noise section)
- "illumination", "lighting", "lux", "foot-candle" → rule1070 (illumination section)
- "ventilation", "air supply", "air changes" → rule1070 (ventilation section)
- "nurse", "physician", "first aider", "clinic" → rule1960
- "occupational nurse", "when nurse required", "200 workers" → rule1960 (nurse section)
- "occupational physician", "when doctor required" → rule1960 (physician section)
- "first aider", "first aid training" → rule1960, do235
- "mental health", "stress", "DO 208" → do208
- "mental health policy", "psychosocial risk" → do208
- "TB", "tuberculosis" → do73
- "HIV", "AIDS" → do102
- "drug-free", "drug test", "DO 53" → do53
- "heat stress", "hot work environment" → la08, la23
- "El Niño", "summer heat" → la23
- "confined space", "permit entry" → rule1120
- "chemical", "GHS", "SDS", "hazmat" → do136, rule1090
- "COVID", "pandemic" → do178, la19, la20
- "work from home", "WFH", "telecommuting" → da05
- "solo parent", "solo parents leave" → do184
- "child labor", "working age", "young workers" → do224
- "welding", "cutting", "hot work" → rule1100
- "boiler", "pressure vessel" → rule1160
- "explosives", "blasting" → rule1140
- "premises", "workplace requirements", "housekeeping" → rule1060
- "stairs", "railings", "ladders" → rule1060

## SUB-TOPIC KEYS (for granular retrieval):
When the question is about a SPECIFIC section, you can use sub-topic keys that will map to their parent topics:
- rule1030_so1, rule1030_so2, rule1030_so3_cosh, rule1030_renewal → maps to rule1030, do252
- rule1020_deadline, rule1020_layout, rule1020_forms → maps to rule1020
- rule1040_composition, rule1040_meetings, rule1040_type_a/b/c/d/e → maps to rule1040
- rule1050_fatal, rule1050_formulas, rule1050_scheduled_charges → maps to rule1050, la07
- rule1070_noise, rule1070_illumination, rule1070_ventilation → maps to rule1070
- rule1080_fall_protection, rule1080_head_protection → maps to rule1080
- rule1960_nurse, rule1960_physician, rule1960_first_aider → maps to rule1960
- ra11058_penalties, ra11058_imminent_danger, ra11058_worker_rights → maps to ra11058

## OUTPUT FORMAT (JSON ONLY):
{
  "primaryTopic": "rule1030",
  "secondaryTopics": ["do252", "ra11058"],
  "knowledgeKeys": ["rule1030", "do252"],
  "confidence": 0.9,
  "suggestedFollowUps": [
    "What are the renewal requirements for safety officers?",
    "How many safety officers do I need for a high-risk establishment?"
  ],
  "reasoning": "Question asks about SO training, primary source is Rule 1030, updated by DO 252"
}`;

class OSHTopicIntelligenceService {
  private openai = getOpenAIClient();

  /**
   * Use AI to determine the exact topic from the question
   * Much smarter than regex patterns
   */
  async detectTopic(
    question: string,
    conversationHistory?: string[]
  ): Promise<OSHTopicResult> {
    const startTime = Date.now();

    if (!question || question.trim().length < 3) {
      return this.createFallbackResult('Empty question');
    }

    try {
      // Build context from conversation history if available
      let contextPrompt = '';
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5).join('\n');
        contextPrompt = `\n\n## RECENT CONVERSATION CONTEXT:\n${recentHistory}\n\nUse this context to better understand follow-up questions.`;
      }

      const response = await this.openai.chat.completions.create({
        model: TOPIC_MODEL,
        messages: [
          { role: 'system', content: OSH_TOPIC_INTELLIGENCE_PROMPT + contextPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: 250,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.createFallbackResult('Empty AI response');
      }

      const result = JSON.parse(content);
      const processingTimeMs = Date.now() - startTime;

      // Validate and normalize the result
      const topicResult: OSHTopicResult = {
        primaryTopic: this.validateTopic(result.primaryTopic),
        secondaryTopics: this.validateTopics(result.secondaryTopics || []),
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
        knowledgeKeys: this.validateTopics(result.knowledgeKeys || [result.primaryTopic]),
        suggestedFollowUps: result.suggestedFollowUps || [],
        reasoning: result.reasoning,
      };

      // Ensure knowledgeKeys includes primaryTopic
      if (!topicResult.knowledgeKeys.includes(topicResult.primaryTopic)) {
        topicResult.knowledgeKeys.unshift(topicResult.primaryTopic);
      }

      console.log(`[OSH Topic Intel] "${question.substring(0, 50)}..." → ${topicResult.primaryTopic} (${topicResult.confidence.toFixed(2)} confidence, ${processingTimeMs}ms)`);

      return topicResult;
    } catch (error) {
      console.error('[OSH Topic Intel] Error:', error);
      return this.createFallbackResult('AI topic detection failed');
    }
  }

  /**
   * Validate a single topic key
   * Handles both primary keys and sub-topic aliases
   */
  private validateTopic(topic: string): string {
    if (AVAILABLE_KNOWLEDGE_KEYS.includes(topic as KnowledgeKey)) {
      return topic;
    }

    // Check if it's a sub-topic alias - return the first mapped key
    if (topic && SUBTOPIC_ALIASES[topic]) {
      return SUBTOPIC_ALIASES[topic][0];
    }

    // Try common variations
    const normalized = topic?.toLowerCase().replace(/[-_\s]/g, '');
    const found = AVAILABLE_KNOWLEDGE_KEYS.find(key =>
      key.toLowerCase().replace(/[-_\s]/g, '') === normalized
    );
    return found || 'rule1020'; // Default to registration
  }

  /**
   * Expand sub-topic aliases to their mapped knowledge keys
   */
  private expandSubtopicAliases(topics: string[]): string[] {
    const expanded: string[] = [];
    for (const topic of topics) {
      if (SUBTOPIC_ALIASES[topic]) {
        expanded.push(...SUBTOPIC_ALIASES[topic]);
      } else if (AVAILABLE_KNOWLEDGE_KEYS.includes(topic as KnowledgeKey)) {
        expanded.push(topic);
      }
    }
    // Remove duplicates using filter
    return expanded.filter((item, index) => expanded.indexOf(item) === index);
  }

  /**
   * Validate multiple topic keys
   */
  private validateTopics(topics: string[]): string[] {
    if (!Array.isArray(topics)) return [];
    return topics
      .map(t => this.validateTopic(t))
      .filter((t, i, arr) => arr.indexOf(t) === i); // Remove duplicates
  }

  /**
   * Create a fallback result for error cases
   */
  private createFallbackResult(reason: string): OSHTopicResult {
    console.log(`[OSH Topic Intel] Fallback: ${reason}`);
    return {
      primaryTopic: 'rule1020',
      secondaryTopics: ['rule1030', 'ra11058'],
      confidence: 0.3,
      knowledgeKeys: ['rule1020', 'rule1030', 'ra11058'],
      suggestedFollowUps: [
        'What are the safety officer training requirements?',
        'What are the penalties for non-compliance?',
        'How do I register with DOLE?',
      ],
      reasoning: `Fallback: ${reason}`,
    };
  }

  /**
   * Get knowledge for specific topics from the knowledge base
   * Limits to relevant keys instead of returning everything
   * Handles sub-topic aliases by expanding them to their mapped keys
   */
  getKnowledgeForTopics(knowledgeKeys: string[], allKnowledge: Record<string, any>): string {
    if (!knowledgeKeys || knowledgeKeys.length === 0) {
      // Return all knowledge as fallback
      return JSON.stringify(allKnowledge, null, 2);
    }

    // Expand any sub-topic aliases to their primary keys
    const expandedKeys = this.expandSubtopicAliases(knowledgeKeys);

    const relevantKnowledge: Record<string, any> = {};

    for (const key of expandedKeys) {
      if (allKnowledge[key]) {
        relevantKnowledge[key] = allKnowledge[key];
      }
    }

    // If no keys matched, try the original keys without expansion
    if (Object.keys(relevantKnowledge).length === 0) {
      for (const key of knowledgeKeys) {
        if (allKnowledge[key]) {
          relevantKnowledge[key] = allKnowledge[key];
        }
      }
    }

    // If still no keys matched, return all knowledge
    if (Object.keys(relevantKnowledge).length === 0) {
      return JSON.stringify(allKnowledge, null, 2);
    }

    return JSON.stringify(relevantKnowledge, null, 2);
  }
}

export const oshTopicIntelligence = new OSHTopicIntelligenceService();
