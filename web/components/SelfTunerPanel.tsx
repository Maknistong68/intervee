'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Play, Square, Copy, RotateCcw, Loader2, Check, ChevronDown, ChevronUp, ClipboardList, Zap, Target, Flame } from 'lucide-react';
import type { SelfTunerPanelProps, SelfTunerResult, SelfTunerQuestion, Difficulty } from './types';
import { SELF_TUNER_QUESTIONS } from '@/lib/self-tuner-questions';
import {
  selectRandomQuestions,
  formatForClipboard,
  formatQuestionsOnly,
  copyToClipboard,
  getDifficultyColor,
  getTypeBadgeColor,
} from '@/lib/self-tuner-utils';

const QUESTION_COUNT = 30;
const DELAY_BETWEEN_QUESTIONS_MS = 1000;

type TunerStatus = 'idle' | 'running' | 'stopped' | 'completed';
type DifficultyOption = Difficulty | 'mixed';

const DIFFICULTY_OPTIONS: { value: DifficultyOption; label: string; icon: typeof Zap; description: string }[] = [
  { value: 'easy', label: 'Easy', icon: Zap, description: 'Basic recall questions' },
  { value: 'medium', label: 'Medium', icon: Target, description: 'Application & calculations' },
  { value: 'hard', label: 'Hard', icon: Flame, description: 'Situational & tricky' },
  { value: 'mixed', label: 'Mixed', icon: ClipboardList, description: 'All difficulty levels' },
];

