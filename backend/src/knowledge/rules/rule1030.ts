// Rule 1030 - Training of Personnel in Occupational Safety and Health
// Original OSHS + As amended by DO 252, s. 2025 and DO 253, s. 2025

export const RULE_1030 = {
  ruleNumber: '1030',
  title: 'Training of Personnel in Occupational Safety and Health',
  amendments: ['DO 252, s. 2025', 'DO 253, s. 2025'],

  // ===========================================
  // ORIGINAL OSHS SECTIONS
  // ===========================================
  originalSections: {
    '1031': {
      title: 'Training Programs',
      provisions: [
        {
          number: '(1)',
          content: `The Bureau, either directly or through accredited organizations, shall conduct
continuing programs to increase the supply and competence of personnel qualified to carry out
the provisions of this Standards.`,
        },
        {
          number: '(2)',
          content: `The Bureau shall prescribe the required training programs, which shall, in consultation
with the UP Institute of Public Health, World Health Organization and other technical societies,
contain provisions requiring the incorporation into the training programs of the latest trends,
practices and technology in occupational safety and health.`,
        },
      ],
    },

    '1032': {
      title: 'Accreditation',
      content: `The Secretary may issue accreditation or authority to recognized organizations or groups
of persons to conduct occupational safety and health training.`,

      '1032.01': {
        title: 'Criteria for Training',
        criteria: [
          'Bureau-prescribed course of study shall be used by accredited organizations. Any deviation requires previous approval of the Bureau.',
          'Adequate training facilities required: laboratory facilities, library, training rooms and equipment.',
          'Training staff must be recognized by the Bureau, duly trained and certified as competent by Bureau or accredited training organizations.',
        ],
      },

      '1032.02': {
        title: 'Audit Systems',
        provisions: [
          'Regular audit by Bureau to determine compliance with criteria, system/method of training, and quality/effectiveness of training staff.',
          'Secretary may cancel accreditation upon recommendation of the Director if provisions are not complied with.',
        ],
      },
    },

    '1033': {
      title: 'Training and Personnel Complement',
      provisions: [
        'Training course prescribed by Bureau is requisite for appointment of safetyman.',
        'At least the required number of supervisors/technical personnel shall take training and be appointed safety man.',
      ],

      // NOTE: Original "safetyman" terminology replaced by "Safety Officer" in DO 252 amendments
      originalSafetymanRequirements: {
        hazardous: {
          '200_and_below': '1 part-time safety man',
          'over_200_to_1000': '1 full-time safety man',
          'every_1000': '1 full-time safety man',
        },
        nonHazardous: {
          'less_than_1000': '1 part-time safety man',
          'every_1000': '1 full-time safety man',
        },
      },

      safetymanDuties: 'Duties specified under Rule 1040. Part-time safetyman shall be allotted at least 4 hours per week.',

      consultantAlternative: {
        description: 'Full-time safety man may not be required if employer contracts with qualified consultant.',
        consultantDuties: [
          'Assist, advise or guide employer in complying with Standards, including development of health and safety programs',
          'Make at least quarterly appraisal of programs and safety performance, including safety committee activities',
          'Be present during scheduled safety inspections by government agents and regular safety committee meetings',
          'Be in establishment at least 6 hours a week',
        ],
        note: 'Employment of consultant does NOT excuse employer from required training of supervisors/technical personnel.',
      },
    },

    '1034.01': {
      title: 'Qualifications of a Safety Consultant',
      qualifications: [
        'Safety and health practitioner for at least 5 years AND has taken necessary Bureau-prescribed training.',
        'Safety practitioners with at least 10 years experience in all fields of OSH may not need training IF they secure Bureau certification attesting to competence.',
        'All safety consultants or consulting organizations shall be accredited by Bureau and registered with Regional Office.',
      ],
    },

    '1034.02': {
      title: 'Prohibition in the Practice of Occupational Safety and Health',
      content: `No person or organization may be allowed, hired or otherwise employed in the practice
of occupational safety and health unless the requirements of this Rule are complied with.`,
    },
  },

  // ===========================================
  // AS AMENDED BY DO 252, s. 2025 & DO 253, s. 2025
  // "Safetyman" replaced with "Safety Officer" levels
  // ===========================================
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

  accreditedProviders: {
    description: 'Training must be conducted by:',
    providers: [
      'DOLE-accredited training organizations',
      'DOLE-BWC (Bureau of Working Conditions)',
      'OSHC (Occupational Safety and Health Center)',
      'In-house programs approved by DOLE',
    ],
    accreditationRequirements: [
      'Bureau-prescribed course of study',
      'Adequate training facilities',
      'Certified training staff',
      'Subject to regular audits',
    ],
  },

  documentation: [
    'Training certificates',
    'Attendance records',
    'Training materials used',
    'Assessment/evaluation results',
    'Record of trainers/providers',
  ],

  consultantRequirements: {
    experience: '5 years as safety and health practitioner + Bureau-prescribed training',
    alternativeExperience: '10 years experience (may waive training with Bureau certification)',
    mustBe: 'Accredited by Bureau and registered with Regional Office',
    minimumPresence: '6 hours per week in establishment',
  },
};

// Helper functions
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

export function getConsultantQualifications(): string {
  return `
Safety Consultant Qualifications (Rule 1030, Section 1034.01):
- Option 1: 5 years as OSH practitioner + Bureau-prescribed training
- Option 2: 10 years experience (may waive training with Bureau certification)
- Must be accredited by Bureau and registered with Regional Office
- Minimum 6 hours per week presence in establishment
  `.trim();
}

export function getAccreditationCriteria(): string[] {
  return [
    'Bureau-prescribed course of study (deviations require approval)',
    'Adequate training facilities (lab, library, training rooms, equipment)',
    'Training staff recognized and certified by Bureau',
    'Subject to regular audits by Bureau',
  ];
}

export function getRule1030Summary(): string {
  return `
Rule 1030 - Training of Personnel (as amended by DO 252, s. 2025):

SAFETY OFFICER LEVELS:
- SO1: 40 hours (low-risk, 10-50 workers)
- SO2: 80 hours (medium-risk OR 51-199 workers)
- SO3/COSH: 200 hours (high-risk OR 200+ workers OR construction)
- SO4: Degree + experience (consultants, trainers)

REFRESHER: Every 2 years (8-24 hours depending on level)

TRAINING PROVIDERS: Must be DOLE-accredited

CONSULTANT ALTERNATIVE: May replace full-time SO if:
- 5+ years experience + training (or 10+ years with certification)
- Minimum 6 hours/week on-site
- Does NOT excuse employer from training supervisors
  `.trim();
}
