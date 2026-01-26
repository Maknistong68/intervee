import { Request, Response } from 'express';
import { gptService } from '../services/gptService.js';

export class AnswerController {
  /**
   * Generate answer for a question (for testing)
   * POST /api/answer
   * Body: { question: string, context?: string }
   */
  async generateAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { question, context } = req.body;

      if (!question) {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      const result = await gptService.generateAnswer(question, context);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('[AnswerController] Error:', error);
      res.status(500).json({
        error: 'Failed to generate answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Stream answer for a question (for testing)
   * POST /api/answer/stream
   * Body: { question: string, context?: string }
   */
  async streamAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { question, context } = req.body;

      if (!question) {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const { chunk, done } of gptService.generateAnswerStream(question, context)) {
        if (!done) {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        }
      }

      res.end();
    } catch (error) {
      console.error('[AnswerController] Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to stream answer' })}\n\n`);
      res.end();
    }
  }

  /**
   * Check answer service health
   * GET /api/answer/health
   */
  async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      service: 'gpt',
      model: 'gpt-4.1-mini',
    });
  }
}

export const answerController = new AnswerController();
