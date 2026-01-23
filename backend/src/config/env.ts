import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

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
};

export function validateConfig(): void {
  const required = ['openaiApiKey', 'databaseUrl'] as const;
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work properly.');
  }
}
