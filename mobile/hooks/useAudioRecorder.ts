import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { audioStorageService } from '../services/audioStorageService';
import { socketService } from '../services/socketService';
import { useInterviewStore } from '../stores/interviewStore';
import type { PTTState } from '../components/PTTButton';

export interface UseAudioRecorderReturn {
  // State
  isRecording: boolean;
  pttState: PTTState;
  hasPermission: boolean | null;
  volume: number; // 0-1 for visual feedback
  isSending: boolean; // True while audio is being sent to server
  networkError: string | null; // Network error message if any

  // Actions
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [pttState, setPttState] = useState<PTTState>('idle');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Track current stored recording ID for cleanup after successful send
  const currentStoredIdRef = useRef<string | null>(null);

  const { setRecording, sessionStatus } = useInterviewStore();

  // Initialize audio storage and cleanup stale recordings on mount
  useEffect(() => {
    const init = async () => {
      // Request permission
      const granted = await audioService.requestPermissions();
      setHasPermission(granted);

      // Cleanup stale recordings from previous sessions
      const cleaned = await audioService.cleanupStaleRecordings();
      if (cleaned > 0) {
        console.log(`[useAudioRecorder] Cleaned ${cleaned} stale recordings on startup`);
      }
    };
    init();
  }, []);

  // Listen for successful server response to delete stored recording
  useEffect(() => {
    const handlePTTComplete = () => {
      // Server confirmed receipt - safe to delete stored recording
      if (currentStoredIdRef.current) {
        audioService.deleteStoredRecording(currentStoredIdRef.current);
        console.log(`[useAudioRecorder] Deleted stored recording after server confirmation: ${currentStoredIdRef.current}`);
        currentStoredIdRef.current = null;
      }
      setPttState('idle');
    };

    socketService.setEventHandlers({
      onPTTComplete: handlePTTComplete,
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await audioService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  /**
   * Start PTT recording (toggle ON)
   * Records complete audio with metering for visual feedback
   */
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (pttState === 'recording' || pttState === 'processing') return false;

    // Clear any previous errors
    setNetworkError(null);

    // Ensure we have permission
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        console.error('[useAudioRecorder] No microphone permission');
        setNetworkError('Microphone permission required');
        return false;
      }
    }

    // Ensure socket is connected (but don't block recording if not)
    if (!socketService.isConnected()) {
      try {
        await socketService.connect();
      } catch (error) {
        console.warn('[useAudioRecorder] Server not connected - recording will be saved locally');
        // Continue anyway - we'll save locally and retry later
      }
    }

    // Start PTT recording
    const success = await audioService.startPTTRecording({
      onVolumeChange: setVolume,
    });

    if (success) {
      setPttState('recording');
      setRecording(true);
      console.log('[useAudioRecorder] PTT recording started (toggle ON)');
    }

    return success;
  }, [pttState, hasPermission, requestPermission, setRecording]);

  /**
   * Stop PTT recording and send to server (toggle OFF)
   * Audio is persisted locally as safety net, deleted after server confirmation
   */
  const stopRecording = useCallback(async (): Promise<void> => {
    if (pttState !== 'recording') return;

    setPttState('processing');
    setRecording(false);

    // Stop recording with persist option (save locally as safety net)
    const result = await audioService.stopPTTRecording({ persist: true });

    setVolume(0);

    if (!result || !result.audioBase64) {
      console.warn('[useAudioRecorder] No audio data captured');
      setPttState('idle');
      return;
    }

    // Track stored recording for cleanup after server confirms
    if (result.storedRecording) {
      currentStoredIdRef.current = result.storedRecording.id;
    }

    console.log(`[useAudioRecorder] Sending PTT audio: ${result.durationMs}ms`);
    setIsSending(true);

    try {
      // Check connection before sending
      if (!socketService.isConnected()) {
        console.warn('[useAudioRecorder] Socket disconnected, attempting reconnect...');
        try {
          await socketService.connect();
        } catch (connectError) {
          setNetworkError('Network error - recording saved for retry');
          setPttState('idle');
          setIsSending(false);
          // Audio is stored locally for retry on reconnect
          return;
        }
      }

      socketService.sendCompletePTTAudio(
        result.audioBase64,
        result.durationMs,
        result.format
      );

      // Note: pttState will be set to 'idle' when server confirms via onPTTComplete
    } catch (error) {
      console.error('[useAudioRecorder] Error sending audio:', error);
      setNetworkError('Failed to send audio - saved for retry');
      setPttState('idle');
    } finally {
      setIsSending(false);
    }
  }, [pttState, setRecording]);

  /**
   * Cancel recording without sending (discard)
   */
  const cancelRecording = useCallback(async (): Promise<void> => {
    if (pttState !== 'recording') return;

    await audioService.cancelPTTRecording();

    // Clear any pending socket audio
    socketService.clearPendingAudio();

    setVolume(0);
    setPttState('cancelled');
    setRecording(false);

    console.log('[useAudioRecorder] Recording cancelled');

    // Brief visual feedback, then return to idle
    setTimeout(() => {
      setPttState('idle');
    }, 1000);
  }, [pttState, setRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioService.isPTTActive()) {
        audioService.cancelPTTRecording();
      }
    };
  }, []);

  return {
    isRecording: pttState === 'recording',
    pttState,
    startRecording,
    stopRecording,
    cancelRecording,
    hasPermission,
    requestPermission,
    volume,
    isSending,
    networkError,
  };
}
