/**
 * OSH Standards Audit Test Runner
 * Tests AI-generated answers against official Philippine OSH standards
 *
 * Usage: npx ts-node audit/run-audit.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExpectedAnswer {
  keyFacts: string[];
  citation: string;
  critical: boolean;
}

interface TestQuestion {
  id: string;
  topic: string;
  type: 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL';
  language: string;
  question: string;
  expectedAnswer: ExpectedAnswer;
}

interface TestResult {
  id: string;
  topic: string;
  type: string;
  language: string;
  question: string;
  aiAnswer: string;
  expectedKeyFacts: string[];
  foundKeyFacts: string[];
  missingKeyFacts: string[];
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | null;
  responseTimeMs: number;
  citationFound: boolean;
  notes: string;
}

interface AuditSummary {
  totalQuestions: number;
  passed: number;
  partial: number;
  failed: number;
  passRate: number;
  byTopic: Record<string, { total: number; passed: number; failed: number; partial: number }>;
  byType: Record<string, { total: number; passed: number; failed: number; partial: number }>;
  criticalIssues: TestResult[];
  averageResponseTime: number;
}

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testQuestion(question: TestQuestion): Promise<TestResult> {
  const startTime = Date.now();
  let aiAnswer = '';
  let responseTimeMs = 0;

  try {
    const response = await fetch(`${API_BASE_URL}/api/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.question,
        sessionId: `audit-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    aiAnswer = data.answer || '';
    responseTimeMs = data.responseTimeMs || (Date.now() - startTime);
  } catch (error) {
    aiAnswer = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    responseTimeMs = Date.now() - startTime;
  }

  // Analyze the answer against expected key facts
  const answerLower = aiAnswer.toLowerCase();
  const foundKeyFacts: string[] = [];
  const missingKeyFacts: string[] = [];

  for (const fact of question.expectedAnswer.keyFacts) {
    const factLower = fact.toLowerCase();
    // Check for exact match or numeric match
    const factVariants = [factLower];

    // Add number variants (e.g., "40" should match "40 hours", "forty")
    const numMatch = fact.match(/\d+/);
    if (numMatch) {
      factVariants.push(numMatch[0]);
    }

    // Check if any variant is found
    const isFound = factVariants.some(variant => answerLower.includes(variant));

    if (isFound) {
      foundKeyFacts.push(fact);
    } else {
      missingKeyFacts.push(fact);
    }
  }

  // Check if citation is mentioned
  const citationLower = question.expectedAnswer.citation.toLowerCase();
  const citationFound = answerLower.includes(citationLower) ||
                        answerLower.includes(citationLower.replace(' ', ''));

  // Determine status
  let status: 'PASS' | 'PARTIAL' | 'FAIL';
  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
  let notes = '';

  const factFoundRatio = foundKeyFacts.length / question.expectedAnswer.keyFacts.length;

  if (factFoundRatio === 1) {
    status = 'PASS';
    notes = 'All key facts present';
  } else if (factFoundRatio >= 0.5) {
    status = 'PARTIAL';
    notes = `Missing: ${missingKeyFacts.join(', ')}`;
    severity = question.expectedAnswer.critical ? 'HIGH' : 'MEDIUM';
  } else {
    status = 'FAIL';
    notes = `Missing critical facts: ${missingKeyFacts.join(', ')}`;
    severity = question.expectedAnswer.critical ? 'CRITICAL' : 'HIGH';
  }

  // Check for errors
  if (aiAnswer.startsWith('ERROR:')) {
    status = 'FAIL';
    severity = 'CRITICAL';
    notes = aiAnswer;
  }

  return {
    id: question.id,
    topic: question.topic,
    type: question.type,
    language: question.language,
    question: question.question,
    aiAnswer,
    expectedKeyFacts: question.expectedAnswer.keyFacts,
    foundKeyFacts,
    missingKeyFacts,
    status,
    severity,
    responseTimeMs,
    citationFound,
    notes,
  };
}

function generateSummary(results: TestResult[]): AuditSummary {
  const summary: AuditSummary = {
    totalQuestions: results.length,
    passed: 0,
    partial: 0,
    failed: 0,
    passRate: 0,
    byTopic: {},
    byType: {},
    criticalIssues: [],
    averageResponseTime: 0,
  };

  let totalTime = 0;

  for (const result of results) {
    totalTime += result.responseTimeMs;

    // Count by status
    if (result.status === 'PASS') summary.passed++;
    else if (result.status === 'PARTIAL') summary.partial++;
    else summary.failed++;

    // Track critical issues
    if (result.severity === 'CRITICAL') {
      summary.criticalIssues.push(result);
    }

    // By topic
    if (!summary.byTopic[result.topic]) {
      summary.byTopic[result.topic] = { total: 0, passed: 0, failed: 0, partial: 0 };
    }
    summary.byTopic[result.topic].total++;
    if (result.status === 'PASS') summary.byTopic[result.topic].passed++;
    else if (result.status === 'PARTIAL') summary.byTopic[result.topic].partial++;
    else summary.byTopic[result.topic].failed++;

    // By type
    if (!summary.byType[result.type]) {
      summary.byType[result.type] = { total: 0, passed: 0, failed: 0, partial: 0 };
    }
    summary.byType[result.type].total++;
    if (result.status === 'PASS') summary.byType[result.type].passed++;
    else if (result.status === 'PARTIAL') summary.byType[result.type].partial++;
    else summary.byType[result.type].failed++;
  }

  summary.passRate = (summary.passed / summary.totalQuestions) * 100;
  summary.averageResponseTime = totalTime / results.length;

  return summary;
}

function generateReport(results: TestResult[], summary: AuditSummary): string {
  const timestamp = new Date().toISOString();

  let report = `# OSH Standards Audit Report
Generated: ${timestamp}

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Questions | ${summary.totalQuestions} |
| Passed | ${summary.passed} (${summary.passRate.toFixed(1)}%) |
| Partial | ${summary.partial} |
| Failed | ${summary.failed} |
| Average Response Time | ${summary.averageResponseTime.toFixed(0)}ms |
| Critical Issues | ${summary.criticalIssues.length} |

## Results by Topic

| Topic | Total | Pass | Partial | Fail | Rate |
|-------|-------|------|---------|------|------|
`;

  for (const [topic, data] of Object.entries(summary.byTopic)) {
    const rate = ((data.passed / data.total) * 100).toFixed(1);
    report += `| ${topic} | ${data.total} | ${data.passed} | ${data.partial} | ${data.failed} | ${rate}% |\n`;
  }

  report += `
## Results by Question Type

| Type | Total | Pass | Partial | Fail | Rate |
|------|-------|------|---------|------|------|
`;

  for (const [type, data] of Object.entries(summary.byType)) {
    const rate = ((data.passed / data.total) * 100).toFixed(1);
    report += `| ${type} | ${data.total} | ${data.passed} | ${data.partial} | ${data.failed} | ${rate}% |\n`;
  }

  if (summary.criticalIssues.length > 0) {
    report += `
## Critical Issues

The following questions have CRITICAL discrepancies that should be addressed immediately:

`;
    for (const issue of summary.criticalIssues) {
      report += `### ${issue.id}: ${issue.question}

- **Expected**: ${issue.expectedKeyFacts.join(', ')}
- **Missing**: ${issue.missingKeyFacts.join(', ')}
- **AI Answer**: ${issue.aiAnswer.substring(0, 200)}${issue.aiAnswer.length > 200 ? '...' : ''}
- **Notes**: ${issue.notes}

`;
    }
  }

  report += `
## Detailed Results

| ID | Topic | Type | Status | Severity | Time | Notes |
|----|-------|------|--------|----------|------|-------|
`;

  for (const result of results) {
    const statusEmoji = result.status === 'PASS' ? 'PASS' : result.status === 'PARTIAL' ? 'PARTIAL' : 'FAIL';
    const severity = result.severity || '-';
    const notes = result.notes.length > 50 ? result.notes.substring(0, 47) + '...' : result.notes;
    report += `| ${result.id} | ${result.topic} | ${result.type} | ${statusEmoji} | ${severity} | ${result.responseTimeMs}ms | ${notes} |\n`;
  }

  report += `
## Recommendations

`;

  // Generate recommendations based on results
  const recommendations: string[] = [];

  // Check topic-specific issues
  for (const [topic, data] of Object.entries(summary.byTopic)) {
    const failRate = (data.failed + data.partial) / data.total;
    if (failRate > 0.3) {
      recommendations.push(`- Review knowledge base entries for **${topic}** topic - ${((1-failRate)*100).toFixed(0)}% accuracy`);
    }
  }

  // Check type-specific issues
  for (const [type, data] of Object.entries(summary.byType)) {
    if (data.failed > data.passed) {
      recommendations.push(`- Improve handling of **${type}** questions`);
    }
  }

  // General recommendations
  if (summary.criticalIssues.length > 0) {
    recommendations.push(`- **URGENT**: Fix ${summary.criticalIssues.length} critical issues with incorrect legal values`);
  }

  if (summary.averageResponseTime > 2000) {
    recommendations.push(`- Optimize response time (currently ${summary.averageResponseTime.toFixed(0)}ms average)`);
  }

  if (recommendations.length === 0) {
    recommendations.push('- Knowledge base is performing well. Continue regular audits.');
  }

  report += recommendations.join('\n');

  report += `

---
*This audit was generated automatically by the INTERVEE OSH Standards Audit Tool*
`;

  return report;
}

async function runAudit() {
  console.log('========================================');
  console.log('  INTERVEE OSH Standards Audit');
  console.log('========================================\n');

  // Load test questions
  const questionsPath = path.join(__dirname, 'test-questions.json');

  if (!fs.existsSync(questionsPath)) {
    console.error('Error: test-questions.json not found');
    process.exit(1);
  }

  const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  const questions: TestQuestion[] = questionsData.questions;

  console.log(`Loaded ${questions.length} test questions\n`);
  console.log(`Testing against: ${API_BASE_URL}\n`);

  // Run tests
  const results: TestResult[] = [];
  let completed = 0;

  for (const question of questions) {
    process.stdout.write(`\rTesting: ${completed + 1}/${questions.length} - ${question.id}`);

    const result = await testQuestion(question);
    results.push(result);
    completed++;

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n\nTests completed!\n');

  // Generate summary
  const summary = generateSummary(results);

  // Display summary
  console.log('========================================');
  console.log('  AUDIT SUMMARY');
  console.log('========================================');
  console.log(`Total: ${summary.totalQuestions}`);
  console.log(`Passed: ${summary.passed} (${summary.passRate.toFixed(1)}%)`);
  console.log(`Partial: ${summary.partial}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Critical Issues: ${summary.criticalIssues.length}`);
  console.log(`Avg Response Time: ${summary.averageResponseTime.toFixed(0)}ms`);
  console.log('========================================\n');

  // Generate and save report
  const report = generateReport(results, summary);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, `audit-report-${timestamp}.md`);

  fs.writeFileSync(reportPath, report);
  console.log(`Report saved to: ${reportPath}\n`);

  // Save detailed results as JSON
  const resultsPath = path.join(__dirname, `audit-results-${timestamp}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify({ summary, results }, null, 2));
  console.log(`Detailed results saved to: ${resultsPath}\n`);

  // Exit with error code if critical issues found
  if (summary.criticalIssues.length > 0) {
    console.log('\nWARNING: Critical issues found! Review the report for details.\n');
    process.exit(1);
  }

  console.log('Audit completed successfully!\n');
}

// Run if executed directly
runAudit().catch(console.error);
