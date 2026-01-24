import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { socketService } from '../services/socketService';
import { useInterviewStore } from '../stores/interviewStore';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<void>;
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
  volume: number; // 0-1 for visual feedback
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(0);

  const { setRecording, sessionStatus } = useInterviewStore();

  // Check permission on mount
  useEffect(() => {
    audioService.requestPermissions().then(setHasPermission);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await audioService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  /**
   * Start PTT recording (new approach - no chunking)
   * Records complete audio, only sends metering for visual feedback
   */
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (isRecording) return true;

    // Ensure we have permission
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        console.error('[useAudioRecorder] No microphone permission');
        return false;
      }
    }

    // Ensure socket is connected
    if (!socketService.isConnected()) {
      try {
        await socketService.connect();
      } catch (error) {
        console.error('[useAudioRecorder] Failed to connect to server');
        return false;
      }
    }

    // Start PTT recording (no chunking - records complete audio)
    const success = await audioService.startPTTRecording({
      onVolumeChange: setVolume, // For visual feedback only
    });

    if (success) {
      setIsRecording(true);
      setRecording(true);
      console.log('[useAudioRecorder] PTT recording started');
    }

    return success;
  }, [isRecording, hasPermission, requestPermission, setRecording]);

  /**
   * Stop PTT recording and send complete audio to server
   * Key improvement: Audio is sent AFTER recording stops (no race condition)
   */
  const stopRecording = useCallback(async (): Promise<void> => {
    if (!isRecording) return;

    // Stop recording and get complete audio file
    const result = await audioService.stopPTTRecording();

    setIsRecording(false);
    setRecording(false);
    setVolume(0);

    // Send complete audio to server (if we got a result)
    if (result && result.audioBase64) {
      console.log(`[useAudioRecorder] Sending complete PTT audio: ${result.durationMs}ms`);
      socketService.sendCompletePTTAudio(
        result.audioBase64,
        result.durationMs,
        result.format
      );
    } else {
      console.warn('[useAudioRecorder] No audio data to send');
    }
  }, [isRecording, setRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioService.isPTTActive()) {
        audioService.stopPTTRecording();
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermission,
    volume,
  };
}
