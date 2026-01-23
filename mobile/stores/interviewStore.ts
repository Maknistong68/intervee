import { create } from 'zustand';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'paused' | 'ended';
export type AnswerStatus = 'idle' | 'listening' | 'processing' | 'ready';

export interface Exchange {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  timestamp: Date;
  responseTimeMs: number;
}

export interface InterviewState {
  // Session state
  sessionId: string | null;
  sessionStatus: SessionStatus;
  startedAt: Date | null;

  // Current transcript
  currentTranscript: string;
  isPartialTranscript: boolean;

  // Current answer
  currentAnswer: string;
  answerConfidence: number;
  answerStatus: AnswerStatus;
  isStreaming: boolean;

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

  setAnswerGenerating: (question: string) => void;
  appendAnswerChunk: (chunk: string) => void;
  setAnswerReady: (answer: string, confidence: number, responseTimeMs: number) => void;
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
  currentAnswer: '',
  answerConfidence: 0,
  answerStatus: 'idle' as AnswerStatus,
  isStreaming: false,
  exchanges: [],
  isRecording: false,
  error: null,
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

  setAnswerReady: (answer: string, confidence: number, responseTimeMs: number) => {
    const state = get();
    const newExchange: Exchange = {
      id: Date.now().toString(),
      question: state.currentTranscript,
      answer,
      confidence,
      timestamp: new Date(),
      responseTimeMs,
    };

    set({
      currentAnswer: answer,
      answerConfidence: confidence,
      answerStatus: 'ready',
      isStreaming: false,
      exchanges: [...state.exchanges, newExchange],
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
