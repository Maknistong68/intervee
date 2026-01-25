import { create } from 'zustand';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'paused' | 'ended';
export type AnswerStatus = 'idle' | 'listening' | 'processing' | 'ready';

export interface TranscriptInterpretation {
  original: string;
  interpreted: string;
  confidence: number;
  suggestedTopics?: string[];
  alternativeInterpretations?: string[];
}

export interface Exchange {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  timestamp: Date;
  responseTimeMs: number;
  // OSH Intelligence fields
  originalTranscript?: string;
  interpretedAs?: string;
  topic?: string;
  suggestedFollowUps?: string[];
}

export interface InterviewState {
  // Session state
  sessionId: string | null;
  sessionStatus: SessionStatus;
  startedAt: Date | null;

  // Current transcript
  currentTranscript: string;
  isPartialTranscript: boolean;

  // OSH Intelligence - Interpretation
  interpretation: TranscriptInterpretation | null;
  suggestedFollowUps: string[];

  // Current answer
  currentAnswer: string;
  answerConfidence: number;
  answerStatus: AnswerStatus;
  isStreaming: boolean;
  currentTopic: string | null;

  // History
  exchanges: Exchange[];

  // Recording state
  isRecording: boolean;

  // Error handling
  error: string | null;

  // Actions
  startSession: (sessionId: string) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;

  setTranscript: (text: string, isPartial: boolean) => void;
  clearTranscript: () => void;

  // OSH Intelligence actions
  setInterpretation: (interpretation: TranscriptInterpretation) => void;
  clearInterpretation: () => void;
  setSuggestedFollowUps: (followUps: string[]) => void;

  setAnswerGenerating: (question: string) => void;
  appendAnswerChunk: (chunk: string) => void;
  setAnswerReady: (answer: string, confidence: number, responseTimeMs: number, extras?: {
    originalTranscript?: string;
    interpretedAs?: string;
    topic?: string;
    suggestedFollowUps?: string[];
  }) => void;
  clearAnswer: () => void;

  setRecording: (isRecording: boolean) => void;
  setError: (error: string | null) => void;

  reset: () => void;
}

const initialState = {
  sessionId: null,
  sessionStatus: 'idle' as SessionStatus,
  startedAt: null,
  currentTranscript: '',
  isPartialTranscript: false,
  // OSH Intelligence
  interpretation: null as TranscriptInterpretation | null,
  suggestedFollowUps: [] as string[],
  currentTopic: null as string | null,
  // Answers
  currentAnswer: '',
  answerConfidence: 0,
  answerStatus: 'idle' as AnswerStatus,
  isStreaming: false,
  exchanges: [] as Exchange[],
  isRecording: false,
  error: null as string | null,
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  ...initialState,

  startSession: (sessionId: string) => {
    set({
      sessionId,
      sessionStatus: 'active',
      startedAt: new Date(),
      exchanges: [],
      error: null,
    });
  },

  endSession: () => {
    set({
      sessionStatus: 'ended',
      isRecording: false,
    });
  },

  pauseSession: () => {
    set({
      sessionStatus: 'paused',
      isRecording: false,
    });
  },

  resumeSession: () => {
    set({
      sessionStatus: 'active',
    });
  },

  setTranscript: (text: string, isPartial: boolean) => {
    set({
      currentTranscript: text,
      isPartialTranscript: isPartial,
      answerStatus: 'listening',
    });
  },

  clearTranscript: () => {
    set({
      currentTranscript: '',
      isPartialTranscript: false,
    });
  },

  // OSH Intelligence methods
  setInterpretation: (interpretation: TranscriptInterpretation) => {
    set({
      interpretation,
      // Update transcript to show interpreted version
      currentTranscript: interpretation.interpreted,
      isPartialTranscript: false,
    });
  },

  clearInterpretation: () => {
    set({
      interpretation: null,
    });
  },

  setSuggestedFollowUps: (followUps: string[]) => {
    set({
      suggestedFollowUps: followUps,
    });
  },

  setAnswerGenerating: (question: string) => {
    set({
      answerStatus: 'processing',
      currentAnswer: '',
      isStreaming: true,
    });
  },

  appendAnswerChunk: (chunk: string) => {
    set((state) => ({
      currentAnswer: state.currentAnswer + chunk,
    }));
  },

  setAnswerReady: (answer: string, confidence: number, responseTimeMs: number, extras?: {
    originalTranscript?: string;
    interpretedAs?: string;
    topic?: string;
    suggestedFollowUps?: string[];
  }) => {
    const state = get();
    const newExchange: Exchange = {
      id: Date.now().toString(),
      question: extras?.interpretedAs || state.currentTranscript,
      answer,
      confidence,
      timestamp: new Date(),
      responseTimeMs,
      // OSH Intelligence fields
      originalTranscript: extras?.originalTranscript,
      interpretedAs: extras?.interpretedAs,
      topic: extras?.topic,
      suggestedFollowUps: extras?.suggestedFollowUps,
    };

    set({
      currentAnswer: answer,
      answerConfidence: confidence,
      answerStatus: 'ready',
      isStreaming: false,
      exchanges: [...state.exchanges, newExchange],
      currentTopic: extras?.topic || null,
      suggestedFollowUps: extras?.suggestedFollowUps || [],
      // Clear interpretation after answer is ready
      interpretation: null,
    });
  },

  clearAnswer: () => {
    set({
      currentAnswer: '',
      answerConfidence: 0,
      answerStatus: 'idle',
      isStreaming: false,
    });
  },

  setRecording: (isRecording: boolean) => {
    set({ isRecording });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));
