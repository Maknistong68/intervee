import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { whisperService, AudioBufferManager, PTTAudioBufferManager } from '../services/whisperService.js';
import { gptService } from '../services/gptService.js';
import { questionDetector, QuestionDetector } from '../services/questionDetector.js';
import { conversationContextService } from '../services/conversationContext.js';
import { oshTranscriptIntelligence } from '../services/oshTranscriptIntelligence.js';
import { oshTopicIntelligence } from '../services/oshTopicIntelligence.js';
import { OSH_KNOWLEDGE } from '../knowledge/oshKnowledgeBase.js';
import { config } from '../config/env.js';
import { DetectedLanguage, getFinalLanguage } from '../utils/languageDetector.js';
import { normalizeTranscript } from '../utils/transcriptNormalizer.js';
import { normalizeAudioBuffer } from '../utils/audioNormalizer.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterSocketData,
  AudioChunk,
  SessionState,
  LanguagePreference,
  ReviewerSessionConfig,
  ReviewerAnswerSubmission,
  PTTAudioPayload,
} from '../types/index.js';
import { reviewerSessionService } from '../services/reviewerSession.js';

interface SocketState {
  sessionId: string | null;
  audioBuffer: AudioBufferManager;
  detector: QuestionDetector;
  isProcessing: boolean;
  processingPromise: Promise<void> | null;  // Promise-based queue for race condition prevention
  lastTranscript: string;
  silenceTimer: NodeJS.Timeout | null;
  languagePreference: LanguagePreference | null;
  // PTT mode fields
  isPTTMode: boolean;
  pttAudioBuffer: PTTAudioBufferManager;
  // Rate limiting
  audioChunkCount: number;
  audioChunkWindowStart: number;
  // Reviewer mode fields
  reviewerSessionId: string | null;
  reviewerQuestionTimer: NodeJS.Timeout | null;
  reviewerQuestionStartTime: number | null;
}

const socketStates = new Map<string, SocketState>();

export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  // Parse allowed origins from environment variable
  const allowedOrigins = config.allowedOrigins
    ? config.allowedOrigins.split(',').map(o => o.trim())
    : ['*'];

  const corsOrigin = config.nodeEnv === 'production' && !allowedOrigins.includes('*')
    ? allowedOrigins
    : '*';

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: config.nodeEnv === 'production',
    },
    transports: ['websocket', 'polling'],
    // Increase max buffer size for large audio files (10MB)
    maxHttpBufferSize: 10 * 1024 * 1024,
    // Longer ping timeout to prevent disconnection during transcription
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Initialize state for this socket
    socketStates.set(socket.id, {
      sessionId: null,
      audioBuffer: whisperService.createAudioBuffer(),
      detector: new QuestionDetector(),
      isProcessing: false,
      processingPromise: null,
      lastTranscript: '',
      silenceTimer: null,
      languagePreference: null,
      // PTT mode
      isPTTMode: false,
      pttAudioBuffer: whisperService.createPTTAudioBuffer(),
      // Rate limiting
      audioChunkCount: 0,
      audioChunkWindowStart: Date.now(),
      // Reviewer mode
      reviewerSessionId: null,
      reviewerQuestionTimer: null,
      reviewerQuestionStartTime: null,
    });

    // Handle session start
    socket.on('session:start', (data?: { languagePreference?: LanguagePreference }) => {
      handleSessionStart(socket, data?.languagePreference);
    });

    // Handle language preference change
    socket.on('session:setLanguage', (data: { languagePreference: LanguagePreference }) => {
      const state = socketStates.get(socket.id);
      if (state) {
        state.languagePreference = data.languagePreference;
        console.log(`[Socket] Language preference updated: ${data.languagePreference}`);
      }
    });

    // Handle audio chunks
    socket.on('audio:chunk', (data: AudioChunk) => {
      handleAudioChunk(socket, data);
    });

    // Handle session end
    socket.on('session:end', () => {
      handleSessionEnd(socket);
    });

    // Handle context reset
    socket.on('context:reset', () => {
      handleContextReset(socket);
    });

    // Handle PTT (Push-to-Talk) mode
    socket.on('ptt:start', () => {
      handlePTTStart(socket);
    });

    socket.on('ptt:end', () => {
      handlePTTEnd(socket);
    });

    // Handle complete PTT audio (new approach - no chunking)
    socket.on('ptt:audio', (data: PTTAudioPayload) => {
      handlePTTAudio(socket, data);
    });

    // Reviewer mode events
    socket.on('reviewer:startSession' as any, (config: ReviewerSessionConfig) => {
      handleReviewerStartSession(socket, config);
    });

    socket.on('reviewer:submitAnswer' as any, (submission: ReviewerAnswerSubmission) => {
      handleReviewerSubmitAnswer(socket, submission);
    });

    socket.on('reviewer:requestNext' as any, () => {
      handleReviewerRequestNext(socket);
    });

    socket.on('reviewer:endSession' as any, () => {
      handleReviewerEndSession(socket);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });

  console.log('[Socket] WebSocket server initialized');
  return io;
}

