// Conversation Context Service
// Tracks conversation history per session for follow-up question handling

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

// In-memory storage for conversation contexts
const contexts = new Map<string, ConversationContext>();

// Context expiration time (30 minutes)
const CONTEXT_EXPIRY_MS = 30 * 60 * 1000;

// Maximum history entries to keep
const MAX_HISTORY_ENTRIES = 10;

/**
 * Create a new conversation context for a session
 */
export function createContext(sessionId: string): ConversationContext {
  const context: ConversationContext = {
    sessionId,
    history: [],
    currentTopic: '',
    followUpCount: 0,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  contexts.set(sessionId, context);
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
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get context summary for GPT prompt
 */
export function getContextSummary(sessionId: string): string {
  const context = contexts.get(sessionId);
  if (!context || context.history.length === 0) {
    return '';
  }

  const lastExchange = context.history[context.history.length - 1];

  let summary = `## CONVERSATION CONTEXT:\n`;
  summary += `Previous Question: "${lastExchange.question}"\n`;
  summary += `Previous Answer: "${lastExchange.answer.substring(0, 200)}${lastExchange.answer.length > 200 ? '...' : ''}"\n`;
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
};
