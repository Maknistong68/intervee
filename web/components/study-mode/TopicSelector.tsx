'use client';

import { Check } from 'lucide-react';
import { TOPIC_INFO, type StudyTopic } from '@/lib/studyData';

interface TopicSelectorProps {
  selectedTopics: StudyTopic[];
  onToggleTopic: (topic: StudyTopic) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  topicStats?: Record<StudyTopic, { flashcards: number; quizzes: number }>;
  mode?: 'flashcard' | 'quiz';
}

export default function TopicSelector({
  selectedTopics,
  onToggleTopic,
  onSelectAll,
  onClearAll,
  topicStats,
  mode = 'flashcard',
}: TopicSelectorProps) {
  const topics = Object.entries(TOPIC_INFO) as [StudyTopic, typeof TOPIC_INFO[StudyTopic]][];

  // Group by priority
  const highPriority = topics.filter(([, info]) => info.priority === 'high');
  const mediumPriority = topics.filter(([, info]) => info.priority === 'medium');
  const lowPriority = topics.filter(([, info]) => info.priority === 'low');

  const renderTopicButton = ([topic, info]: [StudyTopic, typeof TOPIC_INFO[StudyTopic]]) => {
    const isSelected = selectedTopics.includes(topic);
    const count = topicStats
      ? mode === 'flashcard'
        ? topicStats[topic]?.flashcards || 0
        : topicStats[topic]?.quizzes || 0
      : 0;

    return (
      <button
        key={topic}
        onClick={() => onToggleTopic(topic)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
          isSelected
            ? 'bg-primary/20 border-primary/50 text-white'
            : 'bg-surface-light border-divider text-gray-400 hover:border-gray-500 hover:text-gray-300'
        }`}
      >
        <span className="text-lg">{info.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : ''}`}>
              {info.name}
            </span>
            {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </div>
          {topicStats && (
            <span className="text-xs text-gray-500">
              {count} {mode === 'flashcard' ? 'cards' : 'questions'}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSelectAll}
          className="text-xs text-primary hover:text-primary-light transition-colors"
        >
          Select All
        </button>
        <span className="text-gray-600">|</span>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          Clear All
        </button>
        <span className="ml-auto text-xs text-gray-500">
          {selectedTopics.length} selected
        </span>
      </div>

      {/* High Priority */}
      <div>
        <h4 className="text-xs font-semibold text-red-400 uppercase mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          High Priority (Most Asked)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {highPriority.map(renderTopicButton)}
        </div>
      </div>

      {/* Medium Priority */}
      <div>
        <h4 className="text-xs font-semibold text-yellow-400 uppercase mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Medium Priority
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {mediumPriority.map(renderTopicButton)}
        </div>
      </div>

      {/* Additional Topics */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Additional Topics
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lowPriority.map(renderTopicButton)}
        </div>
      </div>
    </div>
  );
}
