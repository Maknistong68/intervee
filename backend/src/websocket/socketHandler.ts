import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { whisperService, AudioBufferManager } from '../services/whisperService.js';
import { gptService } from '../services/gptService.js';
import { questionDetector, QuestionDetector } from '../services/questionDetector.js';
import { conversationContextService } from '../services/conversationContext.js';
import { config } from '../config/env.js';
import { DetectedLanguage } from '../utils/languageDetector.js';
import { normalizeTranscript } from '../utils/transcriptNormalizer.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterSocketData,
  AudioChunk,
  SessionState,
} from '../types/index.js';

type LanguagePreference = 'eng' | 'fil' | 'mix';

interface SocketState {
  sessionId: string | null;
  audioBuffer: AudioBufferManager;
  detector: QuestionDetector;
  isProcessing: boolean;
  lastTranscript: string;
  silenceTimer: NodeJS.Timeout | null;
  languagePreference: LanguagePreference | null;
}

const socketStates = new Map<string, SocketState>();

export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: '*', // Configure appropriately for production
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Initialize state for this socket
    socketStates.set(socket.id, {
      sessionId: null,
      audioBuffer: whisperService.createAudioBuffer(),
      detector: new QuestionDetector(),
      isProcessing: false,
      lastTranscript: '',
      silenceTimer: null,
      languagePreference: null,
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
    socket.on('context:reset' as any, () => {
      handleContextReset(socket);
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

async function handleAudioChunk(socket: Socket, data: AudioChunk): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || !state.sessionId) {
    socket.emit('error', { message: 'No active session', code: 'NO_SESSION' });
    return;
  }

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

  // Process audio if we have enough data and not currently processing
  if (state.audioBuffer.isReadyForTranscription() && !state.isProcessing) {
    await processAudioBuffer(socket);
  }
}

async function processAudioBuffer(socket: Socket): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state || state.isProcessing) return;

  state.isProcessing = true;

  try {
    const audioBuffer = state.audioBuffer.getBuffer();
    const result = await whisperService.transcribe(audioBuffer);

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

async function processQuestion(
  socket: Socket,
  questionText: string,
  detectedLanguage: DetectedLanguage
): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state) return;

  const startTime = Date.now();
  const sessionId = state.sessionId || socket.id;

  // Determine final language: USER PREFERENCE takes priority over detection
  let finalLanguage: DetectedLanguage;
  if (state.languagePreference === 'fil') {
    finalLanguage = 'tl';
  } else if (state.languagePreference === 'mix') {
    finalLanguage = 'taglish';
  } else if (state.languagePreference === 'eng') {
    finalLanguage = 'en';
  } else {
    // No preference set - use auto-detected language
    finalLanguage = detectedLanguage;
  }

  // Notify client that we're generating an answer
  socket.emit('answer:generating', { questionText });

  try {
    // Stream the answer for faster perceived response (with session context and language)
    let fullAnswer = '';

    for await (const { chunk, done } of gptService.generateAnswerStream(questionText, undefined, sessionId, finalLanguage)) {
      if (!done) {
        socket.emit('answer:stream', { chunk, done: false });
        fullAnswer += chunk;
      }
    }

    // Send final answer with metadata
    const responseTimeMs = Date.now() - startTime;
    socket.emit('answer:ready', {
      answer: fullAnswer,
      confidence: 0.85, // Will be calculated properly
      citations: [],
      responseTimeMs,
      cached: false,
    });

    // Clear accumulated text for next question
    state.detector.clearAccumulated();
    state.lastTranscript = '';

    console.log(`[Socket] Answer delivered in ${responseTimeMs}ms`);
  } catch (error) {
    console.error('[Socket] Answer generation error:', error);
    socket.emit('error', {
      message: 'Failed to generate answer',
      code: 'GPT_ERROR',
    });
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
  socket.emit('context:cleared' as any, { sessionId });
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
    socketStates.delete(socket.id);
  }
  console.log(`[Socket] Client disconnected: ${socket.id}`);
}