function handleSessionStart(socket: Socket, languagePreference?: LanguagePreference): void {
  const state = socketStates.get(socket.id);
  if (!state) return;

  const sessionId = uuidv4();
  state.sessionId = sessionId;
  state.audioBuffer.clear();
  state.lastTranscript = '';
  state.languagePreference = languagePreference || null;

  socket.emit('session:started', { sessionId });
  console.log(`[Socket] Session started: ${sessionId}, language: ${languagePreference || 'auto-detect'}`);
}

// Rate limiting constants
const AUDIO_CHUNK_RATE_LIMIT = 60; // max chunks per minute
const AUDIO_CHUNK_WINDOW_MS = 60000; // 1 minute window

async function handleAudioChunk(socket: Socket, data: AudioChunk): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.sessionId) {
    socket.emit('error', { message: 'No active session', code: 'NO_SESSION' });
    return;
  }

  // Rate limiting check
  const now = Date.now();
  if (now - state.audioChunkWindowStart > AUDIO_CHUNK_WINDOW_MS) {
    // Reset window
    state.audioChunkCount = 0;
    state.audioChunkWindowStart = now;
  }
  state.audioChunkCount++;
  if (state.audioChunkCount > AUDIO_CHUNK_RATE_LIMIT) {
    console.warn(`[Socket] Rate limit exceeded for socket ${socket.id}`);
    socket.emit('error', { message: 'Audio rate limit exceeded', code: 'RATE_LIMIT' });
    return;
  }

  // PTT Mode: Just accumulate audio, NO silence timer, NO auto-processing
  if (state.isPTTMode) {
    state.pttAudioBuffer.addChunk(data.data, data.duration);
    // No further processing - wait for ptt:end to process all audio
    return;
  }

  // Non-PTT Mode: Original voice-activated behavior with silence detection
  // Add audio to buffer
  state.audioBuffer.addChunk(data.data, data.duration);

  // Reset silence timer
  if (state.silenceTimer) {
    clearTimeout(state.silenceTimer);
  }

  // Set up silence detection
  state.silenceTimer = setTimeout(() => {
    handleSilenceDetected(socket);
  }, config.silenceThreshold);

  // Process audio if we have enough data - use Promise-based queuing to prevent race conditions
  if (state.audioBuffer.isReadyForTranscription()) {
    // Wait for any pending processing to complete
    if (state.processingPromise) {
      await state.processingPromise;
    }
    // Double-check after awaiting (state may have changed)
    if (state.audioBuffer.isReadyForTranscription() && !state.processingPromise) {
      state.processingPromise = processAudioBuffer(socket).finally(() => {
        state.processingPromise = null;
      });
    }
  }
}

async function processAudioBuffer(socket: Socket): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state) return;

  // Set processing flag (processingPromise is set by caller)
  state.isProcessing = true;

  try {
    const audioBuffer = state.audioBuffer.getBuffer();
    // Pass language preference to Whisper for better accuracy
    const result = await whisperService.transcribe(audioBuffer, state.languagePreference || undefined);

    // Normalize Filipino number shortcuts before further processing
    // e.g., "Rule 10 20" → "Rule 1020", "RA 11,0,5,8" → "RA 11058"
    const normalizedText = normalizeTranscript(result.text);

    // Accumulate text FIRST for question detection
    state.detector.accumulateText(normalizedText);
    state.lastTranscript = state.detector.getAccumulatedText();

    // Emit the FULL accumulated transcript (not just current chunk)
    socket.emit('transcript:partial', {
      text: state.lastTranscript,
      timestamp: Date.now(),
    });

    // Check for question
    const detection = state.detector.detectQuestion(
      state.lastTranscript,
      state.detector.getSilenceDuration()
    );

    if (detection.isQuestion && detection.confidence > 0.5) {
      await processQuestion(socket, detection.questionText, detection.language);
    }

    // Clear the buffer after processing
    state.audioBuffer.clear();
  } catch (error) {
    console.error('[Socket] Audio processing error:', error);
    socket.emit('error', {
      message: 'Failed to process audio',
      code: 'AUDIO_ERROR',
    });
  } finally {
    state.isProcessing = false;
  }
}

