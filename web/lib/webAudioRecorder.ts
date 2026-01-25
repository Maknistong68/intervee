/**
 * Web Audio Recorder using MediaRecorder API
 * Records complete audio without streaming or auto-stop
 * Returns base64 audio data when stopped
 */

export interface WebAudioRecorderConfig {
  // MIME type for recording (browser will pick best available)
  mimeType?: string;
  // Audio constraints for getUserMedia
  audioBitsPerSecond?: number;
}

export interface RecordingResult {
  audioBase64: string;
  durationMs: number;
  format: string;
  sizeBytes: number;
}

export type RecorderState = 'inactive' | 'recording' | 'paused';

export class WebAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private config: WebAudioRecorderConfig;
  private state: RecorderState = 'inactive';

  // Callbacks
  private onStateChange?: (state: RecorderState) => void;
  private onError?: (error: Error) => void;

  constructor(config: WebAudioRecorderConfig = {}) {
    this.config = {
      audioBitsPerSecond: 128000, // 128kbps - good quality, reasonable size
      ...config,
    };
  }

  /**
   * Get supported MIME type for recording
   * Prioritizes webm/opus for better compatibility with Whisper
   */
  private getSupportedMimeType(): string {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav',
    ];

    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('[WebAudioRecorder] Using MIME type:', type);
        return type;
      }
    }

    console.warn('[WebAudioRecorder] No preferred MIME type supported, using default');
    return '';
  }

  /**
   * Start recording audio
   * Returns true if recording started successfully
   */
  async start(): Promise<boolean> {
    try {
      // Reset state
      this.audioChunks = [];
      this.startTime = Date.now();

      // Get microphone stream with audio processing
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Whisper prefers 16kHz
        },
      });

      // Create MediaRecorder with best available format
      const mimeType = this.config.mimeType || this.getSupportedMimeType();
      const options: MediaRecorderOptions = {
        audioBitsPerSecond: this.config.audioBitsPerSecond,
      };

      if (mimeType) {
        options.mimeType = mimeType;
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event: Event) => {
        const error = (event as ErrorEvent).error || new Error('MediaRecorder error');
        console.error('[WebAudioRecorder] Error:', error);
        this.onError?.(error);
      };

      this.mediaRecorder.onstart = () => {
        this.state = 'recording';
        this.onStateChange?.('recording');
        console.log('[WebAudioRecorder] Recording started');
      };

      this.mediaRecorder.onstop = () => {
        this.state = 'inactive';
        this.onStateChange?.('inactive');
        console.log('[WebAudioRecorder] Recording stopped');
      };

      // Request data every 1 second (for progress tracking, but we use full blob at end)
      this.mediaRecorder.start(1000);

      return true;
    } catch (error) {
      console.error('[WebAudioRecorder] Failed to start:', error);
      this.onError?.(error as Error);
      return false;
    }
  }

  /**
   * Stop recording and return the audio data
   * Returns null if no recording was in progress
   */
  async stop(): Promise<RecordingResult | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        console.warn('[WebAudioRecorder] No active recording to stop');
        resolve(null);
        return;
      }

      const endTime = Date.now();
      const durationMs = endTime - this.startTime;
      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

      // Handler for when recording actually stops
      const handleStop = async () => {
        // Create blob from all chunks
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const sizeBytes = audioBlob.size;

        // Convert to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        const chunkSize = 8192;

        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, Array.from(chunk));
        }

        const audioBase64 = btoa(binaryString);

        // Determine format from MIME type
        let format = 'webm';
        if (mimeType.includes('ogg')) format = 'ogg';
        else if (mimeType.includes('mp4')) format = 'mp4';
        else if (mimeType.includes('wav')) format = 'wav';

        console.log(`[WebAudioRecorder] Recording complete: ${durationMs}ms, ${Math.round(sizeBytes/1024)}KB, ${format}`);

        // Cleanup
        this.cleanup();

        resolve({
          audioBase64,
          durationMs,
          format,
          sizeBytes,
        });
      };

      // Set up one-time stop handler
      this.mediaRecorder.addEventListener('stop', handleStop, { once: true });

      // Request final data and stop
      this.mediaRecorder.requestData();
      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording without returning data
   */
  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
    console.log('[WebAudioRecorder] Recording cancelled');
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    // Stop all tracks in the media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.state = 'inactive';
  }

  /**
   * Get current recording state
   */
  getState(): RecorderState {
    return this.state;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.state === 'recording';
  }

  /**
   * Get recording duration so far (in ms)
   */
  getCurrentDuration(): number {
    if (this.state !== 'recording') return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Set state change callback
   */
  setOnStateChange(callback: (state: RecorderState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Set error callback
   */
  setOnError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  /**
   * Check if MediaRecorder is supported in this browser
   */
  static isSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && typeof navigator.mediaDevices !== 'undefined';
  }
}

// Singleton instance for convenience
let recorderInstance: WebAudioRecorder | null = null;

export function getRecorder(): WebAudioRecorder {
  if (!recorderInstance) {
    recorderInstance = new WebAudioRecorder();
  }
  return recorderInstance;
}
