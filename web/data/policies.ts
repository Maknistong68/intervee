export interface Amendment {
  reference: string;
  year: string;
  description: string;
}

export interface Policy {
  id: string;
  ruleNumber: string;
  title: string;
  fullTitle: string;
  keywords: string[];
  summary: string;
  amendments?: Amendment[];
  keyRequirements: string[];
  penalties?: string;
}

export interface TechnicalTable {
  id: string;
  title: string;
  keywords: string[];
  description: string;
  tableData: {
    headers: string[];
    rows: string[][];
  };
}

export const policies: Policy[] = [
  {
    id: 'rule1020',
    ruleNumber: 'Rule 1020',
    title: 'Registration',
    fullTitle: 'Registration of Establishments',
    keywords: ['registration', 'register', 'dole', 'compliance', 'rule 1020', '1020'],
    summary: 'Requires all workplaces to register with DOLE Regional Office. This ensures government oversight of workplace safety conditions and enables monitoring of OSH compliance across all industries.',
    keyRequirements: [
      'Register within 30 days of business operation',
      'Submit registration form to DOLE Regional Office',
      'Annual renewal of registration',
      'Display registration certificate in workplace',
      'Update registration when there are changes in business'
    ],
    penalties: 'Non-registration may result in fines and closure orders'
  },
  {
    id: 'rule1030',
    ruleNumber: 'Rule 1030',
    title: 'Training & Personnel',
    fullTitle: 'Training of Personnel in Occupational Safety and Health',
    keywords: ['safety officer', 'so1', 'so2', 'so3', 'so4', 'bosh', 'training', 'rule 1030', '1030', 'cosh', 'personnel', 'do 252', 'd.o. 252', 'do252', 'department order 252'],
    summary: 'Mandates proper OSH training for workplace personnel. Employers must designate trained Safety Officers based on workplace size and hazard level. Training ensures competent personnel to implement OSH programs.',
    amendments: [
      {
        reference: 'D.O. No. 252, s. 2025',
        year: '2025',
        description: 'Updated Safety Officer classification requirements. Revised training hour requirements and qualifications for SO1-SO4. Introduced new competency standards aligned with international best practices.'
      }
    ],
    keyRequirements: [
      'SO1: 1-9 workers (8-hr orientation)',
      'SO2: 10-50 workers (40-hr BOSH)',
      'SO3: 51-200 workers (40-hr BOSH + experience)',
      'SO4: 201+ workers (COSH trained)',
      'Refresher training every 3 years',
      'Safety Officer must be accredited by DOLE'
    ],
    penalties: 'Failure to designate SO: PHP 20,000 - 100,000 per day'
  },
  {
    id: 'rule1040',
    ruleNumber: 'Rule 1040',
    title: 'Health & Safety Committee',
    fullTitle: 'Health and Safety Committee (HSC)',
    keywords: ['hsc', 'health and safety committee', 'committee', 'rule 1040', '1040'],
    summary: 'Requires establishment of joint employer-employee Health and Safety Committee. The HSC serves as the planning and policy-making body for OSH programs, ensuring worker participation in safety decisions.',
    amendments: [
      {
        reference: 'D.O. No. 252, s. 2025',
        year: '2025',
        description: 'Revised HSC composition requirements. Updated meeting frequency and documentation standards. Strengthened worker representation provisions and expanded HSC responsibilities.'
      }
    ],
    keyRequirements: [
      'Required for workplaces with 10+ employees',
      'Equal employer-employee representation',
      'Monthly meetings minimum',
      'Maintain minutes of all meetings',
      'Develop and review OSH programs',
      'Investigate accidents and recommend prevention'
    ],
    penalties: 'Non-compliance: PHP 20,000 - 100,000'
  },
  {
    id: 'rule1050',
    ruleNumber: 'Rule 1050',
    title: 'Accident/Illness Reporting',
    fullTitle: 'Notification and Keeping of Records of Accidents and/or Occupational Illnesses',
    keywords: ['accident', 'incident', 'illness', 'wair', 'report', 'notification', 'records', 'rule 1050', '1050', 'la 07', 'l.a. 07', 'la07', 'labor advisory 07'],
    summary: 'Establishes requirements for reporting and documenting workplace accidents and occupational illnesses. Proper reporting enables DOLE to monitor workplace safety trends and enforce compliance.',
    amendments: [
      {
        reference: 'L.A. No. 07, s. 2022',
        year: '2022',
        description: 'Introduced electronic reporting system (WAIR Online). Simplified reporting forms and streamlined submission process. Added provisions for remote/online submission of accident reports.'
      },
      {
        reference: 'D.O. No. 252, s. 2025',
        year: '2025',
        description: 'Updated reporting timelines and requirements. Enhanced data privacy provisions for medical records. Added new categories for reporting work-related COVID-19 cases.'
      }
    ],
    keyRequirements: [
      'Report fatal accidents within 24 hours',
      'Report serious injuries within 5 days',
      'Submit WAIR (Work Accident/Illness Report)',
      'Maintain records for 5 years minimum',
      'Include near-miss incidents in records',
      'Conduct accident investigation for all incidents'
    ],
    penalties: 'Failure to report: PHP 50,000 - 100,000 per incident'
  },
  {
    id: 'rule1070',
    ruleNumber: 'Rule 1070',
    title: 'Environmental Control',
    fullTitle: 'Occupational Health and Environmental Control',
    keywords: ['environmental', 'environment', 'ventilation', 'air quality', 'rule 1070', '1070', 'occupational health', 'noise', 'heat', 'do 136', 'd.o. 136', 'do136', 'drug-free', 'drug free', 'do 160', 'd.o. 160', 'do160', 'hiv', 'aids', 'do 254', 'd.o. 254', 'do254', 'hepatitis', 'do 224', 'd.o. 224', 'do224', 'mental health'],
    summary: 'Covers control of workplace environmental hazards including ventilation, lighting, noise, temperature, and chemical exposure. Aims to prevent occupational diseases caused by hazardous work conditions.',
    amendments: [
      {
        reference: 'D.O. No. 136, s. 2014',
        year: '2014',
        description: 'Guidelines for Drug-Free Workplace. Establishes mandatory drug testing programs and rehabilitation provisions for workers with substance abuse issues.'
      },
      {
        reference: 'D.O. No. 160, s. 2016',
        year: '2016',
        description: 'Rules on HIV/AIDS Prevention in the Workplace. Prohibits discrimination against HIV-positive workers and mandates education programs.'
      },
      {
        reference: 'D.O. No. 254, s. 2016',
        year: '2016',
        description: 'Guidelines on Hepatitis B Prevention. Requires vaccination programs and prohibits discrimination against Hepatitis B positive workers.'
      },
      {
        reference: 'D.O. No. 224, s. 2021',
        year: '2021',
        description: 'Guidelines for Workplace Mental Health Program. Mandates mental health policies, stress management, and access to mental health services.'
      }
    ],
    keyRequirements: [
      'Maintain proper ventilation (minimum air changes)',
      'Control noise levels (85 dB max for 8 hours)',
      'Adequate lighting per work type',
      'Temperature control (23-26°C recommended)',
      'Chemical exposure within TLV limits',
      'Regular environmental monitoring'
    ],
    penalties: 'Violation: PHP 20,000 - 100,000 plus closure'
  },
  {
    id: 'rule1080',
    ruleNumber: 'Rule 1080',
    title: 'PPE',
    fullTitle: 'Personal Protective Equipment and Devices',
    keywords: ['ppe', 'personal protective equipment', 'safety equipment', 'rule 1080', '1080', 'helmet', 'gloves', 'goggles', 'protective'],
    summary: 'Requires employers to provide appropriate PPE to workers exposed to hazards. PPE is the last line of defense after engineering and administrative controls. Must be properly selected, maintained, and used.',
    keyRequirements: [
      'Employer provides PPE free of charge',
      'PPE must meet Philippine National Standards',
      'Proper selection based on hazard assessment',
      'Training on correct PPE use and maintenance',
      'Regular inspection and replacement',
      'Workers must use provided PPE'
    ],
    penalties: 'Non-provision of PPE: PHP 20,000 - 100,000'
  },
  {
    id: 'rule1960',
    ruleNumber: 'Rule 1960',
    title: 'Occupational Health Services',
    fullTitle: 'Occupational Health Services',
    keywords: ['health services', 'medical', 'first aid', 'clinic', 'nurse', 'physician', 'rule 1960', '1960', 'ohs', 'doctor', 'first aider', 'do 53', 'd.o. 53', 'do53', 'call center', 'do 73', 'd.o. 73', 'do73', 'tuberculosis', 'tb', 'do 102', 'd.o. 102', 'do102', 'do 178', 'd.o. 178', 'do178', 'healthy lifestyle', 'do 184', 'd.o. 184', 'do184', 'puv', 'do 208', 'd.o. 208', 'do208', 'covid', 'do 235', 'd.o. 235', 'do235', 'telecommuting', 'work from home', 'wfh', 'da 05', 'd.a. 05', 'da05', 'solo parent', 'la 01', 'l.a. 01', 'la01', 'la 08', 'l.a. 08', 'la08', 'la 19', 'l.a. 19', 'la19', 'la 20', 'l.a. 20', 'la20', 'la 21', 'l.a. 21', 'la21', 'la 22', 'l.a. 22', 'la22', 'la 23', 'l.a. 23', 'la23', 'gig economy'],
    summary: 'Establishes requirements for workplace health services including first aid, medical personnel, and health facilities. Ensures immediate medical response capability and ongoing health monitoring of workers.',
    amendments: [
      {
        reference: 'D.O. No. 53, s. 2003',
        year: '2003',
        description: 'Guidelines on Occupational Safety and Health for Call Center Industry. Addresses unique hazards like voice strain, ergonomic issues, and night shift health concerns.'
      },
      {
        reference: 'D.O. No. 73, s. 2005',
        year: '2005',
        description: 'Guidelines for Implementation of Policy on TB in the Workplace. Mandates TB prevention programs and non-discrimination policies. Amended by L.A. No. 21, s. 2023.'
      },
      {
        reference: 'D.O. No. 102, s. 2010',
        year: '2010',
        description: 'Guidelines for Medical, Dental Practitioners and Nurses in the Workplace. Sets qualifications and duties of healthcare personnel. Amended by L.A. No. 22, s. 2023.'
      },
      {
        reference: 'D.O. No. 178, s. 2017',
        year: '2017',
        description: 'Guidelines on Healthy Lifestyle Programs. Promotes wellness activities including exercise, nutrition, and smoking cessation in workplaces.'
      },
      {
        reference: 'D.O. No. 184, s. 2017',
        year: '2017',
        description: 'Guidelines on Occupational Safety in Public Utility Vehicles (PUV). Addresses driver fatigue, health monitoring, and safety requirements for transport workers.'
      },
      {
        reference: 'D.O. No. 208, s. 2020',
        year: '2020',
        description: 'Guidelines on COVID-19 Prevention in Workplaces. Establishes minimum health protocols, ventilation, and isolation requirements. Amended by L.A. No. 19, s. 2023.'
      },
      {
        reference: 'D.O. No. 235, s. 2022',
        year: '2022',
        description: 'Guidelines for Telecommuting/Work-From-Home Arrangements. Addresses OSH requirements for remote workers including ergonomics and mental health.'
      },
      {
        reference: 'D.O. No. 252, s. 2025',
        year: '2025',
        description: 'Comprehensive update to health services requirements. Revised staffing ratios, facility requirements, and medical examination standards.'
      },
      {
        reference: 'D.A. No. 05, s. 2010',
        year: '2010',
        description: 'Guidelines on Solo Parents in the Workplace. Provides flexible work arrangements and health support for solo parent workers.'
      },
      {
        reference: 'L.A. No. 01, s. 2023',
        year: '2023',
        description: 'Updated guidelines on annual physical examination requirements. Standardized medical forms and examination procedures.'
      },
      {
        reference: 'L.A. No. 08, s. 2023',
        year: '2023',
        description: 'Guidelines on mental health first aid training. Requires trained mental health responders in larger workplaces.'
      },
      {
        reference: 'L.A. No. 19, s. 2023',
        year: '2023',
        description: 'Amendment to COVID-19 guidelines transitioning to endemic management protocols.'
      },
      {
        reference: 'L.A. No. 20, s. 2023',
        year: '2023',
        description: 'Updated requirements for workplace clinics and emergency medical equipment.'
      },
      {
        reference: 'L.A. No. 21, s. 2023',
        year: '2023',
        description: 'Amendment to TB workplace policy aligned with updated DOH guidelines.'
      },
      {
        reference: 'L.A. No. 22, s. 2023',
        year: '2023',
        description: 'Updated qualifications and continuing education requirements for workplace health personnel.'
      },
      {
        reference: 'L.A. No. 23, s. 2023',
        year: '2023',
        description: 'Guidelines on occupational health services for gig economy and platform workers.'
      }
    ],
    keyRequirements: [
      'First-aider: 1 per 25 workers (trained)',
      'Nurse: Required for 50-199 workers (full-time)',
      'Physician: Required for 200+ workers (part-time)',
      'First aid kit contents per OSHS standards',
      'Emergency medical plan and procedures',
      'Annual physical examination for all workers',
      'Medical records maintained for 20 years'
    ],
    penalties: 'Inadequate health services: PHP 50,000 - 100,000'
  },
  {
    id: 'do128',
    ruleNumber: 'D.O. 128-13',
    title: 'Construction Safety',
    fullTitle: 'Guidelines Governing Occupational Safety and Health in the Construction Industry',
    keywords: ['do 128', 'd.o. 128', 'do128', 'do 128-13', 'construction', 'building', 'contractor', 'construction safety', 'scaffold', 'fall protection', 'excavation'],
    summary: 'Comprehensive safety guidelines specific to construction industry. Addresses high-risk activities like working at heights, excavation, and heavy equipment operation. Construction has the highest fatality rate among industries.',
    keyRequirements: [
      'Construction Safety and Health Program (CSHP)',
      'Full-time Safety Officer on site',
      'Fall protection for heights above 1.8m',
      'Scaffolding inspection and certification',
      'Excavation safety protocols',
      'Heavy equipment operator certification',
      'Daily safety toolbox meetings',
      'Personal fall arrest systems (PFAS)'
    ],
    penalties: 'Violation: PHP 100,000+ and project stoppage'
  },
  {
    id: 'do253',
    ruleNumber: 'D.O. 253-25',
    title: 'Revised OSHS',
    fullTitle: 'Revised Occupational Safety and Health Standards (2025)',
    keywords: ['do 253', 'd.o. 253', 'do253', 'do 253-25', 'revised oshs', 'updated standards', 'new oshs'],
    summary: 'Latest comprehensive revision of the OSHS aligned with RA 11058 (OSH Law). Updates penalties, strengthens enforcement, and modernizes safety requirements to international standards.',
    keyRequirements: [
      'Aligned with RA 11058 provisions',
      'Increased penalties for violations',
      'Digital reporting and compliance systems',
      'Enhanced worker participation rights',
      'Updated hazard classifications',
      'New provisions for emerging industries',
      'Strengthened enforcement mechanisms'
    ],
    penalties: 'As per RA 11058: PHP 100,000+ and imprisonment'
  },
  {
    id: 'ra11058',
    ruleNumber: 'RA 11058',
    title: 'OSH Law',
    fullTitle: 'Occupational Safety and Health Standards Act (OSH Law)',
    keywords: ['ra 11058', 'osh law', 'republic act', 'law', 'osh act', '11058'],
    summary: 'The primary legislation governing workplace safety in the Philippines. Signed into law in 2018, it strengthens OSHS enforcement with stiffer penalties and broader coverage. Applies to ALL workplaces regardless of size.',
    keyRequirements: [
      'Applies to ALL establishments (no exemptions)',
      'Right of workers to refuse unsafe work',
      'Mandatory OSH programs for all employers',
      'Right to report violations (whistleblower protection)',
      'Employer duty to provide safe workplace',
      'Worker duty to comply with OSH rules',
      'DOLE authority to close unsafe workplaces'
    ],
    penalties: 'First offense: PHP 100,000/day. Repeat: imprisonment 6 months - 6 years'
  }
];

