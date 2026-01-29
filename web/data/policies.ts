export interface Amendment {
  reference: string;
  description?: string;
}

export interface Policy {
  id: string;
  ruleNumber: string;
  title: string;
  fullTitle: string;
  keywords: string[];
  amendments?: Amendment[];
  keyPoints?: string[];
}

export const policies: Policy[] = [
  {
    id: 'rule1020',
    ruleNumber: 'Rule 1020',
    title: 'Registration',
    fullTitle: 'Registration',
    keywords: ['registration', 'register', 'dole', 'compliance', 'rule 1020', '1020'],
    keyPoints: [
      'All workplaces must be registered with DOLE',
      'Registration within 30 days of start of operations',
      'Annual renewal required'
    ]
  },
  {
    id: 'rule1030',
    ruleNumber: 'Rule 1030',
    title: 'Training & Personnel',
    fullTitle: 'Training of Personnel in Occupational Safety and Health',
    keywords: ['safety officer', 'so1', 'so2', 'so3', 'so4', 'bosh', 'training', 'rule 1030', '1030', 'cosh', 'personnel'],
    amendments: [
      { reference: 'D.O. No. 252, s. 2025', description: 'Amendment to training requirements' }
    ],
    keyPoints: [
      'Safety Officers must complete BOSH training (40 hrs)',
      'SO1-SO4 classifications based on workplace size',
      'Mandatory refresher training every 3 years'
    ]
  },
  {
    id: 'rule1040',
    ruleNumber: 'Rule 1040',
    title: 'Health & Safety Committee',
    fullTitle: 'Health and Safety Committee',
    keywords: ['hsc', 'health and safety committee', 'committee', 'rule 1040', '1040'],
    amendments: [
      { reference: 'D.O. No. 252, s. 2025', description: 'Amendment to HSC composition' }
    ],
    keyPoints: [
      'Required for workplaces with 10+ employees',
      'Must meet at least once a month',
      'Equal employer-employee representation'
    ]
  },
  {
    id: 'rule1050',
    ruleNumber: 'Rule 1050',
    title: 'Accident/Illness Reporting',
    fullTitle: 'Notification and Keeping of Records of Accidents and/or Occupational Illnesses',
    keywords: ['accident', 'incident', 'illness', 'wair', 'report', 'notification', 'records', 'rule 1050', '1050'],
    amendments: [
      { reference: 'L.A. No. 07, s. 2022', description: 'Amended reporting procedures' },
      { reference: 'D.O. No. 252, s. 2025', description: 'Further amendments' }
    ],
    keyPoints: [
      'Report fatal accidents within 24 hours',
      'Submit WAIR (Work Accident/Illness Report)',
      'Maintain 5-year records of all incidents'
    ]
  },
  {
    id: 'rule1070',
    ruleNumber: 'Rule 1070',
    title: 'Environmental Control',
    fullTitle: 'Occupational Health and Environmental Control',
    keywords: ['environmental', 'environment', 'ventilation', 'air quality', 'rule 1070', '1070', 'occupational health'],
    amendments: [
      { reference: 'D.O. No. 136, s. 2014' },
      { reference: 'D.O. No. 160, s. 2016' },
      { reference: 'D.O. No. 254, s. 2016' },
      { reference: 'D.O. No. 224, s. 2021' }
    ],
    keyPoints: [
      'Control of physical hazards (noise, heat, radiation)',
      'Proper ventilation requirements',
      'Chemical exposure limits (TLV)'
    ]
  },
  {
    id: 'rule1080',
    ruleNumber: 'Rule 1080',
    title: 'PPE',
    fullTitle: 'Personal Protective Equipment and Devices',
    keywords: ['ppe', 'personal protective equipment', 'safety equipment', 'rule 1080', '1080', 'helmet', 'gloves', 'goggles'],
    keyPoints: [
      'Employer must provide PPE free of charge',
      'PPE must meet Philippine standards',
      'Workers must be trained on proper PPE use'
    ]
  },
  {
    id: 'rule1960',
    ruleNumber: 'Rule 1960',
    title: 'Occupational Health Services',
    fullTitle: 'Occupational Health Services',
    keywords: ['health services', 'medical', 'first aid', 'clinic', 'nurse', 'physician', 'rule 1960', '1960', 'ohs'],
    amendments: [
      { reference: 'D.O. No. 252, s. 2025' },
      { reference: 'D.O. No. 53, s. 2003' },
      { reference: 'D.O. No. 73, s. 2005', description: 'Amended by L.A. No. 21, s. 2023' },
      { reference: 'D.O. No. 102, s. 2010', description: 'Amended by L.A. No. 22, s. 2023' },
      { reference: 'D.O. No. 178, s. 2017' },
      { reference: 'D.O. No. 184, s. 2017' },
      { reference: 'D.O. No. 208, s. 2020', description: 'Amended by L.A. No. 19, s. 2023' },
      { reference: 'D.O. No. 235, s. 2022' },
      { reference: 'D.A. No. 05, s. 2010' },
      { reference: 'L.A. No. 01, s. 2023' },
      { reference: 'L.A. No. 08, s. 2023' },
      { reference: 'L.A. No. 19, s. 2023' },
      { reference: 'L.A. No. 20, s. 2023' },
      { reference: 'L.A. No. 21, s. 2023' },
      { reference: 'L.A. No. 22, s. 2023' },
      { reference: 'L.A. No. 23, s. 2023' }
    ],
    keyPoints: [
      'First-aider ratio: 1 per 25 workers',
      'Nurse required: 50-199 workers',
      'Physician required: 200+ workers',
      'Emergency medical supplies must be available'
    ]
  },
  {
    id: 'do128',
    ruleNumber: 'D.O. 128-13',
    title: 'Construction Safety',
    fullTitle: 'Guidelines on Construction Safety and Health',
    keywords: ['do 128', 'construction', 'building', 'contractor', 'construction safety'],
    keyPoints: [
      'Specific requirements for construction sites',
      'Fall protection requirements',
      'Scaffolding and excavation safety'
    ]
  },
  {
    id: 'do253',
    ruleNumber: 'D.O. 253-25',
    title: 'Revised OSHS',
    fullTitle: 'Revised Occupational Safety and Health Standards',
    keywords: ['do 253', 'revised', '2025', 'new rules', 'revised oshs'],
    keyPoints: [
      'Latest amendments to OSHS',
      'Updated compliance requirements',
      'Aligned with RA 11058'
    ]
  },
  {
    id: 'ra11058',
    ruleNumber: 'RA 11058',
    title: 'OSH Law',
    fullTitle: 'Occupational Safety and Health Standards Act',
    keywords: ['ra 11058', 'osh law', 'republic act', 'law', 'osh act'],
    keyPoints: [
      'Primary OSH law in the Philippines',
      'Penalties for non-compliance',
      'Worker rights and employer duties'
    ]
  }
];

export function detectPolicyFromText(text: string): string | null {
  const lowerText = text.toLowerCase();

  for (const policy of policies) {
    for (const keyword of policy.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return policy.id;
      }
    }
  }

  return null;
}
