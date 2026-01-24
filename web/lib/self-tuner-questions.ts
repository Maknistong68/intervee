export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SelfTunerQuestion {
  id: string;
  topic: string;
  type: 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL' | 'SITUATIONAL' | 'TRICKY';
  difficulty: Difficulty;
  question: string;
  citation: string;
}

export const SELF_TUNER_QUESTIONS: SelfTunerQuestion[] = [
  // ============================================
  // EASY QUESTIONS - Direct recall, basic facts
  // ============================================

  // Safety Officer - Easy
  {
    id: 'SO-E01',
    topic: 'Safety Officer',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'How many training hours are required for SO1 certification?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-E02',
    topic: 'Safety Officer',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'How many training hours are required for SO2 certification?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-E03',
    topic: 'Safety Officer',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'How many training hours are required for SO3/COSH certification?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-E04',
    topic: 'Safety Officer',
    type: 'GENERIC',
    difficulty: 'easy',
    question: 'What are the different safety officer levels in the Philippines?',
    citation: 'Rule 1030',
  },

  // HSC - Easy
  {
    id: 'HSC-E01',
    topic: 'HSC',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'How often should HSC meetings be held in hazardous workplaces?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-E02',
    topic: 'HSC',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'How often should HSC meetings be held in non-hazardous workplaces?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-E03',
    topic: 'HSC',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What are the types of Health and Safety Committee?',
    citation: 'Rule 1040',
  },

  // Environmental - Easy
  {
    id: 'ENV-E01',
    topic: 'Environmental',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the permissible noise exposure for 8 hours?',
    citation: 'Rule 1070',
  },
  {
    id: 'ENV-E02',
    topic: 'Environmental',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the peak impact noise ceiling?',
    citation: 'Rule 1070',
  },
  {
    id: 'ENV-E03',
    topic: 'Environmental',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the required illumination for general work areas?',
    citation: 'Rule 1070',
  },

  // Penalties - Easy
  {
    id: 'PEN-E01',
    topic: 'Penalties',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the penalty for first offense OSH violation for a micro enterprise?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-E02',
    topic: 'Penalties',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the penalty for first offense for a large enterprise?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-E03',
    topic: 'Penalties',
    type: 'GENERIC',
    difficulty: 'easy',
    question: 'Can DOLE issue a work stoppage order?',
    citation: 'RA 11058',
  },

  // PPE - Easy
  {
    id: 'PPE-E01',
    topic: 'PPE',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'Who is responsible for providing PPE to workers?',
    citation: 'Rule 1080',
  },
  {
    id: 'PPE-E02',
    topic: 'PPE',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'Can employers charge workers for PPE?',
    citation: 'Rule 1080',
  },

  // Registration - Easy
  {
    id: 'REG-E01',
    topic: 'Registration',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'Is there a fee for DOLE establishment registration?',
    citation: 'Rule 1020',
  },
  {
    id: 'REG-E02',
    topic: 'Registration',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the form number for establishment registration?',
    citation: 'Rule 1020',
  },

  // Accident - Easy
  {
    id: 'ACC-E01',
    topic: 'Accident Reporting',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the deadline for reporting fatal accidents to DOLE?',
    citation: 'Rule 1050',
  },

  // Premises - Easy
  {
    id: 'PRM-E01',
    topic: 'Premises',
    type: 'SPECIFIC',
    difficulty: 'easy',
    question: 'What is the minimum headroom for workplaces?',
    citation: 'Rule 1060',
  },

  // ============================================
  // MEDIUM QUESTIONS - Application, calculations
  // ============================================

  // Safety Officer - Medium
  {
    id: 'SO-M01',
    topic: 'Safety Officer',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What safety officer is required for construction projects?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-M02',
    topic: 'Safety Officer',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the renewal requirement for SO3/COSH?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-M03',
    topic: 'Safety Officer',
    type: 'PROCEDURAL',
    difficulty: 'medium',
    question: 'How does a safety officer maintain their certification?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-M04',
    topic: 'Safety Officer',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What safety officer is required for a high-risk workplace with 150 workers?',
    citation: 'Rule 1030',
  },

  // HSC - Medium
  {
    id: 'HSC-M01',
    topic: 'HSC',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'When is a Health and Safety Committee required?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-M02',
    topic: 'HSC',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What type of HSC is required for a workplace with 500 workers?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-M03',
    topic: 'HSC',
    type: 'PROCEDURAL',
    difficulty: 'medium',
    question: 'How to organize a Health and Safety Committee?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-M04',
    topic: 'HSC',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the composition of a Type A HSC?',
    citation: 'Rule 1040',
  },

  // Environmental - Medium
  {
    id: 'ENV-M01',
    topic: 'Environmental',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the permissible noise exposure for 4 hours?',
    citation: 'Rule 1070',
  },
  {
    id: 'ENV-M02',
    topic: 'Environmental',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the air supply requirement per worker?',
    citation: 'Rule 1070',
  },
  {
    id: 'ENV-M03',
    topic: 'Environmental',
    type: 'PROCEDURAL',
    difficulty: 'medium',
    question: 'How often should working environment be measured in hazardous workplaces?',
    citation: 'Rule 1070',
  },

  // Penalties - Medium
  {
    id: 'PEN-M01',
    topic: 'Penalties',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the penalty for death due to OSH violation?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-M02',
    topic: 'Penalties',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'Who is liable for OSH violations involving contractors?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-M03',
    topic: 'Penalties',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the penalty for willful OSH violation?',
    citation: 'RA 11058',
  },

  // PPE - Medium
  {
    id: 'PPE-M01',
    topic: 'PPE',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'At what height is fall protection required under OSHS?',
    citation: 'Rule 1080',
  },
  {
    id: 'PPE-M02',
    topic: 'PPE',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'When is hearing protection required?',
    citation: 'Rule 1080',
  },

  // Registration - Medium
  {
    id: 'REG-M01',
    topic: 'Registration',
    type: 'PROCEDURAL',
    difficulty: 'medium',
    question: 'How to register an establishment with DOLE?',
    citation: 'Rule 1020',
  },
  {
    id: 'REG-M02',
    topic: 'Registration',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What changes require updating DOLE registration?',
    citation: 'Rule 1020',
  },

  // Accident - Medium
  {
    id: 'ACC-M01',
    topic: 'Accident Reporting',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'How is the frequency rate calculated?',
    citation: 'Rule 1050',
  },
  {
    id: 'ACC-M02',
    topic: 'Accident Reporting',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'How is the severity rate calculated?',
    citation: 'Rule 1050',
  },

  // Confined Space - Medium
  {
    id: 'CNF-M01',
    topic: 'Confined Space',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is the minimum oxygen level for confined space entry?',
    citation: 'Rule 1120',
  },
  {
    id: 'CNF-M02',
    topic: 'Confined Space',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'What is required before entering a confined space?',
    citation: 'Rule 1120',
  },

  // Health Services - Medium
  {
    id: 'HLT-M01',
    topic: 'Health Services',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'When is a workplace clinic required?',
    citation: 'Rule 1960',
  },
  {
    id: 'HLT-M02',
    topic: 'Health Services',
    type: 'SPECIFIC',
    difficulty: 'medium',
    question: 'How many first aiders are required per shift?',
    citation: 'Rule 1960',
  },

  // ============================================
  // HARD QUESTIONS - Situational, tricky, edge cases
  // ============================================

  // Safety Officer - Hard/Situational
  {
    id: 'SO-H01',
    topic: 'Safety Officer',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A manufacturing company has 200 workers in a non-hazardous facility but operates welding in one section. What safety officer classification is required?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-H02',
    topic: 'Safety Officer',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'An SO3 certificate expired 3 months ago. Can the safety officer still perform their duties while waiting for renewal?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-H03',
    topic: 'Safety Officer',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'What is the difference between SO3 and COSH? Are they the same certification?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-H04',
    topic: 'Safety Officer',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A company has two shifts with 80 workers each in a hazardous workplace. How many safety officers are needed and what level?',
    citation: 'Rule 1030',
  },
  {
    id: 'SO-H05',
    topic: 'Safety Officer',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'Can an SO1 serve as the sole safety officer for a small construction project with only 5 workers?',
    citation: 'Rule 1030',
  },

  // HSC - Hard/Situational
  {
    id: 'HSC-H01',
    topic: 'HSC',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A company has 8 office workers but also employs 3 workers handling hazardous chemicals. Do they need an HSC?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-H02',
    topic: 'HSC',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'The HSC meeting was cancelled for 2 consecutive months in a hazardous workplace. What are the implications?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-H03',
    topic: 'HSC',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'Can the company owner serve as chairman of the HSC if the company only has 50 workers?',
    citation: 'Rule 1040',
  },
  {
    id: 'HSC-H04',
    topic: 'HSC',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A company downsized from 450 to 380 workers. Should they reorganize their HSC from Type A to Type B?',
    citation: 'Rule 1040',
  },

  // Penalties - Hard/Situational
  {
    id: 'PEN-H01',
    topic: 'Penalties',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A contractor caused a fatal accident on a project. The principal employer claims they are not liable since they hired a licensed contractor. Is this defense valid?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-H02',
    topic: 'Penalties',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A medium enterprise committed a second offense but argues the first offense was 5 years ago. Does the penalty still escalate?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-H03',
    topic: 'Penalties',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'What constitutes a "willful" OSH violation versus a regular violation?',
    citation: 'RA 11058',
  },
  {
    id: 'PEN-H04',
    topic: 'Penalties',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'DOLE issued a work stoppage order but the company believes it is unjust. What remedies are available?',
    citation: 'RA 11058',
  },

  // Environmental - Hard/Situational
  {
    id: 'ENV-H01',
    topic: 'Environmental',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A worker is exposed to 95 dBA for 3 hours and 90 dBA for 5 hours in the same shift. Is this within permissible limits?',
    citation: 'Rule 1070',
  },
  {
    id: 'ENV-H02',
    topic: 'Environmental',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'What is the difference between continuous noise exposure limits and impact noise limits?',
    citation: 'Rule 1070',
  },
  {
    id: 'ENV-H03',
    topic: 'Environmental',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A factory has good natural ventilation but no mechanical ventilation. Is this compliant with OSHS if air quality tests pass?',
    citation: 'Rule 1070',
  },

  // PPE - Hard/Situational
  {
    id: 'PPE-H01',
    topic: 'PPE',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A worker refuses to wear provided PPE citing discomfort. The employer terminates the worker. Is this termination justified under OSH law?',
    citation: 'Rule 1080',
  },
  {
    id: 'PPE-H02',
    topic: 'PPE',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'An employer provides PPE but deducts the cost from the worker\'s salary over 6 months. Is this allowed?',
    citation: 'Rule 1080',
  },
  {
    id: 'PPE-H03',
    topic: 'PPE',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'If work is at 5.5 meters height, is fall protection required? What about at exactly 6 meters?',
    citation: 'Rule 1080',
  },

  // Accident Reporting - Hard/Situational
  {
    id: 'ACC-H01',
    topic: 'Accident Reporting',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A worker died 45 days after a workplace accident from complications. Should this be reported as a fatal accident?',
    citation: 'Rule 1050',
  },
  {
    id: 'ACC-H02',
    topic: 'Accident Reporting',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A company had 5 disabling injuries with 100,000 man-hours worked. What is their frequency rate and how does it compare to acceptable levels?',
    citation: 'Rule 1050',
  },
  {
    id: 'ACC-H03',
    topic: 'Accident Reporting',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'What is the difference between a "disabling injury" and a "non-disabling injury" under OSHS?',
    citation: 'Rule 1050',
  },

  // Registration - Hard/Situational
  {
    id: 'REG-H01',
    topic: 'Registration',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A company relocated to a new building in the same city. Do they need to re-register with DOLE or just update their registration?',
    citation: 'Rule 1020',
  },
  {
    id: 'REG-H02',
    topic: 'Registration',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A business has been operating for 2 years without DOLE registration. What are the consequences and how should they proceed?',
    citation: 'Rule 1020',
  },

  // Confined Space - Hard/Situational
  {
    id: 'CNF-H01',
    topic: 'Confined Space',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'Oxygen level in a confined space reads 19%. Can entry proceed with supplied air respirators?',
    citation: 'Rule 1120',
  },
  {
    id: 'CNF-H02',
    topic: 'Confined Space',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'During confined space entry, the entry watcher needs to use the restroom. What is the proper procedure?',
    citation: 'Rule 1120',
  },
  {
    id: 'CNF-H03',
    topic: 'Confined Space',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'Is a large open-top tank considered a confined space under OSHS?',
    citation: 'Rule 1120',
  },

  // Health Services - Hard/Situational
  {
    id: 'HLT-H01',
    topic: 'Health Services',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A company has 250 workers in a non-hazardous workplace. Do they need a full-time nurse or part-time physician?',
    citation: 'Rule 1960',
  },
  {
    id: 'HLT-H02',
    topic: 'Health Services',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A worker was classified as "Class C" during pre-employment medical exam. Can the employer refuse to hire them?',
    citation: 'Rule 1960',
  },
  {
    id: 'HLT-H03',
    topic: 'Health Services',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'What is the difference between a first-aider and a first-aid trained safety officer?',
    citation: 'Rule 1960',
  },

  // Hazardous Materials - Hard/Situational
  {
    id: 'HAZ-H01',
    topic: 'Hazardous Materials',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A chemical supplier provides SDS in English only, but workers only understand Filipino. Is the employer compliant?',
    citation: 'Rule 1090',
  },
  {
    id: 'HAZ-H02',
    topic: 'Hazardous Materials',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'Two incompatible chemicals are stored in the same room but in separate cabinets. Is this compliant with OSHS?',
    citation: 'Rule 1090',
  },

  // Cross-topic Hard Questions
  {
    id: 'CROSS-H01',
    topic: 'Multiple',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'A new company is starting operations with 25 workers in a chemical manufacturing facility. List all OSH requirements they must comply with before starting.',
    citation: 'Multiple Rules',
  },
  {
    id: 'CROSS-H02',
    topic: 'Multiple',
    type: 'SITUATIONAL',
    difficulty: 'hard',
    question: 'During a DOLE inspection, several violations were found. What factors determine whether penalties are imposed immediately or a compliance order is issued first?',
    citation: 'RA 11058',
  },
  {
    id: 'CROSS-H03',
    topic: 'Multiple',
    type: 'TRICKY',
    difficulty: 'hard',
    question: 'What is the hierarchy of controls in OSH and when is PPE the appropriate solution?',
    citation: 'Rule 1080',
  },
];
