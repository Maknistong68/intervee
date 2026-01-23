import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface AudioRecordingOptions {
  onChunkReady: (base64Data: string, timestamp: number, duration: number) => void;
  chunkIntervalMs?: number;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private chunkInterval: NodeJS.Timeout | null = null;
  private lastChunkTime = 0;
  private options: AudioRecordingOptions | null = null;

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
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 64000,
        },
      });

      this.recording = recording;
      this.isRecording = true;
      this.lastChunkTime = Date.now();

      // Set up chunking interval
      const intervalMs = options.chunkIntervalMs || 500;
      this.chunkInterval = setInterval(() => {
        this.processChunk();
      }, intervalMs);

      console.log('[Audio] Recording started');
      return true;
    } catch (error) {
      console.error('[Audio] Failed to start recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<void> {
    try {
      // Clear chunk interval
      if (this.chunkInterval) {
        clearInterval(this.chunkInterval);
        this.chunkInterval = null;
      }

      if (this.recording) {
        // Process final chunk
        await this.processChunk();

        // Stop and unload recording
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      this.isRecording = false;

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

  async getRecordingStatus(): Promise<Audio.RecordingStatus | null> {
    if (!this.recording) return null;
    try {
      return await this.recording.getStatusAsync();
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const audioService = new AudioService();
