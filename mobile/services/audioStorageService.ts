import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECORDINGS_DIR = FileSystem.cacheDirectory + 'recordings/';
const PENDING_RECORDINGS_KEY = 'intervee_pending_recordings';
const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

export interface PendingRecording {
  id: string;
  filePath: string;
  durationMs: number;
  format: 'wav' | 'm4a';
  createdAt: number;
  sizeBytes?: number;
}

class AudioStorageService {
  private initialized = false;

  /**
   * Initialize the recordings directory
   * Should be called on app start
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure recordings directory exists
      const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
        console.log('[AudioStorage] Created recordings directory');
      }
      this.initialized = true;
      console.log('[AudioStorage] Initialized');
    } catch (error) {
      console.error('[AudioStorage] Failed to initialize:', error);
    }
  }

  /**
   * Save recording temporarily as a safety net
   * Returns the pending recording metadata
   */
  async saveTemporary(audioBase64: string, format: 'wav' | 'm4a', durationMs: number): Promise<PendingRecording> {
    await this.initialize();

    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filePath = `${RECORDINGS_DIR}${id}.${format}`;

    try {
      // Write audio data to file
      await FileSystem.writeAsStringAsync(filePath, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const sizeBytes = fileInfo.exists ? (fileInfo as any).size : undefined;

      const pendingRecording: PendingRecording = {
        id,
        filePath,
        durationMs,
        format,
        createdAt: Date.now(),
        sizeBytes,
      };

      // Track in metadata store
      await this.addToPendingList(pendingRecording);

      console.log(`[AudioStorage] Saved temporary recording: ${id}, ${durationMs}ms, ${sizeBytes ? Math.round(sizeBytes / 1024) + 'KB' : 'unknown size'}`);
      return pendingRecording;
    } catch (error) {
      console.error('[AudioStorage] Failed to save recording:', error);
      throw error;
    }
  }

  /**
   * Read a recording from storage
   * Returns base64 audio data
   */
  async readRecording(id: string): Promise<string | null> {
    const pending = await this.getPendingRecording(id);
    if (!pending) {
      console.warn(`[AudioStorage] Recording not found: ${id}`);
      return null;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(pending.filePath);
      if (!fileInfo.exists) {
        console.warn(`[AudioStorage] Recording file missing: ${pending.filePath}`);
        await this.removeFromPendingList(id);
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(pending.filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`[AudioStorage] Read recording: ${id}`);
      return base64;
    } catch (error) {
      console.error(`[AudioStorage] Failed to read recording ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete recording after successful processing
   */
  async deleteRecording(id: string): Promise<boolean> {
    const pending = await this.getPendingRecording(id);
    if (!pending) {
      console.warn(`[AudioStorage] Recording not found for deletion: ${id}`);
      return false;
    }

    try {
      // Delete the file
      const fileInfo = await FileSystem.getInfoAsync(pending.filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(pending.filePath, { idempotent: true });
      }

      // Remove from tracking
      await this.removeFromPendingList(id);

      console.log(`[AudioStorage] Deleted recording: ${id}`);
      return true;
    } catch (error) {
      console.error(`[AudioStorage] Failed to delete recording ${id}:`, error);
      return false;
    }
  }

  /**
   * Clean up stale recordings (older than 1 hour)
   * Should be called on app start
   * Returns count of deleted recordings
   */
  async cleanupStale(): Promise<number> {
    await this.initialize();

    const now = Date.now();
    const pendingList = await this.getPendingList();
    let deletedCount = 0;

    for (const recording of pendingList) {
      const age = now - recording.createdAt;
      if (age > STALE_THRESHOLD_MS) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(recording.filePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(recording.filePath, { idempotent: true });
          }
          await this.removeFromPendingList(recording.id);
          deletedCount++;
          console.log(`[AudioStorage] Cleaned up stale recording: ${recording.id} (${Math.round(age / 60000)}min old)`);
        } catch (error) {
          console.error(`[AudioStorage] Failed to cleanup ${recording.id}:`, error);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`[AudioStorage] Cleaned up ${deletedCount} stale recordings`);
    }

    return deletedCount;
  }

  /**
   * Get all pending recordings that failed to send
   * These can be retried when network is available
   */
  async getPendingRecordings(): Promise<PendingRecording[]> {
    return this.getPendingList();
  }

  /**
   * Get a specific pending recording by ID
   */
  async getPendingRecording(id: string): Promise<PendingRecording | null> {
    const list = await this.getPendingList();
    return list.find(r => r.id === id) || null;
  }

  /**
   * Clear all recordings (for debugging/testing)
   */
  async clearAll(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(RECORDINGS_DIR, { idempotent: true });
        await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
      }
      await AsyncStorage.removeItem(PENDING_RECORDINGS_KEY);
      console.log('[AudioStorage] Cleared all recordings');
    } catch (error) {
      console.error('[AudioStorage] Failed to clear all:', error);
    }
  }

  // =====================
  // Private helpers
  // =====================

  private async getPendingList(): Promise<PendingRecording[]> {
    try {
      const data = await AsyncStorage.getItem(PENDING_RECORDINGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[AudioStorage] Failed to get pending list:', error);
      return [];
    }
  }

  private async addToPendingList(recording: PendingRecording): Promise<void> {
    try {
      const list = await this.getPendingList();
      list.push(recording);
      await AsyncStorage.setItem(PENDING_RECORDINGS_KEY, JSON.stringify(list));
    } catch (error) {
      console.error('[AudioStorage] Failed to add to pending list:', error);
    }
  }

  private async removeFromPendingList(id: string): Promise<void> {
    try {
      const list = await this.getPendingList();
      const filtered = list.filter(r => r.id !== id);
      await AsyncStorage.setItem(PENDING_RECORDINGS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[AudioStorage] Failed to remove from pending list:', error);
    }
  }
}

// Singleton instance
export const audioStorageService = new AudioStorageService();
