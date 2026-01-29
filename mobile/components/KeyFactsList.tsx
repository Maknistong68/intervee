import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { KeyFact } from '../data/keyHighlightsData';

interface KeyFactsListProps {
  keyFacts: KeyFact[];
  maxItems?: number;
  showCopyButton?: boolean;
}

export function KeyFactsList({
  keyFacts,
  maxItems,
  showCopyButton = true,
}: KeyFactsListProps) {
  const displayItems = maxItems ? keyFacts.slice(0, maxItems) : keyFacts;

  const handleCopyFact = useCallback((fact: KeyFact) => {
    const text = fact.citation
      ? `${fact.fact} (${fact.citation})`
      : fact.fact;

    try {
      Clipboard.setString(text);
    } catch (error) {
      // Silent fail - clipboard may not be available
    }
  }, []);

  const handleCopyAll = useCallback(() => {
    const allFacts = displayItems
      .map((f) => (f.citation ? `- ${f.fact} (${f.citation})` : `- ${f.fact}`))
      .join('\n');

    try {
      Clipboard.setString(allFacts);
    } catch (error) {
      // Silent fail - clipboard may not be available
    }
  }, [displayItems]);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>{'\u2713'}</Text>
          <Text style={styles.title}>KEY FACTS</Text>
        </View>
        {showCopyButton && displayItems.length > 1 && (
          <TouchableOpacity
            style={styles.copyAllButton}
            onPress={handleCopyAll}
            activeOpacity={0.7}
          >
            <Text style={styles.copyIcon}>{'\u2398'}</Text>
            <Text style={styles.copyAllText}>Copy All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Facts list */}
      <View style={styles.factsList}>
        {displayItems.map((fact, index) => (
          <TouchableOpacity
            key={fact.id}
            style={[
              styles.factItem,
              index === displayItems.length - 1 && styles.factItemLast,
            ]}
            onPress={() => handleCopyFact(fact)}
            activeOpacity={0.7}
          >
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>{'\u2713'}</Text>
            </View>
            <View style={styles.factContent}>
              <Text style={styles.factText}>{fact.fact}</Text>
              {fact.citation && (
                <Text style={styles.factCitation}>{fact.citation}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show more indicator if truncated */}
      {maxItems && keyFacts.length > maxItems && (
        <Text style={styles.moreText}>
          +{keyFacts.length - maxItems} more facts
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 14,
    color: DARK_THEME.success,
  },
  title: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: DARK_THEME.success,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: DARK_THEME.surface,
  },
  copyIcon: {
    fontSize: 12,
    color: DARK_THEME.textMuted,
  },
  copyAllText: {
    fontSize: 10,
    color: DARK_THEME.textMuted,
    marginLeft: 4,
  },
  factsList: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  factItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  factItemLast: {
    borderBottomWidth: 0,
  },
  bulletContainer: {
    width: 20,
    alignItems: 'center',
    paddingTop: 2,
  },
  bullet: {
    fontSize: 10,
    color: DARK_THEME.success,
  },
  factContent: {
    flex: 1,
  },
  factText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.text,
    lineHeight: 18,
  },
  factCitation: {
    fontSize: 10,
    color: DARK_THEME.primary,
    marginTop: 2,
  },
  moreText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});

export default KeyFactsList;
