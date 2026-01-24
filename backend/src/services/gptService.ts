import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { config } from '../config/env.js';
import { OSH_EXPERT_PROMPT, buildContextPrompt } from '../prompts/oshExpertPrompt.js';
import { classifyQuestion, QuestionType } from './questionClassifier.js';
import { AnswerResult, Citation } from '../types/index.js';
import { cacheService } from './cacheService.js';
import { conversationContextService } from './conversationContext.js';
import { OSH_KNOWLEDGE } from '../knowledge/oshKnowledgeBase.js';
import { DetectedLanguage, getLanguagePromptHint } from '../utils/languageDetector.js';

// Get relevant knowledge based on detected topic
function getTopicKnowledge(topic: string): string {
  const topicMap: Record<string, keyof typeof OSH_KNOWLEDGE> = {
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
    penalty: 'ra11058',
    ra11058: 'ra11058',
  };

  const knowledgeKey = topicMap[topic] || null;

  if (knowledgeKey && OSH_KNOWLEDGE[knowledgeKey]) {
    return `\n## REFERENCE DATA (${knowledgeKey.toUpperCase()}):\n${JSON.stringify(OSH_KNOWLEDGE[knowledgeKey], null, 2)}`;
  }

  // For general questions, provide a summary of all rules
  return `\n## REFERENCE DATA (OSHS OVERVIEW):\n${JSON.stringify({
    rules: Object.keys(OSH_KNOWLEDGE).map(k => OSH_KNOWLEDGE[k as keyof typeof OSH_KNOWLEDGE].title || k),
    ra11058: OSH_KNOWLEDGE.ra11058.title,
  }, null, 2)}`;
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

      // Build system prompt with knowledge + question type hint + language
      const systemPrompt = `${basePrompt}${knowledgeContext}\n\n${contextSection}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above. Use the REFERENCE DATA above to provide accurate information.${languageHint}`;

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
    } catch (error) {
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

      const systemPrompt = `${basePrompt}${knowledgeContext}\n\n${contextSection}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above. Use the REFERENCE DATA above to provide accurate information.${languageHint}`;

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
