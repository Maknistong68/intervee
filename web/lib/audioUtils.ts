/**
 * Audio utilities for Voice Activity Detection (VAD) and audio level monitoring
 * Uses Web Audio API for real-time audio analysis
 */

export interface AudioAnalyzerConfig {
  // Minimum volume level (0-1) to consider as speech
  volumeThreshold: number;
  // Noise gate threshold - audio below this is considered noise
  noiseGateThreshold: number;
  // How long silence must persist before triggering silence event (ms)
  silenceDebounceMs: number;
  // Smoothing factor for volume (0-1, higher = smoother)
  smoothingFactor: number;
}

export interface AudioAnalyzerCallbacks {
  onVolumeChange?: (volume: number, isSpeaking: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onNoiseDetected?: () => void;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationId: number | null = null;

  private config: AudioAnalyzerConfig;
  private callbacks: AudioAnalyzerCallbacks;

  private isSpeaking = false;
  private smoothedVolume = 0;
  private silenceStartTime: number | null = null;
  private lastSpeechTime = 0;

  constructor(
    config: Partial<AudioAnalyzerConfig> = {},
    callbacks: AudioAnalyzerCallbacks = {}
  ) {
    this.config = {
      volumeThreshold: 0.15,        // 15% volume to detect speech
      noiseGateThreshold: 0.05,     // 5% noise gate
      silenceDebounceMs: 500,       // 500ms silence before triggering end
      smoothingFactor: 0.8,         // Smooth out volume spikes
      ...config,
    };
    this.callbacks = callbacks;
  }

  async start(): Promise<boolean> {
    try {
      // Get microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context and analyzer
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();

      // Configure analyzer for speech detection
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;

      // Connect stream to analyzer
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      // Create data array for frequency analysis
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Start analysis loop
      this.analyze();

      console.log('[AudioAnalyzer] Started successfully');
      return true;
    } catch (error) {
      console.error('[AudioAnalyzer] Failed to start:', error);
      return false;
    }
  }

  stop(): void {
    // Stop animation loop
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Disconnect and close audio nodes
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.dataArray = null;
    this.isSpeaking = false;
    this.smoothedVolume = 0;

    console.log('[AudioAnalyzer] Stopped');
  }

  private analyze = (): void => {
    if (!this.analyser || !this.dataArray) return;

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);

    // Calculate RMS volume (more accurate than simple average)
    let sumSquares = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = this.dataArray[i] / 255;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / this.dataArray.length);

    // Apply smoothing
    this.smoothedVolume =
      this.config.smoothingFactor * this.smoothedVolume +
      (1 - this.config.smoothingFactor) * rms;

    // Apply noise gate
    const gatedVolume = this.smoothedVolume < this.config.noiseGateThreshold
      ? 0
      : this.smoothedVolume;

    // Detect speech based on volume threshold
    const nowSpeaking = gatedVolume >= this.config.volumeThreshold;
    const now = Date.now();

    // Handle speech state transitions
    if (nowSpeaking && !this.isSpeaking) {
      // Started speaking
      this.isSpeaking = true;
      this.silenceStartTime = null;
      this.lastSpeechTime = now;
      this.callbacks.onSpeechStart?.();
    } else if (!nowSpeaking && this.isSpeaking) {
      // Might be ending speech - use debounce
      if (this.silenceStartTime === null) {
        this.silenceStartTime = now;
      } else if (now - this.silenceStartTime >= this.config.silenceDebounceMs) {
        // Confirmed silence
        this.isSpeaking = false;
        this.silenceStartTime = null;
        this.callbacks.onSpeechEnd?.();
      }
    } else if (nowSpeaking) {
      // Still speaking - reset silence timer
      this.silenceStartTime = null;
      this.lastSpeechTime = now;
    }

    // Notify volume change
    this.callbacks.onVolumeChange?.(gatedVolume, this.isSpeaking);

    // Detect low-level noise (between gate and threshold)
    if (gatedVolume > 0 && gatedVolume < this.config.volumeThreshold) {
      this.callbacks.onNoiseDetected?.();
    }

    // Continue loop
    this.animationId = requestAnimationFrame(this.analyze);
  };

  // Get current volume (0-1)
  getVolume(): number {
    return this.smoothedVolume;
  }

  // Check if currently speaking
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Get time since last speech (ms)
  getTimeSinceLastSpeech(): number {
    if (this.lastSpeechTime === 0) return Infinity;
    return Date.now() - this.lastSpeechTime;
  }

  // Update config at runtime
  updateConfig(config: Partial<AudioAnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Check if analyzer is running
  isRunning(): boolean {
    return this.audioContext !== null && this.animationId !== null;
  }
}

/**
 * Volume meter component helper - returns CSS width percentage
 */
export function volumeToWidth(volume: number, maxVolume: number = 1): string {
  const percentage = Math.min(100, Math.max(0, (volume / maxVolume) * 100));
  return `${percentage}%`;
}

/**
 * Get volume level indicator (for accessibility)
 */
export function getVolumeLevelText(volume: number): string {
  if (volume < 0.05) return 'Silent';
  if (volume < 0.15) return 'Very quiet';
  if (volume < 0.3) return 'Quiet';
  if (volume < 0.5) return 'Normal';
  if (volume < 0.7) return 'Loud';
  return 'Very loud';
}

/**
 * Check if volume is sufficient for good transcription
 */
export function isVolumeSufficient(volume: number, threshold: number = 0.15): boolean {
  return volume >= threshold;
}
