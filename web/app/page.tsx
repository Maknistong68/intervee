'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, RotateCcw, Settings } from 'lucide-react';
import FloatingActionButton from '@/components/FloatingActionButton';
import SettingsPanel from '@/components/SettingsPanel';
import type { InteractionMode } from '@/components/types';

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
  const [isListening, setIsListening] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [languagePreference, setLanguagePreference] = useState<'eng' | 'fil' | 'mix'>('mix');

  // PTT Mode state
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('push-to-talk');
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for continuous listening and topic detection
  const answerTopRef = useRef<HTMLDivElement>(null);
  const answerEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBufferRef = useRef('');
  const lastAnswerRef = useRef('');
  const lastAnswerTimeRef = useRef(0);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  // Refs for memory leak fixes and restart backoff
  const scrollTimeout1Ref = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeout2Ref = useRef<NodeJS.Timeout | null>(null);
  const restartAttemptsRef = useRef(0);
  const MAX_RESTART_ATTEMPTS = 5;

  const COOLDOWN_MS = 3000; // 3 seconds after answer before accepting new questions
  const SILENCE_MS = 2000; // 2 seconds of silence to process
  const SCROLL_SPEED = 50; // pixels per second for auto-scroll

  // Check if user is echoing the last answer (reading it aloud)
  const isEchoingAnswer = useCallback((transcript: string): boolean => {
    if (!lastAnswerRef.current) return false;

    const transcriptWords = new Set(
      transcript.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    );
    const answerWords = lastAnswerRef.current
      .toLowerCase()
      .replace(/\*\*/g, '') // Remove markdown bold
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (answerWords.length === 0) return false;

    const matchCount = answerWords.filter(w => transcriptWords.has(w)).length;
    const overlapRatio = matchCount / Math.min(answerWords.length, 20); // Check first 20 words

    return overlapRatio > 0.5; // 50% overlap = likely reading answer
  }, []);

  // Check if cooldown period has passed
  const isCooldownActive = useCallback((): boolean => {
    return Date.now() - lastAnswerTimeRef.current < COOLDOWN_MS;
  }, []);

  // Extract keywords for topic detection
  const extractKeywords = useCallback((text: string): string[] => {
    const oshKeywords = [
      'rule', 'hsc', 'committee', 'safety', 'officer', 'ppe', 'penalty',
      'requirement', 'dole', 'osh', '1020', '1030', '1040', '1050', '1060',
      '1070', '1080', '1090', '11058', 'training', 'hazard', 'accident',
      'worker', 'employer', 'violation', 'fine', 'registration'
    ];
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => oshKeywords.some(k => w.includes(k)));
  }, []);

  // Check if transcript has new topic keywords not in last answer
  const hasNewTopic = useCallback((transcript: string): boolean => {
    const transcriptKeywords = extractKeywords(transcript);
    if (transcriptKeywords.length === 0) return false;

    const answerLower = lastAnswerRef.current.toLowerCase();
    const newKeywords = transcriptKeywords.filter(k => !answerLower.includes(k));

    return newKeywords.length > 0;
  }, [extractKeywords]);

  // Smart auto-scroll: scroll to top of answer, then slowly down
  const startAutoScroll = useCallback(() => {
    // Clear ALL existing timers to prevent memory leaks
    if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    if (scrollTimeout1Ref.current) clearTimeout(scrollTimeout1Ref.current);
    if (scrollTimeout2Ref.current) clearTimeout(scrollTimeout2Ref.current);

    userScrolledRef.current = false;

    // First, scroll to top of the latest answer
    scrollTimeout1Ref.current = setTimeout(() => {
      answerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // After scrolling to top, start slow auto-scroll down
      scrollTimeout2Ref.current = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        autoScrollIntervalRef.current = setInterval(() => {
          if (userScrolledRef.current) {
            // User manually scrolled, stop auto-scroll
            if (autoScrollIntervalRef.current) {
              clearInterval(autoScrollIntervalRef.current);
            }
            return;
          }

          const maxScroll = container.scrollHeight - container.clientHeight;
          if (container.scrollTop >= maxScroll - 10) {
            // Reached bottom, stop
            if (autoScrollIntervalRef.current) {
              clearInterval(autoScrollIntervalRef.current);
            }
            return;
          }

          container.scrollTop += SCROLL_SPEED / 10; // 10 updates per second
        }, 100);
      }, 1000); // Start auto-scroll 1 second after jumping to top
    }, 100);
  }, []);

  // Detect user manual scroll
  const handleScroll = useCallback(() => {
    userScrolledRef.current = true;
  }, []);

  // Process and send question
  const processQuestion = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const cleanQuestion = question.trim();
    transcriptBufferRef.current = ''; // Clear buffer after processing
    setCurrentTranscript('');

    const questionMessage: Message = {
      id: Date.now().toString(),
      type: 'question',
      content: cleanQuestion,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, questionMessage]);
    setIsLoading(true);

    // AbortController with 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: cleanQuestion }),
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

      // Store answer for echo detection
      lastAnswerRef.current = data.answer;
      lastAnswerTimeRef.current = Date.now();

      setMessages((prev) => [...prev, answerMessage]);

      // Trigger smart auto-scroll
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
  }, [isLoading, startAutoScroll]);

  // Detect if text is a question
  const isQuestion = useCallback((text: string): boolean => {
    const t = text.toLowerCase().trim();
    if (t.length < 5) return false;  // Reduced from 8
    if (t.endsWith('?')) return true;

    const questionWords = [
      'what', 'who', 'where', 'when', 'why', 'how', 'which',
      'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does',
      'explain', 'describe', 'define', 'tell', 'list', 'enumerate',
      'ano', 'sino', 'saan', 'kailan', 'bakit', 'paano', 'alin',
      'ipaliwanag', 'sabihin', 'tukuyin'
    ];

    // Check if ANY word matches (not just start)
    const words = t.split(/\s+/);
    if (words.some(w => questionWords.includes(w))) return true;

    // Tagalog particles
    if (/\bba\b|\bdiba\b|\bdi\s+ba\b|\bhindi\s+ba\b/.test(t)) return true;

    // Imperatives
    if (/^(explain|describe|define|ipaliwanag|sabihin)\b/.test(t)) return true;
    if (/\b(can|could)\s+you\s+(explain|tell)\b/.test(t)) return true;

    // OSH keywords (context boost)
    const oshKeywords = ['rule', 'hsc', 'committee', 'ppe', 'penalty', 'dole', 'osh', '1040', '1030', '11058'];
    if (oshKeywords.some(k => t.includes(k))) return true;

    return false;
  }, []);

  // Intelligent processing: check all conditions before processing
  const tryProcessTranscript = useCallback(() => {
    // In PTT mode, only process via button release
    if (interactionMode === 'push-to-talk') {
      return;
    }

    const transcript = transcriptBufferRef.current.trim();

    if (!transcript || transcript.length < 8) {
      return; // Too short
    }

    // Layer 1: Cooldown check
    if (isCooldownActive()) {
      console.log('[INTERVEE] Cooldown active, ignoring');
      return;
    }

    // Layer 2: Echo detection
    if (isEchoingAnswer(transcript)) {
      console.log('[INTERVEE] Echo detected, ignoring');
      transcriptBufferRef.current = '';
      setCurrentTranscript('');
      return;
    }

    // Layer 3: Question intent check
    if (!isQuestion(transcript)) {
      console.log('[INTERVEE] Not a question, ignoring');
      return;
    }

    // Layer 4: New topic check (if we have a previous answer)
    if (lastAnswerRef.current && !hasNewTopic(transcript) && !transcript.endsWith('?')) {
      console.log('[INTERVEE] Same topic without question mark, ignoring');
      return;
    }

    // All checks passed - process the question
    console.log('[INTERVEE] Processing question:', transcript);
    processQuestion(transcript);
  }, [interactionMode, isCooldownActive, isEchoingAnswer, isQuestion, hasNewTopic, processQuestion]);

  // Clear silence timer helper
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // PTT Start handler - called when button pressed or spacebar held
  const handlePTTStart = useCallback(() => {
    if (interactionMode !== 'push-to-talk' || isLoading) return;

    transcriptBufferRef.current = '';  // Clear buffer for fresh capture
    setCurrentTranscript('');
    clearSilenceTimer();               // Stop any auto-processing
    setIsPTTActive(true);
    console.log('[INTERVEE] PTT started');
  }, [interactionMode, isLoading, clearSilenceTimer]);

  // PTT End handler - called when button released or spacebar released
  const handlePTTEnd = useCallback(() => {
    if (!isPTTActive) return;

    setIsPTTActive(false);
    const transcript = transcriptBufferRef.current.trim();
    console.log('[INTERVEE] PTT ended, transcript:', transcript);

    if (transcript.length >= 3) {
      // Process immediately without filters - user explicitly requested
      processQuestion(transcript);
    }
  }, [isPTTActive, processQuestion]);

  // Go back to previous answer
  const handleBack = useCallback(() => {
    if (messages.length < 2) return;

    // Remove the last Q&A pair
    setMessages(prev => {
      const newMessages = [...prev];
      // Find last answer and its question
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].type === 'answer') {
          // Remove answer and its question
          newMessages.splice(Math.max(0, i - 1), 2);
          break;
        }
      }
      return newMessages;
    });

    // Update lastAnswer ref to previous answer
    const prevAnswer = messages.filter(m => m.type === 'answer').slice(-2, -1)[0];
    lastAnswerRef.current = prevAnswer?.content || '';
  }, [messages]);

  // Initialize speech recognition - TRULY CONTINUOUS
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome or Edge.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANGUAGE_OPTIONS.find(l => l.code === languagePreference)?.speechCode || 'en-PH';

    recognition.onstart = () => {
      setIsListening(true);
      restartAttemptsRef.current = 0; // Reset counter on successful start
    };

    recognition.onresult = (event: any) => {
      // Build complete transcript from current session
      let sessionTranscript = '';
      let hasFinal = false;

      // Get only the latest final result to avoid repetition
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          sessionTranscript = event.results[i][0].transcript.trim();
          hasFinal = true;
          break;
        }
      }

      // If no final result, get the latest interim
      if (!hasFinal && event.results.length > 0) {
        const lastResult = event.results[event.results.length - 1];
        sessionTranscript = lastResult[0].transcript.trim();
      }

      // Update buffer with latest transcript (replaces, doesn't accumulate)
      if (sessionTranscript) {
        transcriptBufferRef.current = sessionTranscript;
        setCurrentTranscript(sessionTranscript);
      }

      // Reset silence timer on any speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Set silence timer for processing
      if (hasFinal) {
        silenceTimerRef.current = setTimeout(() => {
          tryProcessTranscript();
        }, SILENCE_MS);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[INTERVEE] Recognition error:', event.error);

      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access in browser settings.');
          setIsListening(false);
          setIsStarted(false);
          break;
        case 'no-speech':
          // Normal - just means silence, don't show error
          break;
        case 'audio-capture':
          setError('Microphone not found. Please connect a microphone.');
          setIsListening(false);
          break;
        case 'network':
          setError('Network error. Check your internet connection.');
          break;
        case 'service-unavailable':
          setError('Speech service unavailable. Try refreshing the page.');
          break;
        default:
          // Don't show error for minor issues, will auto-restart
          console.log('[INTERVEE] Minor error, will retry:', event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      // Exponential backoff for restart attempts
      if (recognitionRef.current && restartAttemptsRef.current < MAX_RESTART_ATTEMPTS) {
        const backoffMs = Math.min(50 * Math.pow(2, restartAttemptsRef.current), 2000);
        restartAttemptsRef.current++;

        setTimeout(() => {
          try {
            recognition.start();
            restartAttemptsRef.current = 0; // Reset on success
          } catch (e) {
            console.log('[INTERVEE] Restart failed, attempt:', restartAttemptsRef.current);
            if (restartAttemptsRef.current >= MAX_RESTART_ATTEMPTS) {
              setError('Microphone connection lost. Click START to reconnect.');
              setIsStarted(false);
            }
          }
        }, backoffMs);
      } else if (restartAttemptsRef.current >= MAX_RESTART_ATTEMPTS) {
        setError('Microphone connection lost. Click START to reconnect.');
        setIsStarted(false);
      }
    };

    return recognition;
  }, [tryProcessTranscript, languagePreference]);

  // Start listening (one-time action, never pauses)
  const startListening = useCallback(() => {
    if (isStarted) return;

    const recognition = initRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      setIsStarted(true);
      try {
        recognition.start();
      } catch (e) {
        console.log('[INTERVEE] Failed to start recognition');
      }
    }
  }, [isStarted, initRecognition]);

  // Emergency stop (rarely used)
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsStarted(false);
    setIsListening(false);
  }, []);

  // Toggle for header button
  const toggleListening = useCallback(() => {
    if (isStarted) {
      stopListening();
    } else {
      startListening();
    }
  }, [isStarted, startListening, stopListening]);

  // Reset handler - clears conversation context
  const handleReset = useCallback(() => {
    // Clear all messages
    setMessages([]);
    // Clear transcript buffer
    transcriptBufferRef.current = '';
    // Clear last answer refs
    lastAnswerRef.current = '';
    lastAnswerTimeRef.current = 0;
    // Clear current transcript display
    setCurrentTranscript('');
    // Clear any errors
    setError(null);

    // Notify backend to clear context (fire and forget)
    fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'default' }),
    }).catch(() => {
      // Silently ignore reset API errors
    });

    console.log('[INTERVEE] Context reset');
  }, []);

  // Spacebar listener - PTT mode: hold to speak, release to get answer
  useEffect(() => {
    const isInputElementCheck = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isInputElementCheck(e.target)) {
        if (interactionMode === 'push-to-talk' && isStarted) {
          e.preventDefault();
          handlePTTStart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isInputElementCheck(e.target)) {
        if (interactionMode === 'push-to-talk' && isStarted) {
          e.preventDefault();
          handlePTTEnd();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [interactionMode, isStarted, handlePTTStart, handlePTTEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
      if (scrollTimeout1Ref.current) clearTimeout(scrollTimeout1Ref.current);
      if (scrollTimeout2Ref.current) clearTimeout(scrollTimeout2Ref.current);
    };
  }, []);

  // Load language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('intervee_language');
    if (saved && ['eng', 'fil', 'mix'].includes(saved)) {
      setLanguagePreference(saved as 'eng' | 'fil' | 'mix');
    }
  }, []);

  // Load interaction mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('intervee_mode');
    if (saved && ['no-interact', 'push-to-talk'].includes(saved)) {
      setInteractionMode(saved as InteractionMode);
    }
  }, []);

  // Handle interaction mode change
  const handleModeChange = useCallback((mode: InteractionMode) => {
    setInteractionMode(mode);
    localStorage.setItem('intervee_mode', mode);
    console.log('[INTERVEE] Mode changed to:', mode);
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((lang: 'eng' | 'fil' | 'mix') => {
    setLanguagePreference(lang);
    localStorage.setItem('intervee_language', lang);
    // Restart recognition with new language if active
    if (recognitionRef.current && isStarted) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      setTimeout(() => {
        const recognition = initRecognition();
        if (recognition) {
          recognitionRef.current = recognition;
          recognition.start();
        }
      }, 100);
    }
  }, [isStarted, initRecognition]);

  const getConfidenceColor = (c: number) => c >= 0.8 ? 'bg-green-500' : c >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500';

  const latestAnswer = messages.filter(m => m.type === 'answer').slice(-1)[0];

  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Header with Mic Button */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-divider bg-surface">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-wider">INTERVEE</h1>
          {isDemo && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">DEMO</span>}
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-surface-light rounded-full p-0.5">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-2 py-1 text-xs font-medium rounded-full transition-all ${
                  languagePreference === lang.code
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="p-2 rounded-full bg-surface-light hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-divider hover:border-primary/30"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset Button - only show when there are messages */}
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              aria-label="Reset conversation"
              title="Reset conversation"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-light hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 transition-all border border-divider hover:border-orange-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs font-medium hidden sm:inline">RESET</span>
            </button>
          )}

          {/* Mic Toggle Button */}
          <button
            onClick={toggleListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            aria-pressed={isListening}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white'
                : isStarted
                  ? 'bg-yellow-500 text-black'
                  : 'bg-primary text-white'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">LIVE</span>
                <MicOff className="w-4 h-4" />
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">{isStarted ? 'PAUSED' : 'START'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Transcript Bar - Minimal, Non-distracting */}
      {isStarted && (
        <div className="px-4 py-1.5 bg-surface-light border-b border-divider">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPTTActive ? 'bg-red-500 animate-pulse' :
                isListening ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}
              aria-hidden="true"
            />
            <span className="sr-only">
              {isPTTActive ? 'Recording' : isListening ? 'Microphone active' : 'Microphone reconnecting'}
            </span>
            <p className="text-xs text-gray-400 truncate flex-1">
              {isPTTActive ? (currentTranscript || 'Recording... release to get answer') :
               currentTranscript || (isListening ?
                 (interactionMode === 'push-to-talk' ? 'Hold button or spacebar to speak...' : 'Listening continuously...')
                 : 'Reconnecting...')}
            </p>
            {/* Mode indicator */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              interactionMode === 'push-to-talk' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {interactionMode === 'push-to-talk' ? 'PTT' : 'VIEW'}
            </span>
          </div>
        </div>
      )}

      {/* Main Answer Display - Maximum Space */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {!isStarted ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">INTERVEE</h2>
            <p className="text-gray-400 mb-1">Philippine OSH Interview Assistant</p>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Passively listens and provides instant answers based on DOLE regulations and RA 11058.
            </p>
            <button
              onClick={startListening}
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl text-lg"
            >
              START LISTENING
            </button>
          </div>
        ) : messages.length === 0 ? (
          /* Waiting for Question */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isPTTActive ? 'bg-red-500/30' :
              isListening ? 'bg-green-500/20' : 'bg-gray-500/20'
            }`}>
              <Mic className={`w-8 h-8 ${
                isPTTActive ? 'text-red-400 scale-110' :
                isListening ? 'text-green-400' : 'text-gray-400'
              }`} />
            </div>
            <p className="text-gray-400">
              {isPTTActive ? 'Recording...' :
               interactionMode === 'push-to-talk' ?
                 'Hold button or spacebar to speak' :
                 (isListening ? 'Listening continuously...' : 'Reconnecting...')}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {interactionMode === 'push-to-talk' ? 'Release to get answer' : 'Ask any OSH question'}
            </p>
          </div>
        ) : (
          /* Answer Display */
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => {
              const isLatestAnswer = message.type === 'answer' &&
                index === messages.length - 1 ||
                (index === messages.length - 2 && messages[messages.length - 1]?.type === 'question');

              return (
                <div key={message.id} className="mb-4">
                  {message.type === 'question' ? (
                    <div className="mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">Question</span>
                      <p className="text-gray-400 text-sm">{message.content}</p>
                    </div>
                  ) : (
                    <>
                      {/* Anchor for scrolling to TOP of answer */}
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
                        <div className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                          {message.content.split('\n').map((line, i) => {
                            const parts = line.split(/(\*\*[^*]+\*\*)/g);
                            return (
                              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                                {parts.map((part, j) =>
                                  part.startsWith('**') && part.endsWith('**')
                                    ? <strong key={j} className="text-primary">{part.slice(2, -2)}</strong>
                                    : part
                                )}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="bg-surface border border-divider rounded-xl p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating answer...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div ref={answerEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-1.5 text-center text-[10px] text-gray-600 border-t border-divider">
        RA 11058 • OSHS Rules 1020-1960 • DOLE Regulations
      </footer>

      {/* Floating Action Button - only in PTT mode when started */}
      <FloatingActionButton
        isPTTActive={isPTTActive}
        isProcessing={isLoading}
        isVisible={interactionMode === 'push-to-talk' && isStarted}
        onPTTStart={handlePTTStart}
        onPTTEnd={handlePTTEnd}
        onBack={handleBack}
        onClear={handleReset}
        hasHistory={messages.filter(m => m.type === 'answer').length > 1}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        interactionMode={interactionMode}
        onModeChange={handleModeChange}
      />
    </main>
  );
}
