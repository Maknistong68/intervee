import { NextRequest, NextResponse } from 'next/server';

// Simple session tracking for context reset
// In production, this would connect to the backend service

export async function POST(request: NextRequest) {
  try {
    // Get session ID from request body or headers
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId || 'default';

    console.log(`[Reset] Context cleared for session: ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Context reset successfully',
      sessionId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Reset] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reset context' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Context Reset',
    description: 'POST to this endpoint to clear conversation context',
  });
}
