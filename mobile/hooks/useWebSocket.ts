import { useEffect, useCallback, useState } from 'react';
import { socketService, SocketEvents } from '../services/socketService';
import { useInterviewStore } from '../stores/interviewStore';
import { storageService, LanguagePreference } from '../services/storageService';

export interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  startSession: () => void;
  endSession: () => void;
  setLanguagePreference: (lang: LanguagePreference) => void;
  error: string | null;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    startSession: storeStartSession,
    endSession: storeEndSession,
    setTranscript,
    setAnswerGenerating,
    appendAnswerChunk,
    setAnswerReady,
    setError: storeSetError,
  } = useInterviewStore();

  // Set up event handlers
  useEffect(() => {
    const handlers: Partial<SocketEvents> = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },

      onDisconnect: () => {
        setIsConnected(false);
      },

      onSessionStarted: ({ sessionId }) => {
        console.log('[WebSocket] Session started:', sessionId);
        storeStartSession(sessionId);
      },

      onSessionEnded: ({ sessionId, exchangeCount }) => {
        console.log('[WebSocket] Session ended:', sessionId);
        storeEndSession();
      },

      onTranscriptPartial: ({ text, timestamp }) => {
        setTranscript(text, true);
      },

      onTranscriptFinal: ({ text, language, confidence }) => {
        setTranscript(text, false);
      },

      onAnswerGenerating: ({ questionText }) => {
        console.log('[WebSocket] Generating answer for:', questionText.substring(0, 50));
        setAnswerGenerating(questionText);
      },

      onAnswerStream: ({ chunk, done }) => {
        if (!done && chunk) {
          appendAnswerChunk(chunk);
        }
      },

      onAnswerReady: ({ answer, confidence, responseTimeMs }) => {
        console.log('[WebSocket] Answer ready, confidence:', confidence);
        setAnswerReady(answer, confidence, responseTimeMs);
      },

      onError: ({ message, code }) => {
        console.error('[WebSocket] Error:', code, message);
        setError(message);
        storeSetError(message);
      },

      // PTT-specific events
      onPTTTranscribing: ({ durationMs, sizeBytes }) => {
        console.log(`[WebSocket] PTT transcribing: ${durationMs}ms, ${sizeBytes} bytes`);
        // Could update a loading state here
      },

      onPTTComplete: ({ fullTranscript, durationMs }) => {
        console.log(`[WebSocket] PTT complete: "${fullTranscript.substring(0, 50)}..." (${durationMs}ms)`);
        // Transcript is already handled by onTranscriptFinal
      },
    };

    socketService.setEventHandlers(handlers);
  }, [
    storeStartSession,
    storeEndSession,
    setTranscript,
    setAnswerGenerating,
    appendAnswerChunk,
    setAnswerReady,
    storeSetError,
  ]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      await socketService.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  const startSession = useCallback(async () => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    // Get language preference from settings
    const settings = await storageService.getSettings();
    socketService.startSession(settings.languagePreference);
  }, [isConnected]);

  const endSession = useCallback(() => {
    socketService.endSession();
  }, []);

  const setLanguagePreference = useCallback((lang: LanguagePreference) => {
    socketService.setLanguagePreference(lang);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    startSession,
    endSession,
    setLanguagePreference,
    error,
  };
}
