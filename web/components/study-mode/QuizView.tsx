'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Check, X, RotateCcw, Trophy, BookOpen } from 'lucide-react';
import type { QuizQuestion } from '@/lib/studyData';
import ProgressBar from './ProgressBar';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

interface QuizState {
  currentIndex: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  score: number;
  answers: { questionId: string; selectedIndex: number; correct: boolean }[];
}

export default function QuizView({ questions, onComplete }: QuizViewProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    selectedAnswer: null,
    isAnswered: false,
    score: 0,
    answers: [],
  });
  const [isComplete, setIsComplete] = useState(false);

  // Shuffle questions on mount
  useEffect(() => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    setState({
      currentIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      score: 0,
      answers: [],
    });
    setIsComplete(false);
  }, [questions]);

  const currentQuestion = shuffledQuestions[state.currentIndex];

  const handleSelectAnswer = useCallback((index: number) => {
    if (state.isAnswered || !currentQuestion) return;

    const isCorrect = index === currentQuestion.correctIndex;

    setState(prev => ({
      ...prev,
      selectedAnswer: index,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      answers: [
        ...prev.answers,
        {
          questionId: currentQuestion.id,
          selectedIndex: index,
          correct: isCorrect,
        },
      ],
    }));
  }, [state.isAnswered, currentQuestion]);

  const handleNext = useCallback(() => {
    if (state.currentIndex < shuffledQuestions.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
      }));
    } else {
      setIsComplete(true);
      onComplete?.(state.score, shuffledQuestions.length);
    }
  }, [state.currentIndex, state.score, shuffledQuestions.length, onComplete]);

  const handleRestart = useCallback(() => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    setState({
      currentIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      score: 0,
      answers: [],
    });
    setIsComplete(false);
  }, [questions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!state.isAnswered) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4 && currentQuestion && num <= currentQuestion.options.length) {
          e.preventDefault();
          handleSelectAnswer(num - 1);
        }
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isAnswered, currentQuestion, handleSelectAnswer, handleNext]);

  if (shuffledQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
        <p>No quiz questions available for selected topics.</p>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    const percentage = Math.round((state.score / shuffledQuestions.length) * 100);
    const grade = percentage >= 90 ? 'Excellent!' : percentage >= 70 ? 'Good Job!' : percentage >= 50 ? 'Keep Practicing!' : 'Need More Study';
    const gradeColor = percentage >= 90 ? 'text-green-400' : percentage >= 70 ? 'text-yellow-400' : percentage >= 50 ? 'text-orange-400' : 'text-red-400';

    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Trophy className={`w-10 h-10 ${percentage >= 70 ? 'text-yellow-400' : 'text-gray-400'}`} />
        </div>

        <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
        <p className={`text-xl font-semibold ${gradeColor} mb-4`}>{grade}</p>

        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-white mb-1">
            {state.score}/{shuffledQuestions.length}
          </p>
          <p className="text-gray-400">
            {percentage}% correct
          </p>
        </div>

        <div className="w-full max-w-xs mb-6">
          <ProgressBar
            current={state.score}
            total={shuffledQuestions.length}
            showPercentage={false}
            color={percentage >= 70 ? 'green' : percentage >= 50 ? 'yellow' : 'red'}
          />
        </div>

        {/* Summary of wrong answers */}
        {state.answers.filter(a => !a.correct).length > 0 && (
          <div className="w-full max-w-md mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Review missed questions:</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {state.answers.filter(a => !a.correct).map((answer, idx) => {
                const q = shuffledQuestions.find(q => q.id === answer.questionId);
                if (!q) return null;
                return (
                  <div key={idx} className="bg-surface-light rounded-lg p-3 text-sm">
                    <p className="text-gray-300 mb-1">{q.question}</p>
                    <p className="text-green-400 text-xs">Correct: {q.options[q.correctIndex]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-4">
        <ProgressBar
          current={state.currentIndex + 1}
          total={shuffledQuestions.length}
          label={`Question ${state.currentIndex + 1}`}
        />
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-green-400">Score: {state.score}</span>
          <span className="text-gray-500">{currentQuestion.citation}</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <div className="bg-surface border border-divider rounded-xl p-6 mb-4">
          <p className="text-lg sm:text-xl text-white font-medium">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = state.selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctIndex;
            const showCorrect = state.isAnswered && isCorrect;
            const showWrong = state.isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={state.isAnswered}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  showCorrect
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : showWrong
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : isSelected
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-surface border-divider text-gray-300 hover:border-gray-500'
                } ${state.isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  showCorrect
                    ? 'bg-green-500 text-white'
                    : showWrong
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-gray-400'
                }`}>
                  {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : index + 1}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after answering) */}
        {state.isAnswered && (
          <div className="bg-surface-light border border-divider rounded-xl p-4 mb-4 animate-fade-in">
            <p className="text-sm text-gray-400 mb-1">Explanation:</p>
            <p className="text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="flex items-center justify-between pt-4 border-t border-divider">
        <div className="text-xs text-gray-600">
          {state.isAnswered ? 'Press Enter or Space to continue' : 'Press 1-4 to select answer'}
        </div>

        {state.isAnswered && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            {state.currentIndex < shuffledQuestions.length - 1 ? 'Next' : 'See Results'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
