import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface InterpretationBubbleProps {
  original: string;
  interpreted: string;
  confidence: number;
  visible: boolean;
}

/**
 * InterpretationBubble
 *
 * Shows what the AI understood from the user's speech.
 * Part of the OSH Intelligence System feedback loop.
 *
 * Example:
 * You said: "save tea off sir training"
 * I understood: "What is safety officer training?"
 */
export function InterpretationBubble({
  original,
  interpreted,
  confidence,
  visible,
}: InterpretationBubbleProps) {
  if (!visible || !original || !interpreted) {
    return null;
  }

  // Only show if interpretation changed the text
  const wasModified = original.toLowerCase().trim() !== interpreted.toLowerCase().trim();

  if (!wasModified) {
    return null;
  }

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return DARK_THEME.confidence.high;
    if (conf >= 0.5) return DARK_THEME.confidence.medium;
    return DARK_THEME.confidence.low;
  };

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        {/* Original text (what was heard) */}
        <View style={styles.row}>
          <Text style={styles.label}>You said:</Text>
          <Text style={styles.originalText} numberOfLines={2}>
            "{original}"
          </Text>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>↓</Text>
        </View>

        {/* Interpreted text (what AI understood) */}
        <View style={styles.row}>
          <Text style={styles.label}>I understood:</Text>
          <Text style={styles.interpretedText} numberOfLines={2}>
            "{interpreted}"
          </Text>
        </View>

        {/* Confidence indicator */}
        <View style={styles.confidenceRow}>
          <View style={styles.confidenceDot}>
            <View
              style={[
                styles.dot,
                { backgroundColor: getConfidenceColor(confidence) },
              ]}
            />
          </View>
          <Text
            style={[
              styles.confidenceText,
              { color: getConfidenceColor(confidence) },
            ]}
          >
            {Math.round(confidence * 100)}% confident
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bubble: {
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: DARK_THEME.processing,
  },
  row: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    fontStyle: 'italic',
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  arrow: {
    fontSize: FONT_SIZES.lg,
    color: DARK_THEME.processing,
  },
  interpretedText: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  confidenceDot: {
    marginRight: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
  },
});
