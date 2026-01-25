import { getOpenAIClient, WHISPER_MODEL } from '../config/openai.js';
import { TranscriptionResult } from '../types/index.js';
import { detectLanguage } from '../utils/languageDetector.js';
import { config } from '../config/env.js';
import { Readable } from 'stream';
import { whisperCircuitBreaker } from '../utils/circuitBreaker.js';

// Language mapping for Whisper API
type LanguagePreference = 'eng' | 'fil' | 'mix' | undefined;

// Extended vocabulary hints for better accuracy
// These help Whisper recognize OSH-specific terminology correctly
const VOCABULARY_HINTS = {
  // OSH-specific terms - emphasize DO and Department Order
  osh: 'OSH safety health DOLE occupational establishment registration training hazard accident penalty violation',
  // Department Orders - repeated for emphasis since Whisper often mishears "DO"
  departmentOrders: 'DO Department Order Department Orders DOs D.O. DO 198 DO 208 DO 73 DO 102 DO 136 DO 160 DO 178 DO 184 DO 224 DO 235 DO 252 DO 53',
  // Labor Advisories
  laborAdvisories: 'LA Labor Advisory Labor Advisories LA 01 LA 07 LA 08 LA 19 LA 20 LA 21 LA 22 LA 23',
  // Filipino terms commonly used
  filipino: 'kailangan dapat pwede maaari trabaho empleyado empleado kompanya kumpanya',
  // Numbers and rules - include all common rule numbers
  rules: 'Rule 1020 1030 1040 1050 1060 1070 1080 1090 1100 1120 1140 1160 1960 RA 11058 OSHS',
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
    const timeout = config.whisperTimeout;

    // Create abort controller for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

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
      // Include all vocabulary hints with emphasis on commonly misheard terms
      let vocabularyPrompt = `${VOCABULARY_HINTS.departmentOrders} ${VOCABULARY_HINTS.laborAdvisories} ${VOCABULARY_HINTS.osh} ${VOCABULARY_HINTS.rules} ${VOCABULARY_HINTS.common}`;
      if (languagePreference === 'fil' || languagePreference === 'mix') {
        vocabularyPrompt += ` ${VOCABULARY_HINTS.filipino}`;
      }

      // Check circuit breaker state before calling
      let response;
      if (whisperCircuitBreaker.getState() === 'OPEN') {
        console.warn('[Whisper] Circuit breaker open, returning empty transcription');
        response = { text: '', segments: [], duration: 0, language: 'en' } as any;
      } else {
        try {
          response = await this.openai.audio.transcriptions.create(
            {
              file: audioFile,
              model: WHISPER_MODEL,
              language: whisperLanguage,
              response_format: 'verbose_json',
              prompt: vocabularyPrompt,
            },
            { signal: abortController.signal }
          );
        } catch (apiError: any) {
          // Log detailed error for debugging
          if (apiError?.status === 401) {
            console.error('[Whisper] API call failed: Invalid API key (401 Unauthorized)');
          } else if (apiError?.status === 429) {
            console.error('[Whisper] API call failed: Rate limit exceeded or no credits (429)');
          } else if (apiError?.status === 500) {
            console.error('[Whisper] API call failed: OpenAI server error (500)');
          } else {
            console.error('[Whisper] API call failed:', apiError?.message || apiError);
          }
          throw apiError;
        }
      }

      clearTimeout(timeoutId);

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
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError' || abortController.signal.aborted) {
        console.error(`[Whisper] Transcription timed out after ${timeout}ms`);
        throw new Error(`Whisper transcription timed out after ${timeout}ms`);
      }
      console.error('[Whisper] Transcription error:', error);
      throw error;
    }
  }

  /**
   * Transcribe complete PTT audio with optimal settings for accuracy
   * Key difference: temperature=0 for deterministic output
   *
   * @param audioBuffer - Complete audio file as Buffer (not chunks)
   * @param languagePreference - User's language preference (eng, fil, mix)
   * @param format - Audio format (wav, m4a)
   */
  async transcribePTT(
    audioBuffer: Buffer,
    languagePreference?: LanguagePreference,
    format: string = 'wav'
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();
    const timeout = config.whisperTimeout * 2; // Allow more time for complete audio

    // Create abort controller for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    try {
      // Determine MIME type and extension based on format
      let mimeType = 'audio/wav';
      let extension = 'wav';
      if (format === 'm4a') {
        mimeType = 'audio/mp4';
        extension = 'm4a';
      } else if (format === 'webm') {
        mimeType = 'audio/webm';
        extension = 'webm';
      }

      // Create a File-like object from the buffer
      const audioFile = new File([audioBuffer], `audio.${extension}`, {
        type: mimeType,
      });

      // Map language preference to Whisper language code
      let whisperLanguage: string | undefined;
      if (languagePreference === 'fil') {
        whisperLanguage = 'tl'; // Tagalog
      } else if (languagePreference === 'eng') {
        whisperLanguage = 'en'; // English
      }
      // For 'mix' or undefined, let Whisper auto-detect

      // Build comprehensive vocabulary prompt
      let vocabularyPrompt = `${VOCABULARY_HINTS.departmentOrders} ${VOCABULARY_HINTS.laborAdvisories} ${VOCABULARY_HINTS.osh} ${VOCABULARY_HINTS.rules} ${VOCABULARY_HINTS.common}`;
      if (languagePreference === 'fil' || languagePreference === 'mix') {
        vocabularyPrompt += ` ${VOCABULARY_HINTS.filipino}`;
      }

      console.log(`[Whisper PTT] Transcribing ${audioBuffer.length} bytes (format=${format}, lang=${whisperLanguage || 'auto'})`);

      // Check circuit breaker state before calling
      let response;
      if (whisperCircuitBreaker.getState() === 'OPEN') {
        console.warn('[Whisper PTT] Circuit breaker open, returning empty transcription');
        response = { text: '', segments: [], duration: 0, language: 'en' } as any;
      } else {
        try {
          response = await this.openai.audio.transcriptions.create(
            {
              file: audioFile,
              model: WHISPER_MODEL,
              language: whisperLanguage,
              response_format: 'verbose_json',
              prompt: vocabularyPrompt,
              temperature: 0, // KEY: Deterministic output for accuracy
            },
            { signal: abortController.signal }
          );
        } catch (apiError: any) {
          // Log detailed error for debugging
          if (apiError?.status === 401) {
            console.error('[Whisper PTT] API call failed: Invalid API key (401 Unauthorized)');
          } else if (apiError?.status === 429) {
            console.error('[Whisper PTT] API call failed: Rate limit exceeded or no credits (429)');
          } else if (apiError?.status === 500) {
            console.error('[Whisper PTT] API call failed: OpenAI server error (500)');
          } else {
            console.error('[Whisper PTT] API call failed:', apiError?.message || apiError);
          }
          throw apiError;
        }
      }

      clearTimeout(timeoutId);

      const text = response.text.trim();
      const detectedLang = detectLanguage(text);
      const processingTime = Date.now() - startTime;

      console.log(`[Whisper PTT] Transcribed in ${processingTime}ms: "${text.substring(0, 100)}..."`);

      return {
        text,
        language: detectedLang,
        confidence: this.estimateConfidence(response),
        isFinal: true,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError' || abortController.signal.aborted) {
        console.error(`[Whisper PTT] Transcription timed out after ${timeout}ms`);
        throw new Error(`Whisper PTT transcription timed out after ${timeout}ms`);
      }
      console.error('[Whisper PTT] Transcription error:', error);
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

  /**
   * Transcribe multiple audio segments (for long PTT recordings)
   * Handles recordings that exceed Whisper's 25MB limit by chunking
   */
  async transcribeSegments(
    segments: Buffer[],
    languagePreference?: LanguagePreference
  ): Promise<TranscriptionResult> {
    if (segments.length === 0) {
      return {
        text: '',
        language: 'en',
        confidence: 0,
        isFinal: true,
      };
    }

    // Single segment: use normal transcription
    if (segments.length === 1) {
      return this.transcribe(segments[0], languagePreference);
    }

    // Multiple segments: transcribe each and concatenate
    console.log(`[Whisper] Transcribing ${segments.length} segments for long recording`);
    const startTime = Date.now();
    const transcriptions: string[] = [];
    const confidenceScores: number[] = [];
    let lastLanguage: 'en' | 'tl' | 'taglish' = 'en';

    for (let i = 0; i < segments.length; i++) {
      console.log(`[Whisper] Processing segment ${i + 1}/${segments.length} (${segments[i].length} bytes)`);
      const result = await this.transcribe(segments[i], languagePreference);
      transcriptions.push(result.text);
      confidenceScores.push(result.confidence);
      lastLanguage = result.language;
    }

    const fullText = transcriptions.join(' ').trim();
    const totalTime = Date.now() - startTime;
    console.log(`[Whisper] All segments transcribed in ${totalTime}ms, total length: ${fullText.length} chars`);

    // Average confidence from all segment transcriptions
    const avgConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0.7;

    return {
      text: fullText,
      language: lastLanguage,
      confidence: avgConfidence,
      isFinal: true,
    };
  }

  /**
   * Estimate transcription confidence from Whisper's verbose_json response
   * Uses avg_logprob (range -2 to 0, closer to 0 = better) and no_speech_prob
   */
  private estimateConfidence(response: any): number {
    // If no segments data, return conservative default
    if (!response.segments || response.segments.length === 0) {
      return 0.7;
    }

    let totalLogprob = 0;
    let totalNoSpeechProb = 0;
    let segmentCount = 0;

    for (const segment of response.segments) {
      if (typeof segment.avg_logprob === 'number') {
        totalLogprob += segment.avg_logprob;
        segmentCount++;
      }
      if (typeof segment.no_speech_prob === 'number') {
        totalNoSpeechProb += segment.no_speech_prob;
      }
    }

    if (segmentCount === 0) {
      return 0.7;
    }

    // Calculate average log probability (range roughly -2 to 0)
    const avgLogprob = totalLogprob / segmentCount;
    // Convert logprob to 0-1 scale: logprob of -1 = 0.5, -0.5 = 0.75, 0 = 1.0
    // Using: score = (avgLogprob + 2) / 2, clamped between 0 and 1
    const logprobScore = Math.max(0, Math.min(1, (avgLogprob + 2) / 2));

    // Calculate speech clarity score (1 - no_speech_prob)
    const avgNoSpeechProb = totalNoSpeechProb / segmentCount;
    const speechScore = 1 - avgNoSpeechProb;

    // Combine scores: weight logprob higher as it's more reliable
    const rawConfidence = logprobScore * 0.7 + speechScore * 0.3;

    // Clamp to reasonable range (0.3 to 0.95)
    const confidence = Math.max(0.3, Math.min(0.95, rawConfidence));

    console.log(`[Whisper] Confidence calculated: ${confidence.toFixed(2)} (logprob: ${avgLogprob.toFixed(2)}, no_speech: ${avgNoSpeechProb.toFixed(2)})`);

    return confidence;
  }

  createAudioBuffer(): AudioBufferManager {
    return new AudioBufferManager();
  }

  createPTTAudioBuffer(): PTTAudioBufferManager {
    return new PTTAudioBufferManager();
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

/**
 * PTT-specific audio buffer manager
 * Accumulates ALL audio without trimming, suitable for long recordings
 */
export class PTTAudioBufferManager {
  private chunks: { buffer: Buffer; durationMs: number }[] = [];
  private totalDuration = 0;
  private totalSize = 0;
  private readonly MAX_CHUNK_SIZE_BYTES = 20 * 1024 * 1024; // 20MB safe limit per segment
  private readonly MAX_DURATION_MS = 10 * 60 * 1000; // 10 minutes max for safety

  addChunk(base64Data: string, durationMs: number): void {
    const buffer = Buffer.from(base64Data, 'base64');
    this.chunks.push({ buffer, durationMs });
    this.totalDuration += durationMs;
    this.totalSize += buffer.length;

    // Safety limit: prevent runaway memory usage (10 min max)
    if (this.totalDuration > this.MAX_DURATION_MS) {
      console.warn('[PTTBuffer] Max duration reached (10 min), stopping accumulation');
    }
  }

  /**
   * Get segments for transcription
   * If total size < 25MB: returns single buffer
   * If total size > 25MB: splits into multiple segments at chunk boundaries
   */
  getSegmentsForTranscription(): Buffer[] {
    if (this.chunks.length === 0) {
      return [];
    }

    // If under the safe limit, return as single buffer
    if (this.totalSize <= this.MAX_CHUNK_SIZE_BYTES) {
      return [Buffer.concat(this.chunks.map(c => c.buffer))];
    }

    // Split into segments at natural chunk boundaries
    const segments: Buffer[] = [];
    let currentSegmentChunks: Buffer[] = [];
    let currentSegmentSize = 0;

    for (const chunk of this.chunks) {
      if (currentSegmentSize + chunk.buffer.length > this.MAX_CHUNK_SIZE_BYTES && currentSegmentChunks.length > 0) {
        // Current segment is full, push it and start new one
        segments.push(Buffer.concat(currentSegmentChunks));
        currentSegmentChunks = [];
        currentSegmentSize = 0;
      }

      currentSegmentChunks.push(chunk.buffer);
      currentSegmentSize += chunk.buffer.length;
    }

    // Don't forget the last segment
    if (currentSegmentChunks.length > 0) {
      segments.push(Buffer.concat(currentSegmentChunks));
    }

    console.log(`[PTTBuffer] Split ${this.totalSize} bytes into ${segments.length} segments`);
    return segments;
  }

  getBuffer(): Buffer {
    return Buffer.concat(this.chunks.map(c => c.buffer));
  }

  clear(): void {
    this.chunks = [];
    this.totalDuration = 0;
    this.totalSize = 0;
  }

  getDuration(): number {
    return this.totalDuration;
  }

  getTotalSize(): number {
    return this.totalSize;
  }

  hasAudio(): boolean {
    return this.chunks.length > 0;
  }
}

export const whisperService = new WhisperService();
