// Prompts for the Reviewer App - Question Generation and Answer Evaluation

export const QUESTION_GENERATION_PROMPT = `You are generating OSH (Occupational Safety and Health) exam questions for Philippine practitioners.

## YOUR TASK:
Generate a quiz question based on the provided knowledge context and parameters.

## QUESTION TYPE GUIDELINES:

### MULTIPLE_CHOICE:
- Create 4 options (A, B, C, D)
- Exactly ONE correct answer
- Distractors should be plausible but clearly wrong
- Avoid "all of the above" or "none of the above"

### TRUE_FALSE:
- Create a clear statement that is definitively true or false
- Avoid ambiguous wording
- Base on specific facts from the knowledge base

### OPEN_ENDED:
- Ask questions requiring explanation (50-100 words expected)
- Include 3-5 key points the answer should contain
- Focus on understanding, not just memorization

### SCENARIO_BASED:
- Present a realistic workplace scenario
- Ask what actions should be taken or what rules apply
- Include 3-5 key points for evaluation

## DIFFICULTY LEVELS:

### EASY:
- Direct recall of facts, numbers, deadlines
- Example: "What is the deadline for registering a new establishment with DOLE?"

### MEDIUM:
- Application of rules to simple situations
- Example: "A company started operations on January 15. By when must they complete DOLE registration?"

### HARD:
- Complex scenarios involving multiple rules or exceptions
- Example: "A construction company with 200 workers discovers a safety violation during an internal audit. What steps should they take and what are the potential penalties?"

## RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no explanation):
{
  "questionText": "The question text",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"], // Only for MULTIPLE_CHOICE
  "correctIndex": 0, // Only for MULTIPLE_CHOICE (0-3)
  "correctAnswer": true, // Only for TRUE_FALSE
  "expectedAnswer": "The model answer text", // Only for OPEN_ENDED/SCENARIO_BASED
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"] // For OPEN_ENDED/SCENARIO_BASED evaluation
}`;

export const ANSWER_EVALUATION_PROMPT = `You are evaluating a user's answer to an OSH (Occupational Safety and Health) exam question.

## YOUR TASK:
Evaluate the user's answer against the expected answer and key points.

## EVALUATION CRITERIA:
1. **Accuracy**: Is the information factually correct?
2. **Completeness**: Does it cover the key points?
3. **Relevance**: Does it directly address the question?
4. **Clarity**: Is the explanation clear and well-organized?

## SCORING GUIDELINES:
- 1.0: Perfect or near-perfect answer covering all key points accurately
- 0.8-0.9: Good answer with minor omissions or small errors
- 0.6-0.7: Adequate answer missing some key points
- 0.4-0.5: Partial answer with significant gaps
- 0.2-0.3: Minimal correct information
- 0.0-0.1: Incorrect or irrelevant answer

## RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no explanation):
{
  "score": 0.85,
  "isCorrect": true,
  "feedback": "Your explanation of the registration deadline was accurate. You correctly identified the 30-day requirement and the penalties for non-compliance. However, you missed mentioning the specific forms required.",
  "keyPointsFound": ["30-day deadline", "Penalties for non-compliance"],
  "keyPointsMissed": ["Required forms", "Regional Labor Office submission"]
}`;

export function buildQuestionGenerationPrompt(
  knowledgeContext: string,
  questionType: string,
  difficulty: string,
  focusArea: string,
  language: string = 'en'
): string {
  const langHint = language === 'fil'
    ? '\n\nGenerate the question in Filipino (Tagalog).'
    : language === 'mix'
    ? '\n\nGenerate the question in Taglish (mixed English/Tagalog).'
    : '';

  return `${QUESTION_GENERATION_PROMPT}

## KNOWLEDGE CONTEXT:
${knowledgeContext}

## PARAMETERS:
- Question Type: ${questionType}
- Difficulty: ${difficulty}
- Focus Area: ${focusArea}
${langHint}

Generate a ${difficulty} difficulty ${questionType.replace('_', ' ')} question about ${focusArea}.`;
}

export function buildAnswerEvaluationPrompt(
  questionText: string,
  expectedAnswer: string,
  keyPoints: string[],
  userAnswer: string
): string {
  return `${ANSWER_EVALUATION_PROMPT}

## QUESTION:
${questionText}

## EXPECTED ANSWER:
${expectedAnswer}

## KEY POINTS TO CHECK:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## USER'S ANSWER:
${userAnswer}

Evaluate the user's answer.`;
}
