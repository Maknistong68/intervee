import { QuestionDetectionResult } from '../types/index.js';
import { detectLanguage, DetectedLanguage } from '../utils/languageDetector.js';
import { getOpenAIClient } from '../config/openai.js';

// AI Detection Result with additional context
export interface AIQuestionDetectionResult extends QuestionDetectionResult {
  intent?: string;
  aiParsed: boolean;
}

// Question keywords in English and Tagalog
const QUESTION_KEYWORDS = {
  en: [
    // Question words
    'what', 'who', 'where', 'when', 'why', 'how',
    'which', 'whose', 'whom',
    // Modal verbs
    'is', 'are', 'do', 'does', 'can', 'could', 'would', 'should', 'will', 'shall',
    'have', 'has', 'did', 'was', 'were',
    // Command verbs that request information
    'explain', 'describe', 'define', 'state', 'enumerate', 'list',
    'tell', 'provide', 'give', 'show', 'discuss', 'clarify',
  ],
  tl: [
    // Tagalog question words
    'ano', 'sino', 'saan', 'kailan', 'bakit', 'paano',
    'alin', 'kanino', 'ilan', 'magkano', 'gaano',
    // Tagalog particles
    'ba', 'kaya', 'pwede', 'puwede', 'maari', 'maaari',
    // Tagalog command verbs
    'ipaliwanag', 'sabihin', 'banggitin', 'ilista', 'ibigay', 'magbigay',
    'diba', 'di ba', 'hindi ba', 'talaga ba', 'ilarawan', 'tukuyin', 'bigyan',
  ],
};

// OSH-specific keywords that indicate an interview question
const OSH_KEYWORDS = [
  'osh', 'safety', 'health', 'dole', 'rule', 'regulation',
  'osha', 'registration', 'committee', 'hsc', 'safety officer',
  'ppe', 'accident', 'hazard', 'training', 'penalty', 'violation',
  'compliance', 'establishment', 'employee', 'worker', 'employer',
  'ra 11058', 'department order', 'labor advisory',
];

export class QuestionDetector {
  private lastSpeechTime: number = Date.now();
  private accumulatedText: string = '';
  private readonly SILENCE_THRESHOLD_MS = 1500; // 1.5 seconds

  detectQuestion(transcript: string, silenceDurationMs: number = 0): QuestionDetectionResult {
    const cleanText = transcript.trim();

    if (!cleanText) {
      return {
        isQuestion: false,
        questionText: '',
        confidence: 0,
        language: 'en',
      };
    }

    const language = detectLanguage(cleanText);
    let confidence = 0;
    let isQuestion = false;

    // Check 1: Ends with question mark
    if (cleanText.endsWith('?')) {
      isQuestion = true;
      confidence += 0.4;
    }

    // Check 2: Contains question word anywhere in text
    const words = cleanText.toLowerCase().split(/\s+/);
    const firstWord = words[0];
    const questionWords = [...QUESTION_KEYWORDS.en, ...QUESTION_KEYWORDS.tl];

    // Check if ANY word in text matches a question keyword (not just first)
    const hasQuestionWord = words.some(word => questionWords.includes(word));
    if (hasQuestionWord) {
      isQuestion = true;
      confidence += 0.25;
    }
    // Bonus if starts with question word
    if (questionWords.includes(firstWord)) {
      confidence += 0.1;
    }

    // Check 3: Enhanced Tagalog particle detection
    const tagalogPatterns = [
      /\bba\b/i, /\bdiba\b/i, /\bdi\s+ba\b/i, /\bhindi\s+ba\b/i, /\bno\?$/i
    ];
    if (tagalogPatterns.some(p => p.test(cleanText))) {
      isQuestion = true;
      confidence += 0.25;
    }

    // Check 4: Contains OSH keywords (more likely to be relevant)
    const lowerText = cleanText.toLowerCase();
    const hasOSHKeyword = OSH_KEYWORDS.some(kw => lowerText.includes(kw));
    if (hasOSHKeyword) {
      confidence += 0.15;
    }

    // Check 5: Sufficient silence after speech (question pause)
    if (silenceDurationMs >= this.SILENCE_THRESHOLD_MS && confidence > 0.2) {
      confidence += 0.1;
    }

    // Check 6: Sentence structure patterns
    const questionPatterns = [
      /^(can|could|would|should|will|do|does|is|are|have|has)\s/i,
      /\b(what|who|where|when|why|how)\b.*\?$/i,
      /\b(ano|sino|saan|kailan|bakit|paano)\b/i,
      /\b(ipaliwanag|explain|describe|define|enumerate)\b/i,
    ];

    if (questionPatterns.some(pattern => pattern.test(cleanText))) {
      isQuestion = true;
      confidence += 0.2;
    }

    // Check 7: Command/imperative questions
    const imperativePatterns = [
      // "Explain X", "Provide X", "Tell me X", etc.
      /^(explain|describe|define|list|enumerate|state|provide|give|show|tell|discuss|clarify)\b/i,
      // "Can you explain/provide/tell me"
      /\b(can|could)\s+you\s+(explain|describe|tell|provide|give|show)\b/i,
      // "Tell me / Give me / Provide me"
      /\b(tell|give|provide|show)\s+(me|us)\b/i,
      // Tagalog imperatives
      /^(ipaliwanag|ilarawan|tukuyin|sabihin|ibigay|magbigay|ilista)\b/i,
      /\bano\s+(ang|yung)\b/i,
    ];
    if (imperativePatterns.some(p => p.test(cleanText))) {
      isQuestion = true;
      confidence += 0.25;
    }

    // Normalize confidence
    confidence = Math.min(confidence, 1.0);

    // Only consider it a question if confidence meets threshold
    if (confidence < 0.25) {
      isQuestion = false;
    }

    return {
      isQuestion,
      questionText: isQuestion ? cleanText : '',
      confidence,
      language,
    };
  }

