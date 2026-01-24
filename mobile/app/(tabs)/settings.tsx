import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { storageService, AppSettings, LanguagePreference } from '../../services/storageService';
import { DARK_THEME, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const LANGUAGE_OPTIONS: { code: LanguagePreference; label: string; description: string }[] = [
  { code: 'eng', label: 'EN', description: 'English' },
  { code: 'fil', label: 'FIL', description: 'Filipino/Tagalog' },
  { code: 'mix', label: 'MIX', description: 'Taglish (Mixed)' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    serverUrl: 'http://localhost:3001',
    autoStart: false,
    hapticFeedback: true,
    keepScreenAwake: true,
    darkMode: true,
    languagePreference: 'mix',
  });

  useEffect(() => {
    storageService.getSettings().then(setSettings);
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await storageService.saveSettings({ [key]: value });
    },
    [settings]
  );

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached answers. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearCache();
            Alert.alert('Success', 'Cache cleared successfully.');
          },
        },
      ]
    );
  }, []);

  const handleClearAllData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all sessions, settings, and cached data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            const freshSettings = await storageService.getSettings();
            setSettings(freshSettings);
            Alert.alert('Success', 'All data cleared.');
          },
        },
      ]
    );
  }, []);

  const SettingRow = ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>

          <View style={styles.card}>
            <SettingRow
              label="Response Language"
              description="Language for AI responses"
            >
              <View style={styles.languageSelector}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageButton,
                      settings.languagePreference === lang.code && styles.languageButtonActive,
                    ]}
                    onPress={() => updateSetting('languagePreference', lang.code)}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        settings.languagePreference === lang.code && styles.languageButtonTextActive,
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </SettingRow>
            <View style={styles.languageHint}>
              <Text style={styles.languageHintText}>
                {LANGUAGE_OPTIONS.find(l => l.code === settings.languagePreference)?.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>

          <View style={styles.card}>
            <SettingRow
              label="Server URL"
              description="Backend server address"
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={settings.serverUrl}
                  onChangeText={(value) => updateSetting('serverUrl', value)}
                  placeholder="http://localhost:3001"
                  placeholderTextColor={DARK_THEME.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </SettingRow>
          </View>
        </View>

        {/* Behavior Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Behavior</Text>

          <View style={styles.card}>
            <SettingRow
              label="Auto-start Recording"
              description="Begin recording when app opens"
            >
              <Switch
                value={settings.autoStart}
                onValueChange={(value) => updateSetting('autoStart', value)}
                trackColor={{
                  false: DARK_THEME.surfaceLight,
                  true: DARK_THEME.primaryDark,
                }}
                thumbColor={
                  settings.autoStart ? DARK_THEME.primary : DARK_THEME.textMuted
                }
              />
            </SettingRow>

            <View style={styles.separator} />

            <SettingRow
              label="Haptic Feedback"
              description="Vibrate on events"
            >
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => updateSetting('hapticFeedback', value)}
                trackColor={{
                  false: DARK_THEME.surfaceLight,
                  true: DARK_THEME.primaryDark,
                }}
                thumbColor={
                  settings.hapticFeedback ? DARK_THEME.primary : DARK_THEME.textMuted
                }
              />
            </SettingRow>

            <View style={styles.separator} />

            <SettingRow
              label="Keep Screen Awake"
              description="Prevent screen from sleeping during sessions"
            >
              <Switch
                value={settings.keepScreenAwake}
                onValueChange={(value) => updateSetting('keepScreenAwake', value)}
                trackColor={{
                  false: DARK_THEME.surfaceLight,
                  true: DARK_THEME.primaryDark,
                }}
                thumbColor={
                  settings.keepScreenAwake ? DARK_THEME.primary : DARK_THEME.textMuted
                }
              />
            </SettingRow>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleClearCache}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDescription}>
                  Remove cached answers
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleClearAllData}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  Clear All Data
                </Text>
                <Text style={styles.settingDescription}>
                  Delete all sessions and settings
                </Text>
              </View>
              <Text style={[styles.actionArrow, styles.dangerText]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Purpose</Text>
              <Text style={styles.aboutValue}>OSH Interview Assistant</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Coverage</Text>
              <Text style={styles.aboutValue}>Philippine DOLE Standards</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            INTERVEE - Philippine OSH Practitioner Interview Assistant
          </Text>
          <Text style={styles.footerSubtext}>
            Based on RA 11058, OSHS Rules 1020-1960, and DOLE regulations
          </Text>
        </View>
      </ScrollView>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.divider,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  content: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    marginTop: 2,
  },
  inputContainer: {
    flex: 1,
    maxWidth: 200,
  },
  textInput: {
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    color: DARK_THEME.text,
    fontSize: FONT_SIZES.sm,
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: DARK_THEME.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  languageButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  languageButtonActive: {
    backgroundColor: DARK_THEME.primary,
  },
  languageButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: DARK_THEME.textMuted,
  },
  languageButtonTextActive: {
    color: DARK_THEME.text,
  },
  languageHint: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  languageHintText: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: DARK_THEME.divider,
    marginLeft: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionArrow: {
    fontSize: FONT_SIZES.xl,
    color: DARK_THEME.textMuted,
  },
  dangerText: {
    color: DARK_THEME.error,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  aboutLabel: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.textSecondary,
  },
  aboutValue: {
    fontSize: FONT_SIZES.md,
    color: DARK_THEME.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: DARK_THEME.textMuted,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
