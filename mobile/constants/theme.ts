export const DARK_THEME = {
  // Base colors
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#252525',

  // Primary accent (green for active/recording)
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#666666',

  // Answer display
  answerText: '#FFFFFF',
  answerBackground: '#1A1A1A',

  // Confidence indicators
  confidence: {
    high: '#4CAF50',    // Green (>80%)
    medium: '#FFC107',  // Yellow (50-80%)
    low: '#FF5722',     // Orange (<50%)
  },

  // Status colors
  recording: '#F44336',
  processing: '#2196F3',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',

  // Borders and dividers
  border: '#333333',
  divider: '#2A2A2A',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  answer: 20, // Main answer text size
  title: 24,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Component-specific styles
export const COMPONENT_STYLES = {
  card: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  button: {
    primary: {
      backgroundColor: DARK_THEME.primary,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },
  },
};
