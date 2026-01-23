import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES } from '../constants/theme';

interface RecordingIndicatorProps {
  isRecording: boolean;
  isConnected: boolean;
}

export function RecordingIndicator({
  isRecording,
  isConnected,
}: RecordingIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Create pulsing animation
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.setValue(1);
    };
  }, [isRecording, pulseAnim]);

  const getStatusColor = (): string => {
    if (!isConnected) return DARK_THEME.error;
    if (isRecording) return DARK_THEME.recording;
    return DARK_THEME.textMuted;
  };

  const getStatusText = (): string => {
    if (!isConnected) return 'DISCONNECTED';
    if (isRecording) return 'REC';
    return 'STANDBY';
  };

  return (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: getStatusColor() },
            isRecording && {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Text style={[styles.text, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {isConnected && (
        <View style={styles.connectionStatus}>
          <View style={styles.connectedDot} />
          <Text style={styles.connectedText}>Connected</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK_THEME.success,
    marginRight: SPACING.xs,
  },
  connectedText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.success,
  },
});
