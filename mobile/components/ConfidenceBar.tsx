import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ConfidenceBarProps {
  confidence: number; // 0 to 1
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function ConfidenceBar({
  confidence,
  showLabel = true,
  size = 'medium',
}: ConfidenceBarProps) {
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return DARK_THEME.confidence.high;
    if (conf >= 0.5) return DARK_THEME.confidence.medium;
    return DARK_THEME.confidence.low;
  };

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 0.8) return 'High Confidence';
    if (conf >= 0.5) return 'Medium Confidence';
    if (conf >= 0.3) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const getBarHeight = (): number => {
    switch (size) {
      case 'small':
        return 3;
      case 'large':
        return 8;
      default:
        return 5;
    }
  };

  const percentage = Math.round(confidence * 100);
  const color = getConfidenceColor(confidence);

  return (
    <View style={styles.container}>
      <View style={[styles.barBackground, { height: getBarHeight() }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height: getBarHeight(),
            },
          ]}
        />

        {/* Segment markers */}
        <View style={[styles.marker, { left: '50%' }]} />
        <View style={[styles.marker, { left: '80%' }]} />
      </View>

      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
          <Text style={styles.label}>{getConfidenceLabel(confidence)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barBackground: {
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    borderRadius: BORDER_RADIUS.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: DARK_THEME.divider,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  percentage: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
  },
});
