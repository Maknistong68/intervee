import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
  visible: boolean;
}

/**
 * FollowUpSuggestions
 *
 * Shows quick-tap follow-up questions after the AI answers.
 * Part of the OSH Intelligence System for improved conversation flow.
 *
 * Example:
 * [How many hours for SO1?] [What about SO2?] [Renewal requirements?]
 */
export function FollowUpSuggestions({
  suggestions,
  onSuggestionPress,
  visible,
}: FollowUpSuggestionsProps) {
  if (!visible || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Related Questions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`${suggestion}-${index}`}
            style={styles.chip}
            onPress={() => onSuggestionPress(suggestion)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText} numberOfLines={2}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  header: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  chip: {
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: DARK_THEME.primary + '40', // 40 = 25% opacity
    maxWidth: 200,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.primaryLight,
    textAlign: 'center',
  },
});
