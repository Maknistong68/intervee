import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { PolicyData } from '../data/keyHighlightsData';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PolicyItemProps {
  policy: PolicyData;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
}

export function PolicyItem({
  policy,
  isExpanded,
  isHighlighted,
  onToggle,
}: PolicyItemProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  // Animate chevron rotation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
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

      {/* Header (always visible) */}
      <TouchableOpacity
        style={styles.header}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Expand/Collapse indicator */}
        <Animated.Text
          style={[
            styles.chevron,
            { transform: [{ rotate: chevronRotation }] },
          ]}
        >
          {'\u25B6'}
        </Animated.Text>

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
      </TouchableOpacity>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Full title */}
          <Text style={styles.fullTitle}>{policy.title}</Text>

          {/* Amendments if any */}
          {policy.amendments && policy.amendments.length > 0 && (
            <Text style={styles.amendments}>
              Amended by: {policy.amendments.join(', ')}
            </Text>
          )}

          {/* Quick Answers */}
          {policy.quickAnswers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Answers</Text>
              {policy.quickAnswers.slice(0, 3).map((qa) => (
                <View key={qa.id} style={styles.qaItem}>
                  <Text style={styles.qaQuestion}>{qa.questionPattern}</Text>
                  <Text style={styles.qaAnswer}>{qa.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Key Facts */}
          {policy.keyFacts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Facts</Text>
              {policy.keyFacts.slice(0, 3).map((fact) => (
                <View key={fact.id} style={styles.factItem}>
                  <Text style={styles.factBullet}>{'\u2022'}</Text>
                  <Text style={styles.factText}>{fact.fact}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  chevron: {
    fontSize: 10,
    color: DARK_THEME.textMuted,
    marginRight: SPACING.xs,
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
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  fullTitle: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.text,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  amendments: {
    fontSize: FONT_SIZES.xs - 1,
    color: DARK_THEME.warning,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: '700',
    color: DARK_THEME.primary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qaItem: {
    marginBottom: SPACING.xs,
  },
  qaQuestion: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
  },
  qaAnswer: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  factItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  factBullet: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.primary,
    marginRight: 6,
  },
  factText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.text,
    flex: 1,
  },
});

export default PolicyItem;
