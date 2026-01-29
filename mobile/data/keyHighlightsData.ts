// Key Highlights Data for Split-Screen Panel
// Provides instant reference information while AI generates full answers

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TableData {
  id: string;
  title: string;
  description: string;
  citation: string;
  headers: string[];
  rows: string[][];
  notes?: string[];
}

export interface QuickAnswer {
  id: string;
  questionPattern: string;
  answer: string;
  citation: string;
}

export interface KeyFact {
  id: string;
  fact: string;
  citation?: string;
}

export interface TopicHighlight {
  topicId: string;
  topicName: string;
  icon: string;
  quickAnswers: QuickAnswer[];
  tables: TableData[];
  keyFacts: KeyFact[];
}

// ============================================
// TOPIC KEYWORDS FOR DETECTION
// ============================================

// Legacy keywords (kept for backward compatibility)
export const TOPIC_KEYWORDS: Record<string, string[]> = {
  registration: ['registration', 'register', 'rule 1020', '1020', 'dole registration', 'new establishment'],
  safety_officer: ['safety officer', 'so1', 'so2', 'so3', 'so4', 'bosh', 'cosh', 'rule 1030', '1030', 'training hours', 'refresher'],
  hsc: ['hsc', 'health and safety committee', 'committee', 'rule 1040', '1040', 'type a', 'type b', 'type c', 'type d', 'type e', 'members'],
  accident: ['accident', 'wair', 'reporting', 'fatal', 'rule 1050', '1050', 'incident', 'injury'],
  environmental: ['noise', 'illumination', 'lux', 'dba', 'rule 1070', '1070', 'environmental', 'lighting', 'hearing'],
  ppe: ['ppe', 'personal protective', 'rule 1080', '1080', 'hard hat', 'safety shoes', 'gloves', 'goggles', 'fall protection'],
  premises: ['premises', 'rule 1060', '1060', 'ceiling', 'floor space', 'toilet', 'exit', 'aisle', 'stair'],
  health_services: ['health services', 'rule 1960', '1960', 'nurse', 'physician', 'first aid', 'medical', 'health personnel'],
  penalty: ['penalty', 'penalties', 'fine', 'violation', 'ra 11058', '11058', 'stoppage order', 'criminal'],
  confined_space: ['confined space', 'rule 1087', '1087', 'oxygen', 'lel', 'entry permit', 'standby'],
  do253: ['do 253', '253', 'temporary accommodation', 'construction workers', 'welfare facilities', 'dormitory', 'sleeping'],
};

// ============================================
// POLICY KEYWORDS FOR DETECTION (NEW - Unambiguous)
// ============================================

export const POLICY_KEYWORDS: Record<string, string[]> = {
  rule1020: ['rule 1020', '1020', 'registration'],
  rule1030: ['rule 1030', '1030', 'so1', 'so2', 'so3', 'so4', 'bosh', 'cosh', 'safety officer'],
  rule1040: ['rule 1040', '1040', 'hsc', 'health and safety committee'],
  rule1050: ['rule 1050', '1050', 'wair', 'accident report', 'fatal accident', 'la 07'],
  rule1070: ['rule 1070', '1070', 'noise exposure', 'illumination', 'dba', 'lux', 'do 136', 'do 160', 'do 254', 'do 224'],
  rule1080: ['rule 1080', '1080', 'ppe', 'personal protective equipment'],
  rule1960: ['rule 1960', '1960', 'health services', 'occupational health', 'first aider', 'nurse', 'physician'],
  do128: ['do 128', 'do no. 128', '128 series 2013'],
  do253: ['do 253', 'do no. 253', '253 series 2025', 'temporary accommodation', 'construction welfare'],
};

// ============================================
// POLICY DATA FOR REFERENCE PANEL
// ============================================

export interface PolicyData {
  id: string;
  ruleNumber: string;
  title: string;
  shortTitle: string;
  icon: string;
  quickAnswers: QuickAnswer[];
  keyFacts: KeyFact[];
  amendments?: string[];
}

