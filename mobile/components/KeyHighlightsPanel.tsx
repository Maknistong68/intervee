import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { getHighlightsFromText, getHighlightsForTopic, TopicHighlight } from '../data/keyHighlightsData';
import { QuickAnswersList } from './QuickAnswerCard';
import { KeyFactsList } from './KeyFactsList';
import { HighlightTable } from './HighlightTable';

interface KeyHighlightsPanelProps {
  /** The current transcript or question text to detect topic from */
  currentText?: string;
  /** Directly provided topic (bypasses detection) */
  topic?: string | null;
  /** Whether the panel should be visible */
  isVisible?: boolean;
  /** Whether we're currently detecting/loading */
  isLoading?: boolean;
}

export function KeyHighlightsPanel({
  currentText,
  topic,
  isVisible = true,
  isLoading = false,
}: KeyHighlightsPanelProps) {
  // Get highlights based on topic or text detection
  const highlights: TopicHighlight | null = useMemo(() => {
    if (topic) {
      return getHighlightsForTopic(topic);
    }
    if (currentText) {
      return getHighlightsFromText(currentText);
    }
    return null;
  }, [topic, currentText]);

  if (!isVisible) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{'\u{1F4A1}'}</Text>
          <Text style={styles.headerTitle}>KEY HIGHLIGHTS</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={DARK_THEME.primary} />
          <Text style={styles.loadingText}>Detecting topic...</Text>
        </View>
      </View>
    );
  }

  // No topic detected - show placeholder
  if (!highlights) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIconMuted}>{'\u{1F4A1}'}</Text>
          <Text style={[styles.headerTitle, styles.headerTitleMuted]}>KEY HIGHLIGHTS</Text>
        </View>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>{'\u{1F50D}'}</Text>
          <Text style={styles.placeholderText}>
            Ask a question to see{'\n'}relevant reference data
          </Text>
          <Text style={styles.placeholderHint}>
            Topics: Safety Officers, HSC, Accident Reporting, PPE, and more
          </Text>
        </View>
      </View>
    );
  }

  // Map topic icon names to emoji
  const topicIconMap: Record<string, string> = {
    'document-text': '\u{1F4DD}',
    'person': '\u{1F477}',
    'people': '\u{1F465}',
    'alert-circle': '\u{26A0}',
    'volume-high': '\u{1F50A}',
    'shield': '\u{1F6E1}',
    'business': '\u{1F3E2}',
    'medkit': '\u{1F3E5}',
    'warning': '\u{26A0}',
    'enter': '\u{1F6AA}',
    'home': '\u{1F3E0}',
  };

  const topicEmoji = topicIconMap[highlights.icon] || '\u{1F4D1}';

  // Render highlights for detected topic
  return (
    <View style={styles.container}>
      {/* Panel header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{'\u{1F4A1}'}</Text>
        <Text style={styles.headerTitle}>KEY HIGHLIGHTS</Text>
      </View>

      {/* Topic indicator */}
      <View style={styles.topicBadge}>
        <Text style={styles.topicIcon}>{topicEmoji}</Text>
        <Text style={styles.topicText}>{highlights.topicName}</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Quick Answers Section */}
        {highlights.quickAnswers.length > 0 && (
          <QuickAnswersList
            quickAnswers={highlights.quickAnswers}
            maxItems={4}
          />
        )}

        {/* Reference Tables Section */}
        {highlights.tables.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{'\u{1F4CA}'}</Text>
              <Text style={styles.sectionTitle}>REFERENCE TABLE</Text>
            </View>
            {highlights.tables.map((table, idx) => (
              <HighlightTable
                key={table.id}
                table={table}
                defaultExpanded={idx === 0}
              />
            ))}
          </View>
        )}

        {/* Key Facts Section */}
        {highlights.keyFacts.length > 0 && (
          <KeyFactsList
            keyFacts={highlights.keyFacts}
            maxItems={6}
            showCopyButton={true}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    borderLeftWidth: 1,
    borderLeftColor: DARK_THEME.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
    backgroundColor: DARK_THEME.surface,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerIconMuted: {
    fontSize: 16,
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: DARK_THEME.primary,
    marginLeft: SPACING.xs,
    letterSpacing: 1,
  },
  headerTitleMuted: {
    color: DARK_THEME.textMuted,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  topicIcon: {
    fontSize: 12,
  },
  topicText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: DARK_THEME.primary,
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: DARK_THEME.warning,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    marginTop: SPACING.sm,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  placeholderIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  placeholderHint: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    opacity: 0.7,
  },
});

export default KeyHighlightsPanel;
