import { QuestionDetectionResult } from '../types/index.js';
import { detectLanguage } from '../utils/languageDetector.js';

// Question keywords in English and Tagalog
const QUESTION_KEYWORDS = {
  en: [
    'what', 'who', 'where', 'when', 'why', 'how',
    'which', 'whose', 'whom', 'is', 'are', 'do', 'does',
    'can', 'could', 'would', 'should', 'will', 'shall',
    'have', 'has', 'did', 'was', 'were', 'explain', 'describe',
    'tell me', 'define', 'state', 'enumerate', 'list',
  ],
  tl: [
    'ano', 'sino', 'saan', 'kailan', 'bakit', 'paano',
    'alin', 'kanino', 'ilan', 'magkano', 'gaano',
    'ba', 'kaya', 'pwede', 'puwede', 'maari', 'maaari',
    'ipaliwanag', 'sabihin', 'banggitin', 'ilista',
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

    // Check 2: Starts with question word
    const words = cleanText.toLowerCase().split(/\s+/);
    const firstWord = words[0];
    const questionWords = [...QUESTION_KEYWORDS.en, ...QUESTION_KEYWORDS.tl];

    if (questionWords.includes(firstWord)) {
      isQuestion = true;
      confidence += 0.3;
    }

    // Check 3: Contains "ba" (Tagalog question particle)
    if (words.includes('ba') || words.includes('ba?')) {
      isQuestion = true;
      confidence += 0.2;
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

    // Normalize confidence
    confidence = Math.min(confidence, 1.0);

    // Only consider it a question if confidence meets threshold
    if (confidence < 0.35) {
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
}

export const questionDetector = new QuestionDetector();
