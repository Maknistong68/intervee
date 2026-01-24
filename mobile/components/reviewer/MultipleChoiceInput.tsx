import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface MultipleChoiceInputProps {
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function MultipleChoiceInput({
  options,
  selectedIndex,
  onSelect,
  disabled,
}: MultipleChoiceInputProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const letter = String.fromCharCode(65 + index); // A, B, C, D

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => !disabled && onSelect(index)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={[styles.letterCircle, isSelected && styles.letterCircleSelected]}>
              <Text style={[styles.letter, isSelected && styles.letterSelected]}>
                {letter}
              </Text>
            </View>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option.replace(/^[A-D]\)\s*/, '')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: DARK_THEME.border,
  },
  optionSelected: {
    borderColor: DARK_THEME.primary,
    backgroundColor: DARK_THEME.primary + '10',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  letterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DARK_THEME.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  letterCircleSelected: {
    backgroundColor: DARK_THEME.primary,
  },
  letter: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: DARK_THEME.textSecondary,
  },
  letterSelected: {
    color: DARK_THEME.text,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    lineHeight: FONT_SIZES.md * 1.4,
  },
  optionTextSelected: {
    fontWeight: '500',
  },
});
