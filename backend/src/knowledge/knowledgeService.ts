// Knowledge Service - Topic-based JSON loader with caching
// Loads only relevant knowledge based on detected question topic

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TopicKnowledge {
  topic: string;
  rules: string[];
  keywords: string[];
  promptContent: string;
}

interface CacheEntry {
  data: TopicKnowledge;
  timestamp: number;
}

// In-memory cache with 30-minute TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Map of topic names to JSON file names
const TOPIC_FILES: Record<string, string> = {
  safety_officer: 'safety_officer.json',
  hsc: 'hsc.json',
  accident_reporting: 'accident_reporting.json',
  ppe: 'ppe.json',
  registration: 'registration.json',
  penalties: 'penalties.json',
  health_services: 'health_services.json',
  boiler: 'boiler.json',
  hazardous_work: 'hazardous_work.json',
  environmental: 'environmental.json',
  premises: 'premises.json',
  drug_free: 'general.json', // Map to general for now
  general: 'general.json',
};

/**
 * Get the path to JSON knowledge files
 */
function getJsonPath(filename: string): string {
  return join(__dirname, 'json', filename);
}

/**
 * Check if a cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

/**
 * Load topic knowledge from JSON file
 */
export async function getTopicKnowledge(topic: string): Promise<TopicKnowledge | null> {
  const normalizedTopic = topic.toLowerCase().trim();

  // Check cache first
  const cached = cache.get(normalizedTopic);
  if (cached && isCacheValid(cached)) {
    console.log(`[Knowledge] Cache hit for topic: ${normalizedTopic}`);
    return cached.data;
  }

  // Determine which file to load
  const filename = TOPIC_FILES[normalizedTopic] || TOPIC_FILES.general;
  const filepath = getJsonPath(filename);

  try {
    const content = await readFile(filepath, 'utf-8');
    const data: TopicKnowledge = JSON.parse(content);

    // Cache the result
    cache.set(normalizedTopic, {
      data,
      timestamp: Date.now(),
    });

    console.log(`[Knowledge] Loaded topic: ${normalizedTopic} (${data.promptContent.length} chars)`);
    return data;
  } catch (error) {
    console.error(`[Knowledge] Failed to load ${filename}:`, error);

    // Try loading general.json as fallback
    if (normalizedTopic !== 'general') {
      console.log(`[Knowledge] Falling back to general.json`);
      return getTopicKnowledge('general');
    }

    return null;
  }
}

/**
 * Generate a focused system prompt using only the relevant topic's knowledge
 */
export async function generateTopicPrompt(topic?: string): Promise<string> {
  const targetTopic = topic || 'general';
  const knowledge = await getTopicKnowledge(targetTopic);

  if (!knowledge) {
    // Ultimate fallback - minimal hardcoded prompt
    console.log(`[Knowledge] Using minimal fallback prompt`);
    return `You are an expert on Philippine Occupational Safety and Health Standards (OSHS).
Answer questions accurately based on RA 11058 and OSHS Rules 1020-1960.
Always cite specific rule numbers when applicable.`;
  }

  // Build the focused prompt with just the relevant topic
  const prompt = `You are an expert on Philippine Occupational Safety and Health Standards (OSHS). Use the following knowledge to answer questions accurately.

${knowledge.promptContent}

Always cite the specific rule number when answering (e.g., "According to ${knowledge.rules[0] || 'the OSH Standards'}...").`;

  return prompt;
}

/**
 * Clear the knowledge cache (useful for testing or hot reload)
 */
export function clearKnowledgeCache(): void {
  cache.clear();
  console.log('[Knowledge] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; topics: string[] } {
  const validTopics: string[] = [];
  for (const [topic, entry] of cache.entries()) {
    if (isCacheValid(entry)) {
      validTopics.push(topic);
    }
  }
  return {
    size: validTopics.length,
    topics: validTopics,
  };
}

// Export as a service object for consistency
export const knowledgeService = {
  getTopicKnowledge,
  generateTopicPrompt,
  clearKnowledgeCache,
  getCacheStats,
};

export default knowledgeService;
