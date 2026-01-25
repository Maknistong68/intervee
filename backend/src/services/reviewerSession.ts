import { PrismaClient } from '@prisma/client';
import { questionGeneratorService } from './questionGenerator.js';
import { answerEvaluatorService } from './answerEvaluator.js';
import {
  DifficultyLevel,
  ReviewerQuestionType,
  ReviewerSessionConfig,
  ReviewerQuestionData,
  ReviewerAnswerSubmission,
  ReviewerEvaluation,
  ReviewerSessionSummary,
} from '../types/index.js';

const prisma = new PrismaClient();

export class ReviewerSessionService {
  async createSession(config: ReviewerSessionConfig): Promise<{
    sessionId: string;
    firstQuestion: ReviewerQuestionData;
  }> {
    // Create the session in database
    const session = await prisma.reviewerSession.create({
      data: {
        difficulty: config.difficulty,
        questionTypes: config.questionTypes,
        focusAreas: config.focusAreas,
        totalQuestions: config.totalQuestions,
        timeLimitPerQ: config.timeLimitPerQ || null,
        language: config.language || 'en',
      },
    });

    // Generate the first question
    const questionType = config.questionTypes[0] || 'MULTIPLE_CHOICE';
    const generated = await questionGeneratorService.generateQuestion(
      questionType as ReviewerQuestionType,
      config.difficulty,
      config.focusAreas,
      config.language
    );

    // Save the first question
    const question = await prisma.reviewerQuestion.create({
      data: {
        sessionId: session.id,
        questionText: generated.questionText,
        questionType: generated.questionType,
        difficulty: generated.difficulty,
        sourceRule: generated.sourceRule,
        options: generated.options ?? undefined,
        correctIndex: generated.correctIndex ?? null,
        correctAnswer: generated.correctAnswer ?? null,
        expectedAnswer: generated.expectedAnswer || null,
        keyPoints: generated.keyPoints || [],
        questionOrder: 1,
      },
    });

    return {
      sessionId: session.id,
      firstQuestion: this.mapToQuestionData(question),
    };
  }

