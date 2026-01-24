import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { buildAnswerEvaluationPrompt } from '../prompts/reviewerPrompts.js';
import {
  ReviewerQuestionType,
  ReviewerEvaluation,
  ReviewerQuestionData,
} from '../types/index.js';

export class AnswerEvaluatorService {
  private openai = getOpenAIClient();

  async evaluateAnswer(
    question: ReviewerQuestionData,
    userAnswer: string | number | boolean,
    timeSpentSec: number
  ): Promise<ReviewerEvaluation> {
    // Handle different question types
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return this.evaluateMultipleChoice(question, userAnswer as number);

      case 'TRUE_FALSE':
        return this.evaluateTrueFalse(question, userAnswer as boolean);

      case 'OPEN_ENDED':
      case 'SCENARIO_BASED':
        return this.evaluateOpenEnded(question, userAnswer as string);

      default:
        throw new Error(`Unknown question type: ${question.questionType}`);
    }
  }

  private evaluateMultipleChoice(
    question: ReviewerQuestionData,
    selectedIndex: number
  ): ReviewerEvaluation {
    const isCorrect = selectedIndex === question.correctIndex;
    const correctOption = question.options?.[question.correctIndex!];

    return {
      questionId: question.id,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect
        ? 'Correct! Well done.'
        : `Incorrect. The correct answer is: ${correctOption}`,
      correctAnswer: question.correctIndex,
    };
  }

  private evaluateTrueFalse(
    question: ReviewerQuestionData,
    userAnswer: boolean
  ): ReviewerEvaluation {
    const isCorrect = userAnswer === question.correctAnswer;

    return {
      questionId: question.id,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect
        ? 'Correct! Well done.'
        : `Incorrect. The statement is ${question.correctAnswer ? 'TRUE' : 'FALSE'}.`,
      correctAnswer: question.correctAnswer,
    };
  }

  private async evaluateOpenEnded(
    question: ReviewerQuestionData,
    userAnswer: string
  ): Promise<ReviewerEvaluation> {
    // Check for empty or very short answers
    if (!userAnswer || userAnswer.trim().length < 10) {
      return {
        questionId: question.id,
        isCorrect: false,
        score: 0.0,
        feedback:
          'Your answer is too short. Please provide a more detailed response.',
        keyPointsFound: [],
        keyPointsMissed: question.keyPoints || [],
      };
    }

    try {
      const prompt = buildAnswerEvaluationPrompt(
        question.questionText,
        question.expectedAnswer || '',
        question.keyPoints || [],
        userAnswer
      );

      const response = await this.openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Evaluate the answer.' },
        ],
        max_tokens: 300,
        temperature: 0.3, // Lower temperature for consistent evaluation
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from GPT');
      }

      const parsed = JSON.parse(content);

      return {
        questionId: question.id,
        isCorrect: parsed.score >= 0.7, // 70% threshold for "correct"
        score: Math.max(0, Math.min(1, parsed.score)), // Clamp to 0-1
        feedback: parsed.feedback,
        keyPointsFound: parsed.keyPointsFound || [],
        keyPointsMissed: parsed.keyPointsMissed || [],
      };
    } catch (error) {
      console.error('[AnswerEvaluator] Error evaluating open-ended:', error);

      // Fallback to basic evaluation
      return {
        questionId: question.id,
        isCorrect: false,
        score: 0.5, // Give partial credit when evaluation fails
        feedback:
          'Unable to fully evaluate your answer. Please review the expected answer.',
        keyPointsFound: [],
        keyPointsMissed: question.keyPoints || [],
      };
    }
  }

  // Quick check for objective questions (no API call needed)
  isObjectiveQuestion(questionType: ReviewerQuestionType): boolean {
    return (
      questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE'
    );
  }
}

export const answerEvaluatorService = new AnswerEvaluatorService();
