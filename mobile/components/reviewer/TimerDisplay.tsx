import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface TimerDisplayProps {
  seconds: number;
}

export function TimerDisplay({ seconds }: TimerDisplayProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const isLow = seconds <= 10;
  const isWarning = seconds <= 30 && seconds > 10;

  const color = isLow
    ? DARK_THEME.error
    : isWarning
    ? DARK_THEME.warning
    : DARK_THEME.textSecondary;

  return (
    <View style={[styles.container, isLow && styles.containerLow]}>
      <Text style={[styles.timerText, { color }]}>
        {minutes}:{secs.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
  },
  containerLow: {
    backgroundColor: DARK_THEME.error + '20',
  },
  timerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
