import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { config } from '../config/env.js';
import { OSH_EXPERT_PROMPT, buildContextPrompt } from '../prompts/oshExpertPrompt.js';
import { generateSystemPrompt } from '../knowledge/OSH_KNOWLEDGE_INDEX.js';
import { classifyQuestion, QuestionType } from './questionClassifier.js';
import { AnswerResult, Citation } from '../types/index.js';
import { cacheService } from './cacheService.js';
import { conversationContextService, ConversationContext } from './conversationContext.js';

// Force answer prompt addition
const FORCE_ANSWER_PROMPT = `
## CRITICAL INSTRUCTION - ALWAYS PROVIDE AN ANSWER:
You MUST always provide a helpful answer. Never say "I don't understand" or ask for clarification.
If the question is unclear:
1. Interpret it as best you can based on Philippine OSH context
2. If it sounds like a follow-up question, use the previous context provided
3. If completely unclear, provide a relevant OSH tip or fact related to workplace safety

Examples of handling unclear inputs:
- "what about that" → If previous topic was Safety Officers, answer about additional Safety Officer details
- "how many" → If previous topic was HSC, answer about HSC member count requirements
- Vague question with no context → Provide a helpful general OSH fact

NEVER leave the user without an answer. ALWAYS be helpful.`;

// Fallback answers when GPT fails
const FALLBACK_ANSWERS: Record<string, string> = {
  safety_officer: "**Safety Officers** are required under Rule 1030. Training levels: SO1 (40 hrs) for low-risk, SO2 (80 hrs) for medium-risk, SO3/COSH (200 hrs) for high-risk or construction. Ask about specific requirements for more details.",
  hsc: "**Health and Safety Committee (HSC)** is required for establishments with 10+ workers under Rule 1040. Must meet monthly (hazardous) or quarterly (non-hazardous). Composed of employer rep, safety officer, workers' reps, and company physician.",
  ppe: "**PPE (Personal Protective Equipment)** must be provided FREE by employers per Rule 1080 and RA 11058. Types include head, eye, ear, respiratory, hand, foot, body, and fall protection. Employers must train workers on proper use.",
  penalty: "**Penalties under RA 11058** range from PHP 100,000 to PHP 5,000,000 per violation depending on establishment size and offense frequency. Criminal liability (6 months - 6 years) applies for willful violations causing death or serious injury.",
  registration: "**All establishments must register with DOLE** within 30 days of operation under Rule 1020. Use the OSHS online portal (oshs.dole.gov.ph). Annual renewal required every January.",
  default: "That's an important OSH consideration. Under Philippine OSH Standards (RA 11058 and OSHS Rules 1020-1960), employers must ensure workplace safety. Could you specify which rule, requirement, or topic you'd like to know more about?",
};

export class GPTService {
  private openai = getOpenAIClient();

  async generateAnswer(
    question: string,
    context?: string,
    sessionId?: string
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
      // Step 2: Build system prompt with knowledge index
      const knowledgePrompt = generateSystemPrompt();
      const basePrompt = context
        ? buildContextPrompt(context)
        : OSH_EXPERT_PROMPT;

      // Build context string for follow-up questions
      let contextSection = '';
      if (classification.isFollowUp && convContext) {
        contextSection = conversationContextService.getContextSummary(sessionId!);
        contextSection += '\nThis appears to be a FOLLOW-UP question. Use the context above to provide a relevant answer.\n';
      }

      // Add knowledge index, question type hint, and force answer prompt
      const systemPrompt = `${basePrompt}\n\n${knowledgePrompt}\n\n${contextSection}${FORCE_ANSWER_PROMPT}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above.`;

      // Step 3: Adjust max tokens based on question type
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 100,    // Short, exact answers (30-50 words)
        GENERIC: 200,     // Brief overviews (60-80 words)
        PROCEDURAL: 250,  // Step-by-step needs more room (80-100 words)
      };
      const maxTokens = maxTokensByType[classification.type] || config.maxResponseTokens;

