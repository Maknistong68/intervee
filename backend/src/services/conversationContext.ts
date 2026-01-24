// Conversation Context Service
// Tracks conversation history per session for follow-up question handling

import { config } from '../config/env.js';

export interface ConversationEntry {
  question: string;
  answer: string;
  topic: string;
  timestamp: number;
}

export interface ConversationContext {
  sessionId: string;
  history: ConversationEntry[];
  currentTopic: string;
  followUpCount: number;
  createdAt: number;
  lastActiveAt: number;
}

// In-memory storage for conversation contexts with LRU tracking
const contexts = new Map<string, ConversationContext>();
const accessOrder: string[] = []; // Track access order for LRU eviction

// Context expiration time (30 minutes)
const CONTEXT_EXPIRY_MS = 30 * 60 * 1000;

// Maximum history entries to keep
const MAX_HISTORY_ENTRIES = 10;

/**
 * Update LRU tracking - move session to end (most recently used)
 */
function updateLRU(sessionId: string): void {
  const index = accessOrder.indexOf(sessionId);
  if (index > -1) {
    accessOrder.splice(index, 1);
  }
  accessOrder.push(sessionId);
}

/**
 * Evict oldest contexts if over limit (LRU eviction)
 */
function evictIfNeeded(): void {
  const maxContexts = config.maxContexts || 1000;
  while (contexts.size > maxContexts && accessOrder.length > 0) {
    const oldest = accessOrder.shift();
    if (oldest) {
      contexts.delete(oldest);
      console.log(`[ConversationContext] LRU evicted context: ${oldest}`);
    }
  }
}

/**
 * Create a new conversation context for a session
 */
export function createContext(sessionId: string): ConversationContext {
  // Evict old contexts if at capacity
  evictIfNeeded();

  const context: ConversationContext = {
    sessionId,
    history: [],
    currentTopic: '',
    followUpCount: 0,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  contexts.set(sessionId, context);
  updateLRU(sessionId);
  return context;
}

/**
 * Get existing context or create new one
 */
export function getOrCreateContext(sessionId: string): ConversationContext {
  let context = contexts.get(sessionId);

  // Check if context exists and is not expired
  if (context) {
    if (Date.now() - context.lastActiveAt > CONTEXT_EXPIRY_MS) {
      // Context expired, create new one
      context = createContext(sessionId);
    } else {
      context.lastActiveAt = Date.now();
      updateLRU(sessionId);
    }
  } else {
    context = createContext(sessionId);
  }

  return context;
}

/**
 * Get context without creating
 */
export function getContext(sessionId: string): ConversationContext | undefined {
  return contexts.get(sessionId);
}

/**
 * Add a Q&A exchange to the context
 */
export function addExchange(
  sessionId: string,
  question: string,
  answer: string,
  topic: string
): void {
  const context = getOrCreateContext(sessionId);

  const entry: ConversationEntry = {
    question,
    answer,
    topic,
    timestamp: Date.now(),
  };

  context.history.push(entry);

  // Trim history if too long
  if (context.history.length > MAX_HISTORY_ENTRIES) {
    context.history = context.history.slice(-MAX_HISTORY_ENTRIES);
  }

  // Update current topic
  if (topic) {
    context.currentTopic = topic;
  }

  context.lastActiveAt = Date.now();
}

/**
 * Get the last exchange from context
 */
export function getLastExchange(sessionId: string): ConversationEntry | undefined {
  const context = contexts.get(sessionId);
  if (!context || context.history.length === 0) {
    return undefined;
  }
  return context.history[context.history.length - 1];
}

/**
 * Get current topic from context
 */
export function getCurrentTopic(sessionId: string): string {
  const context = contexts.get(sessionId);
  return context?.currentTopic || '';
}

/**
 * Increment follow-up count
 */
export function incrementFollowUp(sessionId: string): number {
  const context = getOrCreateContext(sessionId);
  context.followUpCount++;
  return context.followUpCount;
}

/**
 * Reset follow-up count (when new topic detected)
 */
export function resetFollowUp(sessionId: string): void {
  const context = contexts.get(sessionId);
  if (context) {
    context.followUpCount = 0;
  }
}

/**
 * Clear context for a session (reset)
 */
export function clearContext(sessionId: string): void {
  contexts.delete(sessionId);
  // Remove from LRU tracking
  const index = accessOrder.indexOf(sessionId);
  if (index > -1) {
    accessOrder.splice(index, 1);
  }
}

/**
 * Clear all expired contexts (cleanup)
 */
export function cleanupExpiredContexts(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, context] of contexts) {
    if (now - context.lastActiveAt > CONTEXT_EXPIRY_MS) {
      contexts.delete(sessionId);
      // Remove from LRU tracking
      const index = accessOrder.indexOf(sessionId);
      if (index > -1) {
        accessOrder.splice(index, 1);
      }
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get current context count (for monitoring)
 */
export function getContextCount(): number {
  return contexts.size;
}

/**
 * Get context summary for GPT prompt
 * Uses configurable CONTEXT_SUMMARY_LENGTH for answer truncation
 */
export function getContextSummary(sessionId: string): string {
  const context = contexts.get(sessionId);
  if (!context || context.history.length === 0) {
    return '';
  }

  const summaryLength = config.contextSummaryLength || 500;
  const lastExchange = context.history[context.history.length - 1];

  let summary = `## CONVERSATION CONTEXT:\n`;
  summary += `Previous Question: "${lastExchange.question}"\n`;
  summary += `Previous Answer: "${lastExchange.answer.substring(0, summaryLength)}${lastExchange.answer.length > summaryLength ? '...' : ''}"\n`;
  summary += `Current Topic: ${context.currentTopic || 'general OSH'}\n`;
  summary += `Follow-up Count: ${context.followUpCount}\n`;

  return summary;
}

// Run cleanup every 5 minutes
setInterval(() => {
  const cleaned = cleanupExpiredContexts();
  if (cleaned > 0) {
    console.log(`[ConversationContext] Cleaned up ${cleaned} expired contexts`);
  }
}, 5 * 60 * 1000);

export const conversationContextService = {
  createContext,
  getOrCreateContext,
  getContext,
  addExchange,
  getLastExchange,
  getCurrentTopic,
  incrementFollowUp,
  resetFollowUp,
  clearContext,
  cleanupExpiredContexts,
  getContextSummary,
  getContextCount,
};
