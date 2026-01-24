import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { useReviewerSession } from '../../hooks/useReviewerSession';
import { useReviewerStore } from '../../stores/reviewerStore';
import { ReviewerSetup } from '../../components/reviewer/ReviewerSetup';
import { QuizScreen } from '../../components/reviewer/QuizScreen';
import { ResultsScreen } from '../../components/reviewer/ResultsScreen';
import { DARK_THEME, SPACING, FONT_SIZES } from '../../constants/theme';

export default function ReviewerScreen() {
  const { status } = useReviewerStore();

  // Set initial status to configuring if idle
  useEffect(() => {
    if (status === 'idle') {
      useReviewerStore.setState({ status: 'configuring' });
    }
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'idle':
      case 'configuring':
        return <ReviewerSetup />;
      case 'active':
      case 'evaluating':
        return <QuizScreen />;
      case 'completed':
        return <ResultsScreen />;
      default:
        return <ReviewerSetup />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>REVIEWER</Text>
        <Text style={styles.subtitle}>OSH Quiz Mode</Text>
      </View>
      <View style={styles.content}>{renderContent()}</View>
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
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: DARK_THEME.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
});
