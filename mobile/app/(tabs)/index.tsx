import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { AnswerDisplay } from '../../components/AnswerDisplay';
import { TranscriptPreview } from '../../components/TranscriptPreview';
import { RecordingIndicator } from '../../components/RecordingIndicator';
import { QuickActions } from '../../components/QuickActions';
import { PTTButton } from '../../components/PTTButton';
import { InterpretationBubble } from '../../components/InterpretationBubble';
import { FollowUpSuggestions } from '../../components/FollowUpSuggestions';
import { PolicyReferencePanel } from '../../components/PolicyReferencePanel';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { DARK_THEME, SPACING, FONT_SIZES } from '../../constants/theme';

export default function InterviewScreen() {
  const [isConnecting, setIsConnecting] = useState(false);

  // Responsive layout for split-screen on tablet/DeX
  const { isLargeScreen } = useResponsiveLayout();

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
    // PTT state
    pttState,
    volume,
    networkError,
    // Actions
    startInterview,
    stopInterview,
    pauseInterview,
    resumeInterview,
    // PTT Actions
    startPTTRecording,
    stopPTTRecording,
    cancelPTTRecording,
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

  // Main content component (left column on large screens)
  const MainContent = (
    <View style={isLargeScreen ? styles.leftColumn : styles.mainContent}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RecordingIndicator isRecording={isRecording} isConnected={isConnected} />
        <Text style={styles.title}>INTERVEE</Text>
        {isActive ? (
          <TouchableOpacity style={styles.endButton} onPress={handleStop}>
            <Text style={styles.endButtonText}>END</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Split-screen layout for large screens (tablet/DeX) */}
      {isLargeScreen ? (
        <View style={styles.splitContainer}>
          {/* Left Column - Main Content (60%) */}
          {MainContent}

          {/* Right Column - Policy Reference Panel (40%) */}
          <View style={styles.rightColumn}>
            <PolicyReferencePanel
              detectedTopic={currentTopic}
              currentTranscript={currentTranscript}
              isActive={isActive}
            />
          </View>
        </View>
      ) : (
        // Single column layout for phones
        <>
          {MainContent}
          {/* Policy Reference Panel below answer on phones */}
          {isActive && (
            <View style={styles.phonePolicyPanel}>
              <PolicyReferencePanel
                detectedTopic={currentTopic}
                currentTranscript={currentTranscript}
                isActive={isActive}
              />
            </View>
          )}
        </>
      )}

      {/* Transcript Preview */}
      <View style={styles.transcriptContainer}>
        <TranscriptPreview
          transcript={currentTranscript}
          isPartial={answerStatus === 'listening'}
          isListening={isRecording}
        />
      </View>

      {/* Quick Actions (session controls) - only show when NOT active */}
      {!isActive && (
        <QuickActions
          isActive={isActive}
          isRecording={isRecording}
          isConnecting={isConnecting}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
        />
      )}

      {/* PTT Button (ChatGPT-style toggle) - show when session is active */}
      {isActive && (
        <PTTButton
          state={pttState}
          volume={volume}
          currentTranscript={currentTranscript}
          onStartRecording={startPTTRecording}
          onStopRecording={stopPTTRecording}
          onCancel={cancelPTTRecording}
          disabled={!isConnected}
          networkError={networkError}
        />
      )}
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
  endButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: DARK_THEME.error,
    borderRadius: 4,
  },
  endButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: DARK_THEME.text,
    letterSpacing: 0.5,
  },
  headerPlaceholder: {
    width: 50, // Matches approximate width of END button for balance
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.error,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  // Single column layout (phones)
  mainContent: {
    flex: 1,
  },
  answerContainer: {
    flex: 1, // Takes remaining space after fixed elements
  },
  transcriptContainer: {
    minHeight: 80, // Fixed minimum height for transcript
    maxHeight: 120,
  },
  // Split-screen layout (tablet/DeX)
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 6, // 60% width
  },
  rightColumn: {
    flex: 4, // 40% width
  },
  // Phone layout - Policy panel below answer
  phonePolicyPanel: {
    maxHeight: 200, // Limit height on phones to leave room for transcript and PTT
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
});
