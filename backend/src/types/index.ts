export interface AudioChunk {
  data: string; // Base64 encoded audio
  timestamp: number;
  duration: number;
}

/**
 * PTT complete audio payload - sent after recording stops
 * Contains the full audio file (not chunks)
 */
export interface PTTAudioPayload {
  data: string;       // Base64 encoded complete audio file
  durationMs: number; // Total recording duration in milliseconds
  format: string;     // Audio format (wav, m4a)
  timestamp: number;  // Timestamp when recording ended
}

export interface TranscriptionResult {
  text: string;
  language: 'en' | 'tl' | 'taglish';
  confidence: number;
  isFinal: boolean;
}

export interface QuestionDetectionResult {
  isQuestion: boolean;
  questionText: string;
  confidence: number;
  language: 'en' | 'tl' | 'taglish';
}

export type QuestionType = 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL';

export interface AnswerResult {
  answer: string;
  confidence: number;
  citations: Citation[];
  responseTimeMs: number;
  cached: boolean;
  questionType?: QuestionType;
}

export interface Citation {
  type: 'rule' | 'do' | 'la' | 'ra';
  reference: string;
  title?: string;
}

export interface SessionState {
  id: string;
  isActive: boolean;
  startedAt: Date;
  currentTranscript: string;
  exchangeCount: number;
}

// ===============================
// OSH Intelligence Types
// ===============================

export type DetectedIntent = 'specific' | 'procedural' | 'generic' | 'list';

export interface TranscriptInterpretation {
  original: string;
  interpreted: string;
  confidence: number;
  suggestedTopics?: string[];
  alternativeInterpretations?: string[];
}

export interface OSHAnswerReadyData extends AnswerResult {
  originalTranscript?: string;
  interpretedAs?: string;
  topic?: string;
  suggestedFollowUps?: string[];
}

// WebSocket Events
export interface ServerToClientEvents {
  'transcript:partial': (data: { text: string; timestamp: number }) => void;
  'transcript:final': (data: TranscriptionResult) => void;
  'transcript:interpreted': (data: TranscriptInterpretation) => void;
  'answer:generating': (data: { questionText: string }) => void;
  'answer:ready': (data: AnswerResult | OSHAnswerReadyData) => void;
  'answer:stream': (data: { chunk: string; done: boolean }) => void;
  'session:started': (data: { sessionId: string }) => void;
  'session:ended': (data: { sessionId: string; exchangeCount: number }) => void;
  'context:cleared': (data: { sessionId: string }) => void;
  'error': (data: { message: string; code: string }) => void;
  // PTT-specific events
  'ptt:transcribing': (data: { durationMs: number; sizeBytes: number }) => void;
  'ptt:complete': (data: { fullTranscript: string; durationMs: number }) => void;
}

export type LanguagePreference = 'eng' | 'fil' | 'mix';

export interface ClientToServerEvents {
  'audio:chunk': (data: AudioChunk) => void;
  'session:start': (data?: { languagePreference?: LanguagePreference }) => void;
  'session:setLanguage': (data: { languagePreference: LanguagePreference }) => void;
  'session:end': () => void;
  'context:reset': () => void;
  // PTT-specific events (legacy chunking approach)
  'ptt:start': () => void;
  'ptt:end': () => void;
  // PTT complete audio (new approach - no chunking)
  'ptt:audio': (data: PTTAudioPayload) => void;
}

export interface InterSocketData {
  sessionId?: string;
  audioBuffer: Buffer[];
  lastTranscript: string;
}

// ===============================
// Reviewer App Types
// ===============================

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type ReviewerQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'SCENARIO_BASED';

export interface ReviewerSessionConfig {
  difficulty: DifficultyLevel;
  questionTypes: ReviewerQuestionType[];
  focusAreas: string[]; // Rule numbers, DOs, LAs
  totalQuestions: number;
  timeLimitPerQ?: number; // Seconds (null = untimed)
  language: string;
}

export interface ReviewerQuestionData {
  id: string;
  sessionId: string;
  questionText: string;
  questionType: ReviewerQuestionType;
  difficulty: DifficultyLevel;
  sourceRule: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: boolean;
  expectedAnswer?: string;
  keyPoints?: string[];
  questionOrder: number;
}

export interface ReviewerAnswerSubmission {
  questionId: string;
  answer: string | number | boolean;
  timeSpentSec: number;
}

export interface ReviewerEvaluation {
  questionId: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer?: string | number | boolean;
  keyPointsFound?: string[];
  keyPointsMissed?: string[];
}

export interface GeneratedQuestion {
  questionText: string;
  questionType: ReviewerQuestionType;
  difficulty: DifficultyLevel;
  sourceRule: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: boolean;
  expectedAnswer?: string;
  keyPoints?: string[];
}

export interface ReviewerSessionSummary {
  sessionId: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  score: number;
  byType: Record<ReviewerQuestionType, { total: number; correct: number }>;
  byDifficulty: Record<DifficultyLevel, { total: number; correct: number }>;
  weakAreas: string[];
  strongAreas: string[];
  averageTimePerQuestion: number;
}
