'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, RotateCcw, Shuffle, BookOpen } from 'lucide-react';
import type { Flashcard } from '@/lib/studyData';
import ProgressBar from './ProgressBar';

interface FlashcardViewProps {
  cards: Flashcard[];
  onComplete?: () => void;
  onMarkKnown?: (cardId: string) => void;
  knownCards?: Set<string>;
}

export default function FlashcardView({
  cards,
  onComplete,
  onMarkKnown,
  knownCards = new Set(),
}: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [localKnown, setLocalKnown] = useState<Set<string>>(new Set(knownCards));
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(cards);

  // Shuffle cards on mount
  useEffect(() => {
    setShuffledCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];
  const isKnown = currentCard && localKnown.has(currentCard.id);

  const goToNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, shuffledCards.length, onComplete]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleMarkKnown = useCallback(() => {
    if (!currentCard) return;

    const newKnown = new Set(localKnown);
    if (isKnown) {
      newKnown.delete(currentCard.id);
    } else {
      newKnown.add(currentCard.id);
    }
    setLocalKnown(newKnown);
    onMarkKnown?.(currentCard.id);

    // Auto-advance after marking known
    if (!isKnown) {
      setTimeout(goToNext, 300);
    }
  }, [currentCard, isKnown, localKnown, onMarkKnown, goToNext]);

  const handleShuffle = useCallback(() => {
    setShuffledCards([...shuffledCards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [shuffledCards]);

  const handleReset = useCallback(() => {
    setLocalKnown(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          handleMarkKnown();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, goToNext, goToPrevious, handleMarkKnown]);

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
        <p>No flashcards available for selected topics.</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-4">
        <ProgressBar
          current={localKnown.size}
          total={shuffledCards.length}
          label="Cards Mastered"
          color="green"
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div
          onClick={handleFlip}
          className="perspective-1000 w-full max-w-lg cursor-pointer"
        >
          <div
            className={`relative w-full min-h-[280px] transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front - Question */}
            <div className="absolute inset-0 backface-hidden">
              <div className={`w-full h-full bg-surface border-2 rounded-2xl p-6 flex flex-col ${
                isKnown ? 'border-green-500/50' : 'border-primary/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(currentCard.difficulty)}`}>
                    {currentCard.difficulty.toUpperCase()}
                  </span>
                  {isKnown && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Known
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xl sm:text-2xl text-center font-medium text-white">
                    {currentCard.question}
                  </p>
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Tap or press Space to reveal answer
                </p>
              </div>
            </div>

            {/* Back - Answer */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <div className={`w-full h-full bg-surface border-2 rounded-2xl p-6 flex flex-col ${
                isKnown ? 'border-green-500/50' : 'border-primary/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-primary uppercase font-semibold">Answer</span>
                  <span className="text-xs text-gray-500">{currentCard.citation}</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xl sm:text-2xl text-center font-medium text-primary">
                    {currentCard.answer}
                  </p>
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Press K to mark as known
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card info */}
        <p className="text-sm text-gray-500 mt-4">
          Card {currentIndex + 1} of {shuffledCards.length}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-divider">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-surface-light border border-divider hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === shuffledCards.length - 1}
            className="p-2 rounded-lg bg-surface-light border border-divider hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleMarkKnown}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            isKnown
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-surface-light border-divider text-gray-400 hover:border-green-500/50 hover:text-green-400'
          }`}
          title="Mark Known (K)"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm">{isKnown ? 'Known' : 'Mark Known'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-2 rounded-lg bg-surface-light border border-divider hover:border-gray-500 transition-all"
            title="Shuffle Cards"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-surface-light border border-divider hover:border-gray-500 transition-all"
            title="Reset Progress"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-3 text-center text-xs text-gray-600">
        Space: Flip | Arrows: Navigate | K: Mark Known
      </div>
    </div>
  );
}