export const technicalTables: TechnicalTable[] = [
  {
    id: 'tlv',
    title: 'TLV Chemical Exposure Limits',
    keywords: ['tlv', 'threshold limit value', 'chemical exposure', 'ppm', 'mg/m3'],
    description: 'Threshold Limit Values (TLV) represent airborne concentrations of chemical substances to which workers may be repeatedly exposed without adverse health effects.',
    tableData: {
      headers: ['Chemical', 'TLV-TWA', 'TLV-STEL', 'Unit'],
      rows: [
        ['Carbon Monoxide', '25', '-', 'ppm'],
        ['Ammonia', '25', '35', 'ppm'],
        ['Benzene', '0.5', '2.5', 'ppm'],
        ['Formaldehyde', '0.3', '-', 'ppm'],
        ['Hydrogen Sulfide', '1', '5', 'ppm'],
        ['Lead', '0.05', '-', 'mg/m³'],
        ['Toluene', '20', '-', 'ppm'],
      ],
    },
  },
  {
    id: 'noise',
    title: 'Noise Exposure Limits (Rule 1070)',
    keywords: ['noise', 'decibel', 'db', 'hearing', 'noise exposure'],
    description: 'Permissible noise exposure levels based on duration. Exposure above these limits requires hearing protection and engineering controls.',
    tableData: {
      headers: ['Duration (hrs)', 'Max dB'],
      rows: [
        ['8', '90'],
        ['6', '92'],
        ['4', '95'],
        ['3', '97'],
        ['2', '100'],
        ['1.5', '102'],
        ['1', '105'],
        ['0.5', '110'],
        ['0.25', '115'],
      ],
    },
  },
  {
    id: 'wbgt',
    title: 'Heat Stress WBGT Limits',
    keywords: ['wbgt', 'heat stress', 'wet bulb', 'heat index', 'temperature'],
    description: 'Wet Bulb Globe Temperature (WBGT) limits for different work intensities and work-rest cycles. Exceeding these limits requires additional rest breaks.',
    tableData: {
      headers: ['Work Intensity', 'Continuous', '75% work', '50% work', '25% work'],
      rows: [
        ['Light', '30.0°C', '30.6°C', '31.4°C', '32.2°C'],
        ['Moderate', '26.7°C', '28.0°C', '29.4°C', '31.1°C'],
        ['Heavy', '25.0°C', '25.9°C', '27.9°C', '30.0°C'],
      ],
    },
  },
  {
    id: 'lighting',
    title: 'Lighting Requirements (Minimum Lux)',
    keywords: ['lighting', 'lux', 'illumination', 'light level'],
    description: 'Minimum illumination levels required for different work areas and tasks to ensure adequate visibility and prevent eye strain.',
    tableData: {
      headers: ['Work Area/Task', 'Lux'],
      rows: [
        ['Emergency lighting', '5'],
        ['Corridors, stairs', '100'],
        ['Warehouses', '150'],
        ['General office', '300'],
        ['Detailed work', '500'],
        ['Fine assembly', '750'],
        ['Precision work', '1000'],
      ],
    },
  },
];

export type DetectionResult = { type: 'policy'; id: string } | { type: 'table'; id: string } | null;

export function detectFromText(text: string): DetectionResult {
  const lowerText = text.toLowerCase();

  // Check policies first
  for (const policy of policies) {
    for (const keyword of policy.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { type: 'policy', id: policy.id };
      }
    }
  }

  // Then check technical tables
  for (const table of technicalTables) {
    for (const keyword of table.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { type: 'table', id: table.id };
      }
    }
  }

  return null;
}

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
