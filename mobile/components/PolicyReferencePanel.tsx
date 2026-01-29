import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { PolicyItem } from './PolicyItem';
import { getAllPolicies, detectPolicy, PolicyData } from '../data/keyHighlightsData';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  const [highlightedPolicy, setHighlightedPolicy] = useState<string | null>(null);
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

      // Auto-expand the detected policy
      if (detected) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedPolicies(prev => new Set([...prev, detected!]));

        // Auto-scroll to the detected policy
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

  // Toggle individual policy
  const togglePolicy = useCallback((policyId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPolicies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(policyId)) {
        newSet.delete(policyId);
      } else {
        newSet.add(policyId);
      }
      return newSet;
    });
  }, []);

  // Collapse all policies
  const collapseAll = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPolicies(new Set());
  }, []);

  // Check if any policy is expanded
  const hasExpandedPolicies = expandedPolicies.size > 0;

  return (
    <View style={styles.container}>
      {/* Panel header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>{'\u{1F4CB}'}</Text>
          <Text style={styles.headerTitle}>POLICY REFERENCE</Text>
        </View>
        {hasExpandedPolicies && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={collapseAll}
            activeOpacity={0.7}
          >
            <Text style={styles.collapseButtonText}>Collapse All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Policy list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {!isActive && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveIcon}>{'\u{1F4D1}'}</Text>
            <Text style={styles.inactiveText}>
              Start a session to activate{'\n'}policy detection
            </Text>
          </View>
        )}

        {policies.map((policy, index) => (
          <View
            key={policy.id}
            onLayout={(event) => {
              handlePolicyLayout(policy.id, event.nativeEvent.layout.y);
            }}
          >
            <PolicyItem
              policy={policy}
              isExpanded={expandedPolicies.has(policy.id)}
              isHighlighted={isActive && highlightedPolicy === policy.id}
              onToggle={() => togglePolicy(policy.id)}
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
  collapseButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: DARK_THEME.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: DARK_THEME.divider,
  },
  collapseButtonText: {
    fontSize: FONT_SIZES.xs - 1,
    color: DARK_THEME.textMuted,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.sm,
  },
  inactiveOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    opacity: 0.6,
  },
  inactiveIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  inactiveText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
    lineHeight: 20,
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
