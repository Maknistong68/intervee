'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Loader2, AlertCircle, Volume2, Radio } from 'lucide-react';

interface Message {
  id: string;
  type: 'question' | 'answer';
  content: string;
  confidence?: number;
  responseTime?: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  // Process and send question
  const processQuestion = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const cleanQuestion = question.trim();
    setCurrentTranscript('');
    lastTranscriptRef.current = '';

    // Add question to messages
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      if (data.demo) setIsDemo(true);

      const answerMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: data.answer,
        confidence: data.confidence,
        responseTime: data.responseTimeMs,
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

    // Question mark
    if (t.endsWith('?')) return true;

    // English question words
    const enQuestionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'will', 'explain', 'describe', 'define', 'tell'];
    if (enQuestionWords.some(w => t.startsWith(w + ' '))) return true;

    // Tagalog question words
    const tlQuestionWords = ['ano', 'sino', 'saan', 'kailan', 'bakit', 'paano', 'alin', 'ilan', 'magkano'];
    if (tlQuestionWords.some(w => t.startsWith(w + ' ') || t.includes(' ' + w + ' '))) return true;

    // Tagalog question particle "ba"
    if (t.includes(' ba ') || t.includes(' ba?') || t.endsWith(' ba')) return true;

    // OSH keywords with question context
    const oshKeywords = ['rule', 'hsc', 'committee', 'safety officer', 'ppe', 'penalty', 'requirement', 'dole', 'osh'];
    if (oshKeywords.some(k => t.includes(k)) && t.length > 15) return true;

    return false;
  }, []);

  // Handle silence - process accumulated transcript
  const handleSilence = useCallback(() => {
    const transcript = lastTranscriptRef.current.trim();
    if (transcript && transcript.length > 10 && isQuestion(transcript)) {
      processQuestion(transcript);
    }
  }, [processQuestion, isQuestion]);

  // Reset silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(handleSilence, 2000); // 2 second pause = question complete
  }, [handleSilence]);

  // Initialize and start speech recognition
  const startPassiveListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-PH';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = (lastTranscriptRef.current + ' ' + finalTranscript).trim();

      if (finalTranscript) {
        lastTranscriptRef.current = fullTranscript;
        setCurrentTranscript(fullTranscript);
        resetSilenceTimer();
      } else if (interimTranscript) {
        setCurrentTranscript((lastTranscriptRef.current + ' ' + interimTranscript).trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and refresh.');
        setIsListening(false);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        // Auto-restart on recoverable errors
        setTimeout(() => {
          if (isStarted) {
            try { recognition.start(); } catch (e) {}
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Auto-restart to keep listening continuously
      if (isStarted) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsStarted(true);
    } catch (e) {
      setError('Could not start listening. Please refresh and try again.');
    }
  }, [isStarted, resetSilenceTimer]);

  // Start listening on first user interaction (required by browsers)
  const handleStart = () => {
    if (!isStarted) {
      startPassiveListening();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-divider bg-surface">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <h1 className="text-xl font-bold tracking-wider">INTERVEE</h1>
        </div>
        <div className="flex items-center gap-2">
          {isListening && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex items-center gap-1">
              <Radio className="w-3 h-3" /> LIVE
            </span>
          )}
          {isDemo && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">DEMO</span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!isStarted ? (
          /* Start Screen */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Mic className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">INTERVEE</h2>
            <p className="text-gray-400 mb-2">Philippine OSH Interview Assistant</p>
            <p className="text-gray-500 text-sm mb-8 max-w-md">
              Passively listens to interview questions and provides instant answers based on DOLE regulations, OSHS Rules, and RA 11058.
            </p>
            <button
              onClick={handleStart}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              TAP TO START LISTENING
            </button>
            <p className="text-gray-600 text-xs mt-4">
              Microphone access required
            </p>
          </div>
        ) : (
          /* Active Listening Screen */
          <div className="flex flex-col h-full">
            {/* Answer Display Area - Takes most of the screen */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && !currentTranscript && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Volume2 className="w-16 h-16 text-primary/50 mb-4 animate-pulse" />
                  <p className="text-xl text-gray-400">Listening for questions...</p>
                  <p className="text-sm text-gray-600 mt-2">Ask any OSH-related question</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  {message.type === 'question' ? (
                    <div className="bg-surface-light rounded-lg px-4 py-2 mb-2">
                      <span className="text-xs text-primary font-medium">QUESTION DETECTED</span>
                      <p className="text-gray-300 mt-1">{message.content}</p>
                    </div>
                  ) : (
                    <div className="bg-surface border border-primary/30 rounded-xl p-4">
                      <div className="text-xs text-primary font-medium mb-2 flex items-center justify-between">
                        <span>SUGGESTED ANSWER</span>
                        {message.confidence && (
                          <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`} />
                            {Math.round(message.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="text-lg leading-relaxed whitespace-pre-wrap">
                        {message.content.split('\n').map((line, i) => {
                          const parts = line.split(/(\*\*[^*]+\*\*)/g);
                          return (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>
                              {parts.map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={j} className="text-primary font-semibold">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>
                      {message.demo && (
                        <p className="text-xs text-yellow-500 mt-3">Demo response - Add API key for GPT-4o</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="bg-surface border border-divider rounded-xl p-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating answer...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Live Transcript Bar */}
            <div className="border-t border-divider bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                <div className="flex-1 min-h-[48px] bg-surface-light rounded-lg px-4 py-3">
                  {currentTranscript ? (
                    <p className="text-white">{currentTranscript}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      {isListening ? 'Listening...' : 'Microphone inactive'}
                    </p>
                  )}
                </div>
              </div>
              {isListening && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Speak naturally • Questions auto-detected after 2s pause
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
