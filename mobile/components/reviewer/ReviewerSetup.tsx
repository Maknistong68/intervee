import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useReviewerSession } from '../../hooks/useReviewerSession';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy', description: 'Direct recall questions' },
  { value: 'MEDIUM', label: 'Medium', description: 'Application of rules' },
  { value: 'HARD', label: 'Hard', description: 'Complex scenarios' },
];

const QUESTION_TYPE_OPTIONS = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'OPEN_ENDED', label: 'Open Ended' },
  { value: 'SCENARIO_BASED', label: 'Scenario' },
];

const FOCUS_AREAS = [
  { key: 'rule1020', label: 'Rule 1020 - Registration' },
  { key: 'rule1030', label: 'Rule 1030 - Safety Officers' },
  { key: 'rule1040', label: 'Rule 1040 - HSC' },
  { key: 'rule1050', label: 'Rule 1050 - Accident Reporting' },
  { key: 'rule1080', label: 'Rule 1080 - PPE' },
  { key: 'rule1090', label: 'Rule 1090 - Hazardous Materials' },
  { key: 'ra11058', label: 'RA 11058 - Penalties' },
  { key: 'do252', label: 'DO 252 - Safety Officer Training' },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25];
const TIME_LIMITS = [30, 60, 90, 120];

export function ReviewerSetup() {
  const {
    difficulty,
    questionTypes,
    focusAreas,
    questionCount,
    timed,
    timeLimitPerQ,
    isLoading,
    error,
    setDifficulty,
    toggleQuestionType,
    toggleFocusArea,
    setQuestionCount,
    setTimed,
    setTimeLimitPerQ,
    startSession,
  } = useReviewerSession();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Difficulty */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <View style={styles.optionsRow}>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                difficulty === opt.value && styles.optionButtonActive,
              ]}
              onPress={() => setDifficulty(opt.value as any)}
            >
              <Text
                style={[
                  styles.optionText,
                  difficulty === opt.value && styles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question Types</Text>
        <View style={styles.optionsWrap}>
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chipButton,
                questionTypes.includes(opt.value as any) && styles.chipButtonActive,
              ]}
              onPress={() => toggleQuestionType(opt.value as any)}
            >
              <Text
                style={[
                  styles.chipText,
                  questionTypes.includes(opt.value as any) && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Focus Areas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Areas (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          Leave empty for random topics
        </Text>
        <View style={styles.optionsWrap}>
          {FOCUS_AREAS.map((area) => (
            <TouchableOpacity
              key={area.key}
              style={[
                styles.chipButton,
                focusAreas.includes(area.key) && styles.chipButtonActive,
              ]}
              onPress={() => toggleFocusArea(area.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  focusAreas.includes(area.key) && styles.chipTextActive,
                ]}
              >
                {area.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Questions</Text>
        <View style={styles.optionsRow}>
          {QUESTION_COUNTS.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.countButton,
                questionCount === count && styles.countButtonActive,
              ]}
              onPress={() => setQuestionCount(count)}
            >
              <Text
                style={[
                  styles.countText,
                  questionCount === count && styles.countTextActive,
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timer */}
      <View style={styles.section}>
        <View style={styles.timerHeader}>
          <Text style={styles.sectionTitle}>Time Limit</Text>
          <TouchableOpacity
            style={[styles.toggleButton, timed && styles.toggleButtonActive]}
            onPress={() => setTimed(!timed)}
          >
            <Text style={styles.toggleText}>{timed ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
        {timed && (
          <View style={styles.optionsRow}>
            {TIME_LIMITS.map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.timeButton,
                  timeLimitPerQ === seconds && styles.timeButtonActive,
                ]}
                onPress={() => setTimeLimitPerQ(seconds)}
              >
                <Text
                  style={[
                    styles.timeText,
                    timeLimitPerQ === seconds && styles.timeTextActive,
                  ]}
                >
                  {seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startButton, isLoading && styles.startButtonDisabled]}
        onPress={startSession}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={DARK_THEME.text} />
        ) : (
          <Text style={styles.startButtonText}>Start Quiz</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  errorContainer: {
    backgroundColor: DARK_THEME.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: DARK_THEME.error,
    fontSize: FONT_SIZES.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: DARK_THEME.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
    marginBottom: SPACING.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  optionButton: {
    flex: 1,
    minWidth: 90,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  optionButtonActive: {
    backgroundColor: DARK_THEME.primary + '20',
    borderColor: DARK_THEME.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: DARK_THEME.primary,
  },
  chipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  chipButtonActive: {
    backgroundColor: DARK_THEME.primary + '20',
    borderColor: DARK_THEME.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
  },
  chipTextActive: {
    color: DARK_THEME.primary,
  },
  countButton: {
    width: 50,
    height: 50,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  countButtonActive: {
    backgroundColor: DARK_THEME.primary + '20',
    borderColor: DARK_THEME.primary,
  },
  countText: {
    fontSize: FONT_SIZES.lg,
    color: DARK_THEME.textSecondary,
    fontWeight: '600',
  },
  countTextActive: {
    color: DARK_THEME.primary,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  toggleButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  toggleButtonActive: {
    backgroundColor: DARK_THEME.primary + '20',
    borderColor: DARK_THEME.primary,
  },
  toggleText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
    fontWeight: '600',
  },
  timeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  timeButtonActive: {
    backgroundColor: DARK_THEME.primary + '20',
    borderColor: DARK_THEME.primary,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
  },
  timeTextActive: {
    color: DARK_THEME.primary,
  },
  startButton: {
    backgroundColor: DARK_THEME.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: DARK_THEME.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
