import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { storageService, StoredSession } from '../../services/storageService';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    const data = await storageService.getSessions();
    setSessions(data);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteSession(id);
            await loadSessions();
          },
        },
      ]
    );
  }, [loadSessions]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all session history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAllSessions();
            await loadSessions();
          },
        },
      ]
    );
  }, [loadSessions]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: string, end: string | null): string => {
    if (!end) return 'Ongoing';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Less than 1 min';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const renderSession = ({ item }: { item: StoredSession }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionDate}>{formatDate(item.startedAt)}</Text>
            <Text style={styles.sessionDuration}>
              Duration: {formatDuration(item.startedAt, item.endedAt)}
            </Text>
          </View>
          <View style={styles.sessionStats}>
            <Text style={styles.exchangeCount}>{item.exchanges.length}</Text>
            <Text style={styles.exchangeLabel}>Q&A</Text>
          </View>
        </View>

        {isExpanded && item.exchanges.length > 0 && (
          <View style={styles.exchangesList}>
            {item.exchanges.slice(0, 5).map((exchange, index) => (
              <View key={exchange.id} style={styles.exchangeItem}>
                <Text style={styles.questionText} numberOfLines={2}>
                  Q: {exchange.question}
                </Text>
                <Text style={styles.answerPreview} numberOfLines={3}>
                  A: {exchange.answer}
                </Text>
                <View style={styles.exchangeMeta}>
                  <Text style={styles.confidenceText}>
                    {Math.round(exchange.confidence * 100)}% confidence
                  </Text>
                  <Text style={styles.responseTime}>
                    {exchange.responseTimeMs}ms
                  </Text>
                </View>
              </View>
            ))}
            {item.exchanges.length > 5 && (
              <Text style={styles.moreText}>
                +{item.exchanges.length - 5} more exchanges
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>
        {sessions.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Sessions Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your interview sessions will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={DARK_THEME.primary}
            />
          }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  clearButton: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.error,
  },
  listContent: {
    padding: SPACING.md,
  },
  sessionCard: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: DARK_THEME.text,
  },
  sessionDuration: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    marginTop: 2,
  },
  sessionStats: {
    alignItems: 'center',
  },
  exchangeCount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: DARK_THEME.primary,
  },
  exchangeLabel: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
  },
  exchangesList: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  exchangeItem: {
    marginBottom: SPACING.md,
  },
  questionText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textSecondary,
    fontStyle: 'italic',
  },
  answerPreview: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.text,
    marginTop: SPACING.xs,
  },
  exchangeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.primary,
  },
  responseTime: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
  },
  moreText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.primary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: DARK_THEME.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.textSecondary,
    textAlign: 'center',
  },
});
