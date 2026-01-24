import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OSH_EXPERT_PROMPT } from '@/lib/osh-prompt';
import { OSH_KNOWLEDGE } from '@/lib/osh-knowledge';

// Simple in-memory conversation context for follow-up support
interface ConversationEntry {
  question: string;
  answer: string;
  topic: string;
  timestamp: number;
}

interface SessionContext {
  history: ConversationEntry[];
  currentTopic: string;
  lastActiveAt: number;
}

const sessionContexts = new Map<string, SessionContext>();
const CONTEXT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

function getOrCreateContext(sessionId: string): SessionContext {
  let ctx = sessionContexts.get(sessionId);
  if (!ctx || Date.now() - ctx.lastActiveAt > CONTEXT_EXPIRY_MS) {
    ctx = { history: [], currentTopic: '', lastActiveAt: Date.now() };
    sessionContexts.set(sessionId, ctx);
  }
  ctx.lastActiveAt = Date.now();
  return ctx;
}

function addExchange(sessionId: string, question: string, answer: string, topic: string): void {
  const ctx = getOrCreateContext(sessionId);
  ctx.history.push({ question, answer, topic, timestamp: Date.now() });
  if (ctx.history.length > 10) ctx.history = ctx.history.slice(-10);
  if (topic) ctx.currentTopic = topic;
}

function getLastExchange(sessionId: string): ConversationEntry | undefined {
  const ctx = sessionContexts.get(sessionId);
  return ctx?.history[ctx.history.length - 1];
}

// Follow-up detection patterns
const FOLLOW_UP_PATTERNS = [
  /^(what about|how about|and|but|also|then)/i,
  /^(same|similar|related|another|more)/i,
  /^(what|how|when|where|who|why) (is|are|do|does|did|was|were) (it|that|they|this|those|these)/i,
];

function isFollowUp(question: string): boolean {
  const q = question.toLowerCase().trim();
  if (FOLLOW_UP_PATTERNS.some(p => p.test(q))) return true;
  const wordCount = q.split(/\s+/).filter(w => w.length > 1).length;
  return wordCount <= 4 && q.endsWith('?');
}

// Detect topic from question
function detectTopic(question: string): string {
  const q = question.toLowerCase();
  if (/safety officer|so[1-4]|training hours|cosh/i.test(q)) return 'safety_officer';
  if (/hsc|committee|meeting/i.test(q)) return 'hsc';
  if (/ppe|equipment|helmet|harness|fall protection/i.test(q)) return 'ppe';
  if (/penalty|fine|violation|offense/i.test(q)) return 'penalty';
  if (/regist|1020/i.test(q)) return 'registration';
  if (/accident|report|wair|frequency|severity/i.test(q)) return 'accident';
  if (/construction|scaffold|excavation/i.test(q)) return 'construction';
  if (/weld|cutting|screen/i.test(q)) return 'welding';
  if (/noise|illumination|ventilation|dba/i.test(q)) return 'environmental';
  if (/health service|hospital|physician|nurse|first.?aid/i.test(q)) return 'health_services';
  if (/hazardous|chemical|material|acid/i.test(q)) return 'hazardous_materials';
  if (/confined space|entry|watcher/i.test(q)) return 'confined_space';
  if (/explosive|magazine|blast/i.test(q)) return 'explosives';
  if (/boiler|pressure/i.test(q)) return 'boiler';
  if (/premise|stair|railing|floor/i.test(q)) return 'premises';
  return 'general';
}

// Get relevant knowledge based on detected topic
function getTopicKnowledge(topic: string): string {
  const topicMap: Record<string, keyof typeof OSH_KNOWLEDGE> = {
    registration: 'rule1020',
    safety_officer: 'rule1030',
    training: 'rule1030',
    hsc: 'rule1040',
    committee: 'rule1040',
    accident: 'rule1050',
    reporting: 'rule1050',
    premises: 'rule1060',
    environmental: 'rule1070',
    noise: 'rule1070',
    illumination: 'rule1070',
    ventilation: 'rule1070',
    ppe: 'rule1080',
    hazardous_materials: 'rule1090',
    welding: 'rule1100',
    confined_space: 'rule1120',
    explosives: 'rule1140',
    boiler: 'rule1160',
    health_services: 'rule1960',
    penalty: 'ra11058',
    ra11058: 'ra11058',
  };

  const knowledgeKey = topicMap[topic] || null;

  if (knowledgeKey && OSH_KNOWLEDGE[knowledgeKey]) {
    return `\n## REFERENCE DATA (${knowledgeKey.toUpperCase()}):\n${JSON.stringify(OSH_KNOWLEDGE[knowledgeKey], null, 2)}`;
  }

  // For general questions, provide a summary of all rules
  return `\n## REFERENCE DATA (OSHS OVERVIEW):\n${JSON.stringify({
    rules: Object.keys(OSH_KNOWLEDGE).map(k => OSH_KNOWLEDGE[k as keyof typeof OSH_KNOWLEDGE].title || k),
    ra11058: OSH_KNOWLEDGE.ra11058.title,
  }, null, 2)}`;
}


export async function POST(request: NextRequest) {
  const sessionId = 'default'; // Simple session for now

  try {
    const body = await request.json();
    const question = body.question;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Detect topic and check if follow-up
    const topic = detectTopic(question);
    const followUp = isFollowUp(question);
    const lastExchange = getLastExchange(sessionId);

    // Build context string for follow-ups
    let contextAddition = '';
    if (followUp && lastExchange) {
      contextAddition = `
## CONVERSATION CONTEXT:
Previous Question: "${lastExchange.question}"
Previous Answer: "${lastExchange.answer.substring(0, 300)}${lastExchange.answer.length > 300 ? '...' : ''}"
Current Topic: ${lastExchange.topic}

This appears to be a FOLLOW-UP question. Use the context above to provide a relevant answer.
`;
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please use the backend API instead.' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000, // 10 second timeout
      maxRetries: 2,  // Retry up to 2 times
    });

    const startTime = Date.now();

    // Get relevant knowledge for the detected topic
    const knowledgeContext = getTopicKnowledge(topic);

    // Build system prompt with knowledge and conversation context
    const enhancedPrompt = `${OSH_EXPERT_PROMPT}${knowledgeContext}${contextAddition}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: enhancedPrompt },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = response.choices[0]?.message?.content || '';
    const responseTimeMs = Date.now() - startTime;

    if (!answer || answer.trim() === '') {
      return NextResponse.json(
        { error: 'Failed to generate answer. Please try again.' },
        { status: 500 }
      );
    }

    // Store exchange in context
    addExchange(sessionId, question, answer, topic);

    // Calculate confidence based on citations
    let confidence = 0.75;
    if (answer.match(/Rule\s+\d{4}/i)) confidence += 0.1;
    if (answer.match(/DO\s+\d+/i)) confidence += 0.05;
    if (answer.match(/RA\s+11058/i)) confidence += 0.05;
    confidence = Math.min(confidence, 0.95);

    return NextResponse.json({
      answer,
      confidence,
      responseTimeMs,
      demo: false,
      isFollowUp: followUp,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);

    // Return proper error response - no fallback to hardcoded data
    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your question. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'INTERVEE OSH Assistant',
    apiConfigured: !!process.env.OPENAI_API_KEY,
  });
}
