/**
 * Transcript Interpreter Service
 *
 * Uses AI to interpret and correct Whisper transcriptions before answer generation.
 * This handles context-aware correction of misheard OSH terminology.
 *
 * TRADEOFFS:
 * - PRO: More accurate - AI understands context, handles novel mishearings
 * - PRO: No maintenance - doesn't need regex updates for new patterns
 * - CON: Added latency (~200-500ms per request)
 * - CON: Extra API cost (~$0.0001 per interpretation with gpt-4o-mini)
 * - CON: Depends on OpenAI availability
 *
 * Configure via: AI_TRANSCRIPT_INTERPRETATION=true|false (default: true)
 * Falls back to regex normalization if disabled or on error.
 */

import { getOpenAIClient } from '../config/openai.js';
import { config } from '../config/env.js';
import { normalizeTranscript } from '../utils/transcriptNormalizer.js';

const INTERPRETER_MODEL = 'gpt-4o-mini'; // Fast and cheap for interpretation

const INTERPRETATION_PROMPT = `You are a transcript interpreter for a Philippine OSH (Occupational Safety and Health) interview assistant.

Your job is to interpret speech-to-text transcriptions that may contain errors from Whisper ASR, especially for OSH terminology.

Common misheard patterns you should recognize and correct:
- "theo", "theos", "dios", "deal", "the o", "geo" → "DO" (Department Order)
- "department or there/their/the" → "Department Order"
- "el a", "ella", "ellas" → "LA" (Labor Advisory)
- "labor advice/advise" → "Labor Advisory"
- "roll/role 1030" → "Rule 1030"
- "are a 11058" → "RA 11058"
- "osh es", "oh shes" → "OSHS" (Occupational Safety and Health Standards)

OSH Context:
- DO = Department Order (e.g., DO 198, DO 208, DO 73, DO 102, DO 136)
- LA = Labor Advisory (e.g., LA 07, LA 01, LA 08)
- RA = Republic Act (e.g., RA 11058)
- Rule = OSHS Rule (e.g., Rule 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090)
- DOLE = Department of Labor and Employment
- HSC = Health and Safety Committee
- PPE = Personal Protective Equipment
- WAIR = Work Accident/Illness Report
- COSH = Construction OSH
- SO = Safety Officer

Instructions:
1. Read the transcription carefully
2. Identify any misheard OSH terms and correct them
3. Preserve the user's intent and question structure
4. Return ONLY the corrected question text, nothing else
5. If the transcription is already correct, return it unchanged
6. Keep the same language (English, Filipino, or Taglish)

Examples:
- Input: "can you give me a three department or there related to"
  Output: "can you give me 3 Department Orders related to"

- Input: "give me 3 theos or department or there"
  Output: "give me 3 DOs or Department Orders"

- Input: "what is el a 07"
  Output: "what is LA 07"

- Input: "ano ang roll 1030"
  Output: "ano ang Rule 1030"

- Input: "list the deals related to construction"
  Output: "list the DOs related to construction"`;

export interface InterpretationResult {
  originalText: string;
  interpretedText: string;
  wasModified: boolean;
  processingTimeMs: number;
  method: 'ai' | 'regex' | 'none';
}

class TranscriptInterpreterService {
  private openai = getOpenAIClient();

  /**
   * Interpret and correct a transcription
   * Uses AI if enabled, otherwise falls back to regex normalization
   */
  async interpret(transcription: string): Promise<InterpretationResult> {
    const startTime = Date.now();

    // Skip empty or very short transcriptions
    if (!transcription || transcription.trim().length < 3) {
      return {
        originalText: transcription,
        interpretedText: transcription,
        wasModified: false,
        processingTimeMs: 0,
        method: 'none',
      };
    }

    // Check if AI interpretation is enabled
    if (config.aiTranscriptInterpretation) {
      try {
        return await this.interpretWithAI(transcription, startTime);
      } catch (error) {
        console.warn('[TranscriptInterpreter] AI failed, falling back to regex:', error);
        // Fall through to regex normalization
      }
    }

    // Use regex-based normalization (fallback or when AI is disabled)
    return this.interpretWithRegex(transcription, startTime);
  }

  /**
   * AI-based interpretation (more accurate, but slower and costs money)
   */
  private async interpretWithAI(transcription: string, startTime: number): Promise<InterpretationResult> {
    const response = await this.openai.chat.completions.create({
      model: INTERPRETER_MODEL,
      messages: [
        { role: 'system', content: INTERPRETATION_PROMPT },
        { role: 'user', content: transcription },
      ],
      max_tokens: 200,
      temperature: 0.1, // Very low for consistent corrections
    });

    const interpretedText = response.choices[0]?.message?.content?.trim() || transcription;
    const processingTimeMs = Date.now() - startTime;
    const wasModified = interpretedText.toLowerCase() !== transcription.toLowerCase();

    if (wasModified) {
      console.log(`[TranscriptInterpreter:AI] Corrected in ${processingTimeMs}ms:`);
      console.log(`  Original: "${transcription}"`);
      console.log(`  Interpreted: "${interpretedText}"`);
    } else {
      console.log(`[TranscriptInterpreter:AI] No changes needed (${processingTimeMs}ms)`);
    }

    return {
      originalText: transcription,
      interpretedText,
      wasModified,
      processingTimeMs,
      method: 'ai',
    };
  }

  /**
   * Regex-based normalization (faster, no cost, but less accurate)
   */
  private interpretWithRegex(transcription: string, startTime: number): InterpretationResult {
    const interpretedText = normalizeTranscript(transcription);
    const processingTimeMs = Date.now() - startTime;
    const wasModified = interpretedText !== transcription;

    if (wasModified) {
      console.log(`[TranscriptInterpreter:Regex] Corrected in ${processingTimeMs}ms:`);
      console.log(`  Original: "${transcription}"`);
      console.log(`  Normalized: "${interpretedText}"`);
    }

    return {
      originalText: transcription,
      interpretedText,
      wasModified,
      processingTimeMs,
      method: 'regex',
    };
  }

  /**
   * Check if AI interpretation is enabled
   */
  isAIEnabled(): boolean {
    return config.aiTranscriptInterpretation;
  }
}

export const transcriptInterpreter = new TranscriptInterpreterService();
