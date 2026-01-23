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
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

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

  const handleChunkReady = useCallback(
    (base64Data: string, timestamp: number, duration: number) => {
      // Send audio chunk to server via WebSocket
      socketService.sendAudioChunk(base64Data, timestamp, duration);
    },
    []
  );

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

    // Start recording
    const success = await audioService.startRecording({
      onChunkReady: handleChunkReady,
      chunkIntervalMs: 500, // Send chunks every 500ms
    });

    if (success) {
      setIsRecording(true);
      setRecording(true);
    }

    return success;
  }, [isRecording, hasPermission, requestPermission, handleChunkReady, setRecording]);

  const stopRecording = useCallback(async (): Promise<void> => {
    if (!isRecording) return;

    await audioService.stopRecording();
    setIsRecording(false);
    setRecording(false);
  }, [isRecording, setRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        audioService.stopRecording();
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermission,
  };
}
