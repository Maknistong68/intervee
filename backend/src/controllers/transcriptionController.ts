import { Request, Response } from 'express';
import { whisperService } from '../services/whisperService.js';

export class TranscriptionController {
  /**
   * Handle manual transcription request (for testing)
   * POST /api/transcribe
   * Body: { audio: base64EncodedAudio }
   */
  async transcribe(req: Request, res: Response): Promise<void> {
    try {
      const { audio } = req.body;

      if (!audio) {
        res.status(400).json({ error: 'Audio data is required' });
        return;
      }

      const audioBuffer = Buffer.from(audio, 'base64');
      const result = await whisperService.transcribe(audioBuffer);

      res.json({
        success: true,
        transcription: result,
      });
    } catch (error) {
      console.error('[TranscriptionController] Error:', error);
      res.status(500).json({
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check transcription service health
   * GET /api/transcribe/health
   */
  async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      service: 'whisper',
      model: 'whisper-1',
    });
  }
}

export const transcriptionController = new TranscriptionController();
