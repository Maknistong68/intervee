import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { config } from '../config/env.js';
import { OSH_EXPERT_PROMPT, buildContextPrompt } from '../prompts/oshExpertPrompt.js';
import {
  classifyQuestion,
  classifyQuestionEnhanced,
  QuestionType,
  EnhancedQuestionType,
  toLegacyType,
} from './questionClassifier.js';
import { AnswerResult, Citation } from '../types/index.js';
import { cacheService } from './cacheService.js';
import { conversationContextService } from './conversationContext.js';
import { OSH_KNOWLEDGE } from '../knowledge/oshKnowledgeBase.js';
import { DetectedLanguage, getLanguagePromptHint } from '../utils/languageDetector.js';
import { DetectedIntent } from './oshTranscriptIntelligence.js';
import { gptCircuitBreaker, CircuitState } from '../utils/circuitBreaker.js';
// New hybrid search imports
import { getTopicKnowledge as getTopicKnowledgeHybrid, isHybridSearchAvailable } from '../knowledge/compatibilityLayer.js';
import { hybridSearchService } from './hybridSearchService.js';
import { confidenceService } from './confidenceService.js';
import { structuredAnswerBuilder, formatRefusalResponse } from '../templates/structuredAnswer.js';
import { ConfidenceEvaluation, SearchResult } from '../knowledge/types/legalDocument.js';

// Dynamic temperature settings by question type
const TEMPERATURE_BY_TYPE: Record<QuestionType, number> = {
  SPECIFIC: 0.1,    // Most deterministic for exact values
  PROCEDURAL: 0.2,  // Moderate for step sequences
  GENERIC: 0.3,     // Higher for explanations
};

// Map DetectedIntent to QuestionType
const INTENT_TO_QUESTION_TYPE: Record<DetectedIntent, QuestionType> = {
  specific: 'SPECIFIC',
  procedural: 'PROCEDURAL',
  generic: 'GENERIC',
  list: 'GENERIC', // Lists are treated as generic with enumeration
};

/**
 * Enhanced OSH Answer Intelligence Prompt (Layer 3)
 *
 * Key principles:
 * 1. NEVER say "I don't know" - always provide relevant OSH information
 * 2. Proactive suggestions if question is ambiguous
 * 3. Related information to provide comprehensive answers
 * 4. Follow-up prompts to guide the conversation
 */
const OSH_ANSWER_INTELLIGENCE_PROMPT = `You are an experienced OSH practitioner being interviewed for a Philippine OSH position.
You are answering questions to demonstrate your expertise. Write in FIRST PERSON as the interviewee.

## ABSOLUTE RULES - NEVER BREAK THESE:

1. **ALWAYS GIVE AN ANSWER** - Never say "I don't know", "I can't find that", "I'm not sure", or "I need more information"
   - If the exact answer isn't in your data, give the CLOSEST relevant information
   - If truly uncertain, provide the most likely answer based on OSH principles
   - Always sound confident and knowledgeable

2. **HANDLE AMBIGUOUS QUESTIONS GRACEFULLY** - If the question is unclear:
   - Answer the most likely interpretation first
   - Then briefly mention alternatives: "If you meant [X], then [Y]..."
   - Never ask clarifying questions - just answer what you think they mean

3. **PROVIDE RELATED HELPFUL INFORMATION** - Don't just answer the bare minimum:
   - Include the legal citation (Rule, DO, LA, RA)
   - Add one helpful related fact when appropriate
   - End important answers with a natural follow-up hook

4. **USE THE REFERENCE DATA** - All answers must be based on the provided OSH_KNOWLEDGE
   - Use exact numbers and values from the data
   - Cite the source naturally (e.g., "per Rule 1030", "as stated in DO 208")

## ANSWER PATTERNS BY INTENT:

### For SPECIFIC questions (exact values, numbers, limits):
Format: Direct answer with citation
Example: "The requirement is [X] hours, as stated in Rule 1030. This applies to [context]."
Length: 60-100 words

### For PROCEDURAL questions (how-to, steps):
Format: Numbered steps with "First... Second... Third..."
Example: "The process involves three main steps. First, [step]. Second, [step]. Third, [step]. This is per [citation]."
Length: 120-180 words

### For GENERIC questions (explanations, definitions):
Format: Brief overview with 2-3 key points
Example: "In my understanding, [concept] refers to [definition]. The key aspects are [point 1] and [point 2], as covered in [citation]."
Length: 100-150 words

### For LIST questions (enumeration, multiple items):
Format: "There are [N] main [items]: First, [item]. Second, [item]. Third, [item]..."
Example: "There are three main Department Orders related to health: First, DO 208 for Mental Health. Second, DO 73 for TB Prevention. Third, DO 102 for HIV/AIDS Prevention."
Length: 120-180 words

## SPOKEN STRUCTURE FOR MULTI-POINT ANSWERS:

For 2-3 points:
"There are [N] key aspects. First, [point]. Second, [point]. And third, [point]."

For procedures:
"The process involves [N] steps. First, [action] - this is important because [reason]. Second, [action]. Finally, [action]."

DO NOT USE: bullets, dashes, numbered lists, markdown
ALWAYS USE: "First... Second... Third... Finally..."

## NATURAL INTERVIEW PHRASING:
- Opening: "That's a great question...", "Based on my experience..."
- Transition: "To elaborate further...", "What's also worth noting..."
- Closing: "So in summary...", "The key takeaway here is..."

## HANDLING EDGE CASES:

### If question is very vague (like just "safety" or "penalty"):
"Based on your question about [topic], I can share that [most relevant answer]. The key regulation here is [citation]. Related topics include [A] and [B]."

### If no exact data in reference:
"While I don't have the exact [specific detail], I can tell you that [related information from the data]. The relevant regulation is [citation]. For the specific detail, [guideline/principle]."

### For questions mixing multiple topics:
Answer the primary topic fully, then briefly touch on related aspects.

## LANGUAGE RULES:
- Use natural, conversational phrasing suitable for speaking aloud
- NO markdown formatting (no bold, bullets, headers) - this is spoken
- Numbers can be written as numerals for clarity

## OSH TERMINOLOGY REMINDERS:
- DO = Department Order (DOLE issuances)
- LA = Labor Advisory
- RA = Republic Act
- SO = Safety Officer (SO1, SO2, SO3, SO4)
- HSC = Health and Safety Committee
- WAIR = Work Accident/Illness Report
- PPE = Personal Protective Equipment
- OSHS = Occupational Safety and Health Standards`;

