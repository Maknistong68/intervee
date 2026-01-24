import { getOpenAIClient, WHISPER_MODEL } from '../config/openai.js';
import { TranscriptionResult } from '../types/index.js';
import { detectLanguage } from '../utils/languageDetector.js';
import { Readable } from 'stream';

// Language mapping for Whisper API
type LanguagePreference = 'eng' | 'fil' | 'mix' | undefined;

// Extended vocabulary hints for better accuracy
const VOCABULARY_HINTS = {
  // OSH-specific terms
  osh: 'OSH safety health DOLE occupational establishment registration training hazard accident penalty violation',
  // Filipino terms commonly used
  filipino: 'kailangan dapat pwede maaari trabaho empleyado empleado kompanya kumpanya',
  // Numbers and rules
  rules: 'Rule 1020 1030 1040 1050 1060 1070 1080 1090 1100 1120 1140 1160 1960 RA 11058 DO 198',
  // Common OSH terms
  common: 'HSC committee PPE helmet harness fire extinguisher first aid WAIR frequency rate severity',
};

export class WhisperService {
  private openai = getOpenAIClient();

  /**
   * Transcribe audio with optional language hint
   * @param audioBuffer - Audio data as Buffer
   * @param languagePreference - User's language preference (eng, fil, mix)
   */
  async transcribe(
    audioBuffer: Buffer,
    languagePreference?: LanguagePreference
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      // Create a File-like object from the buffer
      const audioFile = new File([audioBuffer], 'audio.webm', {
        type: 'audio/webm',
      });

      // Map language preference to Whisper language code
      // For 'mix' (Taglish), we use English as base since Whisper handles code-switching
      let whisperLanguage: string | undefined;
      if (languagePreference === 'fil') {
        whisperLanguage = 'tl'; // Tagalog
      } else if (languagePreference === 'eng') {
        whisperLanguage = 'en'; // English
      }
      // For 'mix' or undefined, let Whisper auto-detect

      // Build comprehensive vocabulary prompt based on language
      let vocabularyPrompt = `${VOCABULARY_HINTS.osh} ${VOCABULARY_HINTS.rules} ${VOCABULARY_HINTS.common}`;
      if (languagePreference === 'fil' || languagePreference === 'mix') {
        vocabularyPrompt += ` ${VOCABULARY_HINTS.filipino}`;
      }

      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: WHISPER_MODEL,
        language: whisperLanguage,
        response_format: 'verbose_json',
        prompt: vocabularyPrompt,
      });

      const text = response.text.trim();
      const detectedLang = detectLanguage(text);
      const processingTime = Date.now() - startTime;

      console.log(`[Whisper] Transcribed in ${processingTime}ms (lang=${whisperLanguage || 'auto'}): "${text.substring(0, 50)}..."`);

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
  private readonly MIN_DURATION_MS = 1500; // Increased minimum for better context (1.5s)
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
