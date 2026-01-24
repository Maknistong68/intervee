import { Router, Request, Response } from 'express';
import { reviewerSessionService } from '../services/reviewerSession.js';
import { getAvailableFocusAreas } from '../services/questionGenerator.js';
import { ReviewerSessionConfig, ReviewerAnswerSubmission } from '../types/index.js';

const router = Router();

// Get available focus areas for quiz configuration
router.get('/focus-areas', (req: Request, res: Response) => {
  try {
    const focusAreas = getAvailableFocusAreas();
    res.json({ focusAreas });
  } catch (error) {
    console.error('[Reviewer] Error getting focus areas:', error);
    res.status(500).json({ error: 'Failed to get focus areas' });
  }
});

// Create a new quiz session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const config: ReviewerSessionConfig = req.body;

    // Validate required fields
    if (!config.difficulty || !config.questionTypes || !config.totalQuestions) {
      return res.status(400).json({
        error: 'Missing required fields: difficulty, questionTypes, totalQuestions',
      });
    }

    // Validate question count
    if (config.totalQuestions < 1 || config.totalQuestions > 50) {
      return res.status(400).json({
        error: 'totalQuestions must be between 1 and 50',
      });
    }

    // Set defaults
    config.focusAreas = config.focusAreas || [];
    config.language = config.language || 'en';

    const result = await reviewerSessionService.createSession(config);

    res.status(201).json({
      sessionId: result.sessionId,
      firstQuestion: result.firstQuestion,
    });
  } catch (error) {
    console.error('[Reviewer] Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get session details
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await reviewerSessionService.getSession(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Don't expose correct answers in the response
    const sanitizedQuestions = session.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      difficulty: q.difficulty,
      sourceRule: q.sourceRule,
      options: q.options,
      questionOrder: q.questionOrder,
      userAnswer: q.userAnswer,
      isCorrect: q.isCorrect,
      score: q.score,
      feedback: q.feedback,
    }));

    res.json({
      id: session.id,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      difficulty: session.difficulty,
      questionTypes: session.questionTypes,
      focusAreas: session.focusAreas,
      totalQuestions: session.totalQuestions,
      timeLimitPerQ: session.timeLimitPerQ,
      language: session.language,
      completedCount: session.completedCount,
      score: session.score,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('[Reviewer] Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Get next question in session
router.get('/sessions/:id/next', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await reviewerSessionService.getNextQuestion(id);

    if (!question) {
      return res.json({
        complete: true,
        message: 'All questions answered',
      });
    }

    // Don't expose correct answers
    res.json({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty,
      sourceRule: question.sourceRule,
      options: question.options,
      questionOrder: question.questionOrder,
    });
  } catch (error: any) {
    console.error('[Reviewer] Error getting next question:', error);
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(500).json({ error: 'Failed to get next question' });
  }
});

// Submit answer for a question
router.post('/sessions/:id/answer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission: ReviewerAnswerSubmission = req.body;

    // Validate required fields
    if (!submission.questionId || submission.answer === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: questionId, answer',
      });
    }

    submission.timeSpentSec = submission.timeSpentSec || 0;

    const evaluation = await reviewerSessionService.submitAnswer(id, submission);

    res.json(evaluation);
  } catch (error: any) {
    console.error('[Reviewer] Error submitting answer:', error);
    if (error.message === 'Question not found') {
      return res.status(404).json({ error: 'Question not found' });
    }
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get session summary/results
router.get('/sessions/:id/summary', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const summary = await reviewerSessionService.getSessionSummary(id);

    res.json(summary);
  } catch (error: any) {
    console.error('[Reviewer] Error getting summary:', error);
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// End session early
router.post('/sessions/:id/end', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const summary = await reviewerSessionService.endSession(id);

    res.json(summary);
  } catch (error: any) {
    console.error('[Reviewer] Error ending session:', error);
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(500).json({ error: 'Failed to end session' });
  }
});

export default router;
