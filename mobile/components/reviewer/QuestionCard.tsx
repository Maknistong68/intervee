import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { TimerDisplay } from './TimerDisplay';

interface QuestionCardProps {
  question: {
    questionText: string;
    questionType: string;
    difficulty: string;
    sourceRule: string;
    questionOrder: number;
  };
  timeRemaining: number | null;
}

const DIFFICULTY_COLORS = {
  EASY: '#4CAF50',
  MEDIUM: '#FFC107',
  HARD: '#F44336',
};

const TYPE_LABELS = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True/False',
  OPEN_ENDED: 'Open Ended',
  SCENARIO_BASED: 'Scenario',
};

export function QuestionCard({ question, timeRemaining }: QuestionCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[question.difficulty as keyof typeof DIFFICULTY_COLORS] || DARK_THEME.textSecondary;
  const typeLabel = TYPE_LABELS[question.questionType as keyof typeof TYPE_LABELS] || question.questionType;

  return (
    <View style={styles.container}>
      {/* Header with metadata */}
      <View style={styles.header}>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: difficultyColor + '20' }]}>
            <Text style={[styles.badgeText, { color: difficultyColor }]}>
              {question.difficulty}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{typeLabel}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{question.sourceRule}</Text>
          </View>
        </View>
        {timeRemaining !== null && (
          <TimerDisplay seconds={timeRemaining} />
        )}
      </View>

      {/* Question Text */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Question {question.questionOrder}</Text>
        <Text style={styles.questionText}>{question.questionText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    flex: 1,
  },
  badge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
    fontWeight: '500',
  },
  questionContainer: {
    marginTop: SPACING.sm,
  },
  questionNumber: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    marginBottom: SPACING.xs,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    color: DARK_THEME.text,
    lineHeight: FONT_SIZES.lg * 1.5,
  },
});
