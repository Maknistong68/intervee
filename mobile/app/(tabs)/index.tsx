import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { AnswerDisplay } from '../../components/AnswerDisplay';
import { TranscriptPreview } from '../../components/TranscriptPreview';
import { RecordingIndicator } from '../../components/RecordingIndicator';
import { QuickActions } from '../../components/QuickActions';
import { InterpretationBubble } from '../../components/InterpretationBubble';
import { FollowUpSuggestions } from '../../components/FollowUpSuggestions';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { socketService } from '../../services/socketService';
import { DARK_THEME, SPACING, FONT_SIZES } from '../../constants/theme';

export default function InterviewScreen() {
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    isActive,
    isRecording,
    isConnected,
    sessionStatus,
    currentTranscript,
    currentAnswer,
    answerConfidence,
    answerStatus,
    isStreaming,
    // OSH Intelligence
    interpretation,
    suggestedFollowUps,
    currentTopic,
    // Actions
    startInterview,
    stopInterview,
    pauseInterview,
    resumeInterview,
    error,
  } = useInterviewSession();

  // Handle follow-up suggestion press
  const handleFollowUpPress = useCallback((suggestion: string) => {
    // Send the follow-up question as if the user asked it
    // This simulates a PTT press with the suggestion text
    console.log('[InterviewScreen] Follow-up pressed:', suggestion);
    // TODO: Send directly to backend or display in transcript for TTS
  }, []);

  const handleStart = useCallback(async () => {
    setIsConnecting(true);
    try {
      const success = await startInterview();
      if (!success) {
        Alert.alert(
          'Failed to Start',
          'Could not start the interview session. Please check your connection and microphone permissions.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsConnecting(false);
    }
  }, [startInterview]);

  const handleStop = useCallback(async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end the interview session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => stopInterview(),
        },
      ]
    );
  }, [stopInterview]);

  const handlePause = useCallback(() => {
    if (isRecording) {
      pauseInterview();
    } else {
      resumeInterview();
    }
  }, [isRecording, pauseInterview, resumeInterview]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RecordingIndicator isRecording={isRecording} isConnected={isConnected} />
        <Text style={styles.title}>INTERVEE</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Main Answer Display (flexible) */}
      <View style={styles.answerContainer}>
        <AnswerDisplay
          answer={currentAnswer}
          confidence={answerConfidence}
          isGenerating={answerStatus === 'processing'}
          isStreaming={isStreaming}
        />

        {/* Follow-up Suggestions (shown after answer is ready) */}
        <FollowUpSuggestions
          suggestions={suggestedFollowUps}
          onSuggestionPress={handleFollowUpPress}
          visible={answerStatus === 'ready' && suggestedFollowUps.length > 0}
        />
      </View>

      {/* Interpretation Bubble (shows what AI understood) */}
      {interpretation && (
        <InterpretationBubble
          original={interpretation.original}
          interpreted={interpretation.interpreted}
          confidence={interpretation.confidence}
          visible={answerStatus === 'processing' || answerStatus === 'listening'}
        />
      )}

      {/* Transcript Preview */}
      <View style={styles.transcriptContainer}>
        <TranscriptPreview
          transcript={currentTranscript}
          isPartial={answerStatus === 'listening'}
          isListening={isRecording}
        />
      </View>

      {/* Quick Actions (10% of screen) */}
      <QuickActions
        isActive={isActive}
        isRecording={isRecording}
        isConnecting={isConnecting}
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: DARK_THEME.text,
    letterSpacing: 2,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.error,
    position: 'absolute',
    bottom: 2,
    left: SPACING.md,
  },
  answerContainer: {
    flex: 1, // Takes remaining space after fixed elements
  },
  transcriptContainer: {
    minHeight: 80, // Fixed minimum height for transcript
    maxHeight: 120,
  },
});
