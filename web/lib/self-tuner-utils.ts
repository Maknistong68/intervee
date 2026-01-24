import type { SelfTunerQuestion, SelfTunerResult, Difficulty } from '@/components/types';

/**
 * Fisher-Yates shuffle algorithm for randomizing questions
 */
export function shuffleQuestions<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Filter questions by difficulty
 */
export function filterByDifficulty(
  questions: SelfTunerQuestion[],
  difficulty: Difficulty | 'mixed'
): SelfTunerQuestion[] {
  if (difficulty === 'mixed') {
    return questions;
  }
  return questions.filter((q) => q.difficulty === difficulty);
}

/**
 * Select a random subset of questions with optional difficulty filter
 */
export function selectRandomQuestions(
  questions: SelfTunerQuestion[],
  count: number = 30,
  difficulty: Difficulty | 'mixed' = 'mixed'
): SelfTunerQuestion[] {
  const filtered = filterByDifficulty(questions, difficulty);
  const shuffled = shuffleQuestions(filtered);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Format results for clipboard in Markdown format
 */
export function formatForClipboard(
  results: SelfTunerResult[],
  includeAnswers: boolean = true
): string {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Count by difficulty
  const difficultyCount = results.reduce(
    (acc, r) => {
      acc[r.question.difficulty] = (acc[r.question.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const difficultyStr = Object.entries(difficultyCount)
    .map(([d, c]) => `${d}: ${c}`)
    .join(' | ');

  let markdown = `# INTERVEE Self Tuner Results
Generated: ${timestamp}
Questions: ${results.length} (${difficultyStr})

---

`;

  results.forEach((result, index) => {
    const difficultyBadge = result.question.difficulty.toUpperCase();
    const typeBadge = result.question.type;

    markdown += `## Q${index + 1}: ${result.question.question}
**Topic**: ${result.question.topic} | **Citation**: ${result.question.citation}
**Difficulty**: ${difficultyBadge} | **Type**: ${typeBadge}

`;

    if (includeAnswers) {
      markdown += `**Answer**: ${result.answer}

`;
    }

    markdown += `---

`;
  });

  return markdown;
}

/**
 * Format only questions for clipboard
 */
export function formatQuestionsOnly(results: SelfTunerResult[]): string {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let markdown = `# INTERVEE Self Tuner Questions
Generated: ${timestamp}
Total Questions: ${results.length}

---

`;

  results.forEach((result, index) => {
    const difficultyBadge = `[${result.question.difficulty.toUpperCase()}]`;
    markdown += `${index + 1}. ${difficultyBadge} ${result.question.question} (${result.question.citation})
`;
  });

  return markdown;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Get difficulty color class
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'hard':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Get question type badge color
 */
export function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'SITUATIONAL':
      return 'bg-purple-500/20 text-purple-400';
    case 'TRICKY':
      return 'bg-orange-500/20 text-orange-400';
    case 'PROCEDURAL':
      return 'bg-blue-500/20 text-blue-400';
    case 'SPECIFIC':
      return 'bg-cyan-500/20 text-cyan-400';
    case 'GENERIC':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}
