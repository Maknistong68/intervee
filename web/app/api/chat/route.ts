import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OSH_EXPERT_PROMPT } from '@/lib/osh-prompt';

// Demo responses for when API key is not configured
const DEMO_RESPONSES: Record<string, string> = {
  'rule 1040': `**Rule 1040 - Health and Safety Committee (HSC)**

Per DO 252, s. 2025, every establishment with **10 or more workers** must have an HSC.

**Composition:**
• Chairman - Employer/Top Management Representative
• Secretary - Safety Officer
• Members - Company Physician, Workers' Representatives

**Meeting Frequency:**
• **Monthly** - Hazardous workplaces (construction, manufacturing)
• **Quarterly** - Non-hazardous workplaces (offices, retail)

**Key Functions:**
1. Develop OSH programs
2. Conduct safety inspections
3. Investigate accidents
4. Review and recommend preventive measures`,

  'hsc': `**Health and Safety Committee (HSC) - Rule 1040**

**Required for:** Establishments with 10+ workers

**Composition:**
• Chairman: Employer representative (decision-making authority)
• Secretary: Certified Safety Officer
• Members: Company Physician + Workers' Representatives

**Worker representatives** must equal management representatives and are selected by:
- Labor union (if present), OR
- Workers themselves through election

**Meetings:** Monthly (hazardous) or Quarterly (non-hazardous)`,

  'safety officer': `**Safety Officer Requirements - Rule 1030 (DO 252, s. 2025)**

**Training Levels:**
• **SO1:** 40 hours - Low-risk, 10-50 workers
• **SO2:** 80 hours - Medium-risk OR 51-199 workers
• **SO3/COSH:** 200 hours - High-risk OR 200+ workers OR construction

**Refresher Training:** Every 2 years

**Construction:** Always requires SO3 (COSH) regardless of size

**Key Duties:**
1. Implement OSH programs
2. Conduct safety inspections
3. Investigate accidents
4. Maintain safety records
5. Serve as HSC Secretary`,

  'ppe': `**PPE Requirements - Rule 1080**

Per **RA 11058**, PPE must be provided **FREE OF CHARGE** by the employer.

**Types of PPE:**
• **Head:** Hard hats, bump caps
• **Eye:** Safety glasses, goggles, face shields
• **Hearing:** Earplugs, earmuffs (above 85 dB)
• **Respiratory:** N95, respirators
• **Hand:** Gloves (cut, chemical, electrical resistant)
• **Foot:** Steel-toe boots, metatarsal guards
• **Body:** Coveralls, high-vis vests
• **Fall:** Full body harness (above 1.8m)

**Employer Duties:**
1. Assess hazards and select appropriate PPE
2. Provide at no cost
3. Train workers on proper use
4. Maintain and replace as needed`,

  'penalty': `**Penalties under RA 11058**

**Administrative Fines (per violation):**

| Offense | Micro | Small | Medium | Large |
|---------|-------|-------|--------|-------|
| 1st | ₱50,000 | ₱100,000 | ₱200,000 | ₱300,000 |
| 2nd | ₱100,000 | ₱200,000 | ₱400,000 | ₱600,000 |
| 3rd | ₱200,000 | ₱400,000 | ₱800,000 | ₱1,000,000 |

**Serious Violations:**
• Death/Serious Injury: ₱1M - ₱5M
• Willful Violation: **Criminal liability** (6 months - 6 years imprisonment)

**DOLE Authority:**
• Can issue **Work Stoppage Orders** for imminent danger`,

  'rule 1020': `**Rule 1020 - Registration of Establishments**

Per RA 11058, ALL establishments must register with DOLE within **30 days** of operation.

**Registration Requirements:**
• Submit via OSHS Online Portal (https://oshs.dole.gov.ph)
• Provide business permit, floor plan, employee count
• Indicate nature of business and hazard classification

**Annual Renewal:**
• Must renew every January
• Update employee count and safety officer assignment
• Report any change in operations

**Penalties for Non-Registration:**
• First offense: ₱50,000 - ₱100,000
• Subsequent: Up to ₱500,000`,

  'rule 1050': `**Rule 1050 - Notification & Recordkeeping (DO 252, s. 2025)**

**Accident Reporting (WAIR):**
• Submit Work Accident/Illness Report within **5 calendar days**
• Use DOLE-BWC Form WAIR online or manual
• Include: date, time, cause, injuries, corrective actions

**Zero Accident Reporting:**
• Even with no accidents, submit monthly zero-accident report
• Required for establishments with 200+ workers

**Recordkeeping Requirements:**
• Maintain OSH records for **5 years minimum**
• Keep: training records, accident logs, inspection reports
• Must be available for DOLE inspection

**Minutes of HSC Meetings:**
• Keep all meeting minutes
• Document action items and resolutions`,

  'rule 1070': `**Rule 1070 - Occupational Health & Environmental Control**

**Hazard Control Hierarchy (in order of priority):**
1. **Elimination** - Remove the hazard completely
2. **Substitution** - Replace with less hazardous alternative
3. **Engineering Controls** - Isolate workers from hazard
4. **Administrative Controls** - Change work procedures
5. **PPE** - Last resort, personal protective equipment

**Workplace Monitoring:**
• Measure noise levels (limit: 85 dB for 8 hours)
• Monitor air quality (dust, fumes, chemicals)
• Assess lighting, ventilation, temperature

**Threshold Limit Values (TLVs):**
• Must comply with DOLE-prescribed exposure limits
• Regular monitoring required for hazardous workplaces`,

  'rule 1090': `**Rule 1090 - Hazardous Materials**

**GHS Labeling Requirements:**
• All hazardous chemicals must have GHS-compliant labels
• Include: pictograms, signal words, hazard statements
• Labels must be in English and Filipino

**Safety Data Sheets (SDS):**
• 16-section SDS required for all hazardous materials
• Must be accessible to all workers
• Update when new information available

**Storage Requirements:**
• Segregate incompatible chemicals
• Provide proper ventilation
• Install spill containment
• Post warning signs

**Emergency Procedures:**
• Written spill response procedures
• First aid measures readily available
• Emergency contact numbers posted`,

  'construction': `**Construction Safety - DO 198, s. 2018**

**Mandatory Requirements:**
• Safety Officer 3 (COSH - 200 hours) required regardless of size
• Full-time safety officer for projects with 200+ workers
• Daily toolbox meetings mandatory

**Fall Protection (Rule 1080):**
• Required at heights of **1.8 meters or more**
• Full body harness with proper anchor points
• Guardrails, safety nets, or fall arrest systems

**Scaffold Safety:**
• Only trained workers can erect scaffolds
• Inspect before each shift
• Load capacity clearly marked
• Guardrails on all open sides

**Excavation Safety:**
• Shore trenches deeper than 1.2 meters
• Provide safe access/egress every 7.5 meters
• Keep excavated material 1 meter from edge`,

  'first aid': `**First Aid & Medical Requirements - Rule 1960**

**First Aid Kit Requirements:**
• All establishments must have first aid kit
• Contents based on establishment size
• Replenish supplies as used

**Company Physician Requirements:**
• 1-50 workers: Part-time physician OR retainer
• 51-200 workers: Part-time physician (min 4 hrs/week)
• 201+ workers: Full-time physician

**Medical Examinations:**
• **Pre-employment**: Before starting work
• **Annual**: Yearly for all workers
• **Exit**: Upon separation from company
• **Return-to-work**: After extended illness

**Emergency Medical Response:**
• Posted emergency numbers
• Trained first aiders (1 per 25 workers minimum)
• Clear evacuation procedures`,

  'default': `**Philippine OSH Key Points**

Based on **RA 11058** and **OSHS Rules 1020-1960**:

**Key Requirements:**
• **Registration (Rule 1020):** Within 30 days of operation
• **HSC (Rule 1040):** Required for 10+ workers
• **Safety Officer (Rule 1030):** SO1/SO2/SO3 based on risk level
• **PPE (Rule 1080):** Free provision by employer
• **Accident Reporting (Rule 1050):** Within 5 days via WAIR

**Employer Duties:**
1. Provide safe workplace
2. Free PPE and training
3. Report accidents to DOLE
4. Maintain 5-year records

**Worker Rights:**
• Know workplace hazards
• Refuse unsafe work
• Report to DOLE

For specific questions, please ask about: HSC, Safety Officer, PPE, Registration, Penalties, or specific Rule numbers.`
};

