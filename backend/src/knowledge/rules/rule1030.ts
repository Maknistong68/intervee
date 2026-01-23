// Rule 1030 - Training of Personnel
// As amended by DO 252, s. 2025

export const RULE_1030 = {
  ruleNumber: '1030',
  title: 'Training of Personnel in Occupational Safety and Health',
  amendments: ['DO 252, s. 2025', 'DO 253, s. 2025'],

  safetyOfficerLevels: {
    SO1: {
      title: 'Safety Officer 1',
      trainingHours: 40,
      applicableTo: 'Low-risk establishments with 10-50 workers',
      topics: [
        'Basic OSH concepts and principles',
        'Hazard identification and risk assessment',
        'OSHS overview',
        'Accident investigation basics',
        'Emergency preparedness',
        'Basic first aid',
      ],
      renewal: 'Every 2 years (8-hour refresher)',
    },
    SO2: {
      title: 'Safety Officer 2',
      trainingHours: 80,
      applicableTo: 'Medium-risk establishments OR 51-199 workers',
      topics: [
        'All SO1 topics',
        'OSH program development',
        'Safety inspection techniques',
        'Detailed accident investigation',
        'Workers\' compensation',
        'Industrial hygiene basics',
        'Fire prevention',
      ],
      renewal: 'Every 2 years (16-hour refresher)',
    },
    SO3: {
      title: 'Safety Officer 3 (COSH)',
      trainingHours: 200,
      applicableTo: 'High-risk establishments OR 200+ workers OR construction',
      topics: [
        'All SO1 and SO2 topics',
        'Advanced OSH management systems',
        'Detailed industrial hygiene',
        'Occupational health surveillance',
        'Environmental monitoring',
        'OSH auditing',
        'Behavior-based safety',
        'Contractor safety management',
      ],
      renewal: 'Every 2 years (24-hour refresher)',
    },
    SO4: {
      title: 'Safety Officer 4',
      trainingHours: 'Bachelor\'s degree + experience',
      applicableTo: 'Consultants, OSH practitioners, trainers',
      topics: [
        'All previous levels',
        'OSH research',
        'Training and development',
        'Advanced OSH management',
      ],
      renewal: 'Continuing professional development',
    },
  },

  safetyOfficerRequirements: {
    highRisk: {
      workers10_50: 'SO2 (1 full-time)',
      workers51_200: 'SO2 (1 full-time) + SO1 (per shift)',
      workers201_plus: 'SO3 (1 full-time) + SO2 (per shift)',
    },
    mediumRisk: {
      workers10_50: 'SO1 (1 part-time)',
      workers51_200: 'SO2 (1 full-time)',
      workers201_plus: 'SO2 (1 full-time) + SO1 (per shift)',
    },
    lowRisk: {
      workers10_50: 'SO1 (1 part-time)',
      workers51_200: 'SO1 (1 full-time)',
      workers201_plus: 'SO2 (1 full-time)',
    },
    construction: 'SO3 (COSH) required regardless of size',
  },

  workerTraining: {
    orientation: {
      when: 'Within first day of employment',
      duration: 'Minimum 8 hours',
      topics: [
        'Company OSH policy',
        'Workplace hazards and controls',
        'Emergency procedures',
        'Use of PPE',
        'Reporting procedures',
      ],
    },
    recurring: {
      frequency: 'Annual refresher',
      duration: 'Minimum 4 hours',
      special: 'Additional training for new processes or equipment',
    },
  },

  accreditedProviders: `
    Training must be conducted by:
    - DOLE-accredited training organizations
    - DOLE-BWC
    - OSHC (Occupational Safety and Health Center)
    - In-house programs approved by DOLE
  `,

  documentation: [
    'Training certificates',
    'Attendance records',
    'Training materials used',
    'Assessment/evaluation results',
    'Record of trainers/providers',
  ],
};

export function getSafetyOfficerRequirement(riskLevel: string, workerCount: number): string {
  const req = RULE_1030.safetyOfficerRequirements;

  if (riskLevel === 'construction') {
    return 'SO3 (COSH) required - Minimum 200 hours training';
  }

  const level = riskLevel.toLowerCase() as 'highRisk' | 'mediumRisk' | 'lowRisk';
  const levelReq = req[level];

  if (!levelReq) return 'Invalid risk level specified';

  if (workerCount <= 50) return levelReq.workers10_50;
  if (workerCount <= 200) return levelReq.workers51_200;
  return levelReq.workers201_plus;
}

export function getTrainingHours(level: string): number {
  const levels: Record<string, number> = {
    SO1: 40,
    SO2: 80,
    SO3: 200,
    COSH: 200,
  };
  return levels[level.toUpperCase()] || 0;
}
