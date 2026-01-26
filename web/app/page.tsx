'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Loader2, AlertCircle, RotateCcw, Settings, FlaskConical, Puzzle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WebAudioRecorder } from '@/lib/webAudioRecorder';
import { webSocketClient } from '@/lib/socketClient';
import ChatInputBar from '@/components/ChatInputBar';
import SettingsPanel from '@/components/SettingsPanel';
import SelfTunerPanel from '@/components/SelfTunerPanel';
import PopupExtensionCreator from '@/components/PopupExtensionCreator';
import PopupRenderer from '@/components/PopupRenderer';
import ExtensionLauncher from '@/components/ExtensionLauncher';
import type { InteractionMode, ResponseMode, PopupExtension } from '@/components/types';

const LANGUAGE_OPTIONS = [
  { code: 'eng' as const, label: 'EN', speechCode: 'en-US' },
  { code: 'fil' as const, label: 'FIL', speechCode: 'fil-PH' },
  { code: 'mix' as const, label: 'MIX', speechCode: 'en-PH' },
];

interface Message {
  id: string;
  type: 'question' | 'answer';
  content: string;
  confidence?: number;
  timestamp: Date;
  demo?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [languagePreference, setLanguagePreference] = useState<'eng' | 'fil' | 'mix'>('mix');
  const [responseMode, setResponseMode] = useState<ResponseMode>('concise');

