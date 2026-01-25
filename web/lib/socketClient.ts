/**
 * Socket.IO client for web app
 * Communicates with backend for PTT transcription and answers
 */

import { io, Socket } from 'socket.io-client';

// Server URL - uses relative path for same-origin, or configure for different origin
const getServerUrl = (): string => {
  if (typeof window === 'undefined') return '';

  // Check for explicitly configured URL
  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (configuredUrl) return configuredUrl;

  // Default: backend runs on port 3001
  // IMPORTANT: Match the page protocol to avoid Mixed Content blocks on mobile
  const { hostname, protocol } = window.location;
  const wsProtocol = protocol === 'https:' ? 'https' : 'http';
  return `${wsProtocol}://${hostname}:3001`;
};

// Types matching backend events
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
  originalTranscript?: string;
  interpretedAs?: string;
  topic?: string;
  suggestedFollowUps?: string[];
}

export interface PTTTranscribing {
  durationMs: number;
  sizeBytes: number;
}

export interface PTTComplete {
  fullTranscript: string;
  durationMs: number;
}

export interface SocketError {
  message: string;
  code: string;
}

// Streaming answer data
export interface AnswerStream {
  chunk: string;
  done: boolean;
}

// Partial transcript for real-time feedback
export interface TranscriptPartial {
  text: string;
}

// Interpreted/corrected question
export interface TranscriptInterpreted {
  correctedQuestion: string;
}

// Event handler types
export interface WebSocketEvents {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: SocketError) => void;
  onTranscriptFinal?: (data: TranscriptFinal) => void;
  onAnswerReady?: (data: AnswerReady) => void;
  onAnswerGenerating?: (data: { questionText: string }) => void;
  onAnswerStream?: (data: AnswerStream) => void;
  onTranscriptPartial?: (data: TranscriptPartial) => void;
  onTranscriptInterpreted?: (data: TranscriptInterpreted) => void;
  onSessionStarted?: () => void;
  onPTTTranscribing?: (data: PTTTranscribing) => void;
  onPTTComplete?: (data: PTTComplete) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private eventHandlers: WebSocketEvents = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private connectionPromise: Promise<void> | null = null;
  private pendingAudio: { audioBase64: string; durationMs: number; format: string } | null = null;

  /**
   * Connect to the backend socket server
   */
  connect(): Promise<void> {
    // Return existing promise if connection is in progress
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Already connected
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const serverUrl = getServerUrl();
      console.log('[WebSocket] Connecting to:', serverUrl);

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] Connected');
        this.reconnectAttempts = 0;
        this.connectionPromise = null;
        this.eventHandlers.onConnect?.();

        // Retry pending audio if any
        if (this.pendingAudio) {
          console.log('[WebSocket] Retrying pending audio...');
          this.sendCompletePTTAudio(
            this.pendingAudio.audioBase64,
            this.pendingAudio.durationMs,
            this.pendingAudio.format
          );
        }

        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        this.eventHandlers.onDisconnect?.();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionPromise = null;
          reject(new Error('Failed to connect to server'));
        }
      });

      // Set up event listeners
      this.setupEventListeners();
    });

    return this.connectionPromise;
  }

  /**
   * Set up socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('transcript:final', (data: TranscriptFinal) => {
      console.log('[WebSocket] Transcript final:', data.text);
      this.eventHandlers.onTranscriptFinal?.(data);
    });

    this.socket.on('answer:generating', (data: { questionText: string }) => {
      console.log('[WebSocket] Answer generating for:', data.questionText);
      this.eventHandlers.onAnswerGenerating?.(data);
    });

    this.socket.on('answer:ready', (data: AnswerReady) => {
      console.log('[WebSocket] Answer ready');
      this.eventHandlers.onAnswerReady?.(data);
    });

    this.socket.on('ptt:transcribing', (data: PTTTranscribing) => {
      console.log('[WebSocket] PTT transcribing:', data);
      this.eventHandlers.onPTTTranscribing?.(data);
    });

    this.socket.on('ptt:complete', (data: PTTComplete) => {
      console.log('[WebSocket] PTT complete:', data.fullTranscript);
      // Clear pending audio - server confirmed receipt
      this.pendingAudio = null;
      this.eventHandlers.onPTTComplete?.(data);
    });

    this.socket.on('error', (data: SocketError) => {
      console.error('[WebSocket] Error:', data);
      this.eventHandlers.onError?.(data);
    });

    // Streaming answer chunks
    this.socket.on('answer:stream', (data: AnswerStream) => {
      if (!data.done) {
        console.log('[WebSocket] Answer stream chunk received');
      }
      this.eventHandlers.onAnswerStream?.(data);
    });

    // Partial transcript for real-time feedback
    this.socket.on('transcript:partial', (data: TranscriptPartial) => {
      console.log('[WebSocket] Partial transcript:', data.text);
      this.eventHandlers.onTranscriptPartial?.(data);
    });

    // Interpreted/corrected question
    this.socket.on('transcript:interpreted', (data: TranscriptInterpreted) => {
      console.log('[WebSocket] Interpreted as:', data.correctedQuestion);
      this.eventHandlers.onTranscriptInterpreted?.(data);
    });

    // Session started confirmation
    this.socket.on('session:started', () => {
      console.log('[WebSocket] Session started');
      this.eventHandlers.onSessionStarted?.();
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: Partial<WebSocketEvents>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Start a session with language preference
   */
  startSession(languagePreference?: 'eng' | 'fil' | 'mix'): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Starting session with language:', languagePreference);
      this.socket.emit('session:start', { languagePreference });
    }
  }

  /**
   * Update language preference
   */
  setLanguagePreference(languagePreference: 'eng' | 'fil' | 'mix'): void {
    if (this.socket?.connected) {
      this.socket.emit('session:setLanguage', { languagePreference });
    }
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.socket?.connected) {
      this.socket.emit('session:end');
    }
  }

  /**
   * Send complete PTT audio to server for transcription
   * This is the main method for PTT - sends complete audio after recording stops
   */
  sendCompletePTTAudio(audioBase64: string, durationMs: number, format: string): void {
    // Store for retry in case of disconnection
    this.pendingAudio = { audioBase64, durationMs, format };

    if (this.socket?.connected) {
      const sizeKB = Math.round(audioBase64.length * 0.75 / 1024);
      console.log(`[WebSocket] Sending PTT audio: ${durationMs}ms, ${sizeKB}KB, format=${format}`);

      this.socket.emit('ptt:audio', {
        data: audioBase64,
        durationMs,
        format,
        timestamp: Date.now(),
      });

      // Clear pending after emit (socket.io handles retries internally)
      this.pendingAudio = null;
    } else {
      console.error('[WebSocket] Not connected - audio will be sent on reconnect');
    }
  }

  /**
   * Clear any pending audio (call when user cancels recording)
   */
  clearPendingAudio(): void {
    this.pendingAudio = null;
  }

  /**
   * Get the socket instance (for advanced use)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const webSocketClient = new WebSocketClient();
