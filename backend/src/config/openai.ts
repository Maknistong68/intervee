import OpenAI from 'openai';
import { config } from './env.js';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }
  return openaiClient;
}

export const WHISPER_MODEL = 'whisper-1';
export const GPT_MODEL = 'ft:gpt-4.1-mini-2025-04-14:personal:intervee:D2TvYcwn';

// Supported languages for transcription
export const SUPPORTED_LANGUAGES = ['en', 'tl'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
