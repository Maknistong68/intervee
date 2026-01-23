'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2, AlertCircle, Info, BookOpen } from 'lucide-react';

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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-PH';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access.');
          }
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              setIsListening(false);
            }
          }
        };
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (e) {
        setError('Could not start voice input. Please try again.');
      }
    }
  };

  const sendQuestion = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    setError(null);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const questionMessage: Message = {
      id: Date.now().toString(),
      type: 'question',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, questionMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      if (data.demo) {
        setIsDemo(true);
      }

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const sampleQuestions = [
    'What is Rule 1040?',
    'HSC composition?',
    'Safety Officer requirements?',
    'PPE employer duties?',
    'RA 11058 penalties?',
    'Accident reporting procedure?',
  ];

  return (
    <main className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-divider bg-surface">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <h1 className="text-xl font-bold tracking-wider">INTERVEE</h1>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
              DEMO MODE
            </span>
          )}
          <span className="text-xs text-gray-400 hidden sm:inline">PH OSH Assistant</span>
        </div>
      </header>

      {/* Demo Banner */}
      {isDemo && messages.length === 1 && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Demo mode - Using pre-built responses. Add OPENAI_API_KEY for GPT-4o.</span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Philippine OSH Assistant</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Ask questions about OSHS Rules 1020-1960, Department Orders, Labor Advisories, and RA 11058.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
              {sampleQuestions.map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setInput(sample);
                    textareaRef.current?.focus();
                  }}
                  className="p-3 bg-surface rounded-lg text-sm text-left hover:bg-surface-light transition-colors border border-transparent hover:border-primary/30"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'question'
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-divider'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                  {message.content.split('\n').map((line, i) => {
                    // Handle bold text
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>
                {message.type === 'answer' && message.confidence && (
                  <div className="mt-3 pt-3 border-t border-divider/50">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`} />
                        <span>{Math.round(message.confidence * 100)}% {getConfidenceLabel(message.confidence)}</span>
                        {message.demo && (
                          <span className="text-yellow-400">(Demo)</span>
                        )}
                      </div>
                      {message.responseTime && (
                        <span>{message.responseTime}ms</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-divider rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating answer...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-divider bg-surface">
        <div className="flex items-end gap-2">
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-surface-light text-gray-400 hover:text-white hover:bg-border'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask an OSH question... (Press Enter to send)"
              rows={1}
              className="w-full bg-surface-light rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500 text-sm sm:text-base"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={sendQuestion}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-surface-light text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Listening... Speak your question</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-2 text-center text-xs text-gray-500 border-t border-divider bg-background">
        Based on RA 11058, OSHS Rules 1020-1960, and DOLE Regulations
      </footer>
    </main>
  );
}
