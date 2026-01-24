import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface AudioRecordingOptions {
  onChunkReady: (base64Data: string, timestamp: number, duration: number) => void;
  chunkIntervalMs?: number;
  // VAD callbacks
  onVolumeChange?: (volume: number, isSpeaking: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  // Thresholds
  volumeThreshold?: number;  // 0-1, default 0.15
  noiseGateThreshold?: number; // 0-1, default 0.05
}

/**
 * PTT Recording options (no chunking)
 */
export interface PTTRecordingOptions {
  onVolumeChange?: (volume: number) => void;
}

/**
 * PTT Recording result - complete audio file
 */
export interface PTTRecordingResult {
  audioBase64: string;
  durationMs: number;
  format: 'wav' | 'm4a';
  sampleRate: number;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private chunkInterval: NodeJS.Timeout | null = null;
  private meteringInterval: NodeJS.Timeout | null = null;
  private lastChunkTime = 0;
  private options: AudioRecordingOptions | null = null;

  // VAD state
  private isSpeaking = false;
  private smoothedVolume = 0;
  private silenceStartTime: number | null = null;
  private readonly SILENCE_DEBOUNCE_MS = 400;
  private readonly SMOOTHING_FACTOR = 0.7;

  // PTT-specific state
  private isPTTRecording = false;
  private pttStartTime: number = 0;
  private pttOptions: PTTRecordingOptions | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[Audio] Permission error:', error);
      return false;
    }
  }

  async startRecording(options: AudioRecordingOptions): Promise<boolean> {
    try {
      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('[Audio] No microphone permission');
        return false;
      }

      this.options = options;

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create recording with optimized settings for speech
      // Using higher quality settings for better transcription
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000, // Increased bitrate for better quality
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH, // Increased quality
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000, // Increased bitrate
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000, // Increased bitrate
        },
        // Enable metering for VAD
        isMeteringEnabled: true,
      });

      this.recording = recording;
      this.isRecording = true;
      this.lastChunkTime = Date.now();
      this.isSpeaking = false;
      this.smoothedVolume = 0;
      this.silenceStartTime = null;

      // Set up chunking interval (increased to 1 second for better context)
      const intervalMs = options.chunkIntervalMs || 1000;
      this.chunkInterval = setInterval(() => {
        this.processChunk();
      }, intervalMs);

      // Set up metering interval for VAD (100ms for responsive feedback)
      this.meteringInterval = setInterval(() => {
        this.processMetering();
      }, 100);

      console.log('[Audio] Recording started with VAD enabled');
      return true;
    } catch (error) {
      console.error('[Audio] Failed to start recording:', error);
      return false;
    }
  }

  private async processMetering(): Promise<void> {
    if (!this.recording || !this.isRecording || !this.options) return;

    try {
      const status = await this.recording.getStatusAsync();
      if (!status.isRecording || status.metering === undefined) return;

      // Convert dB to linear scale (0-1)
      // metering is in dB, typically -160 to 0
      // -160 dB = silence, 0 dB = max
      const dB = status.metering;
      const linear = Math.pow(10, dB / 20); // Convert dB to linear
      const normalized = Math.min(1, Math.max(0, (dB + 60) / 60)); // Normalize -60 to 0 dB to 0-1

      // Apply smoothing
      this.smoothedVolume =
        this.SMOOTHING_FACTOR * this.smoothedVolume +
        (1 - this.SMOOTHING_FACTOR) * normalized;

      // Apply noise gate
      const noiseGate = this.options.noiseGateThreshold ?? 0.05;
      const gatedVolume = this.smoothedVolume < noiseGate ? 0 : this.smoothedVolume;

      // Detect speech
      const volumeThreshold = this.options.volumeThreshold ?? 0.15;
      const nowSpeaking = gatedVolume >= volumeThreshold;
      const now = Date.now();

      // Handle state transitions
      if (nowSpeaking && !this.isSpeaking) {
        this.isSpeaking = true;
        this.silenceStartTime = null;
        this.options.onSpeechStart?.();
        console.log('[Audio] Speech started');
      } else if (!nowSpeaking && this.isSpeaking) {
        if (this.silenceStartTime === null) {
          this.silenceStartTime = now;
        } else if (now - this.silenceStartTime >= this.SILENCE_DEBOUNCE_MS) {
          this.isSpeaking = false;
          this.silenceStartTime = null;
          this.options.onSpeechEnd?.();
          console.log('[Audio] Speech ended');
        }
      } else if (nowSpeaking) {
        this.silenceStartTime = null;
      }

      // Notify volume change
      this.options.onVolumeChange?.(gatedVolume, this.isSpeaking);
    } catch (error) {
      // Metering might fail occasionally, ignore
    }
  }

  async stopRecording(): Promise<void> {
    try {
      // Clear intervals
      if (this.chunkInterval) {
        clearInterval(this.chunkInterval);
        this.chunkInterval = null;
      }
      if (this.meteringInterval) {
        clearInterval(this.meteringInterval);
        this.meteringInterval = null;
      }

      if (this.recording) {
        // Process final chunk
        await this.processChunk();

        // Stop and unload recording
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      this.isRecording = false;
      this.isSpeaking = false;
      this.smoothedVolume = 0;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });

      console.log('[Audio] Recording stopped');
    } catch (error) {
      console.error('[Audio] Failed to stop recording:', error);
    }
  }

  private async processChunk(): Promise<void> {
    if (!this.recording || !this.options || !this.isRecording) return;

    try {
      const status = await this.recording.getStatusAsync();

      if (!status.isRecording) return;

      // Get the recording URI
      const uri = this.recording.getURI();
      if (!uri) return;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const currentTime = Date.now();
      const duration = currentTime - this.lastChunkTime;

      // Send chunk to callback
      this.options.onChunkReady(base64, currentTime, duration);

      this.lastChunkTime = currentTime;
    } catch (error) {
      // File might not exist yet or be locked
      // This is expected during the first few milliseconds
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // =============================================
  // PTT Recording Methods (No Chunking)
  // =============================================

  /**
   * Start PTT recording - records complete audio without chunking
   * Only metering is active for visual feedback
   */
  async startPTTRecording(options: PTTRecordingOptions = {}): Promise<boolean> {
    try {
      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('[Audio PTT] No microphone permission');
        return false;
      }

      this.pttOptions = options;
      this.pttStartTime = Date.now();

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create recording with WAV format for best quality and easy normalization
      // WAV is uncompressed and easier to process server-side
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 256000,
        },
        // Enable metering for visual feedback only
        isMeteringEnabled: true,
      });

      this.recording = recording;
      this.isPTTRecording = true;
      this.smoothedVolume = 0;

      // Set up metering interval for visual feedback ONLY (no chunking!)
      this.meteringInterval = setInterval(() => {
        this.processPTTMetering();
      }, 100);

      // NO chunk interval - record continuously

      console.log('[Audio PTT] Recording started (no chunking)');
      return true;
    } catch (error) {
      console.error('[Audio PTT] Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Process metering for PTT mode (visual feedback only)
   */
  private async processPTTMetering(): Promise<void> {
    if (!this.recording || !this.isPTTRecording) return;

    try {
      const status = await this.recording.getStatusAsync();
      if (!status.isRecording || status.metering === undefined) return;

      // Convert dB to normalized 0-1
      const dB = status.metering;
      const normalized = Math.min(1, Math.max(0, (dB + 60) / 60));

      // Apply smoothing
      this.smoothedVolume =
        this.SMOOTHING_FACTOR * this.smoothedVolume +
        (1 - this.SMOOTHING_FACTOR) * normalized;

      // Notify volume change (for visual feedback)
      this.pttOptions?.onVolumeChange?.(this.smoothedVolume);
    } catch (error) {
      // Metering might fail occasionally, ignore
    }
  }

  /**
   * Stop PTT recording and return complete audio file
   * IMPORTANT: Reads file AFTER stopAndUnloadAsync completes
   */
  async stopPTTRecording(): Promise<PTTRecordingResult | null> {
    if (!this.recording || !this.isPTTRecording) {
      console.warn('[Audio PTT] No active PTT recording to stop');
      return null;
    }

    try {
      // 1. Clear metering interval
      if (this.meteringInterval) {
        clearInterval(this.meteringInterval);
        this.meteringInterval = null;
      }

      // 2. Get URI before stopping
      const uri = this.recording.getURI();

      // 3. AWAIT stopAndUnloadAsync completely
      await this.recording.stopAndUnloadAsync();
      console.log('[Audio PTT] Recording stopped and unloaded');

      // 4. Calculate duration
      const durationMs = Date.now() - this.pttStartTime;

      // 5. Read complete file as base64 (AFTER recording stopped)
      if (!uri) {
        console.error('[Audio PTT] No URI available');
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`[Audio PTT] Read complete file: ${base64.length} chars base64, ${durationMs}ms duration`);

      // 6. Clean up
      this.recording = null;
      this.isPTTRecording = false;
      this.smoothedVolume = 0;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });

      // 7. Return complete result
      return {
        audioBase64: base64,
        durationMs,
        format: 'wav',
        sampleRate: 16000,
      };
    } catch (error) {
      console.error('[Audio PTT] Failed to stop recording:', error);

      // Clean up on error
      this.recording = null;
      this.isPTTRecording = false;
      this.smoothedVolume = 0;

      return null;
    }
  }

  isPTTActive(): boolean {
    return this.isPTTRecording;
  }

  async getRecordingStatus(): Promise<Audio.RecordingStatus | null> {
    if (!this.recording) return null;
    try {
      return await this.recording.getStatusAsync();
    } catch {
      return null;
    }
  }

  // Get current volume level (0-1)
  getVolume(): number {
    return this.smoothedVolume;
  }

  // Check if currently speaking (based on VAD)
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Check if volume is too low for good transcription
  isVolumeLow(): boolean {
    const threshold = this.options?.volumeThreshold ?? 0.15;
    return this.smoothedVolume > 0.02 && this.smoothedVolume < threshold;
  }
}

// Singleton instance
export const audioService = new AudioService();