export interface OSHAnswerOptions {
  question: string;
  knowledge: string;
  intent: DetectedIntent;
  suggestedFollowUps?: string[];
  language?: DetectedLanguage;
  sessionId?: string;
}

// Get relevant knowledge based on detected topic
// Now supports both legacy (sync) and hybrid (async) modes
function getTopicKnowledgeLegacy(topic: string): string {
  const topicMap: Record<string, keyof typeof OSH_KNOWLEDGE> = {
    // OSHS Rules
    registration: 'rule1020',
    safety_officer: 'rule1030',
    training: 'rule1030',
    hsc: 'rule1040',
    committee: 'rule1040',
    accident: 'rule1050',
    reporting: 'rule1050',
    premises: 'rule1060',
    environmental: 'rule1070',
    noise: 'rule1070',
    illumination: 'rule1070',
    ventilation: 'rule1070',
    ppe: 'rule1080',
    hazardous_materials: 'rule1090',
    welding: 'rule1100',
    confined_space: 'rule1120',
    explosives: 'rule1140',
    boiler: 'rule1160',
    health_services: 'rule1960',
    // RA 11058
    penalty: 'ra11058',
    ra11058: 'ra11058',
    // Department Orders
    do252: 'do252',
    do136: 'do136',
    do160: 'do160',
    do224: 'do224',
    do53: 'do53',
    do73: 'do73',
    do102: 'do102',
    do178: 'do178',
    do184: 'do184',
    do208: 'do208',
    do235: 'do235',
    da05: 'da05',
    // Labor Advisories
    la07: 'la07',
    la01: 'la01',
    la08: 'la08',
    la19: 'la19',
    la20: 'la20',
    la21: 'la21',
    la22: 'la22',
    la23: 'la23',
  };

  // Special handling for generic "Department Orders" questions
  if (topic === 'department_orders') {
    const doKnowledge = {
      do252: OSH_KNOWLEDGE.do252,
      do136: OSH_KNOWLEDGE.do136,
      do160: OSH_KNOWLEDGE.do160,
      do224: OSH_KNOWLEDGE.do224,
      do53: OSH_KNOWLEDGE.do53,
      do73: OSH_KNOWLEDGE.do73,
      do102: OSH_KNOWLEDGE.do102,
      do178: OSH_KNOWLEDGE.do178,
      do184: OSH_KNOWLEDGE.do184,
      do208: OSH_KNOWLEDGE.do208,
      do235: OSH_KNOWLEDGE.do235,
      da05: OSH_KNOWLEDGE.da05,
    };
    return `\n## REFERENCE DATA (ALL DEPARTMENT ORDERS - "DO" means Department Order in OSH context):\nIMPORTANT: When user asks for "DOs" or "Department Orders", list specific Department Orders like DO 208, DO 73, DO 102, etc. - NOT government agencies.\n\n${JSON.stringify(doKnowledge, null, 2)}`;
  }

  // Special handling for generic "Labor Advisories" questions
  if (topic === 'labor_advisories') {
    const laKnowledge = {
      la07: OSH_KNOWLEDGE.la07,
      la01: OSH_KNOWLEDGE.la01,
      la08: OSH_KNOWLEDGE.la08,
      la19: OSH_KNOWLEDGE.la19,
      la20: OSH_KNOWLEDGE.la20,
      la21: OSH_KNOWLEDGE.la21,
      la22: OSH_KNOWLEDGE.la22,
      la23: OSH_KNOWLEDGE.la23,
    };
    return `\n## REFERENCE DATA (ALL LABOR ADVISORIES):\n${JSON.stringify(laKnowledge, null, 2)}`;
  }

  const knowledgeKey = topicMap[topic] || null;

  if (knowledgeKey && OSH_KNOWLEDGE[knowledgeKey]) {
    return `\n## REFERENCE DATA (${knowledgeKey.toUpperCase()}):\n${JSON.stringify(OSH_KNOWLEDGE[knowledgeKey], null, 2)}`;
  }

  // For general questions, provide ALL knowledge data so AI can find any rule
  return `\n## REFERENCE DATA (ALL OSHS RULES):\n${JSON.stringify(OSH_KNOWLEDGE, null, 2)}`;
}

