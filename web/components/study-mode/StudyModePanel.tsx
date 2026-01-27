'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, BookOpen, ClipboardList, Zap, GraduationCap } from 'lucide-react';
import {
  FLASHCARDS,
  QUIZ_QUESTIONS,
  TOPIC_INFO,
  getTopicStats,
  type StudyTopic,
  type Flashcard,
  type QuizQuestion,
} from '@/lib/studyData';
import TopicSelector from './TopicSelector';
import FlashcardView from './FlashcardView';
import QuizView from './QuizView';
import ProgressBar from './ProgressBar';

export interface StudyModePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type StudyMode = 'flashcards' | 'quiz' | 'quick-review';
type ViewState = 'topic-select' | 'studying';

const STORAGE_KEY_KNOWN = 'intervee_study_known_cards';
const STORAGE_KEY_TOPICS = 'intervee_study_selected_topics';

export default function StudyModePanel({ isOpen, onClose }: StudyModePanelProps) {
  const [mode, setMode] = useState<StudyMode>('flashcards');
  const [viewState, setViewState] = useState<ViewState>('topic-select');
  const [selectedTopics, setSelectedTopics] = useState<StudyTopic[]>([]);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());

  const topicStats = getTopicStats();

  // Load saved state from localStorage
  useEffect(() => {
    const savedKnown = localStorage.getItem(STORAGE_KEY_KNOWN);
    if (savedKnown) {
      try {
        setKnownCards(new Set(JSON.parse(savedKnown)));
      } catch (e) {
        console.error('Failed to load known cards:', e);
      }
    }

    const savedTopics = localStorage.getItem(STORAGE_KEY_TOPICS);
    if (savedTopics) {
      try {
        setSelectedTopics(JSON.parse(savedTopics));
      } catch (e) {
        console.error('Failed to load selected topics:', e);
      }
    }
  }, []);

  // Save known cards to localStorage
  useEffect(() => {
    if (knownCards.size > 0) {
      localStorage.setItem(STORAGE_KEY_KNOWN, JSON.stringify([...knownCards]));
    }
  }, [knownCards]);

  // Save selected topics
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(selectedTopics));
  }, [selectedTopics]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (viewState === 'studying') {
          setViewState('topic-select');
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, viewState, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleToggleTopic = useCallback((topic: StudyTopic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTopics(Object.keys(TOPIC_INFO) as StudyTopic[]);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTopics([]);
  }, []);

  const handleStartStudy = useCallback(() => {
    if (selectedTopics.length === 0) return;
    setViewState('studying');
  }, [selectedTopics]);

  const handleMarkKnown = useCallback((cardId: string) => {
    setKnownCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    console.log(`Quiz completed: ${score}/${total}`);
  }, []);

  // Filter cards/questions by selected topics
  const filteredCards: Flashcard[] = FLASHCARDS.filter(card =>
    selectedTopics.includes(card.topic as StudyTopic)
  );

  const filteredQuestions: QuizQuestion[] = QUIZ_QUESTIONS.filter(q =>
    selectedTopics.includes(q.topic as StudyTopic)
  );

  // Calculate overall progress
  const totalCards = FLASHCARDS.length;
  const masteredCards = knownCards.size;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="study-mode-title"
    >
      <div className="w-full h-full sm:w-[95vw] sm:h-[95vh] sm:max-w-5xl bg-surface sm:border sm:border-divider sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-divider bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 id="study-mode-title" className="text-lg font-bold">Study Mode</h2>
              <p className="text-xs text-gray-500">OSH Interview Preparation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Overall Progress */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-gray-400">Mastered:</span>
              <div className="w-32">
                <ProgressBar
                  current={masteredCards}
                  total={totalCards}
                  showPercentage={true}
                  color="green"
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-light transition-colors"
              aria-label="Close study mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-3 border-b border-divider bg-surface-light/50 shrink-0">
          {[
            { id: 'flashcards' as StudyMode, label: 'Flashcards', icon: BookOpen },
            { id: 'quiz' as StudyMode, label: 'Quiz', icon: ClipboardList },
            { id: 'quick-review' as StudyMode, label: 'Quick Review', icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setMode(id);
                setViewState('topic-select');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                mode === id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-surface-light hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {viewState === 'topic-select' ? (
            <div className="max-w-2xl mx-auto">
              {/* Mode Description */}
              <div className="mb-6 p-4 bg-surface-light rounded-xl border border-divider">
                {mode === 'flashcards' && (
                  <>
                    <h3 className="font-semibold text-white mb-1">Flashcard Mode</h3>
                    <p className="text-sm text-gray-400">
                      Flip cards to reveal answers. Mark cards as "known" to track your progress.
                      Cards you know will be remembered for next time.
                    </p>
                  </>
                )}
                {mode === 'quiz' && (
                  <>
                    <h3 className="font-semibold text-white mb-1">Quiz Mode</h3>
                    <p className="text-sm text-gray-400">
                      Test your knowledge with multiple choice questions. See explanations
                      and track your score. Great for exam preparation.
                    </p>
                  </>
                )}
                {mode === 'quick-review' && (
                  <>
                    <h3 className="font-semibold text-white mb-1">Quick Review Mode</h3>
                    <p className="text-sm text-gray-400">
                      See all key facts at once for rapid review before your interview.
                      Perfect for last-minute cramming.
                    </p>
                  </>
                )}
              </div>

              {/* Topic Selection */}
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Select Topics to Study
              </h3>
              <TopicSelector
                selectedTopics={selectedTopics}
                onToggleTopic={handleToggleTopic}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                topicStats={topicStats}
                mode={mode === 'quiz' ? 'quiz' : 'flashcard'}
              />

              {/* Start Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleStartStudy}
                  disabled={selectedTopics.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mode === 'flashcards' && <BookOpen className="w-5 h-5" />}
                  {mode === 'quiz' && <ClipboardList className="w-5 h-5" />}
                  {mode === 'quick-review' && <Zap className="w-5 h-5" />}
                  Start {mode === 'flashcards' ? 'Flashcards' : mode === 'quiz' ? 'Quiz' : 'Review'}
                  {selectedTopics.length > 0 && (
                    <span className="text-white/80 text-sm">
                      ({mode === 'quiz' ? filteredQuestions.length : filteredCards.length} items)
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {/* Back button */}
              <button
                onClick={() => setViewState('topic-select')}
                className="mb-4 text-sm text-gray-400 hover:text-white transition-colors"
              >
                &larr; Back to topic selection
              </button>

              {mode === 'flashcards' && (
                <FlashcardView
                  cards={filteredCards}
                  knownCards={knownCards}
                  onMarkKnown={handleMarkKnown}
                />
              )}

              {mode === 'quiz' && (
                <QuizView
                  questions={filteredQuestions}
                  onComplete={handleQuizComplete}
                />
              )}

              {mode === 'quick-review' && (
                <QuickReviewView cards={filteredCards} />
              )}
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="px-4 sm:px-6 py-3 border-t border-divider bg-surface-light/50 text-center text-xs text-gray-500 shrink-0">
          <span className="hidden sm:inline">
            Keyboard: Space = Flip/Continue | Arrows = Navigate | K = Mark Known | 1-4 = Select Answer | Esc = Back
          </span>
          <span className="sm:hidden">
            Tap cards to flip | Swipe to navigate
          </span>
        </div>
      </div>
    </div>
  );
}

// Quick Review Component (inline for simplicity)
function QuickReviewView({ cards }: { cards: Flashcard[] }) {
  // Group cards by topic
  const cardsByTopic = cards.reduce((acc, card) => {
    if (!acc[card.topic]) {
      acc[card.topic] = [];
    }
    acc[card.topic].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
        <p>No cards available for selected topics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(cardsByTopic).map(([topic, topicCards]) => (
        <div key={topic} className="bg-surface border border-divider rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-surface-light border-b border-divider">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span>{TOPIC_INFO[topic as StudyTopic]?.icon}</span>
              {TOPIC_INFO[topic as StudyTopic]?.name || topic}
              <span className="text-xs text-gray-500">({topicCards.length} cards)</span>
            </h3>
          </div>
          <div className="divide-y divide-divider">
            {topicCards.map(card => (
              <div key={card.id} className="px-4 py-3 hover:bg-surface-light/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{card.question}</p>
                    <p className="text-white font-medium">{card.answer}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                    card.difficulty === 'easy' ? 'bg-green-400/10 text-green-400' :
                    card.difficulty === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-red-400/10 text-red-400'
                  }`}>
                    {card.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{card.citation}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
