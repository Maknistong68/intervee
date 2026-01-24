import { getOpenAIClient, GPT_MODEL } from '../config/openai.js';
import { OSH_KNOWLEDGE } from '../knowledge/oshKnowledgeBase.js';
import { buildQuestionGenerationPrompt } from '../prompts/reviewerPrompts.js';
import {
  DifficultyLevel,
  ReviewerQuestionType,
  GeneratedQuestion,
} from '../types/index.js';

// Map focus areas to knowledge base keys
const FOCUS_AREA_MAP: Record<string, keyof typeof OSH_KNOWLEDGE> = {
  rule1020: 'rule1020',
  rule1030: 'rule1030',
  rule1040: 'rule1040',
  rule1050: 'rule1050',
  rule1060: 'rule1060',
  rule1070: 'rule1070',
  rule1080: 'rule1080',
  rule1090: 'rule1090',
  rule1100: 'rule1100',
  rule1120: 'rule1120',
  rule1140: 'rule1140',
  rule1160: 'rule1160',
  rule1960: 'rule1960',
  ra11058: 'ra11058',
  do252: 'do252',
  do136: 'do136',
  do160: 'do160',
  do224: 'do224',
  do53: 'do53',
  do73: 'do73',
  do102: 'do102',
  do178: 'do178',
  do184: 'do184',
  do208: 'do208',
  do235: 'do235',
  da05: 'da05',
  la07: 'la07',
  la01: 'la01',
  la08: 'la08',
  la19: 'la19',
  la20: 'la20',
  la21: 'la21',
  la22: 'la22',
  la23: 'la23',
};

// Get available focus areas
export function getAvailableFocusAreas(): Array<{ key: string; title: string }> {
  return Object.keys(FOCUS_AREA_MAP).map((key) => {
    const knowledge = OSH_KNOWLEDGE[FOCUS_AREA_MAP[key]];
    return {
      key,
      title: (knowledge as any)?.title || key.toUpperCase(),
    };
  });
}

// Get knowledge context for a specific focus area
function getKnowledgeContext(focusArea: string): string {
  const key = FOCUS_AREA_MAP[focusArea];
  if (key && OSH_KNOWLEDGE[key]) {
    return JSON.stringify(OSH_KNOWLEDGE[key], null, 2);
  }
  // Return all knowledge if focus area not found
  return JSON.stringify(OSH_KNOWLEDGE, null, 2);
}

// Get a random focus area from the provided list or all available
function getRandomFocusArea(focusAreas: string[]): string {
  const validAreas = focusAreas.filter((area) => FOCUS_AREA_MAP[area]);
  if (validAreas.length === 0) {
    // Return random from all available
    const allAreas = Object.keys(FOCUS_AREA_MAP);
    return allAreas[Math.floor(Math.random() * allAreas.length)];
  }
  return validAreas[Math.floor(Math.random() * validAreas.length)];
}

export class QuestionGeneratorService {
  private openai = getOpenAIClient();

  async generateQuestion(
    questionType: ReviewerQuestionType,
    difficulty: DifficultyLevel,
    focusAreas: string[],
    language: string = 'en',
    previousQuestions: string[] = []
  ): Promise<GeneratedQuestion> {
    const focusArea = getRandomFocusArea(focusAreas);
    const knowledgeContext = getKnowledgeContext(focusArea);

    // Build the prompt
    let prompt = buildQuestionGenerationPrompt(
      knowledgeContext,
      questionType,
      difficulty,
      focusArea,
      language
    );

    // Add previous questions to avoid duplicates
    if (previousQuestions.length > 0) {
      prompt += `\n\n## AVOID THESE QUESTIONS (already asked):\n${previousQuestions
        .slice(-5) // Only last 5 to save tokens
        .map((q, i) => `${i + 1}. ${q}`)
        .join('\n')}`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the question.' },
        ],
        max_tokens: 500,
        temperature: 0.7, // Some creativity for variety
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from GPT');
      }

      const parsed = JSON.parse(content);

      // Validate and return the generated question
      return {
        questionText: parsed.questionText,
        questionType,
        difficulty,
        sourceRule: focusArea,
        options: parsed.options,
        correctIndex: parsed.correctIndex,
        correctAnswer: parsed.correctAnswer,
        expectedAnswer: parsed.expectedAnswer,
        keyPoints: parsed.keyPoints,
      };
    } catch (error) {
      console.error('[QuestionGenerator] Error generating question:', error);
      throw error;
    }
  }

  async generateMultipleQuestions(
    count: number,
    questionTypes: ReviewerQuestionType[],
    difficulty: DifficultyLevel,
    focusAreas: string[],
    language: string = 'en'
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    const previousQuestions: string[] = [];

    for (let i = 0; i < count; i++) {
      // Rotate through question types
      const questionType = questionTypes[i % questionTypes.length];

      try {
        const question = await this.generateQuestion(
          questionType,
          difficulty,
          focusAreas,
          language,
          previousQuestions
        );

        questions.push(question);
        previousQuestions.push(question.questionText);
      } catch (error) {
        console.error(
          `[QuestionGenerator] Failed to generate question ${i + 1}:`,
          error
        );
        // Continue with remaining questions
      }
    }

    return questions;
  }
}

export const questionGeneratorService = new QuestionGeneratorService();
