import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useReviewerSession } from '../../hooks/useReviewerSession';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True/False',
  OPEN_ENDED: 'Open Ended',
  SCENARIO_BASED: 'Scenario',
};

export function ResultsScreen() {
  const { summary, history, resetToConfig, reset } = useReviewerSession();

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No results available</Text>
      </View>
    );
  }

  const scorePercent = Math.round(summary.score);
  const scoreColor =
    scorePercent >= 80
      ? DARK_THEME.success
      : scorePercent >= 60
      ? DARK_THEME.warning
      : DARK_THEME.error;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Score Header */}
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreTitle}>Quiz Complete!</Text>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scorePercent, { color: scoreColor }]}>
            {scorePercent}%
          </Text>
        </View>
        <Text style={styles.scoreLabel}>
          {summary.correctCount} of {summary.totalQuestions} correct
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.completedQuestions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.correctCount}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(summary.averageTimePerQuestion)}s
          </Text>
          <Text style={styles.statLabel}>Avg Time</Text>
        </View>
      </View>

      {/* By Type Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Question Type</Text>
        {Object.entries(summary.byType)
          .filter(([_, stats]) => stats.total > 0)
          .map(([type, stats]) => (
            <View key={type} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                {TYPE_LABELS[type] || type}
              </Text>
              <Text style={styles.breakdownValue}>
                {stats.correct}/{stats.total}
              </Text>
            </View>
          ))}
      </View>

      {/* By Difficulty Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Difficulty</Text>
        {Object.entries(summary.byDifficulty)
          .filter(([_, stats]) => stats.total > 0)
          .map(([diff, stats]) => (
            <View key={diff} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{diff}</Text>
              <Text style={styles.breakdownValue}>
                {stats.correct}/{stats.total}
              </Text>
            </View>
          ))}
      </View>

      {/* Weak Areas */}
      {summary.weakAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
          <View style={styles.areasList}>
            {summary.weakAreas.map((area) => (
              <View key={area} style={styles.weakAreaBadge}>
                <Text style={styles.weakAreaText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Strong Areas */}
      {summary.strongAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strong Areas</Text>
          <View style={styles.areasList}>
            {summary.strongAreas.map((area) => (
              <View key={area} style={styles.strongAreaBadge}>
                <Text style={styles.strongAreaText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Question History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question History</Text>
        {history.map((item, index) => (
          <View
            key={item.question.id}
            style={[
              styles.historyItem,
              item.evaluation.isCorrect
                ? styles.historyItemCorrect
                : styles.historyItemIncorrect,
            ]}
          >
            <View style={styles.historyHeader}>
              <Text style={styles.historyNumber}>Q{index + 1}</Text>
              <Text
                style={[
                  styles.historyResult,
                  { color: item.evaluation.isCorrect ? DARK_THEME.success : DARK_THEME.error },
                ]}
              >
                {item.evaluation.isCorrect ? 'Correct' : `${Math.round(item.evaluation.score * 100)}%`}
              </Text>
            </View>
            <Text style={styles.historyQuestion} numberOfLines={2}>
              {item.question.questionText}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={resetToConfig}>
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
          <Text style={styles.secondaryButtonText}>New Quiz</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  errorText: {
    color: DARK_THEME.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  scoreTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: DARK_THEME.text,
    marginBottom: SPACING.md,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scorePercent: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: DARK_THEME.text,
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  areasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  weakAreaBadge: {
    backgroundColor: DARK_THEME.error + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  weakAreaText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.error,
  },
  strongAreaBadge: {
    backgroundColor: DARK_THEME.success + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  strongAreaText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.success,
  },
  historyItem: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
  },
  historyItemCorrect: {
    borderLeftColor: DARK_THEME.success,
  },
  historyItemIncorrect: {
    borderLeftColor: DARK_THEME.error,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  historyNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.textSecondary,
  },
  historyResult: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  historyQuestion: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.text,
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: DARK_THEME.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: DARK_THEME.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: DARK_THEME.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  secondaryButtonText: {
    color: DARK_THEME.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
});
