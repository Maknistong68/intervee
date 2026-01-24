import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface QuizProgressProps {
  current: number;
  total: number;
  correct: number;
}

export function QuizProgress({ current, total, correct }: QuizProgressProps) {
  const progress = (current / total) * 100;
  const answered = current - 1; // Current question not yet answered
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.questionCounter}>
          Question {current} of {total}
        </Text>
        <Text style={styles.score}>
          {correct}/{answered} correct {accuracy > 0 && `(${accuracy}%)`}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  questionCounter: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.text,
    fontWeight: '600',
  },
  score: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DARK_THEME.primary,
    borderRadius: BORDER_RADIUS.full,
  },
});
