import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface AnswerDisplayProps {
  answer: string;
  confidence: number;
  isGenerating: boolean;
  isStreaming: boolean;
}

export function AnswerDisplay({
  answer,
  confidence,
  isGenerating,
  isStreaming,
}: AnswerDisplayProps) {
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return DARK_THEME.confidence.high;
    if (conf >= 0.5) return DARK_THEME.confidence.medium;
    return DARK_THEME.confidence.low;
  };

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 0.8) return 'High Confidence';
    if (conf >= 0.5) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (!answer && !isGenerating) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ready to Assist</Text>
          <Text style={styles.emptySubtitle}>
            Listening for OSH interview questions...
          </Text>
          <Text style={styles.emptyHint}>
            Ask about OSHS Rules, Department Orders, or RA 11058
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SUGGESTED ANSWER</Text>
        {isGenerating && !answer && (
          <View style={styles.generatingIndicator}>
            <ActivityIndicator size="small" color={DARK_THEME.processing} />
            <Text style={styles.generatingText}>Generating...</Text>
          </View>
        )}
      </View>

      {/* Answer Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.answerText}>
          {answer}
          {isStreaming && <Text style={styles.cursor}>▋</Text>}
        </Text>
      </ScrollView>

      {/* Confidence Bar */}
      {answer && confidence > 0 && (
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBarBackground}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${confidence * 100}%`,
                  backgroundColor: getConfidenceColor(confidence),
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.confidenceLabel,
              { color: getConfidenceColor(confidence) },
            ]}
          >
            {Math.round(confidence * 100)}% {getConfidenceLabel(confidence)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.primary,
    letterSpacing: 1,
  },
  generatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generatingText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.processing,
    marginLeft: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  answerText: {
    fontSize: FONT_SIZES.answer,
    lineHeight: FONT_SIZES.answer * 1.5,
    color: DARK_THEME.answerText,
    fontWeight: '400',
  },
  cursor: {
    color: DARK_THEME.primary,
  },
  confidenceContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  confidenceBarBackground: {
    height: 4,
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  confidenceLabel: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: DARK_THEME.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyHint: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
