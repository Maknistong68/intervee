import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useReviewerSession } from '../../hooks/useReviewerSession';
import { QuestionCard } from './QuestionCard';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { TrueFalseInput } from './TrueFalseInput';
import { OpenEndedInput } from './OpenEndedInput';
import { FeedbackModal } from './FeedbackModal';
import { QuizProgress } from './QuizProgress';
import { DARK_THEME, SPACING } from '../../constants/theme';

export function QuizScreen() {
  const {
    status,
    currentQuestion,
    currentIndex,
    totalQuestions,
    timeRemaining,
    timed,
    userAnswer,
    selectedOption,
    selectedBoolean,
    evaluation,
    correctCount,
    setUserAnswer,
    setSelectedOption,
    setSelectedBoolean,
    submitAnswer,
    nextQuestion,
    endSession,
    startVoiceInput,
    stopVoiceInput,
    isRecordingVoice,
  } = useReviewerSession();

  if (!currentQuestion) {
    return null;
  }

  const renderInput = () => {
    switch (currentQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceInput
            options={currentQuestion.options || []}
            selectedIndex={selectedOption}
            onSelect={setSelectedOption}
            disabled={status === 'evaluating' || !!evaluation}
          />
        );
      case 'TRUE_FALSE':
        return (
          <TrueFalseInput
            selected={selectedBoolean}
            onSelect={setSelectedBoolean}
            disabled={status === 'evaluating' || !!evaluation}
          />
        );
      case 'OPEN_ENDED':
      case 'SCENARIO_BASED':
        return (
          <OpenEndedInput
            value={userAnswer}
            onChange={setUserAnswer}
            disabled={status === 'evaluating' || !!evaluation}
            onVoiceStart={startVoiceInput}
            onVoiceStop={stopVoiceInput}
            isRecording={isRecordingVoice}
          />
        );
      default:
        return null;
    }
  };

  const canSubmit = () => {
    if (status === 'evaluating' || evaluation) return false;
    switch (currentQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        return selectedOption !== null;
      case 'TRUE_FALSE':
        return selectedBoolean !== null;
      case 'OPEN_ENDED':
      case 'SCENARIO_BASED':
        return userAnswer.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <QuizProgress
        current={currentIndex}
        total={totalQuestions}
        correct={correctCount}
      />

      {/* Question */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <QuestionCard
          question={currentQuestion}
          timeRemaining={timed ? timeRemaining : null}
        />

        {/* Answer Input */}
        <View style={styles.inputContainer}>{renderInput()}</View>
      </ScrollView>

      {/* Feedback Modal (shown after evaluation) */}
      {evaluation && (
        <FeedbackModal
          evaluation={evaluation}
          question={currentQuestion}
          isLastQuestion={currentIndex >= totalQuestions}
          onNext={nextQuestion}
          onFinish={endSession}
        />
      )}

      {/* Submit Button (when not showing feedback) */}
      {!evaluation && (
        <View style={styles.actionContainer}>
          <View style={styles.submitButton}>
            <SubmitButton
              onPress={submitAnswer}
              disabled={!canSubmit()}
              isLoading={status === 'evaluating'}
            />
          </View>
        </View>
      )}
    </View>
  );
}

import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

function SubmitButton({
  onPress,
  disabled,
  isLoading,
}: {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={DARK_THEME.text} />
      ) : (
        <Text style={styles.buttonText}>Submit Answer</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  inputContainer: {
    marginTop: SPACING.lg,
  },
  actionContainer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
    backgroundColor: DARK_THEME.background,
  },
  submitButton: {
    width: '100%',
  },
  button: {
    backgroundColor: DARK_THEME.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: DARK_THEME.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