export const POLICIES_DATA: PolicyData[] = [
  {
    id: 'rule1020',
    ruleNumber: 'Rule 1020',
    title: 'Registration of Establishments',
    shortTitle: 'Registration',
    icon: '\u{1F4DD}', // memo
    quickAnswers: [
      { id: 'reg-qa1', questionPattern: 'When to register?', answer: '30 days before start of operations', citation: 'Rule 1020.2, OSHS' },
      { id: 'reg-qa2', questionPattern: 'Is registration free?', answer: 'Yes, no fees for workplace registration', citation: 'Rule 1020, OSHS' },
      { id: 'reg-qa3', questionPattern: 'Registration form?', answer: 'DOLE-BWC-IP-3', citation: 'Rule 1020, OSHS' },
    ],
    keyFacts: [
      { id: 'reg-f1', fact: 'Registration is FREE - no fees required', citation: 'Rule 1020' },
      { id: 'reg-f2', fact: 'Each contractor must register separately', citation: 'Rule 1020.2' },
      { id: 'reg-f3', fact: 'Operating without registration is a violation', citation: 'Rule 1020' },
    ],
  },
  {
    id: 'rule1030',
    ruleNumber: 'Rule 1030',
    title: 'Training and Accreditation of Personnel',
    shortTitle: 'Training (SO)',
    icon: '\u{1F477}', // construction worker
    quickAnswers: [
      { id: 'so-qa1', questionPattern: 'SO1 training hours?', answer: '8 hours (Basic OSH for Workers)', citation: 'Rule 1030, OSHS' },
      { id: 'so-qa2', questionPattern: 'SO2 training hours?', answer: '40 hours BOSH training', citation: 'Rule 1030, OSHS' },
      { id: 'so-qa3', questionPattern: 'SO3 training hours?', answer: '80 hours (40 BOSH + 40 COSH)', citation: 'Rule 1030, OSHS' },
      { id: 'so-qa4', questionPattern: 'Refresher frequency?', answer: 'Every 2 years', citation: 'Rule 1030.4, OSHS' },
    ],
    keyFacts: [
      { id: 'so-f1', fact: 'Refresher training required every 2 years', citation: 'Rule 1030.4' },
      { id: 'so-f2', fact: 'Training must be from DOLE-accredited providers', citation: 'Rule 1030' },
      { id: 'so-f3', fact: 'BOSH = Basic Occupational Safety and Health (40 hours)', citation: 'Rule 1030' },
    ],
    amendments: ['DO 252, s. 2025'],
  },
  {
    id: 'rule1040',
    ruleNumber: 'Rule 1040',
    title: 'Health and Safety Committee',
    shortTitle: 'HSC',
    icon: '\u{1F465}', // people
    quickAnswers: [
      { id: 'hsc-qa1', questionPattern: 'Meeting frequency?', answer: 'At least once a month', citation: 'Rule 1040.6, OSHS' },
      { id: 'hsc-qa2', questionPattern: 'Reorganization?', answer: 'Every January', citation: 'Rule 1040.5, OSHS' },
      { id: 'hsc-qa3', questionPattern: 'Who chairs HSC?', answer: 'Management representative', citation: 'Rule 1040.5, OSHS' },
      { id: 'hsc-qa4', questionPattern: 'Record retention?', answer: 'Meeting minutes kept 5 years', citation: 'Rule 1040.7, OSHS' },
    ],
    keyFacts: [
      { id: 'hsc-f1', fact: 'Committee must meet at least once a month', citation: 'Rule 1040.6' },
      { id: 'hsc-f2', fact: 'Reorganize every January', citation: 'Rule 1040.5' },
      { id: 'hsc-f3', fact: 'Management representative serves as Chairman', citation: 'Rule 1040.5' },
    ],
    amendments: ['DO 252, s. 2025'],
  },
  {
    id: 'rule1050',
    ruleNumber: 'Rule 1050',
    title: 'Notification and Reporting of Accidents',
    shortTitle: 'Accident Reports',
    icon: '\u{26A0}\u{FE0F}', // warning
    quickAnswers: [
      { id: 'ar-qa1', questionPattern: 'Fatal accident deadline?', answer: '24 hours notification to DOLE', citation: 'Rule 1050.1, OSHS' },
      { id: 'ar-qa2', questionPattern: 'WAIR due date?', answer: '20th of the following month', citation: 'Rule 1050, OSHS' },
      { id: 'ar-qa3', questionPattern: 'Annual report due?', answer: 'January 30 of following year', citation: 'Rule 1050, OSHS' },
      { id: 'ar-qa4', questionPattern: 'WAIR form number?', answer: 'DOLE-BWC-HSD-IP-6', citation: 'Rule 1050, OSHS' },
    ],
    keyFacts: [
      { id: 'ar-f1', fact: 'WAIR = Work Accident/Illness Report', citation: 'Rule 1050' },
      { id: 'ar-f2', fact: 'Preserve accident scene until DOLE investigation', citation: 'Rule 1050.2' },
      { id: 'ar-f3', fact: 'Submit nil WAIR even if zero accidents', citation: 'Rule 1050' },
    ],
    amendments: ['LA 07', 'DO 252, s. 2025'],
  },
  {
    id: 'rule1070',
    ruleNumber: 'Rule 1070',
    title: 'Occupational Health and Environmental Control',
    shortTitle: 'Environmental',
    icon: '\u{1F50A}', // speaker
    quickAnswers: [
      { id: 'env-qa1', questionPattern: '8-hour noise limit?', answer: '90 dBA (PEL)', citation: 'Rule 1070.2, OSHS' },
      { id: 'env-qa2', questionPattern: 'Office illumination?', answer: '300 lux minimum', citation: 'Rule 1070.1, OSHS' },
      { id: 'env-qa3', questionPattern: 'Hearing protection?', answer: 'Required above 85 dBA', citation: 'Rule 1070.2, OSHS' },
    ],
    keyFacts: [
      { id: 'env-f1', fact: '90 dBA is the PEL for 8 hours', citation: 'Rule 1070.2' },
      { id: 'env-f2', fact: 'Every 5 dBA increase halves allowable exposure', citation: 'Rule 1070.2' },
      { id: 'env-f3', fact: 'Hearing conservation program required at 85 dBA', citation: 'Rule 1070.2' },
    ],
    amendments: ['DO 136', 'DO 160', 'DO 254', 'DO 224'],
  },
  {
    id: 'rule1080',
    ruleNumber: 'Rule 1080',
    title: 'Personal Protective Equipment',
    shortTitle: 'PPE',
    icon: '\u{1F6E1}\u{FE0F}', // shield
    quickAnswers: [
      { id: 'ppe-qa1', questionPattern: 'Who provides PPE?', answer: 'Employer - free of charge', citation: 'RA 11058, Section 5' },
      { id: 'ppe-qa2', questionPattern: 'Fall protection height?', answer: '6 feet (1.8m) or higher', citation: 'Rule 1412.1, OSHS' },
      { id: 'ppe-qa3', questionPattern: 'Hierarchy of controls?', answer: 'Elimination > Substitution > Engineering > Admin > PPE', citation: 'Rule 1080, OSHS' },
    ],
    keyFacts: [
      { id: 'ppe-f1', fact: 'Employer provides all PPE free of charge', citation: 'RA 11058, Section 5' },
      { id: 'ppe-f2', fact: 'PPE is LAST resort (after engineering/admin controls)', citation: 'Rule 1080' },
      { id: 'ppe-f3', fact: 'Workers must be trained on proper PPE use', citation: 'Rule 1080' },
    ],
  },
  {
    id: 'rule1960',
    ruleNumber: 'Rule 1960',
    title: 'Occupational Health Services',
    shortTitle: 'Health Services',
    icon: '\u{1F3E5}', // hospital
    quickAnswers: [
      { id: 'hs-qa1', questionPattern: 'First-aider ratio?', answer: '1 per 50 workers (non-hazardous)', citation: 'Rule 1960.3, OSHS' },
      { id: 'hs-qa2', questionPattern: 'Full-time nurse?', answer: 'Required for 51-200 workers', citation: 'Rule 1960.1, OSHS' },
      { id: 'hs-qa3', questionPattern: 'Medical records?', answer: 'Keep 30 years after employment', citation: 'Rule 1960.5, OSHS' },
    ],
    keyFacts: [
      { id: 'hs-f1', fact: 'First-aider training: minimum 16 hours', citation: 'Rule 1960.3' },
      { id: 'hs-f2', fact: 'Medical records kept for 30 years after employment', citation: 'Rule 1960.5' },
      { id: 'hs-f3', fact: 'Employer pays for all required medical exams', citation: 'Rule 1960.4' },
    ],
    amendments: ['Multiple DOLE amendments'],
  },
  {
    id: 'do128',
    ruleNumber: 'DO 128',
    title: 'Guidelines on OSH Standards for Public Employment Service Offices',
    shortTitle: 'DO 128, s. 2013',
    icon: '\u{1F3DB}\u{FE0F}', // classical building
    quickAnswers: [
      { id: 'do128-qa1', questionPattern: 'What does DO 128 cover?', answer: 'OSH standards for PESO offices', citation: 'DO 128, s. 2013' },
      { id: 'do128-qa2', questionPattern: 'When issued?', answer: '2013', citation: 'DO 128, s. 2013' },
    ],
    keyFacts: [
      { id: 'do128-f1', fact: 'Covers Public Employment Service Offices (PESO)', citation: 'DO 128, s. 2013' },
      { id: 'do128-f2', fact: 'Issued 2013 to standardize OSH in public employment offices', citation: 'DO 128, s. 2013' },
    ],
  },
  {
    id: 'do253',
    ruleNumber: 'DO 253',
    title: 'Standards for Temporary Accommodation of Construction Workers',
    shortTitle: 'Construction Welfare',
    icon: '\u{1F3E0}', // house
    quickAnswers: [
      { id: 'do253-qa1', questionPattern: 'Floor area per worker?', answer: '4.5 square meters minimum', citation: 'DO 253, s. 2025' },
      { id: 'do253-qa2', questionPattern: 'Ceiling height?', answer: '2.4 meters minimum', citation: 'DO 253, s. 2025' },
      { id: 'do253-qa3', questionPattern: 'Bed spacing?', answer: '1 meter between beds', citation: 'DO 253, s. 2025' },
      { id: 'do253-qa4', questionPattern: 'Window area?', answer: '10% of floor area', citation: 'DO 253, s. 2025' },
    ],
    keyFacts: [
      { id: 'do253-f1', fact: 'Separate facilities required for male/female workers', citation: 'DO 253, s. 2025' },
      { id: 'do253-f2', fact: 'Fire extinguishers must be readily accessible', citation: 'DO 253, s. 2025' },
      { id: 'do253-f3', fact: 'Emergency exits must be clearly marked', citation: 'DO 253, s. 2025' },
      { id: 'do253-f4', fact: 'Signed April 28, 2025 (World Day for Safety)', citation: 'DO 253, s. 2025' },
    ],
  },
];

