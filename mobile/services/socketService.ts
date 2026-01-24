import { io, Socket } from 'socket.io-client';

// Server URL - update this for production
const SERVER_URL = __DEV__
  ? 'http://localhost:3001' // Development
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

export interface SocketEvents {
  onTranscriptPartial: (data: TranscriptPartial) => void;
  onTranscriptFinal: (data: TranscriptFinal) => void;
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
}

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Partial<SocketEvents> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SERVER_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected');
        this.reconnectAttempts = 0;
        this.eventHandlers.onConnect?.();
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
        this.eventHandlers.onPTTComplete?.(data);
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
   */
  endPTT(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Ending PTT mode');
      this.socket.emit('ptt:end');
    }
  }
}

// Singleton instance
export const socketService = new SocketService();
