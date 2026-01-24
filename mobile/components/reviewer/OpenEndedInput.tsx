import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface OpenEndedInputProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  onVoiceStart: () => Promise<boolean>;
  onVoiceStop: () => void;
  isRecording: boolean;
}

export function OpenEndedInput({
  value,
  onChange,
  disabled,
  onVoiceStart,
  onVoiceStop,
  isRecording,
}: OpenEndedInputProps) {
  const handleVoiceToggle = async () => {
    if (isRecording) {
      onVoiceStop();
    } else {
      await onVoiceStart();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Answer</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, disabled && styles.textInputDisabled]}
          value={value}
          onChangeText={onChange}
          multiline
          numberOfLines={6}
          placeholder="Type your answer here..."
          placeholderTextColor={DARK_THEME.textMuted}
          editable={!disabled}
          textAlignVertical="top"
        />
      </View>

      {/* Voice Input Button */}
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isRecording && styles.voiceButtonRecording,
          disabled && styles.voiceButtonDisabled,
        ]}
        onPress={handleVoiceToggle}
        disabled={disabled}
      >
        <Text style={styles.voiceIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
        <Text style={styles.voiceText}>
          {isRecording ? 'Stop Recording' : 'Voice Input'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        {isRecording
          ? 'Speak your answer clearly...'
          : 'Tip: Use voice input for longer answers'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  textInput: {
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    minHeight: 150,
    maxHeight: 250,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  voiceButtonRecording: {
    borderColor: DARK_THEME.recording,
    backgroundColor: DARK_THEME.recording + '20',
  },
  voiceButtonDisabled: {
    opacity: 0.5,
  },
  voiceIcon: {
    fontSize: 20,
  },
  voiceText: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
  },
});
