import { getOpenAIClient, WHISPER_MODEL } from '../config/openai.js';
import { TranscriptionResult } from '../types/index.js';
import { detectLanguage } from '../utils/languageDetector.js';
import { Readable } from 'stream';

export class WhisperService {
  private openai = getOpenAIClient();

  async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      // Create a File-like object from the buffer
      const audioFile = new File([audioBuffer], 'audio.webm', {
        type: 'audio/webm',
      });

      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: WHISPER_MODEL,
        language: undefined, // Auto-detect (supports Filipino/English)
        response_format: 'verbose_json',
        prompt: 'OSH safety health DOLE occupational establishment registration training', // Vocabulary hints
      });

      const text = response.text.trim();
      const detectedLang = detectLanguage(text);
      const processingTime = Date.now() - startTime;

      console.log(`[Whisper] Transcribed in ${processingTime}ms: "${text.substring(0, 50)}..."`);

      return {
        text,
        language: detectedLang,
        confidence: this.estimateConfidence(response),
        isFinal: true,
      };
    } catch (error) {
      console.error('[Whisper] Transcription error:', error);
      throw error;
    }
  }

  async transcribeStream(audioBuffer: Buffer): Promise<AsyncGenerator<Partial<TranscriptionResult>>> {
    // For streaming, we'll use the standard API and simulate streaming
    // Whisper API doesn't support true streaming yet
    const result = await this.transcribe(audioBuffer);

    async function* generator() {
      yield result;
    }

    return generator();
  }

  private estimateConfidence(response: any): number {
    // Whisper doesn't provide direct confidence scores
    // We estimate based on audio quality indicators
    // For now, return a reasonable default
    return 0.85;
  }

  createAudioBuffer(): AudioBufferManager {
    return new AudioBufferManager();
  }
}

export class AudioBufferManager {
  private chunks: Buffer[] = [];
  private totalDuration = 0;
  private readonly MIN_DURATION_MS = 1000; // Minimum audio for transcription
  private readonly MAX_DURATION_MS = 30000; // Maximum buffer size

  addChunk(base64Data: string, durationMs: number): void {
    const buffer = Buffer.from(base64Data, 'base64');
    this.chunks.push(buffer);
    this.totalDuration += durationMs;

    // Prevent excessive memory usage
    if (this.totalDuration > this.MAX_DURATION_MS) {
      this.trimOldChunks();
    }
  }

  isReadyForTranscription(): boolean {
    return this.totalDuration >= this.MIN_DURATION_MS;
  }

  getBuffer(): Buffer {
    return Buffer.concat(this.chunks);
  }

  clear(): void {
    this.chunks = [];
    this.totalDuration = 0;
  }

  getDuration(): number {
    return this.totalDuration;
  }

  private trimOldChunks(): void {
    // Remove oldest chunks to stay under limit
    while (this.totalDuration > this.MAX_DURATION_MS && this.chunks.length > 1) {
      this.chunks.shift();
      this.totalDuration -= 500; // Approximate chunk duration
    }
  }
}

export const whisperService = new WhisperService();
