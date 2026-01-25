/**
 * OSH Transcript Intelligence Service (Layer 1)
 *
 * Purpose: Transform ANY audio input into a valid OSH question.
 * Since this is an OSH interview app, when the user presses PTT,
 * their input is 100% guaranteed to be OSH-related.
 *
 * This layer handles:
 * - Phonetic interpretation (sound-alikes to correct OSH terms)
 * - Taglish/Filipino understanding
 * - Context inference from fragments
 * - Intent detection (specific, procedural, generic, list)
 * - Never-fail fallback to common OSH topics
 */

import { getOpenAIClient } from '../config/openai.js';

const INTERPRETER_MODEL = 'gpt-4o-mini'; // Fast and cost-effective

export type DetectedIntent = 'specific' | 'procedural' | 'generic' | 'list';

export interface OSHInterpretationResult {
  originalTranscript: string;
  interpretedQuestion: string;
  detectedIntent: DetectedIntent;
  confidence: number;
  suggestedTopics: string[];  // What topics this might be about
  alternativeInterpretations?: string[];  // Other possible meanings
  reasoning?: string;  // Brief explanation of interpretation
  processingTimeMs: number;
}

const OSH_TRANSCRIPT_INTELLIGENCE_PROMPT = `You are the OSH Transcript Intelligence for INTERVEE, a Philippine OSH interview preparation app.

ABSOLUTE RULE: The user is practicing for an OSH interview. Every input they give is 100% about OSH.
Your job is to understand their intent and produce a CLEAR, ANSWERABLE OSH question.

## YOUR CAPABILITIES:

### 1. PHONETIC INTERPRETATION
Convert sound-alikes to correct OSH terms:
- "save tea/say fatty/safe T/say fee/safety" → "safety"
- "off sir/officer/of sir" → "officer"
- "roll/role" → "Rule"
- "theo/theos/dios/deal/the o/geo/theo's/deos" → "DO" (Department Order)
- "el a/ella/ellas/el ey" → "LA" (Labor Advisory)
- "are a/ara/r a" → "RA" (Republic Act)
- "ten thirty/10 30/ten 30" → "1030"
- "ten twenty/10 20/ten 20" → "1020"
- "eleven fifty eight/11 58/11058" → "11058"
- "pp/pee pee/ppy" → "PPE"
- "hsc/HSC/aitch ess see" → "HSC" (Health and Safety Committee)
- "wayir/wire/way are" → "WAIR" (Work Accident/Illness Report)
- "cosh/kosh" → "COSH" (Construction OSH)
- "s o/esso/es o" → "SO" (Safety Officer)
- "dole/dough lay/doh le" → "DOLE"
- "bee wee see/bwc" → "BWC"
- "oh ess aitch ess/oshes" → "OSHS"

### 2. TAGLISH UNDERSTANDING
Filipino words often misheard:
- "I know/a no/ano" → "Ano" (What)
- "see no/sino" → "Sino" (Who)
- "pie no/pano/paano" → "Paano" (How)
- "by kit/bakit" → "Bakit" (Why)
- "young/yung/ung" → "yung" (the)
- "manga/mah nga" → "mga" (plural marker)
- "gee by/gibay" → "dapat" (should)
- "sigh an/saan" → "Saan" (Where)
- "kelan/kay lan" → "Kailan" (When)
- "mag kano/mag ka no" → "Magkano" (How much)
- "ilan/ee lan" → "Ilan" (How many)
- "tun call/tungkol" → "tungkol" (about)

### 3. CONTEXT INFERENCE
If you hear fragments, infer the full question:
- "...training hours..." → "How many training hours are required for safety officer training?"
- "...penalty..." → "What are the penalties for OSH violations?"
- "...register..." → "How to register with DOLE?"
- "...committee..." → "What is the composition of the Health and Safety Committee?"
- "...renewal..." → "What are the renewal requirements for safety officers?"
- "...first aid..." → "What are the first aid requirements?"
- "...nurse..." → "When is an occupational nurse required?"
- "...physician..." → "When is an occupational physician required?"

### 4. INTENT DETECTION
Identify what type of answer they need:
- SPECIFIC: Questions asking for exact numbers, values, limits, deadlines, fees
  Examples: "How many hours?", "What is the deadline?", "How many workers?"
- PROCEDURAL: Questions asking for step-by-step processes, how to do something
  Examples: "How do I register?", "What is the process?", "Steps to..."
- GENERIC: Questions asking for explanations, definitions, overviews
  Examples: "What is...?", "Explain...", "Define..."
- LIST: Questions asking for multiple items, enumeration
  Examples: "What are the DOs?", "List the requirements", "Give me 3..."

### 5. NEVER FAIL
If completely unclear, pick the most likely OSH topic based on common interview questions:
- Safety Officer training (most common)
- Registration requirements
- Penalties and violations
- HSC composition
- PPE requirements
- WAIR reporting

## OUTPUT FORMAT (JSON ONLY - NO MARKDOWN):
{
  "interpretedQuestion": "Clear, properly formatted question in the same language as input",
  "detectedIntent": "specific|procedural|generic|list",
  "confidence": 0.0-1.0,
  "suggestedTopics": ["topic1", "topic2"],
  "alternativeInterpretations": ["Other possible meaning 1", "Other possible meaning 2"],
  "reasoning": "Brief explanation of how you interpreted the input"
}

## EXAMPLES:

Input: "save tea off sir training roll 10 30"
Output: {
  "interpretedQuestion": "What is safety officer training under Rule 1030?",
  "detectedIntent": "generic",
  "confidence": 0.85,
  "suggestedTopics": ["rule1030", "safety_officer", "training"],
  "reasoning": "Interpreted phonetically: 'save tea' → 'safety', 'off sir' → 'officer', 'roll' → 'Rule', '10 30' → '1030'"
}

Input: "I know young the o related to mental health"
Output: {
  "interpretedQuestion": "Ano yung DO related to mental health?",
  "detectedIntent": "specific",
  "confidence": 0.9,
  "suggestedTopics": ["do208", "mental_health"],
  "reasoning": "Taglish question asking about Department Order for mental health - DO 208"
}

Input: "penalty"
Output: {
  "interpretedQuestion": "What are the penalties for OSH violations?",
  "detectedIntent": "list",
  "confidence": 0.7,
  "suggestedTopics": ["ra11058", "penalty"],
  "alternativeInterpretations": ["Penalties for non-registration", "Penalties for non-compliance"],
  "reasoning": "Single word 'penalty' - expanded to full question about OSH violation penalties under RA 11058"
}

Input: "give me three deals"
Output: {
  "interpretedQuestion": "Give me 3 Department Orders (DOs) related to OSH",
  "detectedIntent": "list",
  "confidence": 0.8,
  "suggestedTopics": ["department_orders", "do208", "do73", "do102"],
  "reasoning": "Interpreted 'deals' as 'DOs' (Department Orders) phonetically"
}

Input: (unintelligible or very garbled)
Output: {
  "interpretedQuestion": "What are the basic OSH requirements for establishments?",
  "detectedIntent": "generic",
  "confidence": 0.3,
  "suggestedTopics": ["rule1020", "registration", "safety_officer"],
  "alternativeInterpretations": ["Safety officer requirements", "Registration process", "Penalties"],
  "reasoning": "Could not clearly interpret input - providing common OSH interview question as fallback"
}`;

