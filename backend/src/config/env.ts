import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Audio Processing
  audioChunkDuration: 500, // ms
  silenceThreshold: 1500, // ms of silence to trigger question detection

  // Response
  maxResponseTokens: 300,
  targetResponseTimeMs: 3000,

  // Caching
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  cacheTTL: 3600, // 1 hour
  memoryCacheMaxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '100', 10),

  // Conversation context
  contextSummaryLength: parseInt(process.env.CONTEXT_SUMMARY_LENGTH || '500', 10),
  maxContexts: parseInt(process.env.MAX_CONTEXTS || '1000', 10),

  // Timeouts (milliseconds)
  whisperTimeout: parseInt(process.env.WHISPER_TIMEOUT || '30000', 10),
  gptTimeout: parseInt(process.env.GPT_TIMEOUT || '15000', 10),

  // Rate limiting
  apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '30', 10), // requests per minute
  apiRateWindowMs: parseInt(process.env.API_RATE_WINDOW_MS || '60000', 10),

  // Circuit breaker
  circuitBreakerThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5', 10),
  circuitBreakerResetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),

  // AI Transcript Interpretation (corrects misheard OSH terms using AI)
  // Enabled by default - more accurate but adds ~200-500ms latency and extra API cost
  // Set to 'false' to use faster regex-based normalization only
  aiTranscriptInterpretation: process.env.AI_TRANSCRIPT_INTERPRETATION !== 'false',
};

export function validateConfig(): void {
  const required = ['openaiApiKey', 'databaseUrl'] as const;
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work properly.');
  }
}
