import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { whisperService, AudioBufferManager } from '../services/whisperService.js';
import { gptService } from '../services/gptService.js';
import { questionDetector, QuestionDetector } from '../services/questionDetector.js';
import { config } from '../config/env.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterSocketData,
  AudioChunk,
  SessionState,
} from '../types/index.js';

interface SocketState {
  sessionId: string | null;
  audioBuffer: AudioBufferManager;
  detector: QuestionDetector;
  isProcessing: boolean;
  lastTranscript: string;
  silenceTimer: NodeJS.Timeout | null;
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
    });

    // Handle session start
    socket.on('session:start', () => {
      handleSessionStart(socket);
    });

    // Handle audio chunks
    socket.on('audio:chunk', (data: AudioChunk) => {
      handleAudioChunk(socket, data);
    });

    // Handle session end
    socket.on('session:end', () => {
      handleSessionEnd(socket);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });

  console.log('[Socket] WebSocket server initialized');
  return io;
}

function handleSessionStart(socket: Socket): void {
  const state = socketStates.get(socket.id);
  if (!state) return;

  const sessionId = uuidv4();
  state.sessionId = sessionId;
  state.audioBuffer.clear();
  state.lastTranscript = '';

  socket.emit('session:started', { sessionId });
  console.log(`[Socket] Session started: ${sessionId}`);
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

    // Emit partial transcript
    socket.emit('transcript:partial', {
      text: result.text,
      timestamp: Date.now(),
    });

    // Accumulate text for question detection
    state.detector.accumulateText(result.text);
    state.lastTranscript = state.detector.getAccumulatedText();

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
  language: string
): Promise<void> {
  const state = socketStates.get(socket.id);
  if (!state) return;

  const startTime = Date.now();

  // Notify client that we're generating an answer
  socket.emit('answer:generating', { questionText });

  try {
    // Stream the answer for faster perceived response
    let fullAnswer = '';

    for await (const { chunk, done } of gptService.generateAnswerStream(questionText)) {
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

function handleSessionEnd(socket: Socket): void {
  const state = socketStates.get(socket.id);
  if (!state || !state.sessionId) return;

  const sessionId = state.sessionId;

  // Clean up
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