async function handleSilenceDetected(socket: Socket): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.lastTranscript) return;

  // Check if accumulated text is a question
  const detection = state.detector.detectQuestion(
    state.lastTranscript,
    config.silenceThreshold
  );

  if (detection.isQuestion && detection.confidence > 0.4) {
    // Emit final transcript
    socket.emit('transcript:final', {
      text: state.lastTranscript,
      language: detection.language,
      confidence: detection.confidence,
      isFinal: true,
    });

    await processQuestion(socket, detection.questionText, detection.language);
  }
}

/**
 * Process question using the 3-Layer OSH Intelligence System
 *
 * Layer 1: OSH Transcript Intelligence - Transform garbled transcript into valid OSH question
 * Layer 2: OSH Topic Intelligence - Determine the exact topic and knowledge keys
 * Layer 3: OSH Answer Intelligence - Generate confident, helpful answer
 */
async function processQuestion(
  socket: Socket,
  questionText: string,
  detectedLanguage: DetectedLanguage
): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state) return;

  const startTime = Date.now();
  const sessionId = state.sessionId || socket.id;

  // Determine final language: USER PREFERENCE ALWAYS takes priority
  // This ensures input transcription language matches output response language
  const finalLanguage = getFinalLanguage(
    state.languagePreference,
    detectedLanguage
  );

  console.log(`[Language] Preference: ${state.languagePreference || 'none'}, Detected: ${detectedLanguage}, Final: ${finalLanguage}`);

  try {
    // ============================================
    // LAYER 1: OSH Transcript Intelligence
    // Transform any garbled transcript into a valid OSH question
    // ============================================
    const interpretation = await oshTranscriptIntelligence.interpret(questionText);
    const interpretedQuestion = interpretation.interpretedQuestion;

    console.log(`[OSH Intel L1] "${questionText}" → "${interpretedQuestion}" (${interpretation.confidence.toFixed(2)})`);

    // Emit interpreted question to client (show what we understood)
    socket.emit('transcript:interpreted' as any, {
      original: questionText,
      interpreted: interpretedQuestion,
      confidence: interpretation.confidence,
      suggestedTopics: interpretation.suggestedTopics,
      alternativeInterpretations: interpretation.alternativeInterpretations,
    });

    // Also emit as final transcript
    socket.emit('transcript:final', {
      text: interpretedQuestion,
      language: detectedLanguage,
      confidence: interpretation.confidence,
      isFinal: true,
    });

    // ============================================
    // LAYER 2: OSH Topic Intelligence
    // Determine the exact topic and which knowledge to retrieve
    // ============================================
    const convContext = conversationContextService.getContext(sessionId);
    const conversationHistory = convContext?.history?.map((e: { question: string; answer: string }) => `Q: ${e.question}\nA: ${e.answer}`) || [];

    const topicResult = await oshTopicIntelligence.detectTopic(
      interpretedQuestion,
      conversationHistory
    );

    console.log(`[OSH Intel L2] Topic: ${topicResult.primaryTopic} (${topicResult.confidence.toFixed(2)}), Keys: ${topicResult.knowledgeKeys.join(', ')}`);

    // Get targeted knowledge (not ALL knowledge)
    const knowledge = oshTopicIntelligence.getKnowledgeForTopics(
      topicResult.knowledgeKeys,
      OSH_KNOWLEDGE
    );

    // Notify client that we're generating an answer
    socket.emit('answer:generating', { questionText: interpretedQuestion });

    // ============================================
    // LAYER 3: OSH Answer Intelligence
    // Generate confident, helpful answer with follow-ups
    // ============================================
    let fullAnswer = '';

    for await (const { chunk, done } of gptService.generateOSHAnswerStream({
      question: interpretedQuestion,
      knowledge,
      intent: interpretation.detectedIntent,
      suggestedFollowUps: topicResult.suggestedFollowUps,
      language: finalLanguage,
      sessionId,
    })) {
      if (!done) {
        socket.emit('answer:stream', { chunk, done: false });
        fullAnswer += chunk;
      }
    }

    // Send final answer with comprehensive metadata
    const responseTimeMs = Date.now() - startTime;
    socket.emit('answer:ready', {
      answer: fullAnswer,
      confidence: Math.max(interpretation.confidence, topicResult.confidence) * 0.9 + 0.1, // Weighted confidence
      citations: [],
      responseTimeMs,
      cached: false,
      // Extended fields for OSH Intelligence
      originalTranscript: questionText,
      interpretedAs: interpretedQuestion,
      topic: topicResult.primaryTopic,
      suggestedFollowUps: topicResult.suggestedFollowUps,
    } as any);

    // Clear accumulated text for next question
    state.detector.clearAccumulated();
    state.lastTranscript = '';

    console.log(`[OSH Intel] Complete flow in ${responseTimeMs}ms: ${questionText.substring(0, 30)}... → ${topicResult.primaryTopic}`);
  } catch (error) {
    console.error('[OSH Intel] Error in 3-layer processing:', error);

    // Fallback to basic answer generation
    try {
      socket.emit('answer:generating', { questionText });

      let fullAnswer = '';
      for await (const { chunk, done } of gptService.generateAnswerStream(questionText, undefined, sessionId, finalLanguage)) {
        if (!done) {
          socket.emit('answer:stream', { chunk, done: false });
          fullAnswer += chunk;
        }
      }

      const responseTimeMs = Date.now() - startTime;
      socket.emit('answer:ready', {
        answer: fullAnswer,
        confidence: 0.7,
        citations: [],
        responseTimeMs,
        cached: false,
      });

      state.detector.clearAccumulated();
      state.lastTranscript = '';

      console.log(`[Socket] Fallback answer delivered in ${responseTimeMs}ms`);
    } catch (fallbackError: any) {
      console.error('[Socket] Fallback answer generation error:', fallbackError);

      // Determine specific error message for client
      let errorMessage = 'Failed to generate answer';
      let errorCode = 'GPT_ERROR';

      if (fallbackError?.status === 401 || fallbackError?.message?.includes('401')) {
        errorMessage = 'OpenAI API key is invalid. Please check your API key configuration.';
        errorCode = 'API_KEY_INVALID';
      } else if (fallbackError?.status === 429 || fallbackError?.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded or no credits. Please check your OpenAI billing.';
        errorCode = 'RATE_LIMIT';
      } else if (fallbackError?.message?.includes('OPENAI_API_KEY is not configured')) {
        errorMessage = 'OpenAI API key not configured on server.';
        errorCode = 'API_KEY_MISSING';
      }

      socket.emit('error', {
        message: errorMessage,
        code: errorCode,
      });
    }
  }
}

