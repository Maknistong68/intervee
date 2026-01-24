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
}

// Singleton instance
export const socketService = new SocketService();
