import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface QuickActionsProps {
  isActive: boolean;
  isRecording: boolean;
  isConnecting?: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
}

export function QuickActions({
  isActive,
  isRecording,
  isConnecting = false,
  onStart,
  onStop,
  onPause,
}: QuickActionsProps) {
  if (isConnecting) {
    return (
      <View style={styles.container}>
        <View style={styles.connectingButton}>
          <ActivityIndicator size="small" color={DARK_THEME.text} />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      </View>
    );
  }

  if (!isActive) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <View style={styles.startIcon}>
            <View style={styles.playTriangle} />
          </View>
          <Text style={styles.startText}>START INTERVIEW</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.activeControls}>
        {onPause && (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={onPause}
            activeOpacity={0.8}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
            <Text style={styles.controlText}>PAUSE</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={onStop}
          activeOpacity={0.8}
        >
          <View style={styles.stopIcon} />
          <Text style={styles.stopText}>END SESSION</Text>
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View style={styles.recordingBadge}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording in progress</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: DARK_THEME.background,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK_THEME.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  startIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: DARK_THEME.text,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  startText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: DARK_THEME.text,
    letterSpacing: 1,
  },
  connectingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK_THEME.surface,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  connectingText: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.textSecondary,
    marginLeft: SPACING.sm,
  },
  activeControls: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  pauseButton: {
    backgroundColor: DARK_THEME.surfaceLight,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  stopButton: {
    backgroundColor: DARK_THEME.error,
  },
  pauseIcon: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: DARK_THEME.text,
    marginHorizontal: 2,
  },
  stopIcon: {
    width: 14,
    height: 14,
    backgroundColor: DARK_THEME.text,
    marginRight: SPACING.sm,
  },
  controlText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.text,
    letterSpacing: 0.5,
  },
  stopText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.text,
    letterSpacing: 0.5,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK_THEME.recording,
    marginRight: SPACING.xs,
  },
  recordingText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
  },
});
