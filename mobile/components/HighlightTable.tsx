import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { TableData } from '../data/keyHighlightsData';

interface HighlightTableProps {
  table: TableData;
  defaultExpanded?: boolean;
}

export function HighlightTable({ table, defaultExpanded = true }: HighlightTableProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.container}>
      {/* Header - tap to expand/collapse */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{table.title}</Text>
          <Text style={styles.citation}>{table.citation}</Text>
        </View>
        <Text style={styles.chevron}>{isExpanded ? '\u25B2' : '\u25BC'}</Text>
      </TouchableOpacity>

      {/* Table content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Horizontal scrollable table */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.tableScroll}
          >
            <View style={styles.table}>
              {/* Table header */}
              <View style={styles.tableHeaderRow}>
                {table.headers.map((header, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.tableCell,
                      styles.tableHeaderCell,
                      idx === 0 && styles.firstCell,
                    ]}
                  >
                    <Text style={styles.tableHeaderText}>{header}</Text>
                  </View>
                ))}
              </View>

              {/* Table rows */}
              {table.rows.map((row, rowIdx) => (
                <View
                  key={rowIdx}
                  style={[
                    styles.tableRow,
                    rowIdx % 2 === 1 && styles.tableRowAlt,
                  ]}
                >
                  {row.map((cell, cellIdx) => (
                    <View
                      key={cellIdx}
                      style={[
                        styles.tableCell,
                        cellIdx === 0 && styles.firstCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableCellText,
                          cellIdx === 0 && styles.firstCellText,
                        ]}
                      >
                        {cell}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Notes */}
          {table.notes && table.notes.length > 0 && (
            <View style={styles.notesContainer}>
              {table.notes.map((note, idx) => (
                <View key={idx} style={styles.noteRow}>
                  <Text style={styles.noteBullet}>{'\u2022'}</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DARK_THEME.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: DARK_THEME.surfaceLight,
  },
  headerContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.text,
  },
  citation: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.primary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 10,
    color: DARK_THEME.textSecondary,
  },
  content: {
    padding: SPACING.sm,
  },
  tableScroll: {
    marginBottom: SPACING.xs,
  },
  table: {
    borderWidth: 1,
    borderColor: DARK_THEME.divider,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: DARK_THEME.surfaceLight,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  tableRowAlt: {
    backgroundColor: DARK_THEME.surface,
  },
  tableCell: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 80,
    justifyContent: 'center',
  },
  tableHeaderCell: {
    backgroundColor: DARK_THEME.surfaceLight,
  },
  firstCell: {
    minWidth: 100,
  },
  tableHeaderText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: DARK_THEME.primary,
  },
  tableCellText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
  },
  firstCellText: {
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteBullet: {
    color: DARK_THEME.primary,
    marginRight: 6,
    fontSize: FONT_SIZES.xs,
  },
  noteText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    lineHeight: 16,
  },
});

export default HighlightTable;
