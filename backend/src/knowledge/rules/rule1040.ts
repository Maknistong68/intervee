// Rule 1040 - Health and Safety Committee (HSC)
// Original OSHS + As amended by DO 252, s. 2025

export const RULE_1040 = {
  ruleNumber: '1040',
  title: 'Health and Safety Committee',
  amendments: ['DO 252, s. 2025'],

  // ===========================================
  // ORIGINAL OSHS SECTIONS
  // ===========================================
  originalSections: {
    '1041': {
      title: 'General Requirements',
      content: `In every place of employment, a health and safety committee shall be organized within
sixty (60) days after this Standards takes effect and for new establishments within one (1) month
from the date the business starts operating. In both cases the Committee shall reorganize every
January of the following year.`,
      keyPoints: [
        'Existing establishments: Organize within 60 days of Standards effectivity',
        'New establishments: Organize within 1 month of starting operations',
        'Reorganize every January',
      ],
    },

    '1042': {
      title: 'Types and Composition of Health and Safety Committee',

      typeA: {
        section: '1042.01',
        title: 'Type A',
        applicableTo: 'Over 400 workers',
        composition: {
          chairman: 'Manager or authorized representative (must be top operating official)',
          members: [
            'Two (2) department heads',
            'Four (4) workers (must be union members, if organized)',
            'Company physician',
          ],
          secretary: 'Safety man',
        },
        totalMembers: 8,
      },

      typeB: {
        section: '1042.02',
        title: 'Type B',
        applicableTo: '200 to 400 workers',
        composition: {
          chairman: 'Manager or authorized representative (must be top operating official)',
          members: [
            'One (1) supervisor',
            'Three (3) workers (must be union members, if organized)',
            'Company physician or company nurse',
          ],
          secretary: 'Safety man',
        },
        totalMembers: 6,
      },

      typeC: {
        section: '1042.03',
        title: 'Type C',
        applicableTo: '100 to 200 workers',
        composition: {
          chairman: 'Manager or authorized representative',
          members: [
            'One (1) foreman',
            'Three (3) workers (must be union members, if organized)',
            'Nurse',
          ],
          secretary: 'Part-time safety man',
        },
        totalMembers: 6,
      },

      typeD: {
        section: '1042.04',
        title: 'Type D',
        applicableTo: 'Less than 100 workers',
        composition: {
          chairman: 'Manager',
          members: [
            'One (1) foreman',
            'Three (3) workers (must be union members, if organized)',
            'Nurse/First-aider',
          ],
          secretary: 'Part-time safety man',
        },
        totalMembers: 6,
        note: 'Line type organization (1048.01) may be organized in this workplace',
      },

      typeE: {
        section: '1042.05',
        title: 'Type E - Joint Committee',
        applicableTo: 'Two or more establishments housed under one building',
        description: `Health and safety committees in each workplace shall form a Joint Coordinating
Committee to plan and implement programs concerning all establishments.`,
        composition: {
          chairman: 'Chairman of one establishment committee',
          members: [
            'Two (2) supervisors from two different establishments',
            'Two (2) workers from two different establishments (union members, if organized)',
          ],
          secretary: 'Appointed by Chairman (in high-rise: building administrator)',
        },
      },

      membershipRules: {
        section: '1042.06',
        title: 'Membership of Committee',
        rules: [
          'Membership numbers are MINIMUM requirements - may increase as necessary',
          'Where workers are not organized (no union), they shall be selected by simple majority vote of workers',
        ],
      },
    },

    '1043': {
      title: 'Duties of the Health and Safety Committee',
      description: 'The HSC is the planning and policymaking group in all matters pertaining to safety and health.',
      duties: [
        'Plans and develops accident prevention programs for the establishment',
        'Directs accident prevention efforts in accordance with safety programs, safety performance, and government regulations',
        'Conducts safety meetings at least once a month',
        'Reviews reports of inspection, accident investigations, and implementation of programs',
        'Submits reports to the manager on its meetings and activities',
        'Provides necessary assistance to government inspecting authorities',
        'Initiates and supervises safety training for employees',
        'Develops and maintains a disaster contingency plan and organizes emergency service units (per Office of Civil Defense emergency preparedness manual)',
      ],
    },

    '1044': {
      title: 'Term of Office of Members',

      '1044.01': {
        title: 'Health and Safety Committee',
        terms: {
          departmentHead: '1 year',
          workerMembers: {
            typeAandB: '2 years each',
            typeCDandE: '1 year',
          },
          permanentMembers: 'Chairman, physician/nurse, and safety man are PERMANENT members',
        },
        purpose: 'Periodic change in membership provides opportunity for other workers to participate in safety program planning',
      },

      '1044.02': {
        title: 'Joint Committee',
        terms: {
          chairman: '1 year',
          members: '1 year',
        },
        note: 'Membership shall be rotated among members of HSCs in other establishments',
      },
    },

    '1045': {
      title: 'Duties of the Employers',
      description: `Health and Safety committees play very important roles in eliminating work hazards.
Developing workers' interest and participation is the responsibility of the employer. The employer
must exercise necessary leadership and provide support to make the program work.`,
      duties: [
        'Establishes and adopts in writing administrative policies on safety in conformity with Standards, outlining responsibility and authority delegated',
        'Reports to enforcing authority in 2 copies: policies adopted and HSC organization established - within 1 month after organization/reorganization',
        'Reports to enforcing authority at least once every 3 months (counting from January): health and safety program, activities undertaken, safety performance, HSC meetings, recommendations, and measures taken',
        'Acts on recommended measures by HSC by adopting elements in production process/workplace; if non-adoption, inform committee of reasons',
      ],
    },

    '1046': {
      title: 'Duties of the Workers',
      duties: [
        'Works in accordance with accepted safety practices and standards established by employer',
        'Reports unsafe conditions and practices to supervisor by making suggestions for correction or removal of hazards',
        'Serves as members of the Health and Safety Committee',
        'Cooperates actively with the Health and Safety Committee',
        'Assists government agencies in conduct of health and safety inspection or other programs',
      ],
    },

    '1047': {
      title: 'Duties of the Safety Man',
      description: `The principal function of the Safety Man is to act as the employer's principal assistant
and consultant in the application of programs to remove hazards and correct unsafe work practices.`,
      duties: [
        {
          duty: 'Serves as Secretary to the Health and Safety Committee',
          subDuties: [
            'Prepare minutes of meetings',
            'Report status of recommendations made',
            'Notify members of meetings',
            'Submit to employer a report of committee activities including recommendations',
          ],
        },
        'Acts in advisory capacity on all matters pertaining to health and safety for guidance of employer and workers',
        'Conducts investigation of accidents as member of HSC and submits separate report and analysis to employer',
        'Coordinates all health and safety training programs for employees and employer',
        'Conducts health and safety inspection as member of committee',
        'Maintains or helps maintain efficient accident record system and coordinates actions by supervisors to eliminate accident causes',
        'Provides assistance to government agencies in safety and health inspection, accident investigation, or related programs',
        'For full-time safety man: shall report directly to the employer for effectiveness',
      ],
    },

    '1048': {
      title: 'Other Types of Health and Safety Organizations',
      description: 'Subject to approval of Secretary or authorized representative, employer may establish:',

      '1048.01': {
        title: 'Line Type',
        description: `A form of organization where the general manager or head of establishment directs
health and safety programs and assumes overall responsibility for safety. He delegates application
of programs to plant personnel occupying line positions.`,
      },

      '1048.02': {
        title: 'Staff Type',
        description: `Staff safety organization or safety engineer type consists of a line organization
with specialized personnel employed to advise and assist management in all matters of safety.
Said personnel are responsible to top executive exercising staff functions, serve all departments
in advisory capacity, and supervise application of health and safety program.`,
      },
    },
  },

  // ===========================================
  // QUICK REFERENCE (AS AMENDED BY DO 252, s. 2025)
  // ===========================================
  coverage: {
    description: 'Every workplace shall have a Health and Safety Committee (HSC) when:',
    requirements: [
      'Establishment has 10 or more workers',
      'Hazardous workplaces regardless of number of workers',
    ],
  },

  compositionByWorkerCount: {
    over400: {
      type: 'A',
      chairman: 'Top management representative',
      secretary: 'Safety Officer',
      members: ['2 department heads', '4 workers', 'Company physician'],
    },
    '200to400': {
      type: 'B',
      chairman: 'Top management representative',
      secretary: 'Safety Officer',
      members: ['1 supervisor', '3 workers', 'Physician or nurse'],
    },
    '100to200': {
      type: 'C',
      chairman: 'Manager or representative',
      secretary: 'Part-time Safety Officer',
      members: ['1 foreman', '3 workers', 'Nurse'],
    },
    under100: {
      type: 'D',
      chairman: 'Manager',
      secretary: 'Part-time Safety Officer',
      members: ['1 foreman', '3 workers', 'Nurse/First-aider'],
    },
    multipleEstablishments: {
      type: 'E (Joint)',
      description: 'Joint Coordinating Committee for multiple establishments in one building',
    },
  },

  meetingRequirements: {
    minimum: 'At least once a month',
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

  workerRepresentativeSelection: {
    withUnion: 'Must be union members',
    withoutUnion: 'Selected by simple majority vote of workers',
    ratio: 'Equal number of worker representatives to management representatives',
  },

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

  reportingToEnforcingAuthority: {
    initial: 'Within 1 month after organization/reorganization - policies and HSC organization (2 copies)',
    quarterly: 'Every 3 months (from January) - program, activities, performance, meetings, recommendations, measures taken',
  },

  penalties: {
    description: 'Failure to organize HSC:',
    firstOffense: 'PHP 50,000 - PHP 300,000 (depending on establishment size)',
    subsequent: 'Double the penalty',
    workStoppage: 'May result in Work Stoppage Order for non-compliance',
  },
};

// Helper functions
export function getHSCType(workerCount: number): string {
  if (workerCount > 400) return 'Type A';
  if (workerCount > 200) return 'Type B';
  if (workerCount >= 100) return 'Type C';
  return 'Type D';
}

export function getHSCComposition(workerCount: number): object {
  const types = RULE_1040.compositionByWorkerCount;

  if (workerCount > 400) return types.over400;
  if (workerCount > 200) return types['200to400'];
  if (workerCount >= 100) return types['100to200'];
  return types.under100;
}

export function getHSCCompositionSummary(): string {
  return `
HSC Composition by Worker Count (Rule 1040):

TYPE A (Over 400 workers):
- Chairman: Top management rep
- Secretary: Safety Officer
- Members: 2 dept heads, 4 workers, physician

TYPE B (200-400 workers):
- Chairman: Top management rep
- Secretary: Safety Officer
- Members: 1 supervisor, 3 workers, physician/nurse

TYPE C (100-200 workers):
- Chairman: Manager/rep
- Secretary: Part-time Safety Officer
- Members: 1 foreman, 3 workers, nurse

TYPE D (Under 100 workers):
- Chairman: Manager
- Secretary: Part-time Safety Officer
- Members: 1 foreman, 3 workers, nurse/first-aider

TYPE E (Joint Committee):
- Multiple establishments in one building
  `.trim();
}

export function getMeetingFrequency(isHazardous: boolean): string {
  if (isHazardous) {
    return 'MONTHLY meetings required for hazardous workplaces (construction, manufacturing, mining, etc.)';
  }
  return 'QUARTERLY meetings required for non-hazardous workplaces (offices, retail, etc.)';
}

export function getHSCDuties(): string[] {
  return RULE_1040.originalSections['1043'].duties as string[];
}

export function getSafetyManDuties(): string[] {
  const duties = RULE_1040.originalSections['1047'].duties;
  return duties.map(d => typeof d === 'string' ? d : d.duty);
}

export function getTermOfOffice(): string {
  return `
Term of Office (Rule 1040, Section 1044):

HSC MEMBERS:
- Department heads: 1 year
- Worker members (Type A & B): 2 years each
- Worker members (Type C, D, E): 1 year
- PERMANENT: Chairman, physician/nurse, safety man

JOINT COMMITTEE:
- Chairman and members: 1 year (rotated among establishments)
  `.trim();
}

export function getRule1040Summary(): string {
  return `
Rule 1040 - Health and Safety Committee Key Points:

WHEN TO ORGANIZE:
- Existing: 60 days after Standards effectivity
- New: Within 1 month of starting operations
- Reorganize every January

TYPES BY WORKER COUNT:
- Type A: Over 400 workers
- Type B: 200-400 workers
- Type C: 100-200 workers
- Type D: Under 100 workers
- Type E: Joint (multiple establishments in one building)

MEETINGS: At least monthly (or quarterly for non-hazardous)

KEY DUTIES:
- Accident prevention programs
- Safety inspections
- Accident investigation
- Training supervision
- Disaster contingency planning

REPORTING: Quarterly reports to enforcing authority
  `.trim();
}
