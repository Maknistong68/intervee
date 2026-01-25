import { io, Socket } from 'socket.io-client';

// Server URL Configuration
// ========================
// For development on physical device (Samsung S24 Ultra):
//   1. Find your PC's IP: run 'ipconfig' in terminal
//   2. Replace 'localhost' with your PC's IP (e.g., '192.168.1.100')
//   3. Make sure PC and phone are on the same WiFi network
//
// Example: const SERVER_URL = 'http://192.168.1.100:3001';
//
const SERVER_URL = __DEV__
  ? 'http://localhost:3001' // Change to your PC's IP for physical device testing
  : 'https://your-production-server.com'; // Production

export interface TranscriptPartial {
  text: string;
  timestamp: number;
}

export interface TranscriptFinal {
  text: string;
  language: 'en' | 'tl' | 'taglish';
  confidence: number;
  isFinal: boolean;
}

export interface AnswerReady {
  answer: string;
  confidence: number;
  citations: Array<{ type: string; reference: string }>;
  responseTimeMs: number;
  cached: boolean;
  // OSH Intelligence extended fields
  originalTranscript?: string;
  interpretedAs?: string;
  topic?: string;
  suggestedFollowUps?: string[];
}

// OSH Intelligence types
export interface TranscriptInterpretation {
  original: string;
  interpreted: string;
  confidence: number;
  suggestedTopics?: string[];
  alternativeInterpretations?: string[];
}

export interface AnswerStream {
  chunk: string;
  done: boolean;
}

// PTT-specific types
export interface PTTTranscribing {
  durationMs: number;
  sizeBytes: number;
}

export interface PTTComplete {
  fullTranscript: string;
  durationMs: number;
}

// Reviewer types
export interface ReviewerQuestion {
  id: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'SCENARIO_BASED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceRule: string;
  options?: string[];
  questionOrder: number;
}

export interface ReviewerEvaluation {
  questionId: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer?: string | number | boolean;
  keyPointsFound?: string[];
  keyPointsMissed?: string[];
}

export interface ReviewerSessionSummary {
  sessionId: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  score: number;
  byType: Record<string, { total: number; correct: number }>;
  byDifficulty: Record<string, { total: number; correct: number }>;
  weakAreas: string[];
  strongAreas: string[];
  averageTimePerQuestion: number;
}

export interface ReviewerSessionConfig {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionTypes: Array<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'SCENARIO_BASED'>;
  focusAreas: string[];
  totalQuestions: number;
  timeLimitPerQ?: number;
  language: string;
}

