import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { QuickAnswer } from '../data/keyHighlightsData';

interface QuickAnswerCardProps {
  quickAnswer: QuickAnswer;
}

export function QuickAnswerCard({ quickAnswer }: QuickAnswerCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{'\u26A1'}</Text>
        <Text style={styles.question}>{quickAnswer.questionPattern}</Text>
      </View>
      <Text style={styles.answer}>{quickAnswer.answer}</Text>
      <Text style={styles.citation}>{quickAnswer.citation}</Text>
    </View>
  );
}

interface QuickAnswersListProps {
  quickAnswers: QuickAnswer[];
  maxItems?: number;
}

export function QuickAnswersList({ quickAnswers, maxItems = 3 }: QuickAnswersListProps) {
  const displayItems = quickAnswers.slice(0, maxItems);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{'\u26A1'}</Text>
        <Text style={styles.sectionTitle}>QUICK ANSWERS</Text>
      </View>
      {displayItems.map((qa) => (
        <View key={qa.id} style={styles.compactItem}>
          <Text style={styles.compactQuestion}>{qa.questionPattern}</Text>
          <Text style={styles.compactAnswer}>{qa.answer}</Text>
          <Text style={styles.compactCitation}>{qa.citation}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: DARK_THEME.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 12,
  },
  question: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: DARK_THEME.textSecondary,
    marginLeft: 6,
  },
  answer: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: DARK_THEME.text,
    marginBottom: 4,
  },
  citation: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.primary,
  },
  // List styles
  listContainer: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: DARK_THEME.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  compactItem: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: 6,
    borderLeftWidth: 2,
    borderLeftColor: DARK_THEME.primary,
  },
  compactQuestion: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    marginBottom: 2,
  },
  compactAnswer: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.text,
  },
  compactCitation: {
    fontSize: 10,
    color: DARK_THEME.primary,
    marginTop: 2,
  },
});

export default QuickAnswerCard;
