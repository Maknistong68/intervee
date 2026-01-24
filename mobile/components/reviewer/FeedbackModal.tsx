import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface FeedbackModalProps {
  evaluation: {
    isCorrect: boolean;
    score: number;
    feedback: string;
    correctAnswer?: string | number | boolean;
    keyPointsFound?: string[];
    keyPointsMissed?: string[];
  };
  question: {
    questionType: string;
    options?: string[];
  };
  isLastQuestion: boolean;
  onNext: () => void;
  onFinish: () => void;
}

export function FeedbackModal({
  evaluation,
  question,
  isLastQuestion,
  onNext,
  onFinish,
}: FeedbackModalProps) {
  const getCorrectAnswerDisplay = () => {
    if (evaluation.correctAnswer === undefined) return null;

    if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
      const index = evaluation.correctAnswer as number;
      return question.options[index];
    }

    if (question.questionType === 'TRUE_FALSE') {
      return evaluation.correctAnswer ? 'TRUE' : 'FALSE';
    }

    return String(evaluation.correctAnswer);
  };

  const scorePercent = Math.round(evaluation.score * 100);

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Result Header */}
          <View style={styles.header}>
            <Text style={styles.resultIcon}>
              {evaluation.isCorrect ? '✓' : '✗'}
            </Text>
            <Text
              style={[
                styles.resultText,
                evaluation.isCorrect ? styles.resultCorrect : styles.resultIncorrect,
              ]}
            >
              {evaluation.isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
            {!evaluation.isCorrect && scorePercent > 0 && (
              <Text style={styles.partialCredit}>
                Partial credit: {scorePercent}%
              </Text>
            )}
          </View>

          {/* Feedback */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackLabel}>Feedback</Text>
            <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
          </View>

          {/* Correct Answer (if wrong) */}
          {!evaluation.isCorrect && evaluation.correctAnswer !== undefined && (
            <View style={styles.correctAnswerContainer}>
              <Text style={styles.correctAnswerLabel}>Correct Answer</Text>
              <Text style={styles.correctAnswerText}>
                {getCorrectAnswerDisplay()}
              </Text>
            </View>
          )}

          {/* Key Points (for open-ended) */}
          {(evaluation.keyPointsFound?.length || evaluation.keyPointsMissed?.length) && (
            <View style={styles.keyPointsContainer}>
              {evaluation.keyPointsFound && evaluation.keyPointsFound.length > 0 && (
                <View style={styles.keyPointsSection}>
                  <Text style={styles.keyPointsLabel}>Points Covered</Text>
                  {evaluation.keyPointsFound.map((point, index) => (
                    <View key={index} style={styles.keyPoint}>
                      <Text style={styles.keyPointIcon}>✓</Text>
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              {evaluation.keyPointsMissed && evaluation.keyPointsMissed.length > 0 && (
                <View style={styles.keyPointsSection}>
                  <Text style={styles.keyPointsLabel}>Points Missed</Text>
                  {evaluation.keyPointsMissed.map((point, index) => (
                    <View key={index} style={styles.keyPoint}>
                      <Text style={[styles.keyPointIcon, styles.keyPointMissed]}>-</Text>
                      <Text style={[styles.keyPointText, styles.keyPointTextMissed]}>
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={isLastQuestion ? onFinish : onNext}
        >
          <Text style={styles.actionButtonText}>
            {isLastQuestion ? 'View Results' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: DARK_THEME.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  resultText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  resultCorrect: {
    color: DARK_THEME.success,
  },
  resultIncorrect: {
    color: DARK_THEME.error,
  },
  partialCredit: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.warning,
    marginTop: SPACING.xs,
  },
  feedbackContainer: {
    marginBottom: SPACING.md,
  },
  feedbackLabel: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    marginBottom: SPACING.xs,
  },
  feedbackText: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  correctAnswerContainer: {
    backgroundColor: DARK_THEME.surfaceLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  correctAnswerLabel: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    marginBottom: SPACING.xs,
  },
  correctAnswerText: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.success,
    fontWeight: '500',
  },
  keyPointsContainer: {
    marginBottom: SPACING.md,
  },
  keyPointsSection: {
    marginBottom: SPACING.md,
  },
  keyPointsLabel: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    marginBottom: SPACING.sm,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  keyPointIcon: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.success,
    marginRight: SPACING.sm,
    width: 20,
  },
  keyPointMissed: {
    color: DARK_THEME.error,
  },
  keyPointText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.text,
  },
  keyPointTextMissed: {
    color: DARK_THEME.textSecondary,
  },
  actionButton: {
    backgroundColor: DARK_THEME.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  actionButtonText: {
    color: DARK_THEME.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
