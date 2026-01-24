import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface TrueFalseInputProps {
  selected: boolean | null;
  onSelect: (value: boolean) => void;
  disabled?: boolean;
}

export function TrueFalseInput({ selected, onSelect, disabled }: TrueFalseInputProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.trueButton,
          selected === true && styles.trueButtonSelected,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => !disabled && onSelect(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, selected === true && styles.iconSelected]}>
          O
        </Text>
        <Text style={[styles.buttonText, selected === true && styles.buttonTextSelected]}>
          TRUE
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.falseButton,
          selected === false && styles.falseButtonSelected,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => !disabled && onSelect(false)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, selected === false && styles.iconSelected]}>
          X
        </Text>
        <Text style={[styles.buttonText, selected === false && styles.buttonTextSelected]}>
          FALSE
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.xl,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DARK_THEME.border,
  },
  trueButton: {},
  trueButtonSelected: {
    borderColor: DARK_THEME.success,
    backgroundColor: DARK_THEME.success + '20',
  },
  falseButton: {},
  falseButtonSelected: {
    borderColor: DARK_THEME.error,
    backgroundColor: DARK_THEME.error + '20',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 32,
    fontWeight: '700',
    color: DARK_THEME.textSecondary,
    marginBottom: SPACING.sm,
  },
  iconSelected: {
    color: DARK_THEME.text,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: DARK_THEME.textSecondary,
  },
  buttonTextSelected: {
    color: DARK_THEME.text,
  },
});
