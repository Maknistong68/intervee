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
