import { create } from 'zustand';

export type ReviewerStatus = 'idle' | 'configuring' | 'active' | 'evaluating' | 'completed';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'SCENARIO_BASED';

export interface ReviewerQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  sourceRule: string;
  options?: string[];
  questionOrder: number;
}

export interface EvaluationResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer?: string | number | boolean;
  keyPointsFound?: string[];
  keyPointsMissed?: string[];
}

export interface AnsweredQuestion {
  question: ReviewerQuestion;
  userAnswer: string | number | boolean;
  evaluation: EvaluationResult;
  timeSpentSec: number;
}

export interface SessionSummary {
  sessionId: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  score: number;
  byType: Record<QuestionType, { total: number; correct: number }>;
  byDifficulty: Record<DifficultyLevel, { total: number; correct: number }>;
  weakAreas: string[];
  strongAreas: string[];
  averageTimePerQuestion: number;
}

export interface ReviewerState {
  // Session
  sessionId: string | null;
  status: ReviewerStatus;

  // Settings
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  focusAreas: string[];
  questionCount: number;
  timed: boolean;
  timeLimitPerQ: number;
  language: string;

  // Current question
  currentQuestion: ReviewerQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  timeRemaining: number | null;
  questionStartTime: number | null;

  // User input
  userAnswer: string;
  selectedOption: number | null;
  selectedBoolean: boolean | null;

  // Results
  evaluation: EvaluationResult | null;
  correctCount: number;
  history: AnsweredQuestion[];
  summary: SessionSummary | null;

  // Error handling
  error: string | null;
  isLoading: boolean;

  // Actions - Settings
  setDifficulty: (difficulty: DifficultyLevel) => void;
  setQuestionTypes: (types: QuestionType[]) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setFocusAreas: (areas: string[]) => void;
  toggleFocusArea: (area: string) => void;
  setQuestionCount: (count: number) => void;
  setTimed: (timed: boolean) => void;
  setTimeLimitPerQ: (seconds: number) => void;
  setLanguage: (language: string) => void;

  // Actions - Session
  startSession: (sessionId: string, firstQuestion: ReviewerQuestion) => void;
  setQuestion: (question: ReviewerQuestion) => void;
  setTimeRemaining: (seconds: number | null) => void;
  decrementTime: () => void;

  // Actions - Answers
  setUserAnswer: (answer: string) => void;
  setSelectedOption: (index: number | null) => void;
  setSelectedBoolean: (value: boolean | null) => void;
  submitAnswer: () => { answer: string | number | boolean; timeSpentSec: number } | null;

  // Actions - Evaluation
  setEvaluation: (evaluation: EvaluationResult) => void;
  nextQuestion: () => void;

  // Actions - Results
  setSessionComplete: (summary: SessionSummary) => void;

  // Actions - State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  resetToConfig: () => void;
}

const initialSettings = {
  difficulty: 'MEDIUM' as DifficultyLevel,
  questionTypes: ['MULTIPLE_CHOICE', 'TRUE_FALSE'] as QuestionType[],
  focusAreas: [] as string[],
  questionCount: 10,
  timed: false,
  timeLimitPerQ: 60,
  language: 'en',
};

const initialState = {
  sessionId: null,
  status: 'idle' as ReviewerStatus,

  ...initialSettings,

  currentQuestion: null,
  currentIndex: 0,
  totalQuestions: 0,
  timeRemaining: null,
  questionStartTime: null,

  userAnswer: '',
  selectedOption: null,
  selectedBoolean: null,

  evaluation: null,
  correctCount: 0,
  history: [],
  summary: null,

  error: null,
  isLoading: false,
};