  async getSession(sessionId: string) {
    return prisma.reviewerSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });
  }

  async getNextQuestion(sessionId: string): Promise<ReviewerQuestionData | null> {
    const session = await prisma.reviewerSession.findUnique({
      where: { id: sessionId },
      include: { questions: { orderBy: { questionOrder: 'desc' }, take: 1 } },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Check if we've reached the total questions
    const currentCount = session.completedCount;
    if (currentCount >= session.totalQuestions) {
      return null; // Session complete
    }

    // Get previous questions to avoid duplicates
    const previousQuestions = await prisma.reviewerQuestion.findMany({
      where: { sessionId },
      select: { questionText: true },
    });

    // Determine question type (rotate through types)
    const questionTypeIndex = currentCount % session.questionTypes.length;
    const questionType = session.questionTypes[questionTypeIndex] as ReviewerQuestionType;

    // Generate new question
    const generated = await questionGeneratorService.generateQuestion(
      questionType,
      session.difficulty as DifficultyLevel,
      session.focusAreas,
      session.language,
      previousQuestions.map((q) => q.questionText)
    );

    // Save the question
    const question = await prisma.reviewerQuestion.create({
      data: {
        sessionId,
        questionText: generated.questionText,
        questionType: generated.questionType,
        difficulty: generated.difficulty,
        sourceRule: generated.sourceRule,
        options: generated.options ?? undefined,
        correctIndex: generated.correctIndex ?? null,
        correctAnswer: generated.correctAnswer ?? null,
        expectedAnswer: generated.expectedAnswer || null,
        keyPoints: generated.keyPoints || [],
        questionOrder: currentCount + 1,
      },
    });

    return this.mapToQuestionData(question);
  }

  async submitAnswer(
    sessionId: string,
    submission: ReviewerAnswerSubmission
  ): Promise<ReviewerEvaluation> {
    // Get the question
    const question = await prisma.reviewerQuestion.findUnique({
      where: { id: submission.questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (question.sessionId !== sessionId) {
      throw new Error('Question does not belong to this session');
    }

    // Evaluate the answer
    const evaluation = await answerEvaluatorService.evaluateAnswer(
      this.mapToQuestionData(question),
      submission.answer,
      submission.timeSpentSec
    );

    // Update the question with the answer
    await prisma.reviewerQuestion.update({
      where: { id: submission.questionId },
      data: {
        userAnswer: String(submission.answer),
        userAnswerAt: new Date(),
        timeSpentSec: submission.timeSpentSec,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
    });

    // Update session completed count
    await prisma.reviewerSession.update({
      where: { id: sessionId },
      data: {
        completedCount: { increment: 1 },
      },
    });

    return evaluation;
  }

  async getSessionSummary(sessionId: string): Promise<ReviewerSessionSummary> {
    const session = await prisma.reviewerSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const questions = session.questions;
    const answeredQuestions = questions.filter((q) => q.userAnswer !== null);

    // Calculate stats
    const correctCount = answeredQuestions.filter((q) => q.isCorrect).length;
    const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = answeredQuestions.length > 0
      ? (totalScore / answeredQuestions.length) * 100
      : 0;

    // Stats by type
    const byType: Record<ReviewerQuestionType, { total: number; correct: number }> = {
      MULTIPLE_CHOICE: { total: 0, correct: 0 },
      TRUE_FALSE: { total: 0, correct: 0 },
      OPEN_ENDED: { total: 0, correct: 0 },
      SCENARIO_BASED: { total: 0, correct: 0 },
    };

    // Stats by difficulty
    const byDifficulty: Record<DifficultyLevel, { total: number; correct: number }> = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
    };

    // Stats by source rule
    const ruleScores: Record<string, { total: number; correct: number }> = {};

    for (const q of answeredQuestions) {
      // By type
      const type = q.questionType as ReviewerQuestionType;
      byType[type].total++;
      if (q.isCorrect) byType[type].correct++;

      // By difficulty
      const diff = q.difficulty as DifficultyLevel;
      byDifficulty[diff].total++;
      if (q.isCorrect) byDifficulty[diff].correct++;

      // By source rule
      if (!ruleScores[q.sourceRule]) {
        ruleScores[q.sourceRule] = { total: 0, correct: 0 };
      }
      ruleScores[q.sourceRule].total++;
      if (q.isCorrect) ruleScores[q.sourceRule].correct++;
    }

    // Determine weak and strong areas
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];

    for (const [rule, stats] of Object.entries(ruleScores)) {
      const rate = stats.correct / stats.total;
      if (rate < 0.5 && stats.total >= 2) {
        weakAreas.push(rule);
      } else if (rate >= 0.8 && stats.total >= 2) {
        strongAreas.push(rule);
      }
    }

    // Calculate average time
    const totalTime = answeredQuestions.reduce(
      (sum, q) => sum + (q.timeSpentSec || 0),
      0
    );
    const avgTime = answeredQuestions.length > 0
      ? totalTime / answeredQuestions.length
      : 0;

    // Update session with final score
    await prisma.reviewerSession.update({
      where: { id: sessionId },
      data: {
        score: averageScore,
        endedAt: new Date(),
      },
    });

    return {
      sessionId,
      totalQuestions: session.totalQuestions,
      completedQuestions: answeredQuestions.length,
      correctCount,
      score: averageScore,
      byType,
      byDifficulty,
      weakAreas,
      strongAreas,
      averageTimePerQuestion: avgTime,
    };
  }

  async endSession(sessionId: string): Promise<ReviewerSessionSummary> {
    // Mark session as ended and return summary
    await prisma.reviewerSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    return this.getSessionSummary(sessionId);
  }

  private mapToQuestionData(question: any): ReviewerQuestionData {
    return {
      id: question.id,
      sessionId: question.sessionId,
      questionText: question.questionText,
      questionType: question.questionType as ReviewerQuestionType,
      difficulty: question.difficulty as DifficultyLevel,
      sourceRule: question.sourceRule,
      options: question.options as string[] | undefined,
      correctIndex: question.correctIndex ?? undefined,
      correctAnswer: question.correctAnswer ?? undefined,
      expectedAnswer: question.expectedAnswer ?? undefined,
      keyPoints: question.keyPoints as string[] | undefined,
      questionOrder: question.questionOrder,
    };
  }
}

export const reviewerSessionService = new ReviewerSessionService();
