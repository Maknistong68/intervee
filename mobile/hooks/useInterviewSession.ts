import { useCallback, useEffect } from 'react';
import { useInterviewStore, TranscriptInterpretation } from '../stores/interviewStore';
import { useWebSocket } from './useWebSocket';
import { useAudioRecorder } from './useAudioRecorder';
import { storageService, StoredSession } from '../services/storageService';
import type { PTTState } from '../components/PTTButton';

export interface UseInterviewSessionReturn {
  // State
  isActive: boolean;
  isRecording: boolean;
  isConnected: boolean;
  sessionStatus: string;

  // Current data
  currentTranscript: string;
  currentAnswer: string;
  answerConfidence: number;
  answerStatus: string;
  isStreaming: boolean;

  // OSH Intelligence data
  interpretation: TranscriptInterpretation | null;
  suggestedFollowUps: string[];
  currentTopic: string | null;

  // PTT state (for toggle button UI)
  pttState: PTTState;
  volume: number;
  networkError: string | null;

  // Actions
  startInterview: () => Promise<boolean>;
  stopInterview: () => Promise<void>;
  pauseInterview: () => void;
  resumeInterview: () => void;

  // PTT Actions (for toggle button)
  startPTTRecording: () => Promise<boolean>;
  stopPTTRecording: () => Promise<void>;
  cancelPTTRecording: () => Promise<void>;

  // Errors
  error: string | null;
}

export function useInterviewSession(): UseInterviewSessionReturn {
  const {
    sessionId,
    sessionStatus,
    currentTranscript,
    currentAnswer,
    answerConfidence,
    answerStatus,
    isStreaming,
    isRecording,
    exchanges,
    error: storeError,
    pauseSession,
    resumeSession,
    reset,
    // OSH Intelligence fields
    interpretation,
    suggestedFollowUps,
    currentTopic,
  } = useInterviewStore();

  const {
    isConnected,
    connect,
    disconnect,
    startSession,
    endSession,
    error: socketError,
  } = useWebSocket();

  const {
    startRecording,
    stopRecording,
    cancelRecording,
    hasPermission,
    requestPermission,
    pttState,
    volume,
    networkError,
  } = useAudioRecorder();

  const startInterview = useCallback(async (): Promise<boolean> => {
    try {
      // Reset any previous state
      reset();

      // Connect to server if not connected
      if (!isConnected) {
        await connect();
      }

      // Request microphone permission if needed (for PTT later)
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Start the session on the server
      // Note: Recording is now handled separately via PTT toggle
      startSession();

      return true;
    } catch (error) {
      console.error('[useInterviewSession] Failed to start interview:', error);
      return false;
    }
  }, [
    reset,
    isConnected,
    connect,
    hasPermission,
    requestPermission,
    startSession,
  ]);

  const stopInterview = useCallback(async (): Promise<void> => {
    // Cancel any active recording
    if (pttState === 'recording') {
      await cancelRecording();
    }

    // End session on server
    endSession();

    // Save session to local storage
    if (sessionId) {
      const session: StoredSession = {
        id: sessionId,
        startedAt: useInterviewStore.getState().startedAt?.toISOString() || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        exchanges: exchanges,
      };
      await storageService.saveSession(session);
    }
  }, [pttState, cancelRecording, endSession, sessionId, exchanges]);

  const pauseInterview = useCallback(() => {
    if (pttState === 'recording') {
      cancelRecording();
    }
    pauseSession();
  }, [pttState, cancelRecording, pauseSession]);

  const resumeInterview = useCallback(async () => {
    resumeSession();
    // Don't auto-start recording - user will tap PTT when ready
  }, [resumeSession]);

  // PTT recording functions (pass through from useAudioRecorder)
  const startPTTRecording = useCallback(async (): Promise<boolean> => {
    return startRecording();
  }, [startRecording]);

  const stopPTTRecording = useCallback(async (): Promise<void> => {
    return stopRecording();
  }, [stopRecording]);

  const cancelPTTRecording = useCallback(async (): Promise<void> => {
    return cancelRecording();
  }, [cancelRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pttState === 'recording') {
        cancelRecording();
      }
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  return {
    isActive: sessionStatus === 'active',
    isRecording,
    isConnected,
    sessionStatus,
    currentTranscript,
    currentAnswer,
    answerConfidence,
    answerStatus,
    isStreaming,
    // OSH Intelligence
    interpretation,
    suggestedFollowUps,
    currentTopic,
    // PTT state
    pttState,
    volume,
    networkError,
    // Actions
    startInterview,
    stopInterview,
    pauseInterview,
    resumeInterview,
    // PTT Actions
    startPTTRecording,
    stopPTTRecording,
    cancelPTTRecording,
    error: storeError || socketError,
  };
}