  // PTT Mode state
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSelfTunerOpen, setIsSelfTunerOpen] = useState(false);

  // Streaming answer state
  const [streamingAnswer, setStreamingAnswer] = useState<string>('');

  // Popup Extension Creator state
  const [isExtensionCreatorOpen, setIsExtensionCreatorOpen] = useState(false);
  const [savedExtensions, setSavedExtensions] = useState<PopupExtension[]>([]);
  const [activeExtension, setActiveExtension] = useState<PopupExtension | null>(null);
  const [isExtensionPopupOpen, setIsExtensionPopupOpen] = useState(false);

  // Refs for scrolling and speech recognition
  const answerTopRef = useRef<HTMLDivElement>(null);
  const answerEndRef = useRef<HTMLDivElement>(null);
  const transcriptBufferRef = useRef('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  // Refs for auto-scroll
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeout1Ref = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeout2Ref = useRef<NodeJS.Timeout | null>(null);

  // Audio recorder ref (replaces SpeechRecognition)
  const audioRecorderRef = useRef<WebAudioRecorder | null>(null);

  // Timeout ref for server response
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track if we're waiting for a response (for timeout callback)
  const waitingForResponseRef = useRef(false);

  // Ref to hold processQuestion for socket callback (avoids dependency loop)
  const processQuestionRef = useRef<(question: string) => void>(() => {});

  const SCROLL_SPEED = 50;

  // Smart auto-scroll: scroll to top of answer, then slowly down
  const startAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    if (scrollTimeout1Ref.current) clearTimeout(scrollTimeout1Ref.current);
    if (scrollTimeout2Ref.current) clearTimeout(scrollTimeout2Ref.current);

    userScrolledRef.current = false;

    scrollTimeout1Ref.current = setTimeout(() => {
      answerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      scrollTimeout2Ref.current = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        autoScrollIntervalRef.current = setInterval(() => {
          if (userScrolledRef.current) {
            if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
            return;
          }

          const maxScroll = container.scrollHeight - container.clientHeight;
          if (container.scrollTop >= maxScroll - 10) {
            if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
            return;
          }

          container.scrollTop += SCROLL_SPEED / 10;
        }, 100);
      }, 1000);
    }, 100);
  }, []);

  const handleScroll = useCallback(() => {
    userScrolledRef.current = true;
  }, []);

  // Process and send question
  const processQuestion = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const cleanQuestion = question.trim();
    transcriptBufferRef.current = '';
    setCurrentTranscript('');

    const questionMessage: Message = {
      id: Date.now().toString(),
      type: 'question',
      content: cleanQuestion,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, questionMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cleanQuestion,
          languagePreference: languagePreference,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get answer');
      if (data.demo) setIsDemo(true);

      const answerMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: data.answer,
        confidence: data.confidence,
        timestamp: new Date(),
        demo: data.demo,
      };

      setMessages((prev) => [...prev, answerMessage]);
      setTimeout(startAutoScroll, 100);

    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, startAutoScroll, languagePreference]);

  // Keep processQuestionRef updated
  useEffect(() => {
    processQuestionRef.current = processQuestion;
  }, [processQuestion]);

  // Initialize socket connection and set up event handlers
  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!WebAudioRecorder.isSupported()) {
      setError('Audio recording not supported in this browser. Please use Chrome, Firefox, or Edge.');
      return;
    }

    // Connect to socket server
    webSocketClient.connect().then(() => {
      setIsSocketConnected(true);
      webSocketClient.startSession(languagePreference);
    }).catch((err) => {
      console.error('[INTERVEE] Socket connection failed:', err);
      // Don't show error - will fall back to HTTP API
    });

    // Set up socket event handlers
    webSocketClient.setEventHandlers({
      onConnect: () => {
        setIsSocketConnected(true);
        console.log('[INTERVEE] Socket connected');
      },
      onDisconnect: () => {
        setIsSocketConnected(false);
        console.log('[INTERVEE] Socket disconnected');
      },
      onPTTTranscribing: () => {
        // Audio received by server, now transcribing
        console.log('[INTERVEE] Server transcribing audio...');
      },
      onPTTComplete: (data) => {
        // Transcription complete - backend will now generate answer via socket
        console.log('[INTERVEE] Transcription complete:', data.fullTranscript);

        if (data.fullTranscript && data.fullTranscript.trim()) {
          transcriptBufferRef.current = data.fullTranscript;
          setCurrentTranscript(data.fullTranscript);
          // Add question to messages (answer will come via onAnswerReady)
          const questionMessage: Message = {
            id: Date.now().toString(),
            type: 'question',
            content: data.fullTranscript.trim(),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, questionMessage]);
          setIsProcessingAudio(false);
          setIsLoading(true); // Show "Generating answer..." while waiting
          setStreamingAnswer(''); // Clear any previous streaming answer
          waitingForResponseRef.current = true;

          // Set timeout for server response (30 seconds)
          if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
          }
          responseTimeoutRef.current = setTimeout(() => {
            if (waitingForResponseRef.current) {
              waitingForResponseRef.current = false;
              setError('Server not responding. Please check your connection and try again.');
              setIsLoading(false);
              setStreamingAnswer('');
            }
          }, 30000);
        } else {
          setIsProcessingAudio(false);
          setError('Could not transcribe audio. Please try speaking more clearly.');
        }
      },
      onAnswerStream: (data) => {
        // Clear timeout on first stream chunk - we're receiving data
        waitingForResponseRef.current = false;
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
          responseTimeoutRef.current = null;
        }

        if (data.done) {
          // Stream complete - answer:ready will handle final
          return;
        }
        setStreamingAnswer(prev => prev + data.chunk);
      },
      onAnswerReady: (data) => {
        // Answer received from backend via socket
        console.log('[INTERVEE] Answer received via socket');

        // Clear timeout and waiting state
        waitingForResponseRef.current = false;
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
          responseTimeoutRef.current = null;
        }

        setIsLoading(false);
        setStreamingAnswer(''); // Clear streaming state

        const answerMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'answer',
          content: data.answer,
          confidence: data.confidence,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, answerMessage]);
        setCurrentTranscript('');
        transcriptBufferRef.current = '';

        // Trigger auto-scroll to show the answer
        setTimeout(() => {
          answerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      onError: (err) => {
        console.error('[INTERVEE] Socket error:', err);

        // Clear timeout and waiting state
        waitingForResponseRef.current = false;
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
          responseTimeoutRef.current = null;
        }

        setIsProcessingAudio(false);
        setIsLoading(false);
        setStreamingAnswer('');
        setError(err.message || 'An error occurred during transcription');
      },
    });

    // Cleanup on unmount
    return () => {
      webSocketClient.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PTT Start handler - uses MediaRecorder (no real-time transcription)
  const handlePTTStart = useCallback(async () => {
    if (isLoading || isProcessingAudio) return;

    // Clear previous state
    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    setError(null);
    setStreamingAnswer('');
    setIsPTTActive(true);

    // Create and start audio recorder
    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new WebAudioRecorder();
    }

    const started = await audioRecorderRef.current.start();
    if (!started) {
      setError('Failed to start recording. Please check microphone permissions.');
      setIsPTTActive(false);
      return;
    }

    console.log('[INTERVEE] PTT started - recording audio');
  }, [isLoading, isProcessingAudio]);

  // PTT End handler - stops recording and sends to backend for transcription
  const handlePTTEnd = useCallback(async () => {
    if (!isPTTActive) return;

    setIsPTTActive(false);

    // Stop recording and get audio data
    if (!audioRecorderRef.current) {
      console.warn('[INTERVEE] No recorder to stop');
      return;
    }

    const result = await audioRecorderRef.current.stop();
    if (!result) {
      console.warn('[INTERVEE] No audio recorded');
      return;
    }

    console.log(`[INTERVEE] PTT ended - sending ${Math.round(result.sizeBytes/1024)}KB audio to server`);

    // Check minimum duration (too short = likely no speech)
    if (result.durationMs < 500) {
      console.log('[INTERVEE] Recording too short, ignoring');
      return;
    }

    // Show processing state
    setIsProcessingAudio(true);
    setCurrentTranscript('Processing audio...');

    // Send to backend via socket
    if (webSocketClient.isConnected()) {
      webSocketClient.sendCompletePTTAudio(
        result.audioBase64,
        result.durationMs,
        result.format
      );
    } else {
      // Fallback: try to reconnect and send
      try {
        await webSocketClient.connect();
        webSocketClient.startSession(languagePreference);
        webSocketClient.sendCompletePTTAudio(
          result.audioBase64,
          result.durationMs,
          result.format
        );
      } catch (err) {
        setIsProcessingAudio(false);
        setCurrentTranscript('');
        setError('Unable to connect to server. Please check your connection.');
      }
    }
  }, [isPTTActive, languagePreference]);

  // PTT Cancel handler
  const handlePTTCancel = useCallback(() => {
    if (!isPTTActive && !isProcessingAudio) return;

    setIsPTTActive(false);
    setIsProcessingAudio(false);

    // Cancel recording
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancel();
    }

    // Clear pending audio on server
    webSocketClient.clearPendingAudio();

    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    console.log('[INTERVEE] PTT cancelled');
  }, [isPTTActive, isProcessingAudio]);

  // Reset handler
  const handleReset = useCallback(() => {
    setMessages([]);
    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    setError(null);

    fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'default' }),
    }).catch(() => {});

    console.log('[INTERVEE] Context reset');
  }, []);

  // Spacebar for PTT
  useEffect(() => {
    const isInputElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isInputElement(e.target)) {
        e.preventDefault();
        handlePTTStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isInputElement(e.target)) {
        e.preventDefault();
        handlePTTEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePTTStart, handlePTTEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cancel();
      }
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
      if (scrollTimeout1Ref.current) clearTimeout(scrollTimeout1Ref.current);
      if (scrollTimeout2Ref.current) clearTimeout(scrollTimeout2Ref.current);
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
    };
  }, []);

  // Load language preference
  useEffect(() => {
    const saved = localStorage.getItem('intervee_language');
    if (saved && ['eng', 'fil', 'mix'].includes(saved)) {
      setLanguagePreference(saved as 'eng' | 'fil' | 'mix');
    }
  }, []);

  // Load response mode preference
  useEffect(() => {
    const saved = localStorage.getItem('intervee_response_mode');
    if (saved && ['detailed', 'concise'].includes(saved)) {
      setResponseMode(saved as ResponseMode);
      // Sync with backend
      fetch('/api/documents/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: saved }),
      }).catch(() => {});
    }
  }, []);

  // Load saved extensions
  useEffect(() => {
    const saved = localStorage.getItem('intervee_extensions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PopupExtension[];
        parsed.forEach(ext => {
          ext.createdAt = new Date(ext.createdAt);
          ext.updatedAt = new Date(ext.updatedAt);
        });
        setSavedExtensions(parsed);
      } catch (err) {
        console.error('Failed to load extensions:', err);
      }
    }
  }, []);

  // Save extensions
  useEffect(() => {
    if (savedExtensions.length > 0) {
      localStorage.setItem('intervee_extensions', JSON.stringify(savedExtensions));
    }
  }, [savedExtensions]);

  const handleSaveExtension = useCallback((extension: PopupExtension) => {
    setSavedExtensions(prev => {
      const existing = prev.findIndex(e => e.id === extension.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = extension;
        return updated;
      }
      return [...prev, extension];
    });
  }, []);

  const handleDeleteExtension = useCallback((id: string) => {
    setSavedExtensions(prev => prev.filter(e => e.id !== id));
    const remaining = savedExtensions.filter(e => e.id !== id);
    if (remaining.length === 0) {
      localStorage.removeItem('intervee_extensions');
    }
  }, [savedExtensions]);

  const handleExtensionButtonClick = useCallback((buttonLabel: string) => {
    console.log('[INTERVEE] Extension button clicked:', buttonLabel);
  }, []);

  const handleLanguageChange = useCallback((lang: 'eng' | 'fil' | 'mix') => {
    setLanguagePreference(lang);
    localStorage.setItem('intervee_language', lang);
    // Update socket session language
    webSocketClient.setLanguagePreference(lang);
  }, []);

  const handleResponseModeChange = useCallback((mode: ResponseMode) => {
    setResponseMode(mode);
    localStorage.setItem('intervee_response_mode', mode);
    // Update backend
    fetch('/api/documents/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    }).catch(() => {});
  }, []);

  const getConfidenceColor = (c: number) => c >= 0.8 ? 'bg-green-500' : c >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Header - Clean, no LIVE button */}
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-divider bg-surface">
        <div className="flex items-center gap-1 sm:gap-2">
          <h1 className="text-base sm:text-lg font-bold tracking-wider">INTERVEE</h1>
          {isDemo && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 sm:px-1.5 py-0.5 rounded">DEMO</span>}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-surface-light rounded-full p-0.5">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full transition-all ${
                  languagePreference === lang.code
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Extension Launcher */}
          <ExtensionLauncher
            extensions={savedExtensions}
            onLaunch={(ext) => {
              setActiveExtension(ext);
              setIsExtensionPopupOpen(true);
            }}
          />

          {/* Extension Creator Button */}
          <button
            onClick={() => setIsExtensionCreatorOpen(true)}
            aria-label="Open extension creator"
            title="Popup Extension Creator"
            className="p-1.5 sm:p-2 rounded-full bg-surface-light hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-all border border-divider hover:border-purple-500/30 hidden sm:flex"
          >
            <Puzzle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Self Tuner Button */}
          <button
            onClick={() => setIsSelfTunerOpen(true)}
            aria-label="Open self tuner"
            title="Self Tuner - OSH Knowledge Audit"
            className="p-1.5 sm:p-2 rounded-full bg-surface-light hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-divider hover:border-primary/30 hidden sm:flex"
          >
            <FlaskConical className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="p-1.5 sm:p-2 rounded-full bg-surface-light hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-divider hover:border-primary/30"
          >
            <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Reset Button */}
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              aria-label="Reset conversation"
              title="Reset conversation"
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-surface-light hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 transition-all border border-divider hover:border-orange-500/30"
            >
              <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">RESET</span>
            </button>
          )}
        </div>
      </header>

      {/* Connection Status Banner */}
      {!isSocketConnected && (
        <div className="bg-red-500/90 text-white px-4 py-2 text-center text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Not connected to server. Check your connection.</span>
        </div>
      )}

      {/* Main Chat Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pb-20"
      >
        {messages.length === 0 ? (
          /* Empty State - Ready to chat */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isPTTActive ? 'bg-red-500/30 animate-pulse' : isProcessingAudio ? 'bg-yellow-500/30' : 'bg-primary/20'
            }`}>
              {isProcessingAudio ? (
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
              ) : (
                <Mic className={`w-8 h-8 ${isPTTActive ? 'text-red-400 scale-110' : 'text-primary'}`} />
              )}
            </div>
            <h2 className="text-xl font-bold mb-2">INTERVEE</h2>
            <p className="text-gray-400 mb-1">Philippine OSH Interview Assistant</p>
            <p className="text-gray-500 text-sm mb-4 max-w-sm">
              {isPTTActive
                ? 'Recording... Release to send'
                : isProcessingAudio
                  ? 'Transcribing your audio...'
                  : 'Hold the mic button or press spacebar to ask a question'}
            </p>
            {currentTranscript && !isProcessingAudio && (
              <div className="bg-surface-light rounded-lg px-4 py-2 max-w-md">
                <p className="text-gray-300 text-sm">"{currentTranscript}"</p>
              </div>
            )}
            {!isSocketConnected && !isPTTActive && !isProcessingAudio && (
              <p className="text-yellow-500/70 text-xs mt-2">Connecting to server...</p>
            )}
          </div>
        ) : (
          /* Chat Messages */
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => {
              const isLatestAnswer = message.type === 'answer' &&
                (index === messages.length - 1 ||
                (index === messages.length - 2 && messages[messages.length - 1]?.type === 'question'));

              return (
                <div key={message.id} className="mb-4">
                  {message.type === 'question' ? (
                    <div className="mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">Question</span>
                      <p className="text-gray-400 text-sm">{message.content}</p>
                    </div>
                  ) : (
                    <>
                      {isLatestAnswer && <div ref={answerTopRef} />}
                      <div className="bg-surface border border-primary/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-primary font-semibold uppercase">Answer</span>
                          {message.confidence && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <span className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`} />
                              {Math.round(message.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="text-base sm:text-lg leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 text-gray-300">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 text-gray-300">{children}</ol>,
                              li: ({ children }) => <li className="text-gray-300">{children}</li>,
                              p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-300">{children}</p>,
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-3">
                                  <table className="min-w-full border border-divider rounded text-sm">{children}</table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-surface-light">{children}</thead>,
                              th: ({ children }) => <th className="px-3 py-2 text-left text-primary font-semibold border-b border-divider">{children}</th>,
                              td: ({ children }) => <td className="px-3 py-2 border-t border-divider text-gray-300">{children}</td>,
                              tr: ({ children }) => <tr className="hover:bg-surface-light/50">{children}</tr>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="bg-surface border border-divider rounded-xl p-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating answer...</span>
                </div>
                {streamingAnswer && (
                  <div className="text-base sm:text-lg leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 text-gray-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 text-gray-300">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-300">{children}</li>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-300">{children}</p>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-3">
                            <table className="min-w-full border border-divider rounded text-sm">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-surface-light">{children}</thead>,
                        th: ({ children }) => <th className="px-3 py-2 text-left text-primary font-semibold border-b border-divider">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 border-t border-divider text-gray-300">{children}</td>,
                        tr: ({ children }) => <tr className="hover:bg-surface-light/50">{children}</tr>,
                      }}
                    >
                      {streamingAnswer}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-5 bg-primary/60 ml-1 animate-pulse" />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-xs hover:text-red-300">Dismiss</button>
              </div>
            )}

            <div ref={answerEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input Bar - Always visible */}
      <ChatInputBar
        isPTTActive={isPTTActive}
        isProcessing={isLoading || isProcessingAudio}
        isVisible={true}
        onPTTStart={handlePTTStart}
        onPTTEnd={handlePTTEnd}
        onPTTCancel={handlePTTCancel}
        currentTranscript={isPTTActive ? 'Recording...' : (isProcessingAudio ? 'Transcribing...' : currentTranscript)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        interactionMode="push-to-talk"
        onModeChange={() => {}}
        responseMode={responseMode}
        onResponseModeChange={handleResponseModeChange}
      />

      {/* Self Tuner Panel */}
      <SelfTunerPanel
        isOpen={isSelfTunerOpen}
        onClose={() => setIsSelfTunerOpen(false)}
      />

      {/* Popup Extension Creator */}
      <PopupExtensionCreator
        isOpen={isExtensionCreatorOpen}
        onClose={() => setIsExtensionCreatorOpen(false)}
        onSave={handleSaveExtension}
        extensions={savedExtensions}
        onDelete={handleDeleteExtension}
      />

      {/* Popup Extension Renderer */}
      <PopupRenderer
        extension={activeExtension}
        isOpen={isExtensionPopupOpen}
        onClose={() => {
          setIsExtensionPopupOpen(false);
          setActiveExtension(null);
        }}
        onButtonClick={handleExtensionButtonClick}
      />
    </main>
  );
}