/**
 * Detect policy from text using unambiguous keywords
 */
export function detectPolicy(text: string): string | null {
  const lowerText = text.toLowerCase();

  for (const [policyId, keywords] of Object.entries(POLICY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return policyId;
      }
    }
  }

  return null;
}

/**
 * Get policy data by ID
 */
export function getPolicyById(policyId: string): PolicyData | null {
  return POLICIES_DATA.find(p => p.id === policyId) || null;
}

/**
 * Get all policies
 */
export function getAllPolicies(): PolicyData[] {
  return POLICIES_DATA;
}

// ============================================
// QUICK ANSWERS DATABASE
// ============================================

const QUICK_ANSWERS: Record<string, QuickAnswer[]> = {
  registration: [
    { id: 'reg-qa1', questionPattern: 'When to register?', answer: '30 days before start of operations', citation: 'Rule 1020.2, OSHS' },
    { id: 'reg-qa2', questionPattern: 'Is registration free?', answer: 'Yes, no fees for workplace registration', citation: 'Rule 1020, OSHS' },
    { id: 'reg-qa3', questionPattern: 'Registration form?', answer: 'DOLE-BWC-IP-3', citation: 'Rule 1020, OSHS' },
  ],
  safety_officer: [
    { id: 'so-qa1', questionPattern: 'SO1 training hours?', answer: '8 hours (Basic OSH for Workers)', citation: 'Rule 1030, OSHS' },
    { id: 'so-qa2', questionPattern: 'SO2 training hours?', answer: '40 hours BOSH training', citation: 'Rule 1030, OSHS' },
    { id: 'so-qa3', questionPattern: 'SO3 training hours?', answer: '80 hours (40 BOSH + 40 COSH)', citation: 'Rule 1030, OSHS' },
    { id: 'so-qa4', questionPattern: 'SO4 training hours?', answer: '120 hours (BOSH + COSH + specialized)', citation: 'Rule 1030, OSHS' },
    { id: 'so-qa5', questionPattern: 'Refresher frequency?', answer: 'Every 2 years', citation: 'Rule 1030.4, OSHS' },
  ],
  hsc: [
    { id: 'hsc-qa1', questionPattern: 'Meeting frequency?', answer: 'At least once a month', citation: 'Rule 1040.6, OSHS' },
    { id: 'hsc-qa2', questionPattern: 'Reorganization?', answer: 'Every January', citation: 'Rule 1040.5, OSHS' },
    { id: 'hsc-qa3', questionPattern: 'Who chairs HSC?', answer: 'Management representative', citation: 'Rule 1040.5, OSHS' },
    { id: 'hsc-qa4', questionPattern: 'Record retention?', answer: 'Meeting minutes kept 5 years', citation: 'Rule 1040.7, OSHS' },
  ],
  accident: [
    { id: 'ar-qa1', questionPattern: 'Fatal accident deadline?', answer: '24 hours notification to DOLE', citation: 'Rule 1050.1, OSHS' },
    { id: 'ar-qa2', questionPattern: 'WAIR due date?', answer: '20th of the following month', citation: 'Rule 1050, OSHS' },
    { id: 'ar-qa3', questionPattern: 'Annual report due?', answer: 'January 30 of following year', citation: 'Rule 1050, OSHS' },
    { id: 'ar-qa4', questionPattern: 'WAIR form number?', answer: 'DOLE-BWC-HSD-IP-6', citation: 'Rule 1050, OSHS' },
    { id: 'ar-qa5', questionPattern: 'Zero accidents?', answer: 'Still submit nil WAIR report', citation: 'Rule 1050, OSHS' },
  ],
  environmental: [
    { id: 'env-qa1', questionPattern: '8-hour noise limit?', answer: '90 dBA (PEL)', citation: 'Rule 1070.2, OSHS' },
    { id: 'env-qa2', questionPattern: 'Office illumination?', answer: '300 lux minimum', citation: 'Rule 1070.1, OSHS' },
    { id: 'env-qa3', questionPattern: 'Hearing protection?', answer: 'Required above 85 dBA', citation: 'Rule 1070.2, OSHS' },
    { id: 'env-qa4', questionPattern: 'Emergency lighting?', answer: '10 lux minimum', citation: 'Rule 1070.1, OSHS' },
  ],
  ppe: [
    { id: 'ppe-qa1', questionPattern: 'Who provides PPE?', answer: 'Employer - free of charge', citation: 'RA 11058, Section 5' },
    { id: 'ppe-qa2', questionPattern: 'Fall protection height?', answer: '6 feet (1.8m) or higher', citation: 'Rule 1412.1, OSHS' },
    { id: 'ppe-qa3', questionPattern: 'Hierarchy of controls?', answer: 'Elimination > Substitution > Engineering > Admin > PPE', citation: 'Rule 1080, OSHS' },
  ],
  premises: [
    { id: 'prem-qa1', questionPattern: 'Ceiling height?', answer: '2.7m (2.4m if air-conditioned)', citation: 'Rule 1060.1, OSHS' },
    { id: 'prem-qa2', questionPattern: 'Floor space per worker?', answer: '2 square meters minimum', citation: 'Rule 1060.2, OSHS' },
    { id: 'prem-qa3', questionPattern: 'Toilet ratio?', answer: '1 toilet per 25 workers', citation: 'Rule 1060.4, OSHS' },
    { id: 'prem-qa4', questionPattern: 'Exit distance?', answer: '45m non-hazardous, 23m hazardous', citation: 'Rule 1060.3, OSHS' },
  ],
  health_services: [
    { id: 'hs-qa1', questionPattern: 'First-aider ratio?', answer: '1 per 50 workers (non-hazardous)', citation: 'Rule 1960.3, OSHS' },
    { id: 'hs-qa2', questionPattern: 'Full-time nurse?', answer: 'Required for 51-200 workers', citation: 'Rule 1960.1, OSHS' },
    { id: 'hs-qa3', questionPattern: 'Medical records?', answer: 'Keep 30 years after employment', citation: 'Rule 1960.5, OSHS' },
    { id: 'hs-qa4', questionPattern: 'Who pays for exams?', answer: 'Employer pays all required exams', citation: 'Rule 1960.4, OSHS' },
  ],
  penalty: [
    { id: 'pen-qa1', questionPattern: 'Max daily fine?', answer: 'PHP 100,000 per day', citation: 'RA 11058, Section 12' },
    { id: 'pen-qa2', questionPattern: 'Criminal prosecution?', answer: 'After 3 violations in 3 years', citation: 'RA 11058, Section 13' },
    { id: 'pen-qa3', questionPattern: 'Work Stoppage Order?', answer: 'For imminent danger situations', citation: 'RA 11058, Section 11' },
  ],
  confined_space: [
    { id: 'cs-qa1', questionPattern: 'Safe oxygen level?', answer: '19.5% to 23.5%', citation: 'Rule 1087, OSHS' },
    { id: 'cs-qa2', questionPattern: 'Testing order?', answer: 'O2 > Flammables > Toxics', citation: 'Rule 1087.3, OSHS' },
    { id: 'cs-qa3', questionPattern: 'Standby person?', answer: 'Always required outside', citation: 'Rule 1087.4, OSHS' },
    { id: 'cs-qa4', questionPattern: 'Maximum LEL?', answer: '10% of Lower Explosive Limit', citation: 'Rule 1087.3, OSHS' },
  ],
  do253: [
    { id: 'do253-qa1', questionPattern: 'Floor area per worker?', answer: '4.5 square meters minimum', citation: 'DO 253, s. 2025' },
    { id: 'do253-qa2', questionPattern: 'Ceiling height?', answer: '2.4 meters minimum', citation: 'DO 253, s. 2025' },
    { id: 'do253-qa3', questionPattern: 'Bed spacing?', answer: '1 meter between beds', citation: 'DO 253, s. 2025' },
    { id: 'do253-qa4', questionPattern: 'Window area?', answer: '10% of floor area', citation: 'DO 253, s. 2025' },
  ],
};