export default function SelfTunerPanel({ isOpen, onClose }: SelfTunerPanelProps) {
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [difficulty, setDifficulty] = useState<DifficultyOption>('mixed');
  const [questions, setQuestions] = useState<SelfTunerQuestion[]>([]);
  const [results, setResults] = useState<SelfTunerResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showPreviousResults, setShowPreviousResults] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleStop();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleStop();
        onClose();
      }
    },
    [onClose]
  );

  // Fetch answer for a question
  const fetchAnswer = useCallback(
    async (question: SelfTunerQuestion, signal: AbortSignal): Promise<string> => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          languagePreference: 'eng',
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      return data.answer || 'No answer generated';
    },
    []
  );

  // Process questions sequentially
  const processQuestions = useCallback(
    async (selectedQuestions: SelfTunerQuestion[]) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      for (let i = 0; i < selectedQuestions.length; i++) {
        if (controller.signal.aborted) break;

        const question = selectedQuestions[i];
        setCurrentIndex(i);
        setCurrentAnswer('');
        setIsLoadingAnswer(true);

        try {
          const answer = await fetchAnswer(question, controller.signal);

          if (controller.signal.aborted) break;

          setCurrentAnswer(answer);

          const result: SelfTunerResult = {
            question,
            answer,
            timestamp: new Date(),
          };

          setResults((prev) => [...prev, result]);
          setIsLoadingAnswer(false);

          // Scroll to show latest result
          setTimeout(() => {
            resultsContainerRef.current?.scrollTo({
              top: resultsContainerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 100);

          // Delay before next question (except for last one)
          if (i < selectedQuestions.length - 1 && !controller.signal.aborted) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_QUESTIONS_MS));
          }
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            break;
          }
          console.error('Error fetching answer:', error);
          setIsLoadingAnswer(false);

          // Add error result
          const errorResult: SelfTunerResult = {
            question,
            answer: 'Error: Failed to generate answer',
            timestamp: new Date(),
          };
          setResults((prev) => [...prev, errorResult]);
        }
      }

      if (!controller.signal.aborted) {
        setStatus('completed');
      }
      abortControllerRef.current = null;
    },
    [fetchAnswer]
  );

  // Start the tuner
  const handleStart = useCallback(() => {
    const selectedQuestions = selectRandomQuestions(SELF_TUNER_QUESTIONS, QUESTION_COUNT, difficulty);
    setQuestions(selectedQuestions);
    setResults([]);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setStatus('running');
    processQuestions(selectedQuestions);
  }, [difficulty, processQuestions]);

  // Stop the tuner
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('stopped');
    setIsLoadingAnswer(false);
  }, []);

  // Reset the tuner
  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setQuestions([]);
    setResults([]);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setIsLoadingAnswer(false);
  }, []);

  // Copy all results
  const handleCopyAll = useCallback(async () => {
    const markdown = formatForClipboard(results);
    const success = await copyToClipboard(markdown);
    setCopySuccess(success ? 'all' : null);
    setTimeout(() => setCopySuccess(null), 2000);
  }, [results]);

  // Copy questions only
  const handleCopyQuestions = useCallback(async () => {
    const markdown = formatQuestionsOnly(results);
    const success = await copyToClipboard(markdown);
    setCopySuccess(success ? 'questions' : null);
    setTimeout(() => setCopySuccess(null), 2000);
  }, [results]);

  // Copy single Q&A
  const handleCopySingle = useCallback(async (result: SelfTunerResult) => {
    const text = `Q: ${result.question.question}\n(${result.question.topic} | ${result.question.citation} | ${result.question.difficulty.toUpperCase()})\n\nA: ${result.answer}`;
    const success = await copyToClipboard(text);
    setCopySuccess(success ? result.question.id : null);
    setTimeout(() => setCopySuccess(null), 2000);
  }, []);

  const progressPercent = questions.length > 0 ? Math.round((results.length / questions.length) * 100) : 0;

  // Count questions by difficulty
  const availableCounts = {
    easy: SELF_TUNER_QUESTIONS.filter((q) => q.difficulty === 'easy').length,
    medium: SELF_TUNER_QUESTIONS.filter((q) => q.difficulty === 'medium').length,
    hard: SELF_TUNER_QUESTIONS.filter((q) => q.difficulty === 'hard').length,
    mixed: SELF_TUNER_QUESTIONS.length,
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="self-tuner-title"
    >
      <div className="w-full max-w-3xl h-[90vh] mx-4 bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
          <h2 id="self-tuner-title" className="text-lg font-bold flex items-center gap-2">
            <span className="text-primary">SELF TUNER</span>
            <span className="text-gray-400 text-sm font-normal">- OSH Knowledge Audit</span>
          </h2>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
            aria-label="Close self tuner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Section */}
        {status !== 'idle' && (
          <div className="px-5 py-3 border-b border-divider bg-surface-light shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Progress: {results.length}/{questions.length}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(difficulty === 'mixed' ? 'medium' : difficulty)}`}>
                {difficulty.toUpperCase()}
              </span>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {status === 'idle' ? (
            /* Idle State - Difficulty Selection */
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">OSH Knowledge Audit</h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Test your knowledge with {QUESTION_COUNT} random questions.
                Select difficulty level to begin.
              </p>

              {/* Difficulty Selector */}
              <div className="w-full max-w-md space-y-2 mb-6">
                {DIFFICULTY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    onClick={() => setDifficulty(value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      difficulty === value
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-surface-light border-divider hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        difficulty === value ? 'bg-primary/20' : 'bg-surface'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          difficulty === value ? 'text-primary' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            difficulty === value ? 'text-primary' : 'text-white'
                          }`}
                        >
                          {label}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({availableCounts[value]} questions)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    {difficulty === value && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleStart}
                disabled={availableCounts[difficulty] === 0}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                Start Audit
              </button>
            </div>
          ) : (
            <>
              {/* Current Question Card */}
              <div className="px-5 py-4 border-b border-divider shrink-0">
                <div className="bg-surface-light rounded-xl p-4 border border-divider">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-semibold uppercase">
                        Q{currentIndex + 1} of {questions.length}
                      </span>
                      {questions[currentIndex] && (
                        <>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${getDifficultyColor(
                              questions[currentIndex].difficulty
                            )}`}
                          >
                            {questions[currentIndex].difficulty.toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${getTypeBadgeColor(
                              questions[currentIndex].type
                            )}`}
                          >
                            {questions[currentIndex].type}
                          </span>
                        </>
                      )}
                    </div>
                    {questions[currentIndex] && (
                      <span className="text-xs text-gray-500">
                        {questions[currentIndex].topic} | {questions[currentIndex].citation}
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium mb-3">
                    {questions[currentIndex]?.question || 'Loading...'}
                  </p>

                  {isLoadingAnswer ? (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating answer...</span>
                    </div>
                  ) : currentAnswer ? (
                    <div className="bg-surface rounded-lg p-3 border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-primary uppercase font-semibold">Answer</span>
                        {results[currentIndex] && (
                          <button
                            onClick={() => handleCopySingle(results[currentIndex])}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                          >
                            {copySuccess === results[currentIndex]?.question.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy Q&A
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{currentAnswer}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Previous Results (Collapsible) */}
              {results.length > 1 && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <button
                    onClick={() => setShowPreviousResults(!showPreviousResults)}
                    className="flex items-center justify-between w-full px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <span>Previous Results ({results.length - 1})</span>
                    {showPreviousResults ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showPreviousResults && (
                    <div
                      ref={resultsContainerRef}
                      className="flex-1 overflow-y-auto px-5 pb-4 min-h-0"
                    >
                      <div className="space-y-3">
                        {results.slice(0, -1).map((result, index) => (
                          <div
                            key={result.question.id}
                            className="bg-surface-light rounded-lg p-3 border border-divider"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Q{index + 1}</span>
                                <span
                                  className={`text-[10px] px-1 py-0.5 rounded ${getDifficultyColor(
                                    result.question.difficulty
                                  )}`}
                                >
                                  {result.question.difficulty.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-600">{result.question.topic}</span>
                              </div>
                              <button
                                onClick={() => handleCopySingle(result)}
                                className="text-gray-500 hover:text-primary transition-colors"
                                aria-label="Copy Q&A"
                              >
                                {copySuccess === result.question.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-gray-300 font-medium">{result.question.question}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        {status !== 'idle' && (
          <div className="px-5 py-4 border-t border-divider bg-surface-light shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {status === 'running' ? (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-light border border-divider transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyQuestions}
                  disabled={results.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-light border border-divider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copySuccess === 'questions' ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-4 h-4" />
                      Questions Only
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyAll}
                  disabled={results.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copySuccess === 'all' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