class OSHTranscriptIntelligenceService {
  private openai = getOpenAIClient();

  /**
   * Transform ANY input into a valid OSH question
   * Never fails - always returns something OSH-related
   */
  async interpret(transcript: string): Promise<OSHInterpretationResult> {
    const startTime = Date.now();

    // Skip empty or very short transcriptions
    if (!transcript || transcript.trim().length < 2) {
      return this.createFallbackResult(transcript, startTime, 'Empty or too short input');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: INTERPRETER_MODEL,
        messages: [
          { role: 'system', content: OSH_TRANSCRIPT_INTELLIGENCE_PROMPT },
          { role: 'user', content: transcript },
        ],
        max_tokens: 300,
        temperature: 0.1, // Low temperature for consistent interpretations
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.createFallbackResult(transcript, startTime, 'Empty AI response');
      }

      const result = JSON.parse(content);
      const processingTimeMs = Date.now() - startTime;

      const interpretation: OSHInterpretationResult = {
        originalTranscript: transcript,
        interpretedQuestion: result.interpretedQuestion || transcript,
        detectedIntent: this.validateIntent(result.detectedIntent),
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
        suggestedTopics: result.suggestedTopics || [],
        alternativeInterpretations: result.alternativeInterpretations,
        reasoning: result.reasoning,
        processingTimeMs,
      };

      console.log(`[OSH Transcript Intel] "${transcript}" → "${interpretation.interpretedQuestion}" (${interpretation.confidence.toFixed(2)} confidence, ${processingTimeMs}ms)`);

      return interpretation;
    } catch (error) {
      console.error('[OSH Transcript Intel] Error:', error);
      return this.createFallbackResult(transcript, startTime, 'AI interpretation failed');
    }
  }

  /**
   * Validate and normalize the detected intent
   */
  private validateIntent(intent: string): DetectedIntent {
    const validIntents: DetectedIntent[] = ['specific', 'procedural', 'generic', 'list'];
    if (validIntents.includes(intent as DetectedIntent)) {
      return intent as DetectedIntent;
    }
    return 'generic'; // Default fallback
  }

  /**
   * Create a fallback result when interpretation fails
   * Never returns an error - always gives something useful
   */
  private createFallbackResult(
    transcript: string,
    startTime: number,
    reason: string
  ): OSHInterpretationResult {
    const processingTimeMs = Date.now() - startTime;

    // Try basic phonetic cleanup even in fallback
    const cleaned = this.basicPhoneticCleanup(transcript);

    return {
      originalTranscript: transcript,
      interpretedQuestion: cleaned || 'What are the basic OSH requirements for establishments?',
      detectedIntent: 'generic',
      confidence: transcript ? 0.3 : 0.1,
      suggestedTopics: ['rule1020', 'registration', 'safety_officer'],
      alternativeInterpretations: [
        'Safety officer training requirements',
        'DOLE registration process',
        'OSH penalty provisions',
      ],
      reasoning: `Fallback: ${reason}`,
      processingTimeMs,
    };
  }

  /**
   * Basic phonetic cleanup without AI (used in fallback)
   */
  private basicPhoneticCleanup(text: string): string {
    if (!text) return '';

    let cleaned = text.toLowerCase();

    // Common phonetic replacements
    const replacements: [RegExp, string][] = [
      // DO patterns
      [/\b(theo|theos|dios?|deals?|the\s*o|geo)\b/gi, 'DO'],
      [/\bdepartment\s*(or|order)\s*(there|their|the)?\b/gi, 'Department Order'],
      // LA patterns
      [/\b(el\s*a|ella|ellas?)\b/gi, 'LA'],
      [/\blabor\s*(advice|advise)\b/gi, 'Labor Advisory'],
      // Rule patterns
      [/\b(roll|role)\s+(\d)/gi, 'Rule $2'],
      // RA patterns
      [/\b(are\s*a|ara)\s+(\d)/gi, 'RA $2'],
      // Safety patterns
      [/\b(save\s*tea|say\s*fatty?|safe\s*[tT])\b/gi, 'safety'],
      [/\b(off\s*sir|of\s*sir)\b/gi, 'officer'],
      // Number patterns
      [/\bten\s*thirty\b/gi, '1030'],
      [/\bten\s*twenty\b/gi, '1020'],
      [/\beleven\s*(fifty\s*)?eight\b/gi, '11058'],
      // PPE
      [/\b(pp|pee\s*pee|ppy)\b/gi, 'PPE'],
      // Filipino patterns
      [/\b(i\s*know|a\s*no)\b/gi, 'Ano'],
      [/\b(see\s*no)\b/gi, 'Sino'],
      [/\b(pie\s*no|pano)\b/gi, 'Paano'],
      [/\b(by\s*kit)\b/gi, 'Bakit'],
    ];

    for (const [pattern, replacement] of replacements) {
      cleaned = cleaned.replace(pattern, replacement);
    }

    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}

export const oshTranscriptIntelligence = new OSHTranscriptIntelligenceService();