/**
 * Get topic knowledge with hybrid search support
 * Uses semantic search when available, falls back to legacy
 */
async function getTopicKnowledge(topic: string, query?: string): Promise<string> {
  // Try hybrid search first
  try {
    return await getTopicKnowledgeHybrid(topic, query);
  } catch (error) {
    // Fall back to legacy
    console.log('[GPT] Falling back to legacy knowledge retrieval');
    return getTopicKnowledgeLegacy(topic);
  }
}



export interface OSHAnswerResult extends AnswerResult {
  suggestedFollowUps?: string[];
}

export class GPTService {
  private openai = getOpenAIClient();

  /**
   * Generate an OSH answer using the 3-layer intelligence system
   * This is the enhanced method that leverages Layer 1 & 2 outputs
   */
  async *generateOSHAnswerStream(
    options: OSHAnswerOptions
  ): AsyncGenerator<{ chunk: string; done: boolean }> {
    const startTime = Date.now();
    const { question, knowledge, intent, suggestedFollowUps, language, sessionId } = options;

    const questionType = INTENT_TO_QUESTION_TYPE[intent];
    console.log(`[GPT OSH Intel] Intent: ${intent} → QuestionType: ${questionType}`);

    try {
      // Build the enhanced system prompt - LANGUAGE FIRST for strict enforcement
      const languageHint = language ? `## MANDATORY LANGUAGE (HIGHEST PRIORITY):\n${getLanguagePromptHint(language)}\n\n` : '';

      const systemPrompt = `${languageHint}${OSH_ANSWER_INTELLIGENCE_PROMPT}

## REFERENCE DATA:
${knowledge}

## CURRENT QUESTION TYPE: ${questionType}
Respond according to the ${questionType} format guidelines above.`;

      // Adjust max tokens based on question type - increased for longer answers
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 300,    // Increased from 120
        GENERIC: 450,     // Increased from 220
        PROCEDURAL: 550,  // Increased from 280
      };
      const maxTokens = maxTokensByType[questionType] || 400;

      // Use lower temperature for more consistent, confident answers
      const temperature = TEMPERATURE_BY_TYPE[questionType] || 0.15;

      const stream = await this.openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: maxTokens,
        temperature,
        stream: true,
      });

      let fullAnswer = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullAnswer += content;
          yield { chunk: content, done: false };
        }
      }

      yield { chunk: '', done: true };

      const responseTimeMs = Date.now() - startTime;
      console.log(`[GPT OSH Intel] Streamed answer in ${responseTimeMs}ms`);

      // Store exchange in conversation context
      if (sessionId) {
        conversationContextService.addExchange(
          sessionId,
          question,
          fullAnswer,
          intent
        );
      }

      // Cache the complete answer
      const citations = this.extractCitations(fullAnswer);
      await cacheService.setAnswer(question, {
        answer: fullAnswer,
        confidence: this.calculateConfidenceFromText(fullAnswer, citations),
        citations,
      });
    } catch (error) {
      console.error('[GPT OSH Intel] Stream error:', error);
      throw error;
    }
  }

  /**
   * Non-streaming version of generateOSHAnswer
   */
  async generateOSHAnswer(options: OSHAnswerOptions): Promise<OSHAnswerResult> {
    const startTime = Date.now();
    const { question, knowledge, intent, suggestedFollowUps, language, sessionId } = options;

    const questionType = INTENT_TO_QUESTION_TYPE[intent];
    console.log(`[GPT OSH Intel] Intent: ${intent} → QuestionType: ${questionType}`);

    try {
      // Build the enhanced system prompt - LANGUAGE FIRST for strict enforcement
      const languageHint = language ? `## MANDATORY LANGUAGE (HIGHEST PRIORITY):\n${getLanguagePromptHint(language)}\n\n` : '';

      const systemPrompt = `${languageHint}${OSH_ANSWER_INTELLIGENCE_PROMPT}

## REFERENCE DATA:
${knowledge}

## CURRENT QUESTION TYPE: ${questionType}
Respond according to the ${questionType} format guidelines above.`;

      // Adjust max tokens based on question type - increased for longer answers
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 300,    // Increased from 120
        GENERIC: 450,     // Increased from 220
        PROCEDURAL: 550,  // Increased from 280
      };
      const maxTokens = maxTokensByType[questionType] || 400;

      // Use lower temperature for more consistent, confident answers
      const temperature = TEMPERATURE_BY_TYPE[questionType] || 0.15;

      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, config.gptTimeout);

      let response;
      try {
        // Check circuit breaker state before calling
        if (gptCircuitBreaker.getState() === CircuitState.OPEN) {
          console.warn('[GPT] Circuit breaker open, using fallback response');
          response = {
            choices: [{
              message: {
                content: 'I understand you\'re asking about OSH requirements. While I need to reconnect to my knowledge base, I can tell you that Philippine OSH is governed by RA 11058 and the OSHS rules. Please try again in a moment for specific details.',
                role: 'assistant' as const,
              },
              index: 0,
              finish_reason: 'stop' as const,
              logprobs: null,
            }],
            id: 'fallback',
            created: Date.now(),
            model: GPT_MODEL,
            object: 'chat.completion' as const,
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          } as any;
        } else {
          // Normal API call with circuit breaker tracking
          try {
            response = await this.openai.chat.completions.create(
              {
                model: GPT_MODEL,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: question },
                ],
                max_tokens: maxTokens,
                temperature,
                presence_penalty: 0.1,
                frequency_penalty: 0.1,
              },
              { signal: abortController.signal }
            );
          } catch (apiError: any) {
            // Log detailed error for debugging
            if (apiError?.status === 401) {
              console.error('[GPT] API call failed: Invalid API key (401 Unauthorized)');
            } else if (apiError?.status === 429) {
              console.error('[GPT] API call failed: Rate limit exceeded or no credits (429)');
            } else if (apiError?.status === 500) {
              console.error('[GPT] API call failed: OpenAI server error (500)');
            } else {
              console.error('[GPT] API call failed:', apiError?.message || apiError);
            }
            throw apiError;
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }

      const answer = response.choices[0]?.message?.content || 'Based on my OSH experience, I can share that this relates to workplace safety requirements. Let me provide the most relevant information from the regulations.';

      const citations = this.extractCitations(answer);
      const confidence = this.calculateConfidence(response, citations);
      const responseTimeMs = Date.now() - startTime;

      console.log(`[GPT OSH Intel] Generated answer in ${responseTimeMs}ms`);

      const result: OSHAnswerResult = {
        answer,
        confidence,
        citations,
        responseTimeMs,
        cached: false,
        questionType,
        suggestedFollowUps,
      };

      // Store exchange in conversation context
      if (sessionId) {
        conversationContextService.addExchange(
          sessionId,
          question,
          answer,
          intent
        );
      }

      // Cache the result
      await cacheService.setAnswer(question, {
        answer,
        confidence,
        citations,
      });

      return result;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error(`[GPT OSH Intel] Answer generation timed out after ${config.gptTimeout}ms`);
        throw new Error(`GPT answer generation timed out after ${config.gptTimeout}ms`);
      }
      console.error('[GPT OSH Intel] Error generating answer:', error);
      throw error;
    }
  }

  async generateAnswer(
    question: string,
    context?: string,
    sessionId?: string,
    language?: DetectedLanguage
  ): Promise<AnswerResult> {
    const startTime = Date.now();

    // Get conversation context if sessionId provided
    const convContext = sessionId
      ? conversationContextService.getContext(sessionId)
      : undefined;
    const lastTopic = convContext?.currentTopic;

    // Step 1: Classify the question type with context awareness
    const classification = classifyQuestion(question, lastTopic);
    console.log(`[GPT] Question type: ${classification.type} (confidence: ${classification.confidence.toFixed(2)}, topic: ${classification.topic || 'general'}, followUp: ${classification.isFollowUp || false})`);

    // Check cache first (skip cache for follow-ups as they need context)
    if (!classification.isFollowUp) {
      const cached = await cacheService.getAnswer(question);
      if (cached) {
        console.log(`[GPT] Cache hit for question`);
        return {
          ...cached,
          responseTimeMs: Date.now() - startTime,
          cached: true,
          questionType: classification.type,
        };
      }
    }

    try {
      // Step 2: Build system prompt with knowledge context
      const basePrompt = context
        ? buildContextPrompt(context)
        : OSH_EXPERT_PROMPT;

      // Get relevant knowledge for the detected topic (now async with hybrid support)
      const knowledgeContext = await getTopicKnowledge(classification.topic || 'general', question);

      // Build context string for follow-up questions
      let contextSection = '';
      if (classification.isFollowUp && convContext) {
        contextSection = conversationContextService.getContextSummary(sessionId!);
        contextSection += '\nThis appears to be a FOLLOW-UP question. Use the context above to provide a relevant answer.\n';
      }

      // Build language instruction - LANGUAGE FIRST for strict enforcement
      const languageHint = language ? `## MANDATORY LANGUAGE (HIGHEST PRIORITY):\n${getLanguagePromptHint(language)}\n\n` : '';

      // Add classification confidence note when uncertain
      let confidenceNote = '';
      if (classification.confidence < 0.5) {
        confidenceNote = `\n\nNOTE: Question classification uncertain (${Math.round(classification.confidence * 100)}% confidence). Clarify what you understood if the question seems ambiguous.`;
      }

      // Build system prompt with language FIRST, then knowledge + question type hint + confidence note
      const systemPrompt = `${languageHint}${basePrompt}${knowledgeContext}\n\n${contextSection}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above. Use the REFERENCE DATA above to provide accurate information.${confidenceNote}`;

      // Step 3: Adjust max tokens based on question type - increased for longer answers
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 280,    // Increased from 100
        GENERIC: 420,     // Increased from 200
        PROCEDURAL: 500,  // Increased from 250
      };
      const maxTokens = maxTokensByType[classification.type] || config.maxResponseTokens;

      // Use dynamic temperature based on question type
      const temperature = TEMPERATURE_BY_TYPE[classification.type] || 0.2;

      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, config.gptTimeout);

      let response;
      try {
        response = await this.openai.chat.completions.create(
          {
            model: GPT_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question },
            ],
            max_tokens: maxTokens,
            temperature,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          },
          { signal: abortController.signal }
        );
      } finally {
        clearTimeout(timeoutId);
      }

      const answer = response.choices[0]?.message?.content || 'Unable to generate answer. Please try again.';

      const citations = this.extractCitations(answer);
      const confidence = this.calculateConfidence(response, citations);
      const responseTimeMs = Date.now() - startTime;

      console.log(`[GPT] Generated answer in ${responseTimeMs}ms`);

      const result: AnswerResult = {
        answer,
        confidence,
        citations,
        responseTimeMs,
        cached: false,
        questionType: classification.type,
      };

      // Store exchange in conversation context
      if (sessionId) {
        conversationContextService.addExchange(
          sessionId,
          question,
          answer,
          classification.topic || 'general'
        );

        // Update follow-up tracking
        if (classification.isFollowUp) {
          conversationContextService.incrementFollowUp(sessionId);
        } else if (classification.topic && classification.topic !== lastTopic) {
          conversationContextService.resetFollowUp(sessionId);
        }
      }

      // Cache the result (only non-follow-up for context-independence)
      if (!classification.isFollowUp) {
        await cacheService.setAnswer(question, {
          answer,
          confidence,
          citations,
        });
      }

      return result;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error(`[GPT] Answer generation timed out after ${config.gptTimeout}ms`);
        throw new Error(`GPT answer generation timed out after ${config.gptTimeout}ms`);
      }
      console.error('[GPT] Error generating answer:', error);
      throw error;
    }
  }

  async *generateAnswerStream(
    question: string,
    context?: string,
    sessionId?: string,
    language?: DetectedLanguage
  ): AsyncGenerator<{ chunk: string; done: boolean; questionType?: QuestionType }> {
    const startTime = Date.now();

    // Get conversation context if sessionId provided
    const convContext = sessionId
      ? conversationContextService.getContext(sessionId)
      : undefined;
    const lastTopic = convContext?.currentTopic;

    // Classify the question type with context awareness
    const classification = classifyQuestion(question, lastTopic);
    console.log(`[GPT Stream] Question type: ${classification.type} (confidence: ${classification.confidence.toFixed(2)}, followUp: ${classification.isFollowUp || false})`);

    try {
      // Build system prompt with knowledge context
      const basePrompt = context
        ? buildContextPrompt(context)
        : OSH_EXPERT_PROMPT;

      // Get relevant knowledge for the detected topic
      const knowledgeContext = getTopicKnowledge(classification.topic || 'general');

      // Build context string for follow-up questions
      let contextSection = '';
      if (classification.isFollowUp && convContext) {
        contextSection = conversationContextService.getContextSummary(sessionId!);
        contextSection += '\nThis appears to be a FOLLOW-UP question. Use the context above to provide a relevant answer.\n';
      }

      // Build language instruction - LANGUAGE FIRST for strict enforcement
      const languageHint = language ? `## MANDATORY LANGUAGE (HIGHEST PRIORITY):\n${getLanguagePromptHint(language)}\n\n` : '';

      // Add classification confidence note when uncertain
      let confidenceNote = '';
      if (classification.confidence < 0.5) {
        confidenceNote = `\n\nNOTE: Question classification uncertain (${Math.round(classification.confidence * 100)}% confidence). Clarify what you understood if the question seems ambiguous.`;
      }

      const systemPrompt = `${languageHint}${basePrompt}${knowledgeContext}\n\n${contextSection}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above. Use the REFERENCE DATA above to provide accurate information.${confidenceNote}`;

      // Adjust max tokens based on question type - increased for longer answers
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 280,    // Increased from 100
        GENERIC: 420,     // Increased from 200
        PROCEDURAL: 500,  // Increased from 250
      };
      const maxTokens = maxTokensByType[classification.type] || config.maxResponseTokens;

      // Use dynamic temperature based on question type
      const temperature = TEMPERATURE_BY_TYPE[classification.type] || 0.2;

      const stream = await this.openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: maxTokens,
        temperature,
        stream: true,
      });

      let fullAnswer = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullAnswer += content;
          yield { chunk: content, done: false };
        }
      }

      yield { chunk: '', done: true };

      const responseTimeMs = Date.now() - startTime;
      console.log(`[GPT] Streamed answer in ${responseTimeMs}ms`);

      // Store exchange in conversation context
      if (sessionId) {
        conversationContextService.addExchange(
          sessionId,
          question,
          fullAnswer,
          classification.topic || 'general'
        );
      }

      // Cache the complete answer (only non-follow-up for context-independence)
      if (!classification.isFollowUp) {
        const citations = this.extractCitations(fullAnswer);
        await cacheService.setAnswer(question, {
          answer: fullAnswer,
          confidence: this.calculateConfidenceFromText(fullAnswer, citations),
          citations,
        });
      }
    } catch (error) {
      console.error('[GPT] Stream error:', error);
      throw error;
    }
  }

  private extractCitations(text: string): Citation[] {
    const citations: Citation[] = [];

    // Primary patterns for direct citations
    const patterns = [
      { regex: /Rule\s+(\d{4})/gi, type: 'rule' as const },
      { regex: /DO\s+(\d+)(?:,?\s*s\.?\s*(\d{4}))?/gi, type: 'do' as const },
      { regex: /LA\s+(\d+)(?:,?\s*s\.?\s*(\d{4}))?/gi, type: 'la' as const },
      { regex: /RA\s+(\d+)/gi, type: 'ra' as const },
      // Section-level citations: "Section 1031" or "Rule 1030, Section 1031"
      { regex: /Section\s+(\d{4})/gi, type: 'rule' as const },
      // Department Administrative Order
      { regex: /DA\s+(\d+)(?:,?\s*s\.?\s*(\d{4}))?/gi, type: 'do' as const },
    ];

    // Narrative patterns (e.g., "as stated in Rule 1030", "per the Revised IRR")
    const narrativePatterns = [
      { regex: /(?:as\s+stated\s+in|per|under|according\s+to|pursuant\s+to)\s+Rule\s+(\d{4})/gi, type: 'rule' as const },
      { regex: /(?:as\s+stated\s+in|per|under|according\s+to|pursuant\s+to)\s+DO\s+(\d+)/gi, type: 'do' as const },
      { regex: /(?:as\s+stated\s+in|per|under|according\s+to|pursuant\s+to)\s+RA\s+(\d+)/gi, type: 'ra' as const },
      // Revised IRR reference
      { regex: /Revised\s+IRR/gi, type: 'ra' as const, staticRef: '11058' },
    ];

    // Extract from primary patterns
    for (const { regex, type } of patterns) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const reference = type === 'rule'
          ? match[1]
          : match[2]
            ? `${match[1]}, s. ${match[2]}`
            : match[1];

        // Avoid duplicates
        if (!citations.some(c => c.type === type && c.reference === reference)) {
          citations.push({ type, reference });
        }
      }
    }

    // Extract from narrative patterns
    for (const pattern of narrativePatterns) {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const reference = (pattern as any).staticRef || match[1];
        const type = pattern.type;

        // Avoid duplicates
        if (!citations.some(c => c.type === type && c.reference === reference)) {
          citations.push({ type, reference });
        }
      }
    }

    // Validate citations against known knowledge base keys
    const validatedCitations = citations.filter(citation => {
      if (citation.type === 'rule') {
        const ruleKey = `rule${citation.reference}` as keyof typeof OSH_KNOWLEDGE;
        return OSH_KNOWLEDGE[ruleKey] !== undefined;
      }
      if (citation.type === 'do') {
        const doKey = `do${citation.reference.split(',')[0]}` as keyof typeof OSH_KNOWLEDGE;
        return OSH_KNOWLEDGE[doKey] !== undefined;
      }
      if (citation.type === 'la') {
        const laKey = `la${citation.reference.split(',')[0]}` as keyof typeof OSH_KNOWLEDGE;
        return OSH_KNOWLEDGE[laKey] !== undefined;
      }
      if (citation.type === 'ra') {
        return citation.reference === '11058'; // Only RA 11058 in our KB
      }
      return true;
    });

    return validatedCitations;
  }

  private calculateConfidence(response: any, citations: Citation[]): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if citations are present
    if (citations.length > 0) {
      confidence += 0.1;
    }

    // Increase confidence for specific rule citations
    if (citations.some(c => c.type === 'rule')) {
      confidence += 0.05;
    }

    // Check finish reason
    if (response.choices[0]?.finish_reason === 'stop') {
      confidence += 0.05;
    }

    return Math.min(confidence, 0.95);
  }

  private calculateConfidenceFromText(text: string, citations: Citation[]): number {
    let confidence = 0.7;

    if (citations.length > 0) {
      confidence += 0.1;
    }

    if (citations.some(c => c.type === 'rule')) {
      confidence += 0.05;
    }

    // Lower confidence for hedging language
    const hedgingPhrases = ['i think', 'possibly', 'might be', 'not sure', 'uncertain'];
    const lowerText = text.toLowerCase();
    if (hedgingPhrases.some(phrase => lowerText.includes(phrase))) {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(confidence, 0.95));
  }

  // ============================================
  // ENHANCED ANSWER GENERATION WITH HYBRID SEARCH
  // ============================================

  /**
   * Generate answer using hybrid search and confidence evaluation
   * This is the new enhanced method that:
   * 1. Uses semantic search to find relevant sections
   * 2. Evaluates confidence and may refuse low-confidence answers
   * 3. Returns structured answers with legal basis
   */
  async generateEnhancedAnswer(
    question: string,
    sessionId?: string,
    language?: DetectedLanguage
  ): Promise<{
    answer: string;
    confidence: ConfidenceEvaluation;
    searchResults: SearchResult[];
    questionType: EnhancedQuestionType;
    refusalReason?: string;
  }> {
    const startTime = Date.now();

    // Step 1: Enhanced classification
    const classification = classifyQuestionEnhanced(question);
    console.log(`[GPT Enhanced] Type: ${classification.type}, Legal refs: ${classification.legalReferences.length}`);

    // Step 2: Perform hybrid search
    const searchResults = await this.performHybridSearch(question, classification);
    console.log(`[GPT Enhanced] Found ${searchResults.length} relevant sections`);

    // Step 3: Evaluate confidence
    const confidenceEval = confidenceService.evaluate({
      searchResults,
      questionType: classification.type,
      hasExactCitation: classification.legalReferences.length > 0,
      hasNumericalMatch: classification.numericalQueries.length > 0,
      queryKeywords: question.toLowerCase().split(/\s+/),
    });

    console.log(`[GPT Enhanced] Confidence: ${confidenceEval.score.toFixed(2)} (${confidenceEval.recommendation})`);

    // Step 4: Handle refusal case
    if (confidenceEval.recommendation === 'refuse') {
      const refusalAnswer = formatRefusalResponse(confidenceEval, classification.type);
      return {
        answer: refusalAnswer,
        confidence: confidenceEval,
        searchResults,
        questionType: classification.type,
        refusalReason: confidenceEval.refusalReason,
      };
    }

    // Step 5: Generate answer with context from search results
    const knowledgeContext = this.formatSearchResultsForPrompt(searchResults);
    const legacyType = toLegacyType(classification.type);

    // LANGUAGE FIRST for strict enforcement
    const languageHint = language ? `## MANDATORY LANGUAGE (HIGHEST PRIORITY):\n${getLanguagePromptHint(language)}\n\n` : '';
    const qualifierHint = confidenceEval.recommendation === 'qualified'
      ? `\n\nNOTE: Confidence is moderate. Start your answer with a qualifier like "${confidenceService.getQualifierPhrase(confidenceEval)}"`
      : '';

    const systemPrompt = `${languageHint}${OSH_ANSWER_INTELLIGENCE_PROMPT}

## REFERENCE DATA (from Hybrid Search):
${knowledgeContext}

## QUESTION TYPE: ${classification.type}
## CONFIDENCE LEVEL: ${confidenceService.getConfidenceLabel(confidenceEval.score)}
${qualifierHint}

Respond according to the ${legacyType} format guidelines. Use the search results above for accurate information.`;

    // Increased token limits for longer answers
    const maxTokensByType: Record<EnhancedQuestionType, number> = {
      SPECIFIC: 280,      // Increased from 100
      PROCEDURAL: 500,    // Increased from 250
      GENERIC: 420,       // Increased from 200
      DEFINITION: 350,    // Increased from 150
      SCENARIO: 500,      // Increased from 250
      COMPARISON: 500,    // Increased from 250
      EXCEPTION: 420,     // Increased from 200
      LIST: 500,          // Increased from 250
      SECTION_QUERY: 420, // Increased from 200
      CITATION_QUERY: 420,// Increased from 200
    };

    const temperature = classification.type === 'SPECIFIC' || classification.type === 'SECTION_QUERY'
      ? 0.1
      : classification.type === 'SCENARIO' || classification.type === 'COMPARISON'
        ? 0.25
        : 0.2;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), config.gptTimeout);

    try {
      const response = await this.openai.chat.completions.create(
        {
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
          max_tokens: maxTokensByType[classification.type] || 200,
          temperature,
        },
        { signal: abortController.signal }
      );

      clearTimeout(timeoutId);

      const answer = response.choices[0]?.message?.content || 'Unable to generate answer.';
      const processingTimeMs = Date.now() - startTime;

      console.log(`[GPT Enhanced] Generated answer in ${processingTimeMs}ms`);

      // Store in conversation context
      if (sessionId) {
        conversationContextService.addExchange(
          sessionId,
          question,
          answer,
          classification.topic || 'general'
        );
      }

      return {
        answer,
        confidence: confidenceEval,
        searchResults,
        questionType: classification.type,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error(`GPT answer generation timed out after ${config.gptTimeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Perform hybrid search based on classification
   */
  private async performHybridSearch(
    question: string,
    classification: ReturnType<typeof classifyQuestionEnhanced>
  ): Promise<SearchResult[]> {
    try {
      // Check if hybrid search is available
      const available = await isHybridSearchAvailable();
      if (!available) {
        console.log('[GPT Enhanced] Hybrid search not available, returning empty results');
        return [];
      }

      // Build search options
      const searchOptions: any = {
        query: question,
        limit: 5,
        minScore: 0.25,
      };

      // Add section numbers from legal references
      const sectionRefs = classification.legalReferences.filter(r => r.type === 'section');
      if (sectionRefs.length > 0) {
        searchOptions.sectionNumbers = sectionRefs.map(r => r.identifier);
      }

      // Add law IDs from references
      const lawRefs = classification.legalReferences.filter(r =>
        ['ra', 'oshs_rule', 'do', 'la', 'da'].includes(r.type)
      );
      if (lawRefs.length > 0) {
        searchOptions.lawIds = lawRefs.map(r => `${r.type}${r.identifier}`);
      }

      // Add numerical query
      if (classification.numericalQueries.length > 0) {
        searchOptions.numericalQuery = classification.numericalQueries[0];
      }

      const result = await hybridSearchService.search(searchOptions);
      return result.results;
    } catch (error) {
      console.error('[GPT Enhanced] Hybrid search error:', error);
      return [];
    }
  }

  /**
   * Format search results for the prompt
   */
  private formatSearchResultsForPrompt(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No specific sections found. Use general OSH knowledge.';
    }

    return results.map((r, i) => {
      const s = r.section;
      const relevance = r.score > 0.7 ? 'HIGH' : r.score > 0.4 ? 'MEDIUM' : 'LOW';

      let text = `### Source ${i + 1} [${relevance}]\n`;
      text += `**Citation:** ${s.lawName}, ${s.sectionNumber}\n`;
      if (s.title) text += `**Title:** ${s.title}\n`;
      text += `\n${s.content}\n`;

      if (r.highlights && r.highlights.length > 0) {
        text += `\n**Key excerpts:**\n`;
        r.highlights.forEach(h => {
          text += `> ${h}\n`;
        });
      }

      return text;
    }).join('\n---\n');
  }
}

export const gptService = new GPTService();