function handleContextReset(socket: Socket): void {
  const state = socketStates.get(socket.id);
  if (!state) return;

  const sessionId = state.sessionId || socket.id;

  // Clear conversation context
  conversationContextService.clearContext(sessionId);

  // Clear local state
  state.lastTranscript = '';
  state.detector.clearAccumulated();

  console.log(`[Socket] Context reset for session: ${sessionId}`);

  // Notify client
  socket.emit('context:cleared', { sessionId });
}

/**
 * Handle PTT (Push-to-Talk) start
 * Enables PTT mode: disables silence timer, prepares for full audio accumulation
 */
function handlePTTStart(socket: Socket): void {
  const state = socketStates.get(socket.id);
  if (!state) return;

  // Enable PTT mode
  state.isPTTMode = true;

  // Clear any existing silence timer (not needed in PTT mode)
  if (state.silenceTimer) {
    clearTimeout(state.silenceTimer);
    state.silenceTimer = null;
  }

  // Clear PTT buffer for fresh start
  state.pttAudioBuffer.clear();

  // Also clear regular buffer and detector to avoid mixing modes
  state.audioBuffer.clear();
  state.detector.clearAccumulated();
  state.lastTranscript = '';

  console.log(`[Socket] PTT mode started for session: ${state.sessionId}`);
}

/**
 * Handle PTT (Push-to-Talk) end
 * Processes all accumulated audio at once, then disables PTT mode
 */
