import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OSH_EXPERT_PROMPT } from '@/lib/osh-prompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: OSH_EXPERT_PROMPT },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = response.choices[0]?.message?.content || '';
    const responseTimeMs = Date.now() - startTime;

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
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
