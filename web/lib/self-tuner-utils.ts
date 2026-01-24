import type { SelfTunerQuestion, SelfTunerResult } from '@/components/types';

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
 * Select a random subset of questions
 */
export function selectRandomQuestions(
  questions: SelfTunerQuestion[],
  count: number = 30
): SelfTunerQuestion[] {
  const shuffled = shuffleQuestions(questions);
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

  const avgConfidence = results.length > 0
    ? Math.round(
        (results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length) * 100
      )
    : 0;

  let markdown = `# INTERVEE Self Tuner Results
Generated: ${timestamp}
Questions: ${results.length} | Avg Confidence: ${avgConfidence}%

---

`;

  results.forEach((result, index) => {
    markdown += `## Q${index + 1}: ${result.question.question}
**Topic**: ${result.question.topic} | **Citation**: ${result.question.citation}

`;

    if (includeAnswers) {
      markdown += `**Answer**: ${result.answer}

**Confidence**: ${Math.round((result.confidence || 0) * 100)}%

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
    markdown += `${index + 1}. ${result.question.question} (${result.question.citation})
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
 * Calculate average confidence from results
 */
export function calculateAverageConfidence(results: SelfTunerResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + (r.confidence || 0), 0);
  return sum / results.length;
}
