'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Loader2, AlertCircle, RotateCcw, Settings, FlaskConical, Puzzle } from 'lucide-react';
import ChatInputBar from '@/components/ChatInputBar';
import SettingsPanel from '@/components/SettingsPanel';
import SelfTunerPanel from '@/components/SelfTunerPanel';
import PopupExtensionCreator from '@/components/PopupExtensionCreator';
import PopupRenderer from '@/components/PopupRenderer';
import ExtensionLauncher from '@/components/ExtensionLauncher';
import type { InteractionMode, PopupExtension } from '@/components/types';

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

  // PTT Mode state
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSelfTunerOpen, setIsSelfTunerOpen] = useState(false);

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

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

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

  // Initialize speech recognition for PTT
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

    recognition.onresult = (event: any) => {
      let sessionTranscript = '';

      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          sessionTranscript = event.results[i][0].transcript.trim();
          break;
        }
      }

      if (!sessionTranscript && event.results.length > 0) {
        const lastResult = event.results[event.results.length - 1];
        sessionTranscript = lastResult[0].transcript.trim();
      }

      if (sessionTranscript) {
        transcriptBufferRef.current = sessionTranscript;
        setCurrentTranscript(sessionTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[INTERVEE] Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      }
    };

    return recognition;
  }, [languagePreference]);

  // PTT Start handler
  const handlePTTStart = useCallback(() => {
    if (isLoading) return;

    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    setIsPTTActive(true);

    // Start speech recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started, ignore
      }
    }

    console.log('[INTERVEE] PTT started');
  }, [isLoading, initRecognition]);

  // PTT End handler
  const handlePTTEnd = useCallback(() => {
    if (!isPTTActive) return;

    setIsPTTActive(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const transcript = transcriptBufferRef.current.trim();
    console.log('[INTERVEE] PTT ended, processing:', transcript);

    if (transcript) {
      processQuestion(transcript);
    }
  }, [isPTTActive, processQuestion]);

  // PTT Cancel handler
  const handlePTTCancel = useCallback(() => {
    if (!isPTTActive) return;

    setIsPTTActive(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    console.log('[INTERVEE] PTT cancelled');
  }, [isPTTActive]);

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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
      if (scrollTimeout1Ref.current) clearTimeout(scrollTimeout1Ref.current);
      if (scrollTimeout2Ref.current) clearTimeout(scrollTimeout2Ref.current);
    };
  }, []);

  // Load language preference
  useEffect(() => {
    const saved = localStorage.getItem('intervee_language');
    if (saved && ['eng', 'fil', 'mix'].includes(saved)) {
      setLanguagePreference(saved as 'eng' | 'fil' | 'mix');
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
  }, []);

  const getConfidenceColor = (c: number) => c >= 0.8 ? 'bg-green-500' : c >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Header - Clean, no LIVE button */}
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
            className="p-2 rounded-full bg-surface-light hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-all border border-divider hover:border-purple-500/30"
          >
            <Puzzle className="w-4 h-4" />
          </button>

          {/* Self Tuner Button */}
          <button
            onClick={() => setIsSelfTunerOpen(true)}
            aria-label="Open self tuner"
            title="Self Tuner - OSH Knowledge Audit"
            className="p-2 rounded-full bg-surface-light hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-divider hover:border-primary/30"
          >
            <FlaskConical className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="p-2 rounded-full bg-surface-light hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-divider hover:border-primary/30"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset Button */}
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
        </div>
      </header>

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
              isPTTActive ? 'bg-red-500/30' : 'bg-primary/20'
            }`}>
              <Mic className={`w-8 h-8 ${isPTTActive ? 'text-red-400 scale-110' : 'text-primary'}`} />
            </div>
            <h2 className="text-xl font-bold mb-2">INTERVEE</h2>
            <p className="text-gray-400 mb-1">Philippine OSH Interview Assistant</p>
            <p className="text-gray-500 text-sm mb-4 max-w-sm">
              {isPTTActive ? 'Recording... Release to get answer' : 'Hold the mic button or press spacebar to ask a question'}
            </p>
            {currentTranscript && (
              <div className="bg-surface-light rounded-lg px-4 py-2 max-w-md">
                <p className="text-gray-300 text-sm">"{currentTranscript}"</p>
              </div>
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
        isProcessing={isLoading}
        isVisible={true}
        onPTTStart={handlePTTStart}
        onPTTEnd={handlePTTEnd}
        onPTTCancel={handlePTTCancel}
        currentTranscript={currentTranscript}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        interactionMode="push-to-talk"
        onModeChange={() => {}}
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
