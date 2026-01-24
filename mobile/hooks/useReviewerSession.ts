import { useCallback, useEffect, useRef } from 'react';
import { useReviewerStore } from '../stores/reviewerStore';
import { socketService, ReviewerSessionConfig } from '../services/socketService';
import { useAudioRecorder } from './useAudioRecorder';

export interface UseReviewerSessionReturn {
  // State
  status: string;
  isLoading: boolean;
  isConnected: boolean;

  // Current question
  currentQuestion: any;
  currentIndex: number;
  totalQuestions: number;
  timeRemaining: number | null;

  // Answers
  userAnswer: string;
  selectedOption: number | null;
  selectedBoolean: boolean | null;

  // Evaluation
  evaluation: any;
  correctCount: number;

  // Results
  summary: any;
  history: any[];

  // Settings
  difficulty: string;
  questionTypes: string[];
  focusAreas: string[];
  questionCount: number;
  timed: boolean;
  timeLimitPerQ: number;

  // Actions - Settings
  setDifficulty: (difficulty: any) => void;
  toggleQuestionType: (type: any) => void;
  toggleFocusArea: (area: string) => void;
  setQuestionCount: (count: number) => void;
  setTimed: (timed: boolean) => void;
  setTimeLimitPerQ: (seconds: number) => void;

  // Actions - Session
  startSession: () => Promise<boolean>;
  endSession: () => void;

  // Actions - Answer
  setUserAnswer: (answer: string) => void;
  setSelectedOption: (index: number | null) => void;
  setSelectedBoolean: (value: boolean | null) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;

  // Actions - Voice
  startVoiceInput: () => Promise<boolean>;
  stopVoiceInput: () => void;
  isRecordingVoice: boolean;

  // Actions - Results
  resetToConfig: () => void;
  reset: () => void;

  // Error
  error: string | null;
}

export function useReviewerSession(): UseReviewerSessionReturn {
  const store = useReviewerStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  const {
    startRecording,
    stopRecording,
    isRecording: isRecordingVoice,
    hasPermission,
    requestPermission,
  } = useAudioRecorder();

  // Set up socket event handlers
  useEffect(() => {
    socketService.setEventHandlers({
      onConnect: () => {
        isConnectedRef.current = true;
      },
      onDisconnect: () => {
        isConnectedRef.current = false;
      },
      onReviewerSessionStarted: ({ sessionId, firstQuestion }) => {
        store.startSession(sessionId, firstQuestion);
        store.setLoading(false);
      },
      onReviewerQuestion: (question) => {
        store.setQuestion(question);
      },
      onReviewerEvaluation: (evaluation) => {
        store.setEvaluation(evaluation);
      },
      onReviewerTimeUp: ({ questionId }) => {
        // Auto-submit with current answer when time is up
        const submission = store.submitAnswer();
        if (submission) {
          socketService.submitReviewerAnswer(
            questionId,
            submission.answer,
            submission.timeSpentSec
          );
        }
      },
      onReviewerSessionComplete: (summary) => {
        store.setSessionComplete(summary);
        clearTimer();
      },
      onReviewerError: ({ message }) => {
        store.setError(message);
        store.setLoading(false);
      },
      // Handle voice transcription for answers
      onTranscriptFinal: ({ text }) => {
        if (store.status === 'active' && store.currentQuestion) {
          const qType = store.currentQuestion.questionType;
          if (qType === 'OPEN_ENDED' || qType === 'SCENARIO_BASED') {
            store.setUserAnswer(store.userAnswer + ' ' + text);
          }
        }
      },
    });

    return () => {
      clearTimer();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (store.timed && store.status === 'active' && store.timeRemaining !== null) {
      timerRef.current = setInterval(() => {
        store.decrementTime();
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [store.status, store.timed, store.currentQuestion?.id]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSession = useCallback(async (): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.setError(null);

      // Connect to server if not connected
      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      // Build config
      const config: ReviewerSessionConfig = {
        difficulty: store.difficulty,
        questionTypes: store.questionTypes,
        focusAreas: store.focusAreas,
        totalQuestions: store.questionCount,
        timeLimitPerQ: store.timed ? store.timeLimitPerQ : undefined,
        language: store.language,
      };

      // Start session via WebSocket
      socketService.startReviewerSession(config);

      return true;
    } catch (error) {
      console.error('[useReviewerSession] Failed to start session:', error);
      store.setError('Failed to start session');
      store.setLoading(false);
      return false;
    }
  }, [store.difficulty, store.questionTypes, store.focusAreas, store.questionCount, store.timed, store.timeLimitPerQ, store.language]);

  const endSession = useCallback(() => {
    clearTimer();
    socketService.endReviewerSession();
  }, [clearTimer]);

  const submitAnswer = useCallback(() => {
    const submission = store.submitAnswer();
    if (submission && store.currentQuestion) {
      clearTimer();
      socketService.submitReviewerAnswer(
        store.currentQuestion.id,
        submission.answer,
        submission.timeSpentSec
      );
    }
  }, [store.currentQuestion, clearTimer]);

  const nextQuestion = useCallback(() => {
    store.nextQuestion();
    socketService.requestNextQuestion();
  }, []);

  const startVoiceInput = useCallback(async (): Promise<boolean> => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    // Start PTT recording (new approach - no chunking, sends complete audio on stop)
    return startRecording();
  }, [hasPermission, requestPermission, startRecording]);

  const stopVoiceInput = useCallback(async () => {
    // Stop recording - this sends complete audio to server via ptt:audio event
    await stopRecording();
  }, [stopRecording]);

  return {
    // State
    status: store.status,
    isLoading: store.isLoading,
    isConnected: isConnectedRef.current,

    // Current question
    currentQuestion: store.currentQuestion,
    currentIndex: store.currentIndex,
    totalQuestions: store.totalQuestions,
    timeRemaining: store.timeRemaining,

    // Answers
    userAnswer: store.userAnswer,
    selectedOption: store.selectedOption,
    selectedBoolean: store.selectedBoolean,

    // Evaluation
    evaluation: store.evaluation,
    correctCount: store.correctCount,

    // Results
    summary: store.summary,
    history: store.history,

    // Settings
    difficulty: store.difficulty,
    questionTypes: store.questionTypes,
    focusAreas: store.focusAreas,
    questionCount: store.questionCount,
    timed: store.timed,
    timeLimitPerQ: store.timeLimitPerQ,

    // Actions - Settings
    setDifficulty: store.setDifficulty,
    toggleQuestionType: store.toggleQuestionType,
    toggleFocusArea: store.toggleFocusArea,
    setQuestionCount: store.setQuestionCount,
    setTimed: store.setTimed,
    setTimeLimitPerQ: store.setTimeLimitPerQ,

    // Actions - Session
    startSession,
    endSession,

    // Actions - Answer
    setUserAnswer: store.setUserAnswer,
    setSelectedOption: store.setSelectedOption,
    setSelectedBoolean: store.setSelectedBoolean,
    submitAnswer,
    nextQuestion,

    // Actions - Voice
    startVoiceInput,
    stopVoiceInput,
    isRecordingVoice,

    // Actions - Results
    resetToConfig: store.resetToConfig,
    reset: store.reset,

    // Error
    error: store.error,
  };
}
