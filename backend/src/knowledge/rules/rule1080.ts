// Rule 1080 - Personal Protective Equipment
// OSHS Rule 1080

export const RULE_1080 = {
  ruleNumber: '1080',
  title: 'Personal Protective Equipment (PPE)',
  amendments: ['RA 11058', 'DO 198 (Construction)'],

  generalRequirements: `
    Personal Protective Equipment (PPE) shall be provided, used, and maintained
    when hazards cannot be eliminated or adequately controlled by engineering
    or administrative controls. PPE must be:
    - Provided FREE OF CHARGE to workers
    - Appropriate for the hazard
    - Properly fitted to the worker
    - Maintained in good condition
    - Replaced when damaged or worn
  `,

  ppeHierarchy: `
    PPE is the LAST LINE OF DEFENSE. Control hierarchy:
    1. Elimination - Remove the hazard entirely
    2. Substitution - Replace with less hazardous alternative
    3. Engineering Controls - Isolate people from hazard
    4. Administrative Controls - Change work procedures
    5. PPE - Protect individual workers
  `,

  types: {
    head: {
      equipment: ['Hard hats', 'Bump caps', 'Hair nets'],
      hazards: ['Falling objects', 'Low clearance', 'Machinery entanglement'],
      standards: 'ANSI Z89.1, PS/PSEC (Philippine Standards)',
    },
    eye: {
      equipment: ['Safety glasses', 'Goggles', 'Face shields', 'Welding helmets'],
      hazards: ['Flying particles', 'Chemical splash', 'Radiation (welding arc)'],
      standards: 'ANSI Z87.1',
    },
    hearing: {
      equipment: ['Earplugs', 'Earmuffs'],
      hazards: ['Noise above 85 dB over 8-hour TWA'],
      standards: 'ANSI S3.19',
    },
    respiratory: {
      equipment: [
        'Dust masks (N95)',
        'Half-face respirators',
        'Full-face respirators',
        'SCBA (Self-Contained Breathing Apparatus)',
      ],
      hazards: ['Dust', 'Fumes', 'Vapors', 'Oxygen deficiency'],
      standards: 'NIOSH approved',
      special: 'Medical clearance required for respirator users',
    },
    hand: {
      equipment: [
        'Leather gloves',
        'Chemical-resistant gloves',
        'Cut-resistant gloves',
        'Electrical gloves',
      ],
      hazards: ['Cuts', 'Chemicals', 'Heat', 'Electrical shock'],
      standards: 'ANSI/ISEA 105',
    },
    foot: {
      equipment: ['Steel-toe boots', 'Metatarsal guards', 'Chemical-resistant boots'],
      hazards: ['Falling objects', 'Punctures', 'Chemicals', 'Electrical'],
      standards: 'ASTM F2413',
    },
    body: {
      equipment: ['Coveralls', 'Aprons', 'Chemical suits', 'High-visibility vests'],
      hazards: ['Chemicals', 'Heat', 'Visibility hazards'],
      standards: 'ANSI/ISEA 107 (high-vis)',
    },
    fall: {
      equipment: ['Full body harness', 'Lanyards', 'Lifelines', 'Anchor points'],
      hazards: ['Falls from height (1.8m or more)'],
      standards: 'ANSI Z359.1',
      special: 'Required for work at heights above 1.8 meters',
    },
  },

  employerDuties: [
    'Assess workplace for PPE needs',
    'Select appropriate PPE for hazards',
    'Provide PPE at no cost to workers',
    'Ensure proper fit for each worker',
    'Train workers on proper use and limitations',
    'Maintain and replace PPE as needed',
    'Enforce PPE use',
    'Keep records of PPE training and issuance',
  ],

  workerDuties: [
    'Use PPE as required',
    'Attend PPE training',
    'Inspect PPE before use',
    'Care for PPE properly',
    'Report damaged or defective PPE',
    'Not alter PPE without authorization',
  ],

  training: {
    required: [
      'When PPE is required',
      'What PPE is required',
      'How to properly don, doff, and adjust',
      'Limitations of PPE',
      'Proper care and maintenance',
      'Useful life and disposal',
    ],
    documentation: 'Training records must be maintained',
    retraining: 'When job changes or new PPE is introduced',
  },

  specialIndustries: {
    construction: {
      mandatory: ['Hard hat', 'Safety boots', 'High-vis vest'],
      heightWork: 'Full body harness above 1.8m',
      reference: 'DO 198, s. 2018',
    },
    welding: {
      mandatory: ['Welding helmet', 'Gloves', 'Leather apron', 'Safety boots'],
      eye: 'Filter lens shade based on process',
    },
    chemical: {
      mandatory: ['Chemical-resistant gloves', 'Eye protection', 'Respirator'],
      special: 'Must match chemical hazard (check SDS)',
    },
  },
};

export function getPPERequirements(hazardType: string): string[] {
  const hazardMap: Record<string, string[]> = {
    falling_objects: ['Hard hat', 'Safety boots (steel-toe)'],
    chemicals: ['Chemical-resistant gloves', 'Goggles/Face shield', 'Chemical-resistant apron', 'Respirator (if vapors)'],
    noise: ['Earplugs or earmuffs (above 85 dB)'],
    dust: ['N95 mask or respirator', 'Safety glasses'],
    heights: ['Full body harness', 'Lanyard', 'Hard hat'],
    welding: ['Welding helmet', 'Leather gloves', 'Leather apron', 'Safety boots'],
    electrical: ['Electrical-rated gloves', 'Safety boots', 'Face shield'],
    construction: ['Hard hat', 'Safety boots', 'High-vis vest', 'Gloves'],
  };

  return hazardMap[hazardType.toLowerCase()] || ['Assess specific hazards to determine PPE'];
}

export function getPPECostResponsibility(): string {
  return `
Per RA 11058 and Rule 1080:
PPE must be provided FREE OF CHARGE by the employer.
Workers cannot be charged for PPE needed for their work.
This includes initial provision, maintenance, and replacement.
  `.trim();
}