  updateSilenceTimer(): void {
    this.lastSpeechTime = Date.now();
  }

  getSilenceDuration(): number {
    return Date.now() - this.lastSpeechTime;
  }

  accumulateText(text: string): void {
    this.accumulatedText += ' ' + text;
    this.accumulatedText = this.accumulatedText.trim();
    this.lastSpeechTime = Date.now();
  }

  getAccumulatedText(): string {
    return this.accumulatedText;
  }

  clearAccumulated(): void {
    this.accumulatedText = '';
  }

  // Extract the most recent complete question from accumulated text
  extractLatestQuestion(text: string): string {
    // Split by common sentence terminators
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    // Find the last sentence that looks like a question
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i].trim();
      const detection = this.detectQuestion(sentence + '?', 0);
      if (detection.confidence > 0.3) {
        return sentence;
      }
    }

    // If no clear question, return the last sentence
    return sentences[sentences.length - 1]?.trim() || text;
  }

  // AI-powered question detection for better accuracy on edge cases
  async detectQuestionWithAI(
    transcript: string,
    conversationContext?: string
  ): Promise<AIQuestionDetectionResult> {
    const cleanText = transcript.trim();

    if (!cleanText) {
      return {
        isQuestion: false,
        questionText: '',
        confidence: 0,
        language: 'en',
        aiParsed: false,
      };
    }

    try {
      const openai = getOpenAIClient();

      const systemPrompt = `You are an AI that analyzes transcripts to detect questions about Occupational Safety and Health (OSH) in the Philippines.

Analyze the given transcript and determine:
1. Is this a question or request for information about OSH?
2. If yes, what is the clean/reformulated question?
3. What is the user's intent?
4. What language is being used (English, Tagalog, or Taglish)?

Consider implicit questions like:
- "I want to know about PPE" → This IS a question (requesting PPE information)
- "Tell me about safety officers" → This IS a question (requesting info)
- "Requirements for registration" → This IS a question (asking about requirements)

Return a JSON object with these exact fields:
{
  "isQuestion": boolean,
  "questionText": "the clean question text",
  "confidence": 0.0-1.0,
  "intent": "brief description of what user wants",
  "language": "en" | "tl" | "taglish"
}`;

      const userPrompt = conversationContext
        ? `Context: ${conversationContext}\n\nTranscript: "${cleanText}"`
        : `Transcript: "${cleanText}"`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Fast and cost-effective for classification
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 150,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);

      return {
        isQuestion: Boolean(parsed.isQuestion),
        questionText: parsed.isQuestion ? (parsed.questionText || cleanText) : '',
        confidence: Math.min(Math.max(Number(parsed.confidence) || 0, 0), 1),
        language: (['en', 'tl', 'taglish'].includes(parsed.language) ? parsed.language : 'en') as DetectedLanguage,
        intent: parsed.intent || undefined,
        aiParsed: true,
      };
    } catch (error) {
      console.error('[QuestionDetector] AI detection error:', error);
      // Fall back to rule-based detection
      const ruleBasedResult = this.detectQuestion(cleanText, 0);
      return {
        ...ruleBasedResult,
        aiParsed: false,
      };
    }
  }

  // Hybrid detection: use rule-based first, AI for uncertain cases
  async detectQuestionHybrid(
    transcript: string,
    silenceDurationMs: number = 0,
    conversationContext?: string
  ): Promise<AIQuestionDetectionResult> {
    // First, run fast rule-based detection
    const ruleResult = this.detectQuestion(transcript, silenceDurationMs);

    // If high confidence from rules, use it immediately (fast path)
    if (ruleResult.confidence > 0.6) {
      console.log(`[QuestionDetector] High confidence rule-based: ${ruleResult.confidence.toFixed(2)}`);
      return {
        ...ruleResult,
        aiParsed: false,
      };
    }

    // If very low confidence, skip (not a question)
    if (ruleResult.confidence < 0.2) {
      console.log(`[QuestionDetector] Low confidence, skipping: ${ruleResult.confidence.toFixed(2)}`);
      return {
        ...ruleResult,
        aiParsed: false,
      };
    }

    // Uncertain case (0.2-0.6): use AI for better detection
    console.log(`[QuestionDetector] Uncertain (${ruleResult.confidence.toFixed(2)}), using AI detection`);
    return this.detectQuestionWithAI(transcript, conversationContext);
  }
}

export const questionDetector = new QuestionDetector();
