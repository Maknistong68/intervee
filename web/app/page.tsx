'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

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
  const answerEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to latest answer
  useEffect(() => {
    if (messages.length > 0) {
      answerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Process and send question
  const processQuestion = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const cleanQuestion = question.trim();
    setCurrentTranscript('');

    const questionMessage: Message = {
      id: Date.now().toString(),
      type: 'question',
      content: cleanQuestion,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, questionMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: cleanQuestion }),
      });

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Detect if text is a question
  const isQuestion = useCallback((text: string): boolean => {
    const t = text.toLowerCase().trim();
    if (t.length < 8) return false;
    if (t.endsWith('?')) return true;
    const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'will', 'explain', 'describe', 'define', 'tell', 'ano', 'sino', 'saan', 'kailan', 'bakit', 'paano', 'alin', 'ilan', 'magkano'];
    if (questionWords.some(w => t.startsWith(w + ' '))) return true;
    if (t.includes(' ba ') || t.includes(' ba?') || t.endsWith(' ba')) return true;
    const oshKeywords = ['rule', 'hsc', 'committee', 'safety officer', 'ppe', 'penalty', 'requirement', 'dole', 'osh', '1040', '1030', '1080', '11058'];
    if (oshKeywords.some(k => t.includes(k))) return true;
    return false;
  }, []);

  // Handle silence - process question
  const handleSilence = useCallback(() => {
    const transcript = currentTranscript.trim();
    if (transcript && isQuestion(transcript)) {
      processQuestion(transcript);
    }
  }, [currentTranscript, processQuestion, isQuestion]);

  // Start/restart speech recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || !isStarted) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started, ignore
    }
  }, [isStarted]);

  // Initialize speech recognition
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
    recognition.lang = 'en-PH';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      // Get only the latest result - prevents exponential repetition
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim();

      if (lastResult.isFinal) {
        setCurrentTranscript(transcript);
        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (transcript && isQuestion(transcript)) {
            processQuestion(transcript);
          }
        }, 1500);
      } else {
        setCurrentTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setError('Microphone denied. Allow access and refresh.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart to keep listening
      if (isStarted) {
        setTimeout(startRecognition, 200);
      }
    };

    return recognition;
  }, [isStarted, isQuestion, processQuestion, startRecognition]);

  // Toggle listening
  const toggleListening = () => {
    if (!isStarted) {
      // First time - initialize
      const recognition = initRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        setIsStarted(true);
        recognition.start();
      }
    } else if (isListening) {
      // Pause
      recognitionRef.current?.stop();
      setIsStarted(false);
    } else {
      // Resume
      setIsStarted(true);
      startRecognition();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Keep recognition alive
  useEffect(() => {
    if (isStarted && !isListening && recognitionRef.current) {
      const timer = setTimeout(startRecognition, 500);
      return () => clearTimeout(timer);
    }
  }, [isStarted, isListening, startRecognition]);

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

        {/* Mic Toggle Button */}
        <button
          onClick={toggleListening}
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
      </header>

      {/* Transcript Bar - Minimal, Non-distracting */}
      {isStarted && (
        <div className="px-4 py-1.5 bg-surface-light border-b border-divider">
          <p className="text-xs text-gray-400 truncate">
            {currentTranscript || (isListening ? '🎤 Listening...' : '⏸ Paused')}
          </p>
        </div>
      )}

      {/* Main Answer Display - Maximum Space */}
      <div className="flex-1 overflow-y-auto p-4">
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
              onClick={toggleListening}
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl text-lg"
            >
              START LISTENING
            </button>
          </div>
        ) : messages.length === 0 ? (
          /* Waiting for Question */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isListening ? 'bg-red-500/20' : 'bg-gray-500/20'}`}>
              <Mic className={`w-8 h-8 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <p className="text-gray-400">{isListening ? 'Listening for questions...' : 'Paused'}</p>
            <p className="text-gray-600 text-sm mt-1">Ask any OSH question</p>
          </div>
        ) : (
          /* Answer Display */
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.type === 'question' ? (
                  <div className="mb-2">
                    <span className="text-[10px] text-gray-500 uppercase">Question</span>
                    <p className="text-gray-400 text-sm">{message.content}</p>
                  </div>
                ) : (
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
                )}
              </div>
            ))}

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
    </main>
  );
}
