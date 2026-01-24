import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { config } from '../config/env.js';
import { OSH_EXPERT_PROMPT, buildContextPrompt } from '../prompts/oshExpertPrompt.js';
import { classifyQuestion, QuestionType } from './questionClassifier.js';
import { AnswerResult, Citation } from '../types/index.js';
import { cacheService } from './cacheService.js';
import { conversationContextService } from './conversationContext.js';
import { OSH_KNOWLEDGE } from '../knowledge/oshKnowledgeBase.js';
import { DetectedLanguage, getLanguagePromptHint } from '../utils/languageDetector.js';

// Dynamic temperature settings by question type
const TEMPERATURE_BY_TYPE: Record<QuestionType, number> = {
  SPECIFIC: 0.1,    // Most deterministic for exact values
  PROCEDURAL: 0.2,  // Moderate for step sequences
  GENERIC: 0.3,     // Higher for explanations
};

// Get relevant knowledge based on detected topic
function getTopicKnowledge(topic: string): string {
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



export class GPTService {
  private openai = getOpenAIClient();

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

      // Get relevant knowledge for the detected topic
      const knowledgeContext = getTopicKnowledge(classification.topic || 'general');

      // Build context string for follow-up questions
      let contextSection = '';
      if (classification.isFollowUp && convContext) {
        contextSection = conversationContextService.getContextSummary(sessionId!);
        contextSection += '\nThis appears to be a FOLLOW-UP question. Use the context above to provide a relevant answer.\n';
      }

      // Build language instruction
      const languageHint = language ? `\n\n## LANGUAGE INSTRUCTION:\n${getLanguagePromptHint(language)}` : '';

      // Add classification confidence note when uncertain
      let confidenceNote = '';
      if (classification.confidence < 0.5) {
        confidenceNote = `\n\nNOTE: Question classification uncertain (${Math.round(classification.confidence * 100)}% confidence). Clarify what you understood if the question seems ambiguous.`;
      }

      // Build system prompt with knowledge + question type hint + language + confidence note
      const systemPrompt = `${basePrompt}${knowledgeContext}\n\n${contextSection}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above. Use the REFERENCE DATA above to provide accurate information.${languageHint}${confidenceNote}`;

      // Step 3: Adjust max tokens based on question type
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 100,    // Short, exact answers (30-50 words)
        GENERIC: 200,     // Brief overviews (60-80 words)
        PROCEDURAL: 250,  // Step-by-step needs more room (80-100 words)
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

      // Build language instruction
      const languageHint = language ? `\n\n## LANGUAGE INSTRUCTION:\n${getLanguagePromptHint(language)}` : '';

      // Add classification confidence note when uncertain
      let confidenceNote = '';
      if (classification.confidence < 0.5) {
        confidenceNote = `\n\nNOTE: Question classification uncertain (${Math.round(classification.confidence * 100)}% confidence). Clarify what you understood if the question seems ambiguous.`;
      }

      const systemPrompt = `${basePrompt}${knowledgeContext}\n\n${contextSection}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above. Use the REFERENCE DATA above to provide accurate information.${languageHint}${confidenceNote}`;

      // Adjust max tokens based on question type
      const maxTokensByType: Record<QuestionType, number> = {
        SPECIFIC: 100,
        GENERIC: 200,
        PROCEDURAL: 250,
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
}

export const gptService = new GPTService();
