import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { AnswerDisplay } from '../../components/AnswerDisplay';
import { TranscriptPreview } from '../../components/TranscriptPreview';
import { RecordingIndicator } from '../../components/RecordingIndicator';
import { QuickActions } from '../../components/QuickActions';
import { useInterviewSession } from '../../hooks/useInterviewSession';
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
    startInterview,
    stopInterview,
    pauseInterview,
    resumeInterview,
    error,
  } = useInterviewSession();

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

      {/* Main Answer Display (75% of screen) */}
      <View style={styles.answerContainer}>
        <AnswerDisplay
          answer={currentAnswer}
          confidence={answerConfidence}
          isGenerating={answerStatus === 'processing'}
          isStreaming={isStreaming}
        />
      </View>

      {/* Transcript Preview (15% of screen) */}
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
    flex: 0.75, // 75% of available space
  },
  transcriptContainer: {
    flex: 0.15, // 15% of available space
  },
});
