// Rule 1040 - Health and Safety Committee (HSC)
// As amended by DO 252, s. 2025

export const RULE_1040 = {
  ruleNumber: '1040',
  title: 'Health and Safety Committee',
  amendments: ['DO 252, s. 2025'],

  coverage: `
    Every workplace shall have a Health and Safety Committee (HSC) when:
    - Establishment has 10 or more workers
    - Hazardous workplaces regardless of number of workers
  `,

  composition: {
    chairman: 'Employer or authorized representative (top management level)',
    members: [
      'Safety Officer (Secretary of the Committee)',
      'Company Physician or First Aider (where applicable)',
      'Workers\' representative(s) - selected by legitimate labor organization or workers themselves',
    ],
    workerRepRatio: 'Equal number of worker representatives to management representatives',
  },

  qualifications: {
    chairman: 'Must have decision-making authority on OSH matters',
    safetyOfficer: 'Must be a certified Safety Officer (SO1, SO2, or SO3 depending on risk level)',
    workerRep: 'Worker in good standing, preferably with OSH training',
  },

  meetingRequirements: {
    hazardous: {
      frequency: 'Monthly',
      description: 'For high-risk establishments (construction, mining, manufacturing, etc.)',
    },
    nonHazardous: {
      frequency: 'Quarterly',
      description: 'For low-risk establishments (offices, retail, etc.)',
    },
    emergency: 'As needed after incidents or when hazardous conditions are identified',
  },

  functions: [
    'Plan and develop OSH programs for the workplace',
    'Direct accident prevention efforts and monitor implementation',
    'Conduct safety inspection of the workplace',
    'Review accident investigation reports and recommend preventive measures',
    'Submit reports to DOLE as required (Annual Medical Report, WAIR)',
    'Initiate and supervise OSH training programs',
    'Develop and maintain safety standards and procedures',
    'Monitor compliance with OSHS and related laws',
    'Promote workers\' participation in OSH activities',
    'Establish emergency procedures and evacuation plans',
  ],

  recordKeeping: {
    required: [
      'Minutes of HSC meetings',
      'Attendance records',
      'Safety inspection reports',
      'Accident investigation reports',
      'Training records',
      'Recommendations and action taken',
    ],
    retention: '5 years',
  },

  penalties: `
    Failure to organize HSC:
    - First Offense: PHP 50,000 - PHP 300,000 (depending on establishment size)
    - Subsequent Offenses: Double the penalty
    - May result in Work Stoppage Order for non-compliance
  `,
};

export function getHSCComposition(): string {
  return `
HSC Composition (Rule 1040, DO 252 s. 2025):
1. Chairman - Employer/Top Management Rep
2. Secretary - Safety Officer
3. Members:
   - Company Physician/First Aider
   - Worker Representatives (equal to management reps)

Worker reps are selected by:
- Labor union (if present), OR
- Workers themselves through election
  `.trim();
}

export function getMeetingFrequency(isHazardous: boolean): string {
  if (isHazardous) {
    return 'MONTHLY meetings required for hazardous workplaces (construction, manufacturing, mining, etc.)';
  }
  return 'QUARTERLY meetings required for non-hazardous workplaces (offices, retail, etc.)';
}

export function getHSCFunctions(): string[] {
  return RULE_1040.functions;
}
