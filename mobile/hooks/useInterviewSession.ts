import { useCallback, useEffect } from 'react';
import { useInterviewStore, TranscriptInterpretation } from '../stores/interviewStore';
import { useWebSocket } from './useWebSocket';
import { useAudioRecorder } from './useAudioRecorder';
import { storageService, StoredSession } from '../services/storageService';

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

  // Actions
  startInterview: () => Promise<boolean>;
  stopInterview: () => Promise<void>;
  pauseInterview: () => void;
  resumeInterview: () => void;

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
    hasPermission,
    requestPermission,
  } = useAudioRecorder();

  const startInterview = useCallback(async (): Promise<boolean> => {
    try {
      // Reset any previous state
      reset();

      // Connect to server if not connected
      if (!isConnected) {
        await connect();
      }

      // Request microphone permission if needed
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Start the session on the server
      startSession();

      // Start recording audio
      const success = await startRecording();
      if (!success) {
        endSession();
        return false;
      }

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
    startRecording,
    endSession,
  ]);

  const stopInterview = useCallback(async (): Promise<void> => {
    // Stop recording
    await stopRecording();

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
  }, [stopRecording, endSession, sessionId, exchanges]);

  const pauseInterview = useCallback(() => {
    stopRecording();
    pauseSession();
  }, [stopRecording, pauseSession]);

  const resumeInterview = useCallback(async () => {
    resumeSession();
    await startRecording();
  }, [resumeSession, startRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
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
    // Actions
    startInterview,
    stopInterview,
    pauseInterview,
    resumeInterview,
    error: storeError || socketError,
  };
}
