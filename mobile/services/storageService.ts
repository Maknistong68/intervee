import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exchange } from '../stores/interviewStore';

const STORAGE_KEYS = {
  SESSIONS: 'intervee_sessions',
  SETTINGS: 'intervee_settings',
  CACHED_ANSWERS: 'intervee_cached_answers',
};

export interface StoredSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  exchanges: Exchange[];
}

export type LanguagePreference = 'eng' | 'fil' | 'mix';
export type ResponseMode = 'detailed' | 'concise';

export interface AppSettings {
  serverUrl: string;
  autoStart: boolean;
  hapticFeedback: boolean;
  keepScreenAwake: boolean;
  darkMode: boolean;
  languagePreference: LanguagePreference;
  responseMode: ResponseMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  serverUrl: 'http://localhost:3001',
  autoStart: false,
  hapticFeedback: true,
  keepScreenAwake: true,
  darkMode: true,
  languagePreference: 'mix',
  responseMode: 'concise',
};

class StorageService {
  // Sessions
  async saveSession(session: StoredSession): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session); // Add to beginning
      }

      // Keep only last 50 sessions
      const trimmedSessions = sessions.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmedSessions));
    } catch (error) {
      console.error('[Storage] Failed to save session:', error);
    }
  }

  async getSessions(): Promise<StoredSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Storage] Failed to get sessions:', error);
      return [];
    }
  }

  async getSession(id: string): Promise<StoredSession | null> {
    const sessions = await this.getSessions();
    return sessions.find(s => s.id === id) || null;
  }

  async deleteSession(id: string): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const filtered = sessions.filter(s => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('[Storage] Failed to delete session:', error);
    }
  }

  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
    } catch (error) {
      console.error('[Storage] Failed to clear sessions:', error);
    }
  }

  // Settings
  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('[Storage] Failed to save settings:', error);
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('[Storage] Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Cached answers for offline fallback
  async cacheAnswer(questionHash: string, answer: string, confidence: number): Promise<void> {
    try {
      const cached = await this.getCachedAnswers();
      cached[questionHash] = { answer, confidence, cachedAt: Date.now() };

      // Keep only 100 most recent
      const entries = Object.entries(cached)
        .sort((a, b) => b[1].cachedAt - a[1].cachedAt)
        .slice(0, 100);

      await AsyncStorage.setItem(
        STORAGE_KEYS.CACHED_ANSWERS,
        JSON.stringify(Object.fromEntries(entries))
      );
    } catch (error) {
      console.error('[Storage] Failed to cache answer:', error);
    }
  }

  async getCachedAnswer(questionHash: string): Promise<{ answer: string; confidence: number } | null> {
    const cached = await this.getCachedAnswers();
    const entry = cached[questionHash];
    return entry ? { answer: entry.answer, confidence: entry.confidence } : null;
  }

  private async getCachedAnswers(): Promise<Record<string, { answer: string; confidence: number; cachedAt: number }>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_ANSWERS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_ANSWERS);
    } catch (error) {
      console.error('[Storage] Failed to clear cache:', error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.CACHED_ANSWERS,
      ]);
    } catch (error) {
      console.error('[Storage] Failed to clear all data:', error);
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