async function handlePTTEnd(socket: Socket): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.isPTTMode) return;

  const sessionId = state.sessionId || socket.id;

  // Check if we have any audio to process
  if (!state.pttAudioBuffer.hasAudio()) {
    console.log(`[Socket] PTT ended with no audio for session: ${sessionId}`);
    state.isPTTMode = false;
    return;
  }

  // Wait for any pending processing using Promise-based queue
  if (state.processingPromise) {
    console.log(`[Socket] PTT end waiting for pending processing for session: ${sessionId}`);
    await state.processingPromise;
  }

  // Double-check after awaiting (prevent race)
  if (state.processingPromise) {
    console.log(`[Socket] PTT end ignored - already processing for session: ${sessionId}`);
    return;
  }

  const durationMs = state.pttAudioBuffer.getDuration();
  const sizeBytes = state.pttAudioBuffer.getTotalSize();

  console.log(`[Socket] PTT ended - processing ${durationMs}ms of audio (${sizeBytes} bytes) for session: ${sessionId}`);

  // Notify client that transcription is starting
  socket.emit('ptt:transcribing', { durationMs, sizeBytes });

  // Track this processing in the promise queue
  state.processingPromise = (async () => {
    state.isProcessing = true;
    try {
      // Get segments for transcription (handles >25MB recordings)
      const segments = state.pttAudioBuffer.getSegmentsForTranscription();

      // Transcribe all segments
      const result = await whisperService.transcribeSegments(segments, state.languagePreference || undefined);

      if (!result.text || result.text.trim() === '') {
        console.log(`[Socket] PTT transcription returned empty for session: ${sessionId}`);
        socket.emit('ptt:complete', { fullTranscript: '', durationMs });
        return;
      }

      // Normalize the transcript
      const normalizedText = normalizeTranscript(result.text);

      // Emit full transcript
      socket.emit('transcript:final', {
        text: normalizedText,
        language: result.language,
        confidence: result.confidence,
        isFinal: true,
      });

      socket.emit('ptt:complete', { fullTranscript: normalizedText, durationMs });

      console.log(`[Socket] PTT transcript: "${normalizedText.substring(0, 100)}..."`);

      // Process as question (use the full transcript)
      await processQuestion(socket, normalizedText, result.language);

    } catch (error) {
      console.error('[Socket] PTT transcription error:', error);
      socket.emit('error', {
        message: 'Failed to process PTT audio',
        code: 'PTT_ERROR',
      });
    } finally {
      // Clean up PTT state
      state.pttAudioBuffer.clear();
      state.isPTTMode = false;
      state.isProcessing = false;
      state.processingPromise = null;

      console.log(`[Socket] PTT mode ended for session: ${sessionId}`);
    }
  })();

  // Wait for processing to complete
  await state.processingPromise;
}

/**
 * Handle complete PTT audio (new approach - no chunking during recording)
 * This receives the complete audio file AFTER recording stops
 */
