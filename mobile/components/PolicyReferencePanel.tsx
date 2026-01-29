import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES } from '../constants/theme';
import { PolicyItem } from './PolicyItem';
import { getAllPolicies, detectPolicy } from '../data/keyHighlightsData';

interface PolicyReferencePanelProps {
  /** Detected topic/policy from AI or keyword detection */
  detectedTopic: string | null;
  /** Current transcript text for keyword detection */
  currentTranscript: string;
  /** Whether the interview session is active */
  isActive: boolean;
}

export function PolicyReferencePanel({
  detectedTopic,
  currentTranscript,
  isActive,
}: PolicyReferencePanelProps) {
  const [highlightedPolicy, setHighlightedPolicy] = React.useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const policyRefs = useRef<Map<string, number>>(new Map());
  const policies = getAllPolicies();

  // Detect policy from transcript and topic
  useEffect(() => {
    let detected: string | null = null;

    // First check detectedTopic prop (from AI)
    if (detectedTopic) {
      // Map legacy topic IDs to new policy IDs
      const topicToPolicyMap: Record<string, string> = {
        registration: 'rule1020',
        safety_officer: 'rule1030',
        hsc: 'rule1040',
        accident: 'rule1050',
        environmental: 'rule1070',
        ppe: 'rule1080',
        health_services: 'rule1960',
        do253: 'do253',
      };
      detected = topicToPolicyMap[detectedTopic] || detectedTopic;
    }

    // If no topic from AI, try to detect from transcript
    if (!detected && currentTranscript) {
      detected = detectPolicy(currentTranscript);
    }

    // Update highlighted policy
    if (detected !== highlightedPolicy) {
      setHighlightedPolicy(detected);

      // Auto-scroll to the detected policy
      if (detected) {
        const yOffset = policyRefs.current.get(detected);
        if (yOffset !== undefined && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
          }, 100);
        }
      }
    }
  }, [detectedTopic, currentTranscript, highlightedPolicy]);

  // Track policy positions for auto-scroll
  const handlePolicyLayout = useCallback((policyId: string, y: number) => {
    policyRefs.current.set(policyId, y);
  }, []);

  return (
    <View style={styles.container}>
      {/* Panel header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>{'\u{1F4CB}'}</Text>
          <Text style={styles.headerTitle}>POLICY REFERENCE</Text>
        </View>
      </View>

      {/* Policy list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {policies.map((policy) => (
          <View
            key={policy.id}
            onLayout={(event) => {
              handlePolicyLayout(policy.id, event.nativeEvent.layout.y);
            }}
          >
            <PolicyItem
              policy={policy}
              isHighlighted={isActive && highlightedPolicy === policy.id}
            />
          </View>
        ))}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Detection status indicator */}
      {isActive && highlightedPolicy && (
        <View style={styles.detectionBanner}>
          <Text style={styles.detectionText}>
            {'\u2714'} Detected: {policies.find(p => p.id === highlightedPolicy)?.ruleNumber}
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
    backgroundColor: DARK_THEME.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: DARK_THEME.primary,
    marginLeft: SPACING.xs,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.sm,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
  detectionBanner: {
    backgroundColor: DARK_THEME.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.divider,
  },
  detectionText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.success,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PolicyReferencePanel;
