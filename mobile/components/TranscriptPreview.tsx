import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface TranscriptPreviewProps {
  transcript: string;
  isPartial: boolean;
  isListening: boolean;
}

export function TranscriptPreview({
  transcript,
  isPartial,
  isListening,
}: TranscriptPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.micIndicator}>
          <View
            style={[
              styles.micDot,
              isListening && styles.micDotActive,
            ]}
          />
          <Text style={styles.micLabel}>
            {isListening ? 'Listening' : 'Paused'}
          </Text>
        </View>
        {isPartial && (
          <Text style={styles.partialBadge}>Processing...</Text>
        )}
      </View>

      <View style={styles.transcriptContainer}>
        {transcript ? (
          <Text style={styles.transcript} numberOfLines={2}>
            "{transcript}"
          </Text>
        ) : (
          <Text style={styles.placeholder}>
            {isListening
              ? 'Waiting for speech...'
              : 'Tap Start to begin listening'}
          </Text>
        )}
      </View>

      {transcript && (
        <View style={styles.detectedBadge}>
          <Text style={styles.detectedText}>
            {transcript.includes('?') ? '❓ Question Detected' : '💬 Speech Detected'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  micIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK_THEME.textMuted,
    marginRight: SPACING.xs,
  },
  micDotActive: {
    backgroundColor: DARK_THEME.recording,
  },
  micLabel: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partialBadge: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.processing,
    fontStyle: 'italic',
  },
  transcriptContainer: {
    minHeight: 40,
    justifyContent: 'center',
  },
  transcript: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    lineHeight: FONT_SIZES.md * 1.4,
  },
  placeholder: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    fontStyle: 'italic',
  },
  detectedBadge: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  detectedText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.primary,
  },
});
