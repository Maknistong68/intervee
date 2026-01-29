import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { PolicyData } from '../data/keyHighlightsData';

interface PolicyItemProps {
  policy: PolicyData;
  isHighlighted: boolean;
}

export function PolicyItem({
  policy,
  isHighlighted,
}: PolicyItemProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Animate glow effect when highlighted
  useEffect(() => {
    if (isHighlighted) {
      // Pulse glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isHighlighted, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <View
      style={[
        styles.container,
        isHighlighted && styles.containerHighlighted,
      ]}
    >
      {/* Glow overlay for highlighted state */}
      {isHighlighted && (
        <Animated.View
          style={[
            styles.glowOverlay,
            { opacity: glowOpacity },
          ]}
        />
      )}

      {/* Policy title row (non-clickable) */}
      <View style={styles.titleRow}>
        {/* Policy icon */}
        <Text style={styles.icon}>{policy.icon}</Text>

        {/* Policy title */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.ruleNumber,
              isHighlighted && styles.ruleNumberHighlighted,
            ]}
          >
            {policy.ruleNumber}
          </Text>
          <Text
            style={styles.shortTitle}
            numberOfLines={1}
          >
            {policy.shortTitle}
          </Text>
        </View>

        {/* Active indicator */}
        {isHighlighted && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DARK_THEME.divider,
  },
  containerHighlighted: {
    borderColor: DARK_THEME.primary,
    borderWidth: 2,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DARK_THEME.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleNumber: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: DARK_THEME.text,
    marginRight: SPACING.xs,
  },
  ruleNumberHighlighted: {
    color: DARK_THEME.primary,
  },
  shortTitle: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    flex: 1,
  },
  activeIndicator: {
    backgroundColor: DARK_THEME.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeText: {
    fontSize: 8,
    fontWeight: '700',
    color: DARK_THEME.background,
    letterSpacing: 0.5,
  },
});

export default PolicyItem;
