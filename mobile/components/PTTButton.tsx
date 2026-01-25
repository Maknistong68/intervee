import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  ActivityIndicator,
  Vibration,
  Platform,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export type PTTState = 'idle' | 'recording' | 'processing' | 'cancelled';

interface PTTButtonProps {
  state: PTTState;
  volume: number; // 0-1 for visual feedback
  currentTranscript?: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancel: () => void;
  disabled?: boolean;
  networkError?: string | null;
}

const CANCEL_THRESHOLD = -100; // Swipe left 100px to cancel

export function PTTButton({
  state,
  volume,
  currentTranscript,
  onStartRecording,
  onStopRecording,
  onCancel,
  disabled = false,
  networkError,
}: PTTButtonProps) {
  const dragX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isCancellingRef = useRef(false);

  // Pulse animation for recording state
  useEffect(() => {
    if (state === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  // Pan responder for swipe-to-cancel on status area
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => state === 'recording',
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movement while recording
        return state === 'recording' && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only track leftward movement (negative dx)
        const clampedX = Math.min(0, gestureState.dx);
        dragX.setValue(clampedX);

        // Trigger haptic when crossing threshold
        if (clampedX < CANCEL_THRESHOLD && !isCancellingRef.current) {
          isCancellingRef.current = true;
          if (Platform.OS !== 'web') {
            Vibration.vibrate(50);
          }
        } else if (clampedX >= CANCEL_THRESHOLD) {
          isCancellingRef.current = false;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < CANCEL_THRESHOLD) {
          // User swiped left past threshold - cancel
          onCancel();
          if (Platform.OS !== 'web') {
            Vibration.vibrate(100);
          }
        }
        // Reset position
        Animated.spring(dragX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        isCancellingRef.current = false;
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        isCancellingRef.current = false;
      },
    })
  ).current;

  // Handle mic button tap (toggle)
  const handleMicPress = useCallback(() => {
    if (disabled) return;

    if (state === 'idle') {
      onStartRecording();
      if (Platform.OS !== 'web') {
        Vibration.vibrate(30);
      }
    } else if (state === 'recording') {
      onStopRecording();
      if (Platform.OS !== 'web') {
        Vibration.vibrate(30);
      }
    }
    // Don't respond to taps while processing
  }, [state, disabled, onStartRecording, onStopRecording]);

  // Calculate cancel progress (0-1)
  const cancelProgress = dragX.interpolate({
    inputRange: [CANCEL_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Get status text and style based on state
  const getStatusContent = () => {
    if (state === 'processing') {
      return (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={DARK_THEME.processing} />
          <Text style={[styles.statusText, styles.processingText]}>Processing...</Text>
        </View>
      );
    }

    if (state === 'cancelled') {
      return (
        <Text style={[styles.statusText, styles.cancelledText]}>Cancelled</Text>
      );
    }

    if (state === 'recording') {
      return (
        <Animated.View
          style={[
            styles.statusRow,
            {
              transform: [{ translateX: dragX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Recording dot */}
          <View style={styles.recordingDot} />

          {/* Transcript or hint */}
          {currentTranscript ? (
            <Text style={styles.transcriptText} numberOfLines={1}>
              {currentTranscript}
            </Text>
          ) : (
            <Text style={styles.hintText}>Slide left to cancel</Text>
          )}

          {/* Cancel indicator (shows on swipe) */}
          <Animated.View
            style={[
              styles.cancelIndicator,
              {
                opacity: cancelProgress,
              },
            ]}
          >
            <Text style={styles.cancelText}>Release to cancel</Text>
          </Animated.View>
        </Animated.View>
      );
    }

    // Idle state
    if (networkError) {
      return (
        <Text style={[styles.statusText, styles.errorText]} numberOfLines={1}>
          {networkError}
        </Text>
      );
    }

    return (
      <Text style={styles.statusText}>Tap to record...</Text>
    );
  };

  // Get mic button style based on state
  const getMicButtonStyle = () => {
    if (disabled || state === 'processing') {
      return [styles.micButton, styles.micButtonDisabled];
    }
    if (state === 'recording') {
      return [styles.micButton, styles.micButtonRecording];
    }
    return [styles.micButton, styles.micButtonIdle];
  };

  // Volume indicator ring (shows during recording)
  const volumeScale = 1 + volume * 0.3; // Scale from 1 to 1.3 based on volume

  return (
    <View style={styles.container}>
      {/* Status/Transcript Area */}
      <View style={styles.statusArea}>
        {getStatusContent()}
      </View>

      {/* Mic Button */}
      <TouchableOpacity
        onPress={handleMicPress}
        disabled={disabled || state === 'processing'}
        activeOpacity={0.7}
      >
        <View style={styles.micButtonContainer}>
          {/* Volume indicator ring (behind button) */}
          {state === 'recording' && (
            <Animated.View
              style={[
                styles.volumeRing,
                {
                  transform: [
                    { scale: volumeScale },
                  ],
                  opacity: volume * 0.8,
                },
              ]}
            />
          )}

          {/* Pulse animation ring */}
          {state === 'recording' && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          )}

          {/* Main button */}
          <View style={getMicButtonStyle()}>
            {state === 'processing' ? (
              <ActivityIndicator size="small" color={DARK_THEME.text} />
            ) : (
              <MicIcon isRecording={state === 'recording'} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Simple mic icon component
function MicIcon({ isRecording }: { isRecording: boolean }) {
  return (
    <View style={styles.micIcon}>
      {/* Mic body */}
      <View style={[styles.micBody, isRecording && styles.micBodyRecording]} />
      {/* Mic stand */}
      <View style={[styles.micStand, isRecording && styles.micStandRecording]} />
      <View style={[styles.micBase, isRecording && styles.micBaseRecording]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: DARK_THEME.background,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
    gap: SPACING.md,
  },
  statusArea: {
    flex: 1,
    height: 44,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
  },
  processingText: {
    color: DARK_THEME.processing,
    marginLeft: SPACING.sm,
  },
  cancelledText: {
    color: DARK_THEME.textMuted,
  },
  errorText: {
    color: DARK_THEME.error,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK_THEME.recording,
  },
  transcriptText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.text,
  },
  hintText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
  },
  cancelIndicator: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: SPACING.sm,
  },
  cancelText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.error,
    fontWeight: '600',
  },

  // Mic button styles
  micButtonContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonIdle: {
    backgroundColor: DARK_THEME.primary,
  },
  micButtonRecording: {
    backgroundColor: DARK_THEME.recording,
  },
  micButtonDisabled: {
    backgroundColor: DARK_THEME.surfaceLight,
  },
  volumeRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DARK_THEME.recording,
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: DARK_THEME.recording,
    opacity: 0.5,
  },

  // Mic icon styles
  micIcon: {
    width: 20,
    height: 28,
    alignItems: 'center',
  },
  micBody: {
    width: 12,
    height: 16,
    backgroundColor: DARK_THEME.text,
    borderRadius: 6,
  },
  micBodyRecording: {
    backgroundColor: DARK_THEME.text,
  },
  micStand: {
    width: 16,
    height: 6,
    borderWidth: 2,
    borderColor: DARK_THEME.text,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  micStandRecording: {
    borderColor: DARK_THEME.text,
  },
  micBase: {
    width: 10,
    height: 2,
    backgroundColor: DARK_THEME.text,
    marginTop: 2,
  },
  micBaseRecording: {
    backgroundColor: DARK_THEME.text,
  },
});