export interface SocketEvents {
  onTranscriptPartial: (data: TranscriptPartial) => void;
  onTranscriptFinal: (data: TranscriptFinal) => void;
  onTranscriptInterpreted: (data: TranscriptInterpretation) => void;
  onAnswerGenerating: (data: { questionText: string }) => void;
  onAnswerStream: (data: AnswerStream) => void;
  onAnswerReady: (data: AnswerReady) => void;
  onSessionStarted: (data: { sessionId: string }) => void;
  onSessionEnded: (data: { sessionId: string; exchangeCount: number }) => void;
  onError: (data: { message: string; code: string }) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  // PTT-specific events
  onPTTTranscribing: (data: PTTTranscribing) => void;
  onPTTComplete: (data: PTTComplete) => void;
  // Reviewer events
  onReviewerSessionStarted: (data: { sessionId: string; firstQuestion: ReviewerQuestion }) => void;
  onReviewerQuestion: (data: ReviewerQuestion) => void;
  onReviewerEvaluation: (data: ReviewerEvaluation) => void;
  onReviewerTimeUp: (data: { questionId: string }) => void;
  onReviewerSessionComplete: (data: ReviewerSessionSummary) => void;
  onReviewerError: (data: { message: string; code: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Partial<SocketEvents> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private pendingAudio: { audioBase64: string; durationMs: number; format: string } | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'], // Allow fallback to polling
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 30000, // Increased timeout for slower networks
        // Larger buffer for audio data
        forceNew: false,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected');
        this.reconnectAttempts = 0;
        this.eventHandlers.onConnect?.();

        // Retry sending pending audio if there was a disconnection
        if (this.pendingAudio) {
          console.log('[Socket] Retrying pending audio send...');
          this.sendCompletePTTAudio(
            this.pendingAudio.audioBase64,
            this.pendingAudio.durationMs,
            this.pendingAudio.format
          );
        }

        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket] Disconnected');
        this.eventHandlers.onDisconnect?.();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to server'));
        }
      });

      // Set up event listeners
      this.socket.on('transcript:partial', (data: TranscriptPartial) => {
        this.eventHandlers.onTranscriptPartial?.(data);
      });

      this.socket.on('transcript:final', (data: TranscriptFinal) => {
        this.eventHandlers.onTranscriptFinal?.(data);
      });

      this.socket.on('transcript:interpreted', (data: TranscriptInterpretation) => {
        console.log('[Socket] Transcript interpreted:', data.interpreted);
        this.eventHandlers.onTranscriptInterpreted?.(data);
      });

      this.socket.on('answer:generating', (data: { questionText: string }) => {
        this.eventHandlers.onAnswerGenerating?.(data);
      });

      this.socket.on('answer:stream', (data: AnswerStream) => {
        this.eventHandlers.onAnswerStream?.(data);
      });

      this.socket.on('answer:ready', (data: AnswerReady) => {
        this.eventHandlers.onAnswerReady?.(data);
      });

      this.socket.on('session:started', (data: { sessionId: string }) => {
        this.eventHandlers.onSessionStarted?.(data);
      });

      this.socket.on('session:ended', (data: { sessionId: string; exchangeCount: number }) => {
        this.eventHandlers.onSessionEnded?.(data);
      });

      this.socket.on('error', (data: { message: string; code: string }) => {
        console.error('[Socket] Error:', data);
        this.eventHandlers.onError?.(data);
      });

      // PTT-specific events
      this.socket.on('ptt:transcribing', (data: PTTTranscribing) => {
        console.log('[Socket] PTT transcribing:', data);
        this.eventHandlers.onPTTTranscribing?.(data);
      });

      this.socket.on('ptt:complete', (data: PTTComplete) => {
        console.log('[Socket] PTT complete:', data);
        // Clear pending audio - server confirmed receipt
        this.pendingAudio = null;
        this.eventHandlers.onPTTComplete?.(data);
      });

      // Reviewer events
      this.socket.on('reviewer:sessionStarted', (data: { sessionId: string; firstQuestion: ReviewerQuestion }) => {
        console.log('[Socket] Reviewer session started:', data.sessionId);
        this.eventHandlers.onReviewerSessionStarted?.(data);
      });

      this.socket.on('reviewer:question', (data: ReviewerQuestion) => {
        console.log('[Socket] Reviewer question received:', data.questionOrder);
        this.eventHandlers.onReviewerQuestion?.(data);
      });

      this.socket.on('reviewer:evaluation', (data: ReviewerEvaluation) => {
        console.log('[Socket] Reviewer evaluation:', data.isCorrect ? 'correct' : 'incorrect');
        this.eventHandlers.onReviewerEvaluation?.(data);
      });

      this.socket.on('reviewer:timeUp', (data: { questionId: string }) => {
        console.log('[Socket] Reviewer time up:', data.questionId);
        this.eventHandlers.onReviewerTimeUp?.(data);
      });

      this.socket.on('reviewer:sessionComplete', (data: ReviewerSessionSummary) => {
        console.log('[Socket] Reviewer session complete:', data.score);
        this.eventHandlers.onReviewerSessionComplete?.(data);
      });

      this.socket.on('reviewer:error', (data: { message: string; code: string }) => {
        console.error('[Socket] Reviewer error:', data);
        this.eventHandlers.onReviewerError?.(data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  setEventHandlers(handlers: Partial<SocketEvents>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Session management
  startSession(languagePreference?: 'eng' | 'fil' | 'mix'): void {
    if (this.socket?.connected) {
      this.socket.emit('session:start', { languagePreference });
    }
  }

  // Update language preference mid-session
  setLanguagePreference(languagePreference: 'eng' | 'fil' | 'mix'): void {
    if (this.socket?.connected) {
      this.socket.emit('session:setLanguage', { languagePreference });
    }
  }

  endSession(): void {
    if (this.socket?.connected) {
      this.socket.emit('session:end');
    }
  }

  // Audio streaming
  sendAudioChunk(base64Data: string, timestamp: number, duration: number): void {
    if (this.socket?.connected) {
      this.socket.emit('audio:chunk', {
        data: base64Data,
        timestamp,
        duration,
      });
    }
  }

  // PTT (Push-to-Talk) methods
  /**
   * Signal start of PTT recording
   * Server will accumulate all audio until endPTT() is called
   */
  startPTT(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Starting PTT mode');
      this.socket.emit('ptt:start');
    }
  }

  /**
   * Signal end of PTT recording
   * Server will process all accumulated audio and return full transcript
   * @deprecated Use sendCompletePTTAudio instead for better accuracy
   */
  endPTT(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Ending PTT mode');
      this.socket.emit('ptt:end');
    }
  }

  /**
   * Send complete PTT audio to server (new approach - no chunking)
   * Audio is sent AFTER recording stops, as a single complete file
   * Includes retry logic for network failures
   */
  sendCompletePTTAudio(audioBase64: string, durationMs: number, format: string): void {
    // Store for retry in case of disconnection
    this.pendingAudio = { audioBase64, durationMs, format };

    if (this.socket?.connected) {
      const sizeKB = Math.round(audioBase64.length * 0.75 / 1024);
      console.log(`[Socket] Sending complete PTT audio: ${durationMs}ms, ${sizeKB}KB, format=${format}`);

      this.socket.emit('ptt:audio', {
        data: audioBase64,
        durationMs,
        format,
        timestamp: Date.now(),
      });

      // Clear pending audio after successful emit
      // Note: This doesn't guarantee delivery, but socket.io handles retries internally
      this.pendingAudio = null;
    } else {
      console.error('[Socket] Cannot send PTT audio - not connected, will retry on reconnect');
      // pendingAudio is kept for retry on reconnect
    }
  }

  /**
   * Clear any pending audio (call when user cancels or starts new recording)
   */
  clearPendingAudio(): void {
    this.pendingAudio = null;
  }

  // Reviewer methods
  /**
   * Start a reviewer quiz session
   */
  startReviewerSession(config: ReviewerSessionConfig): void {
    if (this.socket?.connected) {
      console.log('[Socket] Starting reviewer session');
      this.socket.emit('reviewer:startSession', config);
    }
  }

  /**
   * Submit an answer for the current question
   */
  submitReviewerAnswer(questionId: string, answer: string | number | boolean, timeSpentSec: number): void {
    if (this.socket?.connected) {
      console.log('[Socket] Submitting reviewer answer');
      this.socket.emit('reviewer:submitAnswer', { questionId, answer, timeSpentSec });
    }
  }

  /**
   * Request the next question
   */
  requestNextQuestion(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Requesting next question');
      this.socket.emit('reviewer:requestNext');
    }
  }

  /**
   * End the reviewer session early
   */
  endReviewerSession(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Ending reviewer session');
      this.socket.emit('reviewer:endSession');
    }
  }
}

// Singleton instance
export const socketService = new SocketService();