export const useReviewerStore = create<ReviewerState>((set, get) => ({
  ...initialState,

  // Settings actions
  setDifficulty: (difficulty) => set({ difficulty }),

  setQuestionTypes: (types) => set({ questionTypes: types }),

  toggleQuestionType: (type) => {
    const current = get().questionTypes;
    if (current.includes(type)) {
      // Don't remove if it's the only one
      if (current.length > 1) {
        set({ questionTypes: current.filter((t) => t !== type) });
      }
    } else {
      set({ questionTypes: [...current, type] });
    }
  },

  setFocusAreas: (areas) => set({ focusAreas: areas }),

  toggleFocusArea: (area) => {
    const current = get().focusAreas;
    if (current.includes(area)) {
      set({ focusAreas: current.filter((a) => a !== area) });
    } else {
      set({ focusAreas: [...current, area] });
    }
  },

  setQuestionCount: (count) => set({ questionCount: Math.max(1, Math.min(50, count)) }),

  setTimed: (timed) => set({ timed }),

  setTimeLimitPerQ: (seconds) => set({ timeLimitPerQ: Math.max(10, seconds) }),

  setLanguage: (language) => set({ language }),

  // Session actions
  startSession: (sessionId, firstQuestion) => {
    const state = get();
    set({
      sessionId,
      status: 'active',
      currentQuestion: firstQuestion,
      currentIndex: 1,
      totalQuestions: state.questionCount,
      timeRemaining: state.timed ? state.timeLimitPerQ : null,
      questionStartTime: Date.now(),
      userAnswer: '',
      selectedOption: null,
      selectedBoolean: null,
      evaluation: null,
      correctCount: 0,
      history: [],
      summary: null,
      error: null,
    });
  },

  setQuestion: (question) => {
    const state = get();
    set({
      currentQuestion: question,
      currentIndex: question.questionOrder,
      timeRemaining: state.timed ? state.timeLimitPerQ : null,
      questionStartTime: Date.now(),
      userAnswer: '',
      selectedOption: null,
      selectedBoolean: null,
      evaluation: null,
      status: 'active',
    });
  },

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  decrementTime: () => {
    const state = get();
    if (state.timeRemaining !== null && state.timeRemaining > 0) {
      set({ timeRemaining: state.timeRemaining - 1 });
    }
  },

  // Answer actions
  setUserAnswer: (answer) => set({ userAnswer: answer }),

  setSelectedOption: (index) => set({ selectedOption: index }),

  setSelectedBoolean: (value) => set({ selectedBoolean: value }),

  submitAnswer: () => {
    const state = get();
    if (!state.currentQuestion) return null;

    let answer: string | number | boolean;

    switch (state.currentQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        if (state.selectedOption === null) return null;
        answer = state.selectedOption;
        break;
      case 'TRUE_FALSE':
        if (state.selectedBoolean === null) return null;
        answer = state.selectedBoolean;
        break;
      case 'OPEN_ENDED':
      case 'SCENARIO_BASED':
        if (!state.userAnswer.trim()) return null;
        answer = state.userAnswer;
        break;
      default:
        return null;
    }

    const timeSpentSec = state.questionStartTime
      ? Math.round((Date.now() - state.questionStartTime) / 1000)
      : 0;

    set({ status: 'evaluating' });

    return { answer, timeSpentSec };
  },

  // Evaluation actions
  setEvaluation: (evaluation) => {
    const state = get();
    if (!state.currentQuestion) return;

    const answeredQuestion: AnsweredQuestion = {
      question: state.currentQuestion,
      userAnswer:
        state.currentQuestion.questionType === 'MULTIPLE_CHOICE'
          ? state.selectedOption!
          : state.currentQuestion.questionType === 'TRUE_FALSE'
          ? state.selectedBoolean!
          : state.userAnswer,
      evaluation,
      timeSpentSec: state.questionStartTime
        ? Math.round((Date.now() - state.questionStartTime) / 1000)
        : 0,
    };

    set({
      evaluation,
      correctCount: state.correctCount + (evaluation.isCorrect ? 1 : 0),
      history: [...state.history, answeredQuestion],
    });
  },

  nextQuestion: () => {
    set({
      evaluation: null,
      userAnswer: '',
      selectedOption: null,
      selectedBoolean: null,
    });
  },

  // Results actions
  setSessionComplete: (summary) => {
    set({
      status: 'completed',
      summary,
    });
  },

  // State actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),

  resetToConfig: () => {
    const state = get();
    set({
      ...initialState,
      // Preserve settings
      difficulty: state.difficulty,
      questionTypes: state.questionTypes,
      focusAreas: state.focusAreas,
      questionCount: state.questionCount,
      timed: state.timed,
      timeLimitPerQ: state.timeLimitPerQ,
      language: state.language,
      status: 'configuring',
    });
  },
}));