      const response = await this.openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: maxTokens,
        temperature: 0.2, // Lower for more consistent, accurate responses
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      let answer = response.choices[0]?.message?.content || '';

      // Force answer: if empty, provide fallback
      if (!answer || answer.trim() === '') {
        answer = this.getFallbackAnswer(question, classification.topic);
        console.log(`[GPT] Empty response, using fallback`);
      }

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
    } catch (error) {
      console.error('[GPT] Error generating answer:', error);

      // Return fallback answer instead of throwing
      const fallbackAnswer = this.getFallbackAnswer(question, classification.topic);
      const responseTimeMs = Date.now() - startTime;

      return {
        answer: fallbackAnswer,
        confidence: 0.5,
        citations: [],
        responseTimeMs,
        cached: false,
        questionType: classification.type,
      };
    }
  }

  /**
   * Get fallback answer based on topic
   */
  private getFallbackAnswer(question: string, topic?: string): string {
    if (topic && FALLBACK_ANSWERS[topic]) {
      return FALLBACK_ANSWERS[topic];
    }

    // Try to detect topic from question keywords
    const q = question.toLowerCase();
    if (q.includes('safety officer') || q.includes('so1') || q.includes('so2') || q.includes('so3') || q.includes('training')) {
      return FALLBACK_ANSWERS.safety_officer;
    }
    if (q.includes('hsc') || q.includes('committee')) {
      return FALLBACK_ANSWERS.hsc;
    }
    if (q.includes('ppe') || q.includes('equipment') || q.includes('protective')) {
      return FALLBACK_ANSWERS.ppe;
    }
    if (q.includes('penalty') || q.includes('fine') || q.includes('violation')) {
      return FALLBACK_ANSWERS.penalty;
    }
    if (q.includes('register') || q.includes('registration') || q.includes('1020')) {
      return FALLBACK_ANSWERS.registration;
    }

    return FALLBACK_ANSWERS.default;
  }

  async *generateAnswerStream(
    question: string,
    context?: string,
    sessionId?: string
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
      // Build system prompt with knowledge index
      const knowledgePrompt = generateSystemPrompt();
      const basePrompt = context
        ? buildContextPrompt(context)
        : OSH_EXPERT_PROMPT;

      // Build context string for follow-up questions
      let contextSection = '';
      if (classification.isFollowUp && convContext) {
        contextSection = conversationContextService.getContextSummary(sessionId!);
        contextSection += '\nThis appears to be a FOLLOW-UP question. Use the context above to provide a relevant answer.\n';
      }

      const systemPrompt = `${basePrompt}\n\n${knowledgePrompt}\n\n${contextSection}${FORCE_ANSWER_PROMPT}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above.`;

      // Adjust max tokens based on question type
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 100,
        GENERIC: 200,
        PROCEDURAL: 250,
      };
      const maxTokens = maxTokensByType[classification.type] || config.maxResponseTokens;

      const stream = await this.openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: maxTokens,
        temperature: 0.2,
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

      // Force answer: if empty, provide fallback
      if (!fullAnswer || fullAnswer.trim() === '') {
        fullAnswer = this.getFallbackAnswer(question, classification.topic);
        yield { chunk: fullAnswer, done: false };
        console.log(`[GPT Stream] Empty response, using fallback`);
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

      // Yield fallback answer instead of throwing
      const fallbackAnswer = this.getFallbackAnswer(question, classification.topic);
      yield { chunk: fallbackAnswer, done: false };
      yield { chunk: '', done: true };
    }
  }

  private extractCitations(text: string): Citation[] {
    const citations: Citation[] = [];
    const patterns = [
      { regex: /Rule\s+(\d{4})/gi, type: 'rule' as const },
      { regex: /DO\s+(\d+)(?:,?\s*s\.?\s*(\d{4}))?/gi, type: 'do' as const },
      { regex: /LA\s+(\d+)(?:,?\s*s\.?\s*(\d{4}))?/gi, type: 'la' as const },
      { regex: /RA\s+(\d+)/gi, type: 'ra' as const },
    ];

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

    return citations;
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
}

export const gptService = new GPTService();
