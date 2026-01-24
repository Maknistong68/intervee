/**
 * Knowledge Base Verification Script
 * Compares oshKnowledgeBase.ts against official ground truth values
 *
 * Usage: npx tsx audit/verify-knowledge-base.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OSH_KNOWLEDGE } from '../src/knowledge/oshKnowledgeBase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Discrepancy {
  category: string;
  field: string;
  expected: any;
  actual: any;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// Helper to extract value from nested structure { value: X, citation: Y } or plain value
function getValue(obj: any): any {
  if (obj && typeof obj === 'object' && 'value' in obj) {
    return obj.value;
  }
  return obj;
}

function loadGroundTruth() {
  const groundTruthPath = path.join(__dirname, 'ground-truth.json');
  return JSON.parse(fs.readFileSync(groundTruthPath, 'utf-8'));
}

function verifySafetyOfficers(groundTruth: any): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const kb = OSH_KNOWLEDGE.rule1030;
  const gt = groundTruth.safetyOfficers;

  // Verify training hours
  const levels = ['SO1', 'SO2', 'SO3'] as const;
  for (const level of levels) {
    const gtHours = gt.levels[level]?.trainingHours;
    const kbLevel = kb.safetyOfficerLevels[level];
    const kbHours = kbLevel && 'hours' in kbLevel ? getValue(kbLevel.hours) : null;

    if (gtHours && kbHours !== null && gtHours !== kbHours) {
      discrepancies.push({
        category: 'Safety Officers',
        field: `${level} training hours`,
        expected: gtHours,
        actual: kbHours,
        severity: 'CRITICAL',
      });
    } else if (gtHours && kbHours === null) {
      discrepancies.push({
        category: 'Safety Officers',
        field: `${level} training hours`,
        expected: gtHours,
        actual: 'Not found',
        severity: 'CRITICAL',
      });
    }
  }

  // Verify renewal hours
  const renewalMapping: Record<string, number> = { SO1: 8, SO2: 16, SO3: 24 };
  for (const [level, expectedHours] of Object.entries(renewalMapping)) {
    const kbLevel = kb.safetyOfficerLevels[level as keyof typeof kb.safetyOfficerLevels];
    const kbRenewal = kbLevel && 'renewal' in kbLevel ? String(getValue(kbLevel.renewal)) : '';
    if (!kbRenewal.includes(expectedHours.toString())) {
      discrepancies.push({
        category: 'Safety Officers',
        field: `${level} renewal hours`,
        expected: `${expectedHours} hours`,
        actual: kbRenewal || 'Not found',
        severity: 'CRITICAL',
      });
    }
  }

  // Verify construction requirement
  const constructionReq = String(getValue(kb.requirementsByRisk.construction) || '');
  if (!constructionReq.toLowerCase().includes('so3')) {
    discrepancies.push({
      category: 'Safety Officers',
      field: 'Construction requirement',
      expected: 'SO3 (COSH) required regardless of size',
      actual: constructionReq || 'Not found',
      severity: 'CRITICAL',
    });
  }

  return discrepancies;
}

function verifyHSC(groundTruth: any): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const kb = OSH_KNOWLEDGE.rule1040;
  const gt = groundTruth.healthSafetyCommittee;

  // Verify when required
  const whenRequired = String(getValue(kb.whenRequired) || '');
  if (!whenRequired.includes('10')) {
    discrepancies.push({
      category: 'HSC',
      field: 'When required',
      expected: '10+ workers OR hazardous workplace',
      actual: whenRequired || 'Not found',
      severity: 'CRITICAL',
    });
  }

  // Verify meeting frequency
  const hazardousMeetings = String(getValue(kb.meetings?.hazardous) || '');
  if (!hazardousMeetings.toLowerCase().includes('monthly')) {
    discrepancies.push({
      category: 'HSC',
      field: 'Hazardous workplace meetings',
      expected: 'Monthly',
      actual: hazardousMeetings || 'Not found',
      severity: 'HIGH',
    });
  }

  const nonHazardousMeetings = String(getValue(kb.meetings?.nonHazardous) || '');
  if (!nonHazardousMeetings.toLowerCase().includes('quarterly')) {
    discrepancies.push({
      category: 'HSC',
      field: 'Non-hazardous workplace meetings',
      expected: 'Quarterly',
      actual: nonHazardousMeetings || 'Not found',
      severity: 'HIGH',
    });
  }

  // Verify HSC types exist
  const requiredTypes = ['typeA', 'typeB', 'typeC', 'typeD', 'typeE'];
  for (const type of requiredTypes) {
    if (!kb.types[type as keyof typeof kb.types]) {
      discrepancies.push({
        category: 'HSC',
        field: `HSC ${type}`,
        expected: 'Defined',
        actual: 'Missing',
        severity: 'HIGH',
      });
    }
  }

  return discrepancies;
}

function verifyPenalties(groundTruth: any): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const kb = OSH_KNOWLEDGE.ra11058;
  const gt = groundTruth.penalties;

  // Verify penalty amounts
  const offenses = ['firstOffense', 'secondOffense', 'thirdOffense'];
  const sizes = ['micro', 'small', 'medium', 'large'];

  for (const offense of offenses) {
    for (const size of sizes) {
      const gtPenalty = gt.byOffense[offense]?.[size];
      const kbPenaltyObj = kb.penalties[offense as keyof typeof kb.penalties];
      const kbPenaltySizeObj = kbPenaltyObj && typeof kbPenaltyObj === 'object'
        ? (kbPenaltyObj as Record<string, any>)[size]
        : null;
      const kbPenaltyStr = String(getValue(kbPenaltySizeObj) || '');

      if (gtPenalty && kbPenaltyStr) {
        // Extract number from KB string like "PHP 100,000"
        const kbPenalty = parseInt(kbPenaltyStr.replace(/[^0-9]/g, ''));
        if (gtPenalty !== kbPenalty) {
          discrepancies.push({
            category: 'Penalties',
            field: `${offense} - ${size}`,
            expected: `PHP ${gtPenalty.toLocaleString()}`,
            actual: kbPenaltyStr,
            severity: 'CRITICAL',
          });
        }
      } else if (gtPenalty && !kbPenaltyStr) {
        discrepancies.push({
          category: 'Penalties',
          field: `${offense} - ${size}`,
          expected: `PHP ${gtPenalty.toLocaleString()}`,
          actual: 'Not found',
          severity: 'CRITICAL',
        });
      }
    }
  }

  // Verify death/injury penalty
  const gtDeathMin = gt.deathOrInjury.minimumFine;
  const gtDeathMax = gt.deathOrInjury.maximumFine;
  const kbDeath = String(getValue(kb.penalties.deathOrInjury) || '');

  if (!kbDeath.includes('1,000,000') && !kbDeath.includes('1000000')) {
    discrepancies.push({
      category: 'Penalties',
      field: 'Death/Injury penalty (min)',
      expected: `PHP ${gtDeathMin.toLocaleString()}`,
      actual: kbDeath || 'Not found',
      severity: 'CRITICAL',
    });
  }

  // Verify willful violation
  const willfulViolation = String(getValue(kb.penalties.willfulViolation) || '');
  if (!willfulViolation.includes('6 months') || !willfulViolation.includes('6 years')) {
    discrepancies.push({
      category: 'Penalties',
      field: 'Willful violation',
      expected: '6 months to 6 years imprisonment + fine',
      actual: willfulViolation || 'Not found',
      severity: 'CRITICAL',
    });
  }

  return discrepancies;
}

function verifyEnvironmental(groundTruth: any): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const kb = OSH_KNOWLEDGE.rule1070;
  const gt = groundTruth.environmentalLimits;

  // Verify noise exposure limits
  const noiseChecks = [
    { dba: '90 dBA', hours: '8 hours' },
    { dba: '95 dBA', hours: '4 hours' },
    { dba: '100 dBA', hours: '2 hours' },
    { dba: '105 dBA', hours: '1 hour' },
  ];

  for (const check of noiseChecks) {
    const kbValue = String(getValue(kb.noise?.permissibleExposure?.[check.dba as keyof typeof kb.noise.permissibleExposure]) || '');
    if (!kbValue.includes(check.hours.split(' ')[0])) {
      discrepancies.push({
        category: 'Environmental',
        field: `Noise at ${check.dba}`,
        expected: check.hours,
        actual: kbValue || 'Not found',
        severity: 'CRITICAL',
      });
    }
  }

  // Verify impact noise ceiling
  const impactNoise = String(getValue(kb.noise?.impactNoiseCeiling) || '');
  if (!impactNoise.includes('140')) {
    discrepancies.push({
      category: 'Environmental',
      field: 'Impact noise ceiling',
      expected: '140 dB peak',
      actual: impactNoise || 'Not found',
      severity: 'CRITICAL',
    });
  }

  // Verify illumination values
  const illuminationChecks = [
    { area: 'generalWork', expected: '100' },
    { area: 'passageways', expected: '50' },
    { area: 'yardsRoadways', expected: '20' },
  ];

  for (const check of illuminationChecks) {
    const kbValue = String(getValue(kb.illumination?.[check.area as keyof typeof kb.illumination]) || '');
    if (!kbValue.includes(check.expected)) {
      discrepancies.push({
        category: 'Environmental',
        field: `Illumination - ${check.area}`,
        expected: `${check.expected} lux`,
        actual: kbValue || 'Not found',
        severity: 'HIGH',
      });
    }
  }

  // Verify ventilation
  const airSupply = String(getValue(kb.ventilation?.airSupplyPerWorker) || '');
  if (!airSupply.includes('20') || !airSupply.includes('40')) {
    discrepancies.push({
      category: 'Environmental',
      field: 'Air supply per worker',
      expected: '20-40 cubic meters/hour',
      actual: airSupply || 'Not found',
      severity: 'HIGH',
    });
  }

  return discrepancies;
}

function verifyWebKnowledgeBase(): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  try {
    // Try to read the web knowledge base
    const webKbPath = path.join(__dirname, '../../web/lib/osh-knowledge.ts');
    const webKbContent = fs.readFileSync(webKbPath, 'utf-8');

    // Check if key values exist in web KB
    const criticalValues = [
      { value: '40', context: 'SO1 hours' },
      { value: '80', context: 'SO2 hours' },
      { value: '200', context: 'SO3 hours' },
      { value: '90 dBA', context: 'noise 8 hours' },
      { value: '140', context: 'impact noise ceiling' },
      { value: '100,000', context: 'first offense small' },
    ];

    for (const check of criticalValues) {
      if (!webKbContent.includes(check.value)) {
        discrepancies.push({
          category: 'Web KB Sync',
          field: check.context,
          expected: check.value,
          actual: 'Not found in web KB',
          severity: 'MEDIUM',
        });
      }
    }
  } catch (error) {
    discrepancies.push({
      category: 'Web KB Sync',
      field: 'File access',
      expected: 'web/lib/osh-knowledge.ts readable',
      actual: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      severity: 'LOW',
    });
  }

  return discrepancies;
}

function generateVerificationReport(discrepancies: Discrepancy[]): string {
  const timestamp = new Date().toISOString();

  const critical = discrepancies.filter(d => d.severity === 'CRITICAL');
  const high = discrepancies.filter(d => d.severity === 'HIGH');
  const medium = discrepancies.filter(d => d.severity === 'MEDIUM');
  const low = discrepancies.filter(d => d.severity === 'LOW');

  let report = `# Knowledge Base Verification Report
Generated: ${timestamp}

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | ${critical.length} |
| HIGH | ${high.length} |
| MEDIUM | ${medium.length} |
| LOW | ${low.length} |
| **Total** | **${discrepancies.length}** |

`;

  if (discrepancies.length === 0) {
    report += `## Result: PASSED

All knowledge base values match the official ground truth documents.

`;
  } else {
    report += `## Discrepancies Found

`;

    if (critical.length > 0) {
      report += `### CRITICAL Issues (Incorrect Legal Values)

| Category | Field | Expected | Actual |
|----------|-------|----------|--------|
`;
      for (const d of critical) {
        report += `| ${d.category} | ${d.field} | ${d.expected} | ${d.actual} |\n`;
      }
      report += '\n';
    }

    if (high.length > 0) {
      report += `### HIGH Issues (Missing Important Requirements)

| Category | Field | Expected | Actual |
|----------|-------|----------|--------|
`;
      for (const d of high) {
        report += `| ${d.category} | ${d.field} | ${d.expected} | ${d.actual} |\n`;
      }
      report += '\n';
    }

    if (medium.length > 0) {
      report += `### MEDIUM Issues (Incomplete Information)

| Category | Field | Expected | Actual |
|----------|-------|----------|--------|
`;
      for (const d of medium) {
        report += `| ${d.category} | ${d.field} | ${d.expected} | ${d.actual} |\n`;
      }
      report += '\n';
    }

    if (low.length > 0) {
      report += `### LOW Issues (Minor Differences)

| Category | Field | Expected | Actual |
|----------|-------|----------|--------|
`;
      for (const d of low) {
        report += `| ${d.category} | ${d.field} | ${d.expected} | ${d.actual} |\n`;
      }
      report += '\n';
    }
  }

  report += `
## Verification Areas

- [${critical.filter(d => d.category === 'Safety Officers').length === 0 ? 'x' : ' '}] Safety Officer Requirements (Rule 1030)
- [${discrepancies.filter(d => d.category === 'HSC').length === 0 ? 'x' : ' '}] HSC/Committee Rules (Rule 1040)
- [${critical.filter(d => d.category === 'Penalties').length === 0 ? 'x' : ' '}] Penalties & Violations (RA 11058)
- [${critical.filter(d => d.category === 'Environmental').length === 0 ? 'x' : ' '}] Environmental Limits (Rule 1070)
- [${discrepancies.filter(d => d.category === 'Web KB Sync').length === 0 ? 'x' : ' '}] Web KB Sync Check

---
*Generated by INTERVEE Knowledge Base Verification Tool*
`;

  return report;
}

async function main() {
  console.log('========================================');
  console.log('  Knowledge Base Verification');
  console.log('========================================\n');

  // Load ground truth
  const groundTruth = loadGroundTruth();
  console.log('Loaded ground truth document\n');

  // Run verifications
  const allDiscrepancies: Discrepancy[] = [];

  console.log('Verifying Safety Officers (Rule 1030)...');
  allDiscrepancies.push(...verifySafetyOfficers(groundTruth));

  console.log('Verifying HSC (Rule 1040)...');
  allDiscrepancies.push(...verifyHSC(groundTruth));

  console.log('Verifying Penalties (RA 11058)...');
  allDiscrepancies.push(...verifyPenalties(groundTruth));

  console.log('Verifying Environmental Limits (Rule 1070)...');
  allDiscrepancies.push(...verifyEnvironmental(groundTruth));

  console.log('Verifying Web KB Sync...');
  allDiscrepancies.push(...verifyWebKnowledgeBase());

  console.log('\n========================================');
  console.log('  VERIFICATION RESULTS');
  console.log('========================================');

  const critical = allDiscrepancies.filter(d => d.severity === 'CRITICAL');
  const high = allDiscrepancies.filter(d => d.severity === 'HIGH');

  if (allDiscrepancies.length === 0) {
    console.log('\nRESULT: PASSED');
    console.log('All knowledge base values match ground truth.\n');
  } else {
    console.log(`\nRESULT: ${critical.length > 0 ? 'FAILED' : 'WARNINGS'}`);
    console.log(`Found ${allDiscrepancies.length} discrepancies:`);
    console.log(`  - CRITICAL: ${critical.length}`);
    console.log(`  - HIGH: ${high.length}`);
    console.log(`  - MEDIUM: ${allDiscrepancies.filter(d => d.severity === 'MEDIUM').length}`);
    console.log(`  - LOW: ${allDiscrepancies.filter(d => d.severity === 'LOW').length}\n`);

    if (critical.length > 0) {
      console.log('CRITICAL ISSUES:');
      for (const d of critical) {
        console.log(`  - [${d.category}] ${d.field}: Expected "${d.expected}", got "${d.actual}"`);
      }
      console.log('');
    }
  }

  // Generate and save report
  const report = generateVerificationReport(allDiscrepancies);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, `kb-verification-${timestamp}.md`);

  fs.writeFileSync(reportPath, report);
  console.log(`Report saved to: ${reportPath}\n`);

  // Exit with error if critical issues
  if (critical.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
