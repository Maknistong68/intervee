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

// WebSocket Events
export interface ServerToClientEvents {
  'transcript:partial': (data: { text: string; timestamp: number }) => void;
  'transcript:final': (data: TranscriptionResult) => void;
  'answer:generating': (data: { questionText: string }) => void;
  'answer:ready': (data: AnswerResult) => void;
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
  // PTT-specific events
  'ptt:start': () => void;
  'ptt:end': () => void;
}

export interface InterSocketData {
  sessionId?: string;
  audioBuffer: Buffer[];
  lastTranscript: string;
}
