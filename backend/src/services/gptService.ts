import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { config } from '../config/env.js';
import { OSH_EXPERT_PROMPT, buildContextPrompt } from '../prompts/oshExpertPrompt.js';
import { generateSystemPrompt } from '../knowledge/OSH_KNOWLEDGE_INDEX.js';
import { classifyQuestion, QuestionType } from './questionClassifier.js';
import { AnswerResult, Citation } from '../types/index.js';
import { cacheService } from './cacheService.js';

export class GPTService {
  private openai = getOpenAIClient();

  async generateAnswer(
    question: string,
    context?: string
  ): Promise<AnswerResult> {
    const startTime = Date.now();

    // Step 1: Classify the question type
    const classification = classifyQuestion(question);
    console.log(`[GPT] Question type: ${classification.type} (confidence: ${classification.confidence.toFixed(2)}, topic: ${classification.topic || 'general'})`);

    // Check cache first
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

    try {
      // Step 2: Build system prompt with knowledge index
      const knowledgePrompt = generateSystemPrompt();
      const basePrompt = context
        ? buildContextPrompt(context)
        : OSH_EXPERT_PROMPT;

      // Add knowledge index and question type hint
      const systemPrompt = `${basePrompt}\n\n${knowledgePrompt}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above.`;

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

      const answer = response.choices[0]?.message?.content || '';
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

      // Cache the result
      await cacheService.setAnswer(question, {
        answer,
        confidence,
        citations,
      });

      return result;
    } catch (error) {
      console.error('[GPT] Error generating answer:', error);
      throw error;
    }
  }

  async *generateAnswerStream(
    question: string,
    context?: string
  ): AsyncGenerator<{ chunk: string; done: boolean; questionType?: QuestionType }> {
    const startTime = Date.now();

    // Classify the question type
    const classification = classifyQuestion(question);
    console.log(`[GPT Stream] Question type: ${classification.type} (confidence: ${classification.confidence.toFixed(2)})`);

    try {
      // Build system prompt with knowledge index
      const knowledgePrompt = generateSystemPrompt();
      const basePrompt = context
        ? buildContextPrompt(context)
        : OSH_EXPERT_PROMPT;

      const systemPrompt = `${basePrompt}\n\n${knowledgePrompt}\n\n## CURRENT QUESTION TYPE: ${classification.type}\nRespond according to the ${classification.type} format guidelines above.`;

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

      // Cache the complete answer
      const citations = this.extractCitations(fullAnswer);
      await cacheService.setAnswer(question, {
        answer: fullAnswer,
        confidence: this.calculateConfidenceFromText(fullAnswer, citations),
        citations,
      });
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