// ============================================
// TABLES DATABASE
// ============================================

const TABLES: Record<string, TableData[]> = {
  registration: [
    {
      id: 'registration',
      title: 'Registration Requirements',
      description: 'DOLE registration deadlines and forms',
      citation: 'Rule 1020, OSHS',
      headers: ['Action', 'Deadline', 'Form', 'Where'],
      rows: [
        ['New establishment', '30 days before operation', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
        ['Construction project', 'Before work starts', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
        ['Change of ownership', '30 days after change', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
        ['Change of location', '30 days after change', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
        ['Closure/cessation', '30 days before', 'Letter notification', 'DOLE Regional Office'],
      ],
      notes: ['Registration is FREE', 'Each contractor must register separately'],
    },
  ],
  safety_officer: [
    {
      id: 'so-requirements',
      title: 'SO Requirements by Workplace',
      description: 'Minimum SO level by hazard classification and workers',
      citation: 'Rule 1033, OSHS',
      headers: ['Workers', 'Non-Hazardous', 'Hazardous', 'Highly Hazardous'],
      rows: [
        ['1-9', 'Part-time SO1', 'Part-time SO1', 'Part-time SO2'],
        ['10-50', 'Part-time SO1', 'Part-time SO2', 'Full-time SO2'],
        ['51-200', 'Part-time SO2', 'Full-time SO2', 'Full-time SO3'],
        ['201-250', 'Full-time SO2', 'Full-time SO3', 'Full-time SO4'],
        ['251-500', 'Full-time SO2', 'Full-time SO3', 'Full-time SO4 + 1 SO'],
        ['501-750', 'Full-time SO2 + 1 SO', 'Full-time SO3 + 1 SO', 'Full-time SO4 + 2 SO'],
        ['751-1000', 'Full-time SO2 + 1 SO', 'Full-time SO3 + 2 SO', 'Full-time SO4 + 3 SO'],
        ['1000+', '+1 SO per 400 excess', '+1 SO per 300 excess', '+1 SO per 250 excess'],
      ],
    },
    {
      id: 'so-training',
      title: 'SO Training Hours',
      description: 'Training requirements for each SO level',
      citation: 'Rule 1030, OSHS',
      headers: ['SO Level', 'Total Hours', 'Required Courses', 'Refresher'],
      rows: [
        ['SO1', '8 hours', 'Basic OSH for Workers', '8 hours / 2 years'],
        ['SO2', '40 hours', 'BOSH', '16 hours / 2 years'],
        ['SO3', '80 hours', 'BOSH (40) + COSH (40)', '16 hours / 2 years'],
        ['SO4', '120 hours', 'BOSH + COSH + Specialized', '16 hours / 2 years'],
      ],
      notes: ['Training from DOLE-accredited providers only'],
    },
  ],
  hsc: [
    {
      id: 'hsc-types',
      title: 'HSC Committee Types',
      description: 'Committee composition by workplace size',
      citation: 'Rule 1040, OSHS',
      headers: ['Type', 'Total', 'Mgmt', 'Workers', 'Non-Haz', 'Hazardous'],
      rows: [
        ['None', '0', '-', '-', '1-9', '1-9'],
        ['Type A', '2', '1', '1', '10-50', '-'],
        ['Type B', '4', '2', '2', '51-200', '10-50'],
        ['Type C', '6', '3', '3', '201-500', '51-200'],
        ['Type D', '8', '4', '4', '501+', '201-500'],
        ['Type E', '12', '6', '6', '-', '501+'],
      ],
      notes: ['Monthly meetings required', 'Reorganize every January'],
    },
  ],
  accident: [
    {
      id: 'reporting-deadlines',
      title: 'Reporting Deadlines',
      description: 'When and how to report incidents to DOLE',
      citation: 'Rule 1050, OSHS',
      headers: ['Incident Type', 'Deadline', 'Report To', 'Form'],
      rows: [
        ['Fatal accident', '24 hours', 'DOLE Regional', 'Initial notification'],
        ['Serious injury', '24 hours', 'DOLE Regional', 'Initial notification'],
        ['Dangerous occurrence', '24 hours', 'DOLE Regional', 'Initial notification'],
        ['Monthly accidents', '20th of next month', 'DOLE-BWC', 'WAIR'],
        ['Zero accident month', '20th of next month', 'DOLE-BWC', 'Nil WAIR'],
        ['Annual summary', 'January 30', 'DOLE-BWC', 'Annual Report'],
      ],
      notes: ['Keep records for 5 years', 'Failure to report = violation under RA 11058'],
    },
  ],
  environmental: [
    {
      id: 'noise-limits',
      title: 'Noise Exposure Limits',
      description: 'Maximum exposure time by noise level',
      citation: 'Rule 1070.2, OSHS',
      headers: ['Noise (dBA)', 'Max Exposure', 'Action Required'],
      rows: [
        ['85', '16 hours', 'Hearing conservation program'],
        ['90', '8 hours', 'PEL - Protection required'],
        ['95', '4 hours', 'Hearing protection mandatory'],
        ['100', '2 hours', 'Hearing protection mandatory'],
        ['105', '1 hour', 'Hearing protection mandatory'],
        ['110', '30 minutes', 'Hearing protection mandatory'],
        ['115', '15 minutes', 'Maximum allowable'],
      ],
      notes: ['5 dBA halving rate', 'Action level at 85 dBA'],
    },
    {
      id: 'illumination',
      title: 'Illumination Standards',
      description: 'Minimum lux requirements by area',
      citation: 'Rule 1070.1, OSHS',
      headers: ['Work Area', 'Min Lux', 'Examples'],
      rows: [
        ['Emergency lighting', '10', 'Exit routes'],
        ['Storage areas', '50', 'Warehouses'],
        ['Corridors, stairs', '100', 'Hallways'],
        ['General work', '200', 'Rough assembly'],
        ['Offices', '300', 'Desk work'],
        ['Detailed work', '500', 'Assembly, inspection'],
        ['Fine work', '750', 'Electronics'],
        ['Very fine work', '1000+', 'Jewelry, surgery'],
      ],
    },
  ],
  ppe: [
    {
      id: 'ppe-guide',
      title: 'PPE Selection Guide',
      description: 'Required PPE by hazard type',
      citation: 'Rule 1080, OSHS',
      headers: ['Hazard', 'Head', 'Eyes', 'Hands', 'Feet'],
      rows: [
        ['Impact/falling', 'Hard hat', 'Safety glasses', 'Work gloves', 'Safety shoes'],
        ['Chemical splash', 'Face shield', 'Goggles', 'Chemical gloves', 'Chemical boots'],
        ['Welding', 'Welding hood', 'Shade lens', 'Welding gloves', 'Safety shoes'],
        ['Electrical', 'Insulated', 'Safety glasses', 'Insulated gloves', 'Insulated boots'],
        ['Noise > 85 dBA', '-', '-', '-', 'Ear protection'],
        ['Heights > 6 ft', 'Hard hat', '-', '-', 'Full body harness'],
      ],
      notes: ['Employer provides all PPE free', 'PPE is LAST resort after other controls'],
    },
  ],
  premises: [
    {
      id: 'premises',
      title: 'Premises Requirements',
      description: 'Minimum standards for workplace facilities',
      citation: 'Rule 1060, OSHS',
      headers: ['Requirement', 'Standard', 'Notes'],
      rows: [
        ['Ceiling height', '2.7m', '2.4m if air-conditioned'],
        ['Floor space/worker', '2 sqm', 'Clear, unobstructed'],
        ['Toilet ratio', '1 per 25', 'Separate if 10+ workers'],
        ['Main aisle width', '1.12m (44")', 'Keep clear always'],
        ['Exit door width', '0.71m min', 'Swing outward'],
        ['Stair width', '1.12m (44")', 'Handrails if wider'],
        ['Number of exits', '2 minimum', 'If 50+ occupants'],
        ['Exit distance', '45m / 23m', 'Non-haz / Hazardous'],
      ],
    },
  ],
  health_services: [
    {
      id: 'health-personnel',
      title: 'Health Personnel Requirements',
      description: 'Required health staff by workplace size',
      citation: 'Rule 1960, OSHS',
      headers: ['Workers', 'First-aider', 'Nurse', 'Physician', 'Facility'],
      rows: [
        ['1-50 (non-haz)', '1 per 50', '-', '-', 'First aid kit'],
        ['1-50 (hazardous)', '1 per 25', '-', 'On-call', 'First aid kit'],
        ['51-200', '1 per 50', 'Full-time', 'Part-time', 'Treatment room'],
        ['201-300', '1 per 50', 'Full-time', 'Part-time', 'Emergency room'],
        ['301-500', '1 per 50', '2 Full-time', 'Full-time', 'Emergency room'],
        ['501-1000', '1 per 50', '3 Full-time', 'Full-time', 'Clinic'],
        ['1000+', '1 per 50', '+1 per 500', '+1 per 1000', 'Hospital arr.'],
      ],
      notes: ['First-aider training: 16 hours minimum', 'Employer pays all medical exams'],
    },
  ],
  penalty: [
    {
      id: 'penalties',
      title: 'OSH Violation Penalties',
      description: 'Administrative and criminal penalties',
      citation: 'RA 11058, Sections 12-13',
      headers: ['Violation', 'Penalty', 'Additional'],
      rows: [
        ['Non-compliance', 'PHP 100,000/day', 'Until corrected'],
        ['Failure to report accident', 'PHP 100,000/day', 'Per incident'],
        ['Obstruction of inspection', 'PHP 100,000/day', 'May lead to WSO'],
        ['Retaliation against workers', 'PHP 50,000-100,000', 'Criminal charges'],
        ['Imminent danger', 'Work Stoppage Order', 'Operations halted'],
        ['3 violations in 3 years', 'Criminal prosecution', 'Imprisonment'],
      ],
      notes: ['Fines are cumulative', 'DOLE Regional Directors impose penalties'],
    },
  ],
  confined_space: [
    {
      id: 'confined-space',
      title: 'Confined Space Requirements',
      description: 'Atmospheric limits and safety requirements',
      citation: 'Rule 1087, OSHS',
      headers: ['Parameter', 'Safe Range', 'Action if Outside'],
      rows: [
        ['Oxygen (O2)', '19.5% - 23.5%', 'Do not enter / Use SCBA'],
        ['Oxygen < 19.5%', 'Deficient', 'Ventilate or use supplied air'],
        ['Oxygen > 23.5%', 'Enriched', 'Ventilate, remove ignition'],
        ['LEL (flammables)', '< 10% of LEL', 'Do not enter if higher'],
        ['CO', '< 35 ppm', 'Ventilate, use respirator'],
        ['H2S', '< 10 ppm', 'Ventilate, use respirator'],
      ],
      notes: ['Test order: O2 > Flammables > Toxics', 'Standby person always required'],
    },
  ],
  do253: [
    {
      id: 'do253-space',
      title: 'DO 253 Space Requirements',
      description: 'Temporary Accommodation Standards for Construction Workers',
      citation: 'DO 253, s. 2025',
      headers: ['Requirement', 'Minimum Standard'],
      rows: [
        ['Floor area per worker', '4.5 sqm'],
        ['Ceiling height', '2.4 meters'],
        ['Bed spacing', '1 meter between beds'],
        ['Aisle width', '1 meter'],
        ['Window area', '10% of floor area'],
      ],
      notes: [
        'Separate facilities for male/female workers',
        'Fire extinguishers must be readily accessible',
        'Emergency exits clearly marked',
        'Posted evacuation plans required',
        'Open flames prohibited in sleeping areas',
        'Signed April 28, 2025 (World Day for Safety)',
      ],
    },
  ],
};

// ============================================
// KEY FACTS DATABASE
// ============================================

const KEY_FACTS: Record<string, KeyFact[]> = {
  registration: [
    { id: 'reg-f1', fact: 'Registration is FREE - no fees required', citation: 'Rule 1020' },
    { id: 'reg-f2', fact: 'Each contractor must register separately', citation: 'Rule 1020.2' },
    { id: 'reg-f3', fact: 'Operating without registration is a violation', citation: 'Rule 1020' },
    { id: 'reg-f4', fact: 'Certificate of Registration issued upon approval', citation: 'Rule 1020' },
  ],
  safety_officer: [
    { id: 'so-f1', fact: 'Refresher training required every 2 years', citation: 'Rule 1030.4' },
    { id: 'so-f2', fact: 'Training must be from DOLE-accredited providers', citation: 'Rule 1030' },
    { id: 'so-f3', fact: 'BOSH = Basic Occupational Safety and Health (40 hours)', citation: 'Rule 1030' },
    { id: 'so-f4', fact: 'COSH = Construction Occupational Safety and Health (40 hours)', citation: 'D.O. 13' },
    { id: 'so-f5', fact: 'Construction sites require minimum SO3 regardless of worker count', citation: 'D.O. 13' },
  ],
  hsc: [
    { id: 'hsc-f1', fact: 'Committee must meet at least once a month', citation: 'Rule 1040.6' },
    { id: 'hsc-f2', fact: 'Reorganize every January', citation: 'Rule 1040.5' },
    { id: 'hsc-f3', fact: 'Management representative serves as Chairman', citation: 'Rule 1040.5' },
    { id: 'hsc-f4', fact: 'Worker reps elected by workers or designated by union', citation: 'Rule 1040.5' },
    { id: 'hsc-f5', fact: 'Keep meeting minutes for at least 5 years', citation: 'Rule 1040.7' },
  ],
  accident: [
    { id: 'ar-f1', fact: 'WAIR = Work Accident/Illness Report', citation: 'Rule 1050' },
    { id: 'ar-f2', fact: 'Preserve accident scene until DOLE investigation (fatal/serious)', citation: 'Rule 1050.2' },
    { id: 'ar-f3', fact: 'Keep accident records for at least 5 years', citation: 'Rule 1050.4' },
    { id: 'ar-f4', fact: 'Failure to report is a violation under RA 11058', citation: 'RA 11058' },
    { id: 'ar-f5', fact: 'Submit nil WAIR even if zero accidents', citation: 'Rule 1050' },
  ],
  environmental: [
    { id: 'env-f1', fact: '90 dBA is the PEL (Permissible Exposure Limit) for 8 hours', citation: 'Rule 1070.2' },
    { id: 'env-f2', fact: 'Every 5 dBA increase halves allowable exposure time', citation: 'Rule 1070.2' },
    { id: 'env-f3', fact: 'Hearing conservation program required at 85 dBA action level', citation: 'Rule 1070.2' },
    { id: 'env-f4', fact: 'Audiometric testing required for exposed workers', citation: 'Rule 1070.2' },
    { id: 'env-f5', fact: 'Emergency lighting must have independent power source', citation: 'Rule 1070.1' },
  ],
  ppe: [
    { id: 'ppe-f1', fact: 'Employer provides all PPE free of charge', citation: 'RA 11058, Section 5' },
    { id: 'ppe-f2', fact: 'PPE is LAST resort (after engineering/admin controls)', citation: 'Rule 1080' },
    { id: 'ppe-f3', fact: 'Workers must be trained on proper PPE use', citation: 'Rule 1080' },
    { id: 'ppe-f4', fact: 'Employer must maintain and replace damaged PPE', citation: 'Rule 1080.3' },
    { id: 'ppe-f5', fact: 'Hierarchy: Elimination > Substitution > Engineering > Admin > PPE', citation: 'Rule 1080' },
  ],
  premises: [
    { id: 'prem-f1', fact: 'EXIT signs visible from 30 meters', citation: 'Rule 1060.3' },
    { id: 'prem-f2', fact: 'Exits must not be locked during work hours', citation: 'Rule 1060.3' },
    { id: 'prem-f3', fact: 'Emergency lighting minimum 10 lux', citation: 'Rule 1070.1' },
    { id: 'prem-f4', fact: 'Floors must be slip-resistant in wet/hazardous areas', citation: 'Rule 1060.1' },
    { id: 'prem-f5', fact: 'Separate toilets for male/female if 10+ workers', citation: 'Rule 1060.4' },
  ],
  health_services: [
    { id: 'hs-f1', fact: 'First-aider training: minimum 16 hours', citation: 'Rule 1960.3' },
    { id: 'hs-f2', fact: 'Nurse must be registered (RN)', citation: 'Rule 1960' },
    { id: 'hs-f3', fact: 'Physician must be trained in occupational health', citation: 'Rule 1960' },
    { id: 'hs-f4', fact: 'Medical records kept for 30 years after employment', citation: 'Rule 1960.5' },
    { id: 'hs-f5', fact: 'Employer pays for all required medical exams', citation: 'Rule 1960.4' },
  ],
  penalty: [
    { id: 'pen-f1', fact: 'Fines continue daily until violation is corrected', citation: 'RA 11058, Section 12' },
    { id: 'pen-f2', fact: 'DOLE Regional Directors can impose penalties', citation: 'RA 11058' },
    { id: 'pen-f3', fact: 'Work Stoppage Order (WSO) for imminent danger', citation: 'RA 11058, Section 11' },
    { id: 'pen-f4', fact: 'Responsible officers may face personal liability', citation: 'RA 11058, Section 13' },
    { id: 'pen-f5', fact: 'Criminal prosecution after 3 violations in 3 years', citation: 'RA 11058, Section 13' },
  ],
  confined_space: [
    { id: 'cs-f1', fact: 'Test atmosphere in order: O2 > Flammables > Toxics', citation: 'Rule 1087.3' },
    { id: 'cs-f2', fact: 'Standby person (watcher) required outside', citation: 'Rule 1087.4' },
    { id: 'cs-f3', fact: 'Entry permit required for each entry', citation: 'Rule 1087.2' },
    { id: 'cs-f4', fact: 'Continuous monitoring if conditions may change', citation: 'Rule 1087.3' },
    { id: 'cs-f5', fact: 'Rescue equipment and trained personnel must be ready', citation: 'Rule 1087.6' },
    { id: 'cs-f6', fact: 'Lockout/Tagout (LOTO) required before entry', citation: 'Rule 1087.5' },
  ],
  do253: [
    { id: 'do253-f1', fact: 'Separate facilities required for male/female workers', citation: 'DO 253, s. 2025' },
    { id: 'do253-f2', fact: 'Fire extinguishers must be readily accessible', citation: 'DO 253, s. 2025' },
    { id: 'do253-f3', fact: 'Emergency exits must be clearly marked', citation: 'DO 253, s. 2025' },
    { id: 'do253-f4', fact: 'Posted evacuation plans required', citation: 'DO 253, s. 2025' },
    { id: 'do253-f5', fact: 'Open flames prohibited in sleeping areas', citation: 'DO 253, s. 2025' },
    { id: 'do253-f6', fact: 'Signed April 28, 2025 (World Day for Safety at Work)', citation: 'DO 253, s. 2025' },
    { id: 'do253-f7', fact: 'Applies to temporary accommodation for construction workers', citation: 'DO 253, s. 2025' },
  ],
};

// ============================================
// TOPIC METADATA
// ============================================

const TOPIC_META: Record<string, { name: string; icon: string }> = {
  registration: { name: 'Registration', icon: 'document-text' },
  safety_officer: { name: 'Safety Officers', icon: 'person' },
  hsc: { name: 'Health & Safety Committee', icon: 'people' },
  accident: { name: 'Accident Reporting', icon: 'alert-circle' },
  environmental: { name: 'Environmental Standards', icon: 'volume-high' },
  ppe: { name: 'PPE Requirements', icon: 'shield' },
  premises: { name: 'Premises Requirements', icon: 'business' },
  health_services: { name: 'Health Services', icon: 'medkit' },
  penalty: { name: 'Penalties', icon: 'warning' },
  confined_space: { name: 'Confined Spaces', icon: 'enter' },
  do253: { name: 'DO 253 (Construction Welfare)', icon: 'home' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Detect topic from question/transcript text
 */
export function detectTopic(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Check each topic's keywords
  for (const [topicId, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return topicId;
      }
    }
  }

  return null;
}

/**
 * Get highlights for a detected topic
 */
export function getHighlightsForTopic(topicId: string): TopicHighlight | null {
  const meta = TOPIC_META[topicId];
  if (!meta) return null;

  return {
    topicId,
    topicName: meta.name,
    icon: meta.icon,
    quickAnswers: QUICK_ANSWERS[topicId] || [],
    tables: TABLES[topicId] || [],
    keyFacts: KEY_FACTS[topicId] || [],
  };
}

/**
 * Get all available topics
 */
export function getAllTopics(): Array<{ id: string; name: string; icon: string }> {
  return Object.entries(TOPIC_META).map(([id, meta]) => ({
    id,
    name: meta.name,
    icon: meta.icon,
  }));
}

/**
 * Get highlights from transcript text (combines detection and retrieval)
 */
export function getHighlightsFromText(text: string): TopicHighlight | null {
  const topicId = detectTopic(text);
  if (!topicId) return null;
  return getHighlightsForTopic(topicId);
}