function getDemoResponse(question: string): string {
  const q = question.toLowerCase();

  // Existing triggers
  if (q.includes('1040') || q.includes('committee')) return DEMO_RESPONSES['rule 1040'];
  if (q.includes('hsc') || q.includes('health and safety committee')) return DEMO_RESPONSES['hsc'];
  if (q.includes('safety officer') || q.includes('1030') || q.includes('training')) return DEMO_RESPONSES['safety officer'];
  if (q.includes('ppe') || q.includes('protective') || q.includes('1080')) return DEMO_RESPONSES['ppe'];
  if (q.includes('penalty') || q.includes('fine') || q.includes('violation')) return DEMO_RESPONSES['penalty'];

  // New demo response triggers
  if (q.includes('1020') || q.includes('registration') || q.includes('register')) return DEMO_RESPONSES['rule 1020'];
  if (q.includes('1050') || q.includes('wair') || q.includes('accident report') || q.includes('notification')) return DEMO_RESPONSES['rule 1050'];
  if (q.includes('1070') || q.includes('hierarchy') || q.includes('control') || q.includes('environment')) return DEMO_RESPONSES['rule 1070'];
  if (q.includes('1090') || q.includes('hazardous material') || q.includes('chemical') || q.includes('ghs') || q.includes('sds')) return DEMO_RESPONSES['rule 1090'];
  if (q.includes('construction') || q.includes('scaffold') || q.includes('excavation') || q.includes('do 198')) return DEMO_RESPONSES['construction'];
  if (q.includes('first aid') || q.includes('physician') || q.includes('medical') || q.includes('1960')) return DEMO_RESPONSES['first aid'];

  return DEMO_RESPONSES['default'];
}

