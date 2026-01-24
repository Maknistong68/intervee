# INTERVEE OSH Standards Audit

This directory contains tools for auditing AI-generated interview answers against official Philippine OSH standards.

## Quick Start

```bash
# 1. Verify knowledge base matches official standards (offline)
npm run audit:verify

# 2. Test AI answers against API (requires server running)
npm run audit

# 3. Run both (full audit)
npm run audit:all
```

## Files

| File | Description |
|------|-------------|
| `ground-truth.json` | Official OSH values from DOLE/OSHS sources |
| `test-questions.json` | 40 test questions across 4 topic areas |
| `verify-knowledge-base.ts` | Offline KB verification script |
| `run-audit.ts` | Live API testing script |

## Test Coverage

### 4 Topic Areas (40 Questions Total)

1. **Safety Officers (Rule 1030)** - 10 questions
   - SO1-SO4 training hours
   - Renewal requirements
   - Requirements by risk level
   - Construction requirements

2. **HSC/Committee (Rule 1040)** - 10 questions
   - When required (10+ workers)
   - Meeting frequency
   - Committee types A-E
   - Term of office

3. **Penalties (RA 11058)** - 10 questions
   - Fines by enterprise size
   - Willful violation penalties
   - Death/injury penalties
   - Joint liability

4. **Environmental Limits (Rule 1070)** - 10 questions
   - Noise exposure limits (90 dBA = 8 hours)
   - Illumination requirements
   - Ventilation requirements
   - Impact noise ceiling

## Question Types

- **SPECIFIC**: Exact values (e.g., "How many hours for SO2?")
- **GENERIC**: Concepts (e.g., "What are HSC duties?")
- **PROCEDURAL**: Steps (e.g., "How to organize HSC?")

## Scoring

| Status | Description |
|--------|-------------|
| PASS | All key facts present and accurate |
| PARTIAL | Some facts present, none incorrect |
| FAIL | Missing critical facts OR incorrect values |

## Severity Levels

| Severity | Description |
|----------|-------------|
| CRITICAL | Wrong legal values (penalties, training hours) |
| HIGH | Missing important requirements |
| MEDIUM | Incomplete information |
| LOW | Minor wording differences |

## Running Live API Audit

1. Start the backend server:
   ```bash
   cd backend && npm run dev
   ```

2. In another terminal, run the audit:
   ```bash
   npm run audit
   ```

3. Review generated reports in this directory.

## Output Files

After running audits, reports are generated with timestamps:

- `kb-verification-{timestamp}.md` - Offline verification results
- `audit-report-{timestamp}.md` - Live API test results
- `audit-results-{timestamp}.json` - Detailed JSON results

## Updating Ground Truth

When official standards change (e.g., new DOLE order):

1. Update `ground-truth.json` with new values
2. Run `npm run audit:verify` to check KB compliance
3. If discrepancies found, update `backend/src/knowledge/oshKnowledgeBase.ts`
4. Verify web KB sync: `web/lib/osh-knowledge.ts`

## Adding Test Questions

Edit `test-questions.json` to add new questions:

```json
{
  "id": "SO-011",
  "topic": "safety_officer",
  "type": "SPECIFIC",
  "language": "English",
  "question": "Your question here?",
  "expectedAnswer": {
    "keyFacts": ["expected", "key", "facts"],
    "citation": "Rule 1030",
    "critical": true
  }
}
```