async function handlePTTAudio(socket: Socket, data: PTTAudioPayload): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state) {
    socket.emit('error', { message: 'No socket state', code: 'NO_STATE' });
    return;
  }

  const sessionId = state.sessionId || socket.id;

  // Validate data
  if (!data.data || data.data.length === 0) {
    console.log(`[Socket] PTT audio received with no data for session: ${sessionId}`);
    socket.emit('ptt:complete', { fullTranscript: '', durationMs: data.durationMs || 0 });
    return;
  }

  // Prevent concurrent processing
  if (state.processingPromise) {
    console.log(`[Socket] PTT audio waiting for pending processing for session: ${sessionId}`);
    await state.processingPromise;
  }

  const sizeBytes = Math.round(data.data.length * 0.75); // Base64 -> binary size estimate
  console.log(`[Socket] PTT audio received - ${data.durationMs}ms, ${sizeBytes} bytes, format=${data.format} for session: ${sessionId}`);

  // Notify client that transcription is starting
  socket.emit('ptt:transcribing', { durationMs: data.durationMs, sizeBytes });

  // Track processing
  state.processingPromise = (async () => {
    state.isProcessing = true;
    try {
      // 1. Decode complete audio
      const audioBuffer = Buffer.from(data.data, 'base64');

      // 2. Normalize audio (boost quiet speech) - only for WAV format
      let normalizedBuffer: Buffer = audioBuffer;
      if (data.format === 'wav') {
        const normResult = await normalizeAudioBuffer(audioBuffer, data.format);
        normalizedBuffer = Buffer.from(normResult.buffer);
        if (normResult.wasNormalized) {
          console.log(`[Socket] Audio normalized: ${(normResult.originalPeak * 100).toFixed(1)}% -> ${(normResult.originalPeak * normResult.appliedGain * 100).toFixed(1)}%`);
        }
      }

      // 3. Transcribe with optimal PTT settings (temperature=0)
      const result = await whisperService.transcribePTT(
        normalizedBuffer,
        state.languagePreference || undefined,
        data.format
      );

      if (!result.text || result.text.trim() === '') {
        console.log(`[Socket] PTT audio transcription returned empty for session: ${sessionId}`);
        socket.emit('ptt:complete', { fullTranscript: '', durationMs: data.durationMs });
        return;
      }

      // 4. Normalize the transcript text
      const normalizedText = normalizeTranscript(result.text);

      // 5. Emit results
      socket.emit('transcript:final', {
        text: normalizedText,
        language: result.language,
        confidence: result.confidence,
        isFinal: true,
      });

      socket.emit('ptt:complete', { fullTranscript: normalizedText, durationMs: data.durationMs });

      console.log(`[Socket] PTT audio transcript: "${normalizedText.substring(0, 100)}..."`);

      // 6. Process as question
      await processQuestion(socket, normalizedText, result.language);

    } catch (error: any) {
      console.error('[Socket] PTT audio processing error:', error);

      // Determine specific error message for client
      let errorMessage = 'Failed to process PTT audio';
      let errorCode = 'PTT_AUDIO_ERROR';

      if (error?.status === 401 || error?.message?.includes('401')) {
        errorMessage = 'OpenAI API key is invalid or not configured. Please check your API key.';
        errorCode = 'API_KEY_INVALID';
      } else if (error?.status === 429 || error?.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded or no API credits remaining. Please check your OpenAI billing.';
        errorCode = 'RATE_LIMIT';
      } else if (error?.message?.includes('OPENAI_API_KEY is not configured')) {
        errorMessage = 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.';
        errorCode = 'API_KEY_MISSING';
      }

      socket.emit('error', {
        message: errorMessage,
        code: errorCode,
      });
    } finally {
      state.isProcessing = false;
      state.processingPromise = null;
    }
  })();

  // Wait for processing to complete
  await state.processingPromise;
}

function handleSessionEnd(socket: Socket): void {
  const state = socketStates.get(socket.id);
  if (!state || !state.sessionId) return;

  const sessionId = state.sessionId;

  // Clean up conversation context
  conversationContextService.clearContext(sessionId);

  // Clean up local state
  if (state.silenceTimer) {
    clearTimeout(state.silenceTimer);
  }
  state.sessionId = null;
  state.audioBuffer.clear();
  state.lastTranscript = '';

  socket.emit('session:ended', {
    sessionId,
    exchangeCount: 0, // Would be tracked in production
  });

  console.log(`[Socket] Session ended: ${sessionId}`);
}

function handleDisconnect(socket: Socket): void {
  const state = socketStates.get(socket.id);
  if (state) {
    if (state.silenceTimer) {
      clearTimeout(state.silenceTimer);
    }
    if (state.reviewerQuestionTimer) {
      clearTimeout(state.reviewerQuestionTimer);
    }
    socketStates.delete(socket.id);
  }
  console.log(`[Socket] Client disconnected: ${socket.id}`);
}

// =============================================
// Reviewer Mode Handlers
// =============================================

async function handleReviewerStartSession(
  socket: Socket,
  config: ReviewerSessionConfig
): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state) return;

  try {
    console.log(`[Socket] Starting reviewer session with config:`, config);

    const result = await reviewerSessionService.createSession(config);

    state.reviewerSessionId = result.sessionId;
    state.reviewerQuestionStartTime = Date.now();

    // Set up timer if timed mode
    if (config.timeLimitPerQ) {
      state.reviewerQuestionTimer = setTimeout(() => {
        handleReviewerTimeUp(socket, result.firstQuestion.id);
      }, config.timeLimitPerQ * 1000);
    }

    socket.emit('reviewer:sessionStarted' as any, {
      sessionId: result.sessionId,
      firstQuestion: result.firstQuestion,
    });

    console.log(`[Socket] Reviewer session started: ${result.sessionId}`);
  } catch (error) {
    console.error('[Socket] Error starting reviewer session:', error);
    socket.emit('reviewer:error' as any, {
      message: 'Failed to start reviewer session',
      code: 'SESSION_START_ERROR',
    });
  }
}