export async function POST(request: NextRequest) {
  let question = ''; // Store parsed question at top level to avoid double request.json()

  try {
    const body = await request.json();
    question = body.question; // Save for potential fallback use

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return demo response
      const demoAnswer = getDemoResponse(question);
      return NextResponse.json({
        answer: demoAnswer,
        confidence: 0.85,
        responseTimeMs: 150,
        demo: true,
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000, // 10 second timeout
      maxRetries: 2,  // Retry up to 2 times
    });

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: OSH_EXPERT_PROMPT },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = response.choices[0]?.message?.content || '';
    const responseTimeMs = Date.now() - startTime;

    // Calculate confidence based on citations
    let confidence = 0.75;
    if (answer.match(/Rule\s+\d{4}/i)) confidence += 0.1;
    if (answer.match(/DO\s+\d+/i)) confidence += 0.05;
    if (answer.match(/RA\s+11058/i)) confidence += 0.05;
    confidence = Math.min(confidence, 0.95);

    return NextResponse.json({
      answer,
      confidence,
      responseTimeMs,
      demo: false,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);

    // If OpenAI error, fall back to demo using already-parsed question
    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      const demoAnswer = getDemoResponse(question || '');
      return NextResponse.json({
        answer: demoAnswer,
        confidence: 0.85,
        responseTimeMs: 100,
        demo: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to generate answer. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'INTERVEE OSH Assistant',
    apiConfigured: !!process.env.OPENAI_API_KEY,
  });
}
