// Shared types between mobile and backend

export interface AudioChunk {
  data: string; // Base64 encoded audio
  timestamp: number;
  duration: number;
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

export interface AnswerResult {
  answer: string;
  confidence: number;
  citations: Citation[];
  responseTimeMs: number;
  cached: boolean;
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

// WebSocket Events - Client to Server
export interface ClientToServerEvents {
  'audio:chunk': (data: AudioChunk) => void;
  'session:start': () => void;
  'session:end': () => void;
}

// WebSocket Events - Server to Client
export interface ServerToClientEvents {
  'transcript:partial': (data: { text: string; timestamp: number }) => void;
  'transcript:final': (data: TranscriptionResult) => void;
  'answer:generating': (data: { questionText: string }) => void;
  'answer:ready': (data: AnswerResult) => void;
  'answer:stream': (data: { chunk: string; done: boolean }) => void;
  'session:started': (data: { sessionId: string }) => void;
  'session:ended': (data: { sessionId: string; exchangeCount: number }) => void;
  'error': (data: { message: string; code: string }) => void;
}

// OSH Rule structure
export interface OSHRule {
  id: string;
  ruleNumber: string;
  title: string;
  content: string;
  keywords: string[];
  amendments: Amendment[];
}

export interface Amendment {
  id: string;
  type: 'DO' | 'LA' | 'DA';
  number: string;
  series: string;
  title?: string;
  description: string;
  effectiveDate?: Date;
}

// Exchange/Q&A structure
export interface Exchange {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  language: 'en' | 'tl' | 'taglish';
  responseTimeMs: number;
  timestamp: Date;
  citations?: Citation[];
}

// Session structure
export interface InterviewSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  exchanges: Exchange[];
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

export interface ReviewerSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  difficulty: DifficultyLevel;
  questionTypes: ReviewerQuestionType[];
  focusAreas: string[];
  totalQuestions: number;
  timeLimitPerQ?: number;
  language: string;
  score?: number;
  completedCount: number;
}

export interface ReviewerQuestion {
  id: string;
  sessionId: string;
  questionText: string;
  questionType: ReviewerQuestionType;
  difficulty: DifficultyLevel;
  sourceRule: string;
  options?: string[]; // For multiple choice
  correctIndex?: number; // For multiple choice: 0-3
  correctAnswer?: boolean; // For true/false
  expectedAnswer?: string; // For open-ended
  keyPoints?: string[];
  userAnswer?: string;
  userAnswerAt?: Date;
  timeSpentSec?: number;
  isCorrect?: boolean;
  score?: number; // 0-1 for partial credit
  feedback?: string;
  questionOrder: number;
}

export interface ReviewerAnswerSubmission {
  questionId: string;
  answer: string | number | boolean; // text, option index, or true/false
  timeSpentSec: number;
}

export interface ReviewerEvaluation {
  questionId: string;
  isCorrect: boolean;
  score: number; // 0-1
  feedback: string;
  correctAnswer?: string | number | boolean;
  keyPointsFound?: string[];
  keyPointsMissed?: string[];
}

export interface ReviewerSessionSummary {
  sessionId: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  score: number; // Percentage
  byType: Record<ReviewerQuestionType, { total: number; correct: number }>;
  byDifficulty: Record<DifficultyLevel, { total: number; correct: number }>;
  weakAreas: string[]; // Rules with low scores
  strongAreas: string[]; // Rules with high scores
  averageTimePerQuestion: number;
}

// Reviewer WebSocket Events
export interface ReviewerClientToServerEvents {
  'reviewer:startSession': (config: ReviewerSessionConfig) => void;
  'reviewer:submitAnswer': (data: ReviewerAnswerSubmission) => void;
  'reviewer:requestNext': () => void;
  'reviewer:endSession': () => void;
}

export interface ReviewerServerToClientEvents {
  'reviewer:sessionStarted': (data: { sessionId: string; firstQuestion: ReviewerQuestion }) => void;
  'reviewer:question': (data: ReviewerQuestion) => void;
  'reviewer:evaluation': (data: ReviewerEvaluation) => void;
  'reviewer:timeUp': (data: { questionId: string }) => void;
  'reviewer:sessionComplete': (data: ReviewerSessionSummary) => void;
  'reviewer:error': (data: { message: string; code: string }) => void;
}