async function handleReviewerSubmitAnswer(
  socket: Socket,
  submission: ReviewerAnswerSubmission
): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.reviewerSessionId) {
    socket.emit('reviewer:error' as any, {
      message: 'No active reviewer session',
      code: 'NO_SESSION',
    });
    return;
  }

  try {
    // Clear timer
    if (state.reviewerQuestionTimer) {
      clearTimeout(state.reviewerQuestionTimer);
      state.reviewerQuestionTimer = null;
    }

    // Calculate time spent
    const timeSpentSec = state.reviewerQuestionStartTime
      ? Math.round((Date.now() - state.reviewerQuestionStartTime) / 1000)
      : submission.timeSpentSec || 0;

    const evaluation = await reviewerSessionService.submitAnswer(
      state.reviewerSessionId,
      {
        ...submission,
        timeSpentSec,
      }
    );

    socket.emit('reviewer:evaluation' as any, evaluation);

    console.log(`[Socket] Answer evaluated: ${evaluation.isCorrect ? 'correct' : 'incorrect'}`);
  } catch (error) {
    console.error('[Socket] Error submitting answer:', error);
    socket.emit('reviewer:error' as any, {
      message: 'Failed to submit answer',
      code: 'SUBMIT_ERROR',
    });
  }
}

async function handleReviewerRequestNext(socket: Socket): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.reviewerSessionId) {
    socket.emit('reviewer:error' as any, {
      message: 'No active reviewer session',
      code: 'NO_SESSION',
    });
    return;
  }

  try {
    const session = await reviewerSessionService.getSession(state.reviewerSessionId);
    if (!session) {
      socket.emit('reviewer:error' as any, {
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
      return;
    }

    const question = await reviewerSessionService.getNextQuestion(state.reviewerSessionId);

    if (!question) {
      // Session complete
      const summary = await reviewerSessionService.getSessionSummary(state.reviewerSessionId);
      socket.emit('reviewer:sessionComplete' as any, summary);
      state.reviewerSessionId = null;
      return;
    }

    // Reset timer
    state.reviewerQuestionStartTime = Date.now();
    if (session.timeLimitPerQ) {
      state.reviewerQuestionTimer = setTimeout(() => {
        handleReviewerTimeUp(socket, question.id);
      }, session.timeLimitPerQ * 1000);
    }

    socket.emit('reviewer:question' as any, question);

    console.log(`[Socket] Next question sent: ${question.questionOrder}/${session.totalQuestions}`);
  } catch (error) {
    console.error('[Socket] Error getting next question:', error);
    socket.emit('reviewer:error' as any, {
      message: 'Failed to get next question',
      code: 'NEXT_ERROR',
    });
  }
}

function handleReviewerTimeUp(socket: Socket, questionId: string): void {
  const state = socketStates.get(socket.id);
  if (!state) return;

  console.log(`[Socket] Time up for question: ${questionId}`);

  socket.emit('reviewer:timeUp' as any, { questionId });

  // Clear timer state
  state.reviewerQuestionTimer = null;
}

async function handleReviewerEndSession(socket: Socket): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.reviewerSessionId) {
    socket.emit('reviewer:error' as any, {
      message: 'No active reviewer session',
      code: 'NO_SESSION',
    });
    return;
  }

  try {
    // Clear timer
    if (state.reviewerQuestionTimer) {
      clearTimeout(state.reviewerQuestionTimer);
      state.reviewerQuestionTimer = null;
    }

    const summary = await reviewerSessionService.endSession(state.reviewerSessionId);

    socket.emit('reviewer:sessionComplete' as any, summary);

    console.log(`[Socket] Reviewer session ended: ${state.reviewerSessionId}`);

    state.reviewerSessionId = null;
    state.reviewerQuestionStartTime = null;
  } catch (error) {
    console.error('[Socket] Error ending reviewer session:', error);
    socket.emit('reviewer:error' as any, {
      message: 'Failed to end session',
      code: 'END_ERROR',
    });
  }
}
