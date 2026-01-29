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
    keywords: ['tlv limit', 'tlv-twa', 'tlv-stel', 'threshold limit value', 'chemical exposure limit', 'permissible exposure limit', 'pel limit', 'occupational exposure limit', 'oel limit', 'airborne concentration limit', 'chemical tlv'],
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
    keywords: ['noise exposure limit', 'decibel limit', 'db limit', 'hearing conservation', 'noise level limit', 'permissible noise', 'occupational noise', 'noise duration', 'sound level limit', 'noise exposure table', 'dba limit'],
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
    keywords: ['wbgt limit', 'heat stress limit', 'wet bulb globe', 'heat exposure limit', 'thermal stress', 'heat index limit', 'work rest cycle', 'heat illness prevention', 'hot environment limit', 'occupational heat', 'wbgt table'],
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
    keywords: ['lighting requirement', 'lux level', 'lux requirement', 'illumination level', 'illumination requirement', 'minimum lux', 'light level requirement', 'workplace lighting'],
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
  {
    id: 'fire-extinguisher',
    title: 'Fire Extinguisher Classification',
    keywords: ['fire extinguisher', 'fire extinguisher type', 'fire extinguisher class', 'extinguisher classification', 'class a fire', 'class b fire', 'class c fire', 'class d fire', 'class k fire', 'fire suppression', 'portable fire extinguisher'],
    description: 'Fire extinguisher classifications and their appropriate uses. Selecting the correct extinguisher type is critical for effective fire suppression and safety.',
    tableData: {
      headers: ['Class', 'Fire Type', 'Extinguisher Agent', 'Common Uses'],
      rows: [
        ['A', 'Ordinary combustibles', 'Water, Foam, Dry Chemical', 'Wood, paper, cloth, rubber'],
        ['B', 'Flammable liquids', 'CO2, Foam, Dry Chemical', 'Gasoline, oil, grease, solvents'],
        ['C', 'Electrical equipment', 'CO2, Dry Chemical', 'Wiring, motors, appliances'],
        ['D', 'Combustible metals', 'Dry Powder (special)', 'Magnesium, titanium, sodium'],
        ['K', 'Cooking oils/fats', 'Wet Chemical', 'Kitchen fires, deep fryers'],
      ],
    },
  },
  {
    id: 'safety-colors',
    title: 'Safety Color Coding Standards',
    keywords: ['safety color', 'color coding', 'color code standard', 'pipe color', 'safety sign color', 'color marking', 'hazard color', 'safety color code', 'color identification'],
    description: 'Standard safety colors used for identification of hazards, equipment, and piping in the workplace per OSHS and international standards.',
    tableData: {
      headers: ['Color', 'Meaning', 'Application'],
      rows: [
        ['Red', 'Danger / Fire', 'Fire equipment, stop buttons, flammable liquids'],
        ['Orange', 'Warning', 'Moving parts, pinch points, machine hazards'],
        ['Yellow', 'Caution', 'Physical hazards, tripping, falling, striking'],
        ['Green', 'Safety / First Aid', 'First aid, safety equipment, exits'],
        ['Blue', 'Information / Mandatory', 'PPE required, notices, information'],
        ['Purple', 'Radiation', 'Radioactive materials and areas'],
        ['White', 'Traffic / Housekeeping', 'Aisles, walkways, storage areas'],
        ['Black/White', 'Boundaries', 'Traffic markings, housekeeping'],
      ],
    },
  },
  {
    id: 'first-aid-kit',
    title: 'First Aid Kit Requirements',
    keywords: ['first aid kit', 'first aid kit contents', 'first aid supplies', 'first aid requirement', 'first aid box', 'emergency kit contents', 'first aid equipment', 'medical kit'],
    description: 'Required first aid kit contents based on workplace size and risk level. Kits must be readily accessible and regularly inspected.',
    tableData: {
      headers: ['Item', 'Small (1-25)', 'Medium (26-50)', 'Large (51+)'],
      rows: [
        ['Adhesive bandages (assorted)', '16', '32', '50'],
        ['Sterile gauze pads (4x4)', '4', '8', '12'],
        ['Triangular bandage', '1', '2', '4'],
        ['Elastic bandage', '1', '2', '3'],
        ['Adhesive tape roll', '1', '2', '3'],
        ['Antiseptic wipes', '10', '20', '30'],
        ['Burn dressing', '1', '2', '4'],
        ['Eye wash (500ml)', '1', '1', '2'],
        ['Disposable gloves (pairs)', '4', '8', '12'],
        ['Scissors', '1', '1', '2'],
        ['Tweezers', '1', '1', '2'],
        ['CPR mask', '1', '1', '2'],
        ['First aid manual', '1', '1', '1'],
      ],
    },
  },
  {
    id: 'confined-space',
    title: 'Confined Space Atmospheric Limits',
    keywords: ['confined space', 'confined space limit', 'atmospheric limit', 'oxygen level', 'confined space entry', 'permit required space', 'atmospheric hazard', 'gas level confined', 'confined space oxygen', 'lel limit'],
    description: 'Safe atmospheric limits for confined space entry. Entry requires atmospheric testing and may require permit and rescue provisions.',
    tableData: {
      headers: ['Parameter', 'Safe Range', 'Action Level', 'IDLH'],
      rows: [
        ['Oxygen (O2)', '19.5% - 23.5%', '<19.5% or >23.5%', '<16%'],
        ['Flammable Gas (LEL)', '0%', '>10% LEL', '>20% LEL'],
        ['Carbon Monoxide (CO)', '0 ppm', '>25 ppm', '>1200 ppm'],
        ['Hydrogen Sulfide (H2S)', '0 ppm', '>10 ppm', '>100 ppm'],
        ['Ammonia (NH3)', '0 ppm', '>25 ppm', '>300 ppm'],
        ['Chlorine (Cl2)', '0 ppm', '>0.5 ppm', '>10 ppm'],
      ],
    },
  },
  {
    id: 'lifting-limits',
    title: 'Ergonomic Lifting Limits (NIOSH)',
    keywords: ['lifting limit', 'manual lifting', 'lifting weight', 'niosh lifting', 'ergonomic lifting', 'maximum lift', 'safe lifting weight', 'lifting guideline', 'manual handling limit', 'lifting capacity'],
    description: 'Recommended weight limits for manual lifting based on NIOSH guidelines. Actual limits depend on posture, frequency, and grip conditions.',
    tableData: {
      headers: ['Condition', 'Male (kg)', 'Female (kg)', 'Notes'],
      rows: [
        ['Ideal conditions', '23', '16', 'Close to body, waist height'],
        ['Arms extended', '14', '10', 'Load away from body'],
        ['Floor level', '14', '10', 'Bending required'],
        ['Above shoulder', '11', '8', 'Elevated lifting'],
        ['Frequent lifting (1/min)', '14', '10', 'Repetitive tasks'],
        ['Very frequent (4/min)', '9', '6', 'High frequency'],
        ['One-handed', '11', '8', 'Single arm lift'],
        ['Team lifting (2 persons)', '32', '23', '2/3 of combined limit'],
      ],
    },
  },
  {
    id: 'electrical-clearance',
    title: 'Electrical Safety Clearance Distances',
    keywords: ['electrical clearance', 'electrical safety distance', 'safe distance electrical', 'voltage clearance', 'electrical approach distance', 'power line distance', 'high voltage clearance', 'electrical safe zone', 'live wire distance'],
    description: 'Minimum safe approach distances from energized electrical equipment for unqualified workers. Qualified workers may work closer with proper training and PPE.',
    tableData: {
      headers: ['Voltage Range', 'Min. Distance', 'Notes'],
      rows: [
        ['0 - 50V', '0 m', 'Low voltage, minimal risk'],
        ['51 - 750V', '1.0 m (3.3 ft)', 'Standard industrial'],
        ['751V - 15kV', '1.5 m (5 ft)', 'Medium voltage'],
        ['15kV - 36kV', '1.8 m (6 ft)', 'Distribution lines'],
        ['36kV - 46kV', '2.5 m (8 ft)', 'Sub-transmission'],
        ['46kV - 72.5kV', '3.0 m (10 ft)', 'Transmission'],
        ['72.5kV - 121kV', '3.3 m (11 ft)', 'High voltage'],
        ['138kV - 145kV', '3.6 m (12 ft)', 'High voltage'],
        ['230kV - 242kV', '4.9 m (16 ft)', 'Extra high voltage'],
        ['345kV - 362kV', '6.3 m (21 ft)', 'Extra high voltage'],
        ['500kV - 550kV', '8.5 m (28 ft)', 'Ultra high voltage'],
      ],
    },
  },
  {
    id: 'fall-protection',
    title: 'Fall Protection Requirements',
    keywords: ['fall protection', 'fall protection height', 'fall arrest', 'guardrail requirement', 'safety harness requirement', 'working at height', 'fall prevention', 'height safety', 'elevated work', 'scaffold fall protection'],
    description: 'Fall protection requirements based on working height and industry. Fall protection is mandatory above specified thresholds.',
    tableData: {
      headers: ['Industry/Activity', 'Trigger Height', 'Protection Required'],
      rows: [
        ['General industry', '1.8 m (6 ft)', 'Guardrails, safety nets, or PFAS'],
        ['Construction', '1.8 m (6 ft)', 'Guardrails, safety nets, or PFAS'],
        ['Scaffolding', '3.0 m (10 ft)', 'Guardrails or PFAS'],
        ['Steel erection', '4.5 m (15 ft)', 'PFAS or safety nets'],
        ['Residential construction', '1.8 m (6 ft)', 'Guardrails, safety nets, or PFAS'],
        ['Roofing (low slope)', '1.8 m (6 ft)', 'Guardrails, safety nets, or PFAS'],
        ['Leading edge work', '1.8 m (6 ft)', 'PFAS mandatory'],
        ['Holes/openings', 'Any depth', 'Covers or guardrails'],
        ['Wall openings', '1.2 m (4 ft)', 'Guardrails or barriers'],
      ],
    },
  },
  {
    id: 'ghs-pictograms',
    title: 'GHS Hazard Pictograms',
    keywords: ['ghs pictogram', 'ghs symbol', 'hazard pictogram', 'chemical pictogram', 'ghs hazard symbol', 'chemical hazard symbol', 'globally harmonized system', 'sds pictogram', 'msds symbol', 'chemical label symbol'],
    description: 'Globally Harmonized System (GHS) pictograms for chemical hazard communication. Required on Safety Data Sheets (SDS) and container labels.',
    tableData: {
      headers: ['Pictogram', 'Hazard Class', 'Examples'],
      rows: [
        ['Flame', 'Flammable', 'Flammable liquids, gases, aerosols, solids'],
        ['Flame over Circle', 'Oxidizer', 'Oxidizing gases, liquids, solids'],
        ['Exploding Bomb', 'Explosive', 'Explosives, self-reactive substances'],
        ['Skull & Crossbones', 'Acute Toxicity', 'Highly toxic substances (fatal/toxic)'],
        ['Corrosion', 'Corrosive', 'Skin corrosion, eye damage, metal corrosion'],
        ['Gas Cylinder', 'Compressed Gas', 'Gases under pressure'],
        ['Health Hazard', 'Serious Health Hazard', 'Carcinogen, mutagen, reproductive toxin'],
        ['Exclamation Mark', 'Irritant/Harmful', 'Skin/eye irritant, narcotic, respiratory irritant'],
        ['Environment', 'Environmental Hazard', 'Aquatic toxicity'],
      ],
    },
  },
  {
    id: 'evacuation',
    title: 'Emergency Evacuation Requirements',
    keywords: ['evacuation requirement', 'emergency exit', 'exit requirement', 'egress requirement', 'evacuation route', 'exit width', 'travel distance', 'emergency egress', 'exit capacity', 'means of egress'],
    description: 'Requirements for emergency evacuation routes, exit dimensions, and travel distances. Ensures safe and timely evacuation during emergencies.',
    tableData: {
      headers: ['Parameter', 'Requirement', 'Notes'],
      rows: [
        ['Minimum exit width', '710 mm (28 in)', 'Single door leaf'],
        ['Corridor minimum width', '1.1 m (44 in)', 'For 50+ occupants'],
        ['Stairway minimum width', '1.1 m (44 in)', 'Between handrails'],
        ['Exit door swing', 'Outward', 'In direction of egress'],
        ['Maximum travel distance', '60 m (200 ft)', 'Non-sprinklered'],
        ['Maximum travel (sprinklered)', '75 m (250 ft)', 'With sprinkler system'],
        ['Dead-end corridor max', '6 m (20 ft)', 'Non-sprinklered'],
        ['Exit signs', 'Illuminated', 'Visible from 30 m'],
        ['Emergency lighting', '10 lux minimum', '90-minute backup'],
        ['Occupant load factor', '9.3 m²/person', 'Office areas'],
        ['Assembly areas', '0.65 m²/person', 'Standing room'],
      ],
    },
  },
  {
    id: 'radiation',
    title: 'Radiation Exposure Limits',
    keywords: ['radiation limit', 'radiation exposure', 'radiation dose', 'occupational radiation', 'ionizing radiation limit', 'radiation safety', 'dose limit', 'radiation worker', 'annual dose limit', 'msv limit'],
    description: 'Occupational dose limits for ionizing radiation exposure. Based on ICRP recommendations and national regulations.',
    tableData: {
      headers: ['Category', 'Limit', 'Period'],
      rows: [
        ['Whole body (effective dose)', '20 mSv', 'Annual average over 5 years'],
        ['Whole body (single year max)', '50 mSv', 'Any single year'],
        ['Eye lens', '20 mSv', 'Annual average'],
        ['Skin', '500 mSv', 'Annual'],
        ['Hands and feet', '500 mSv', 'Annual'],
        ['Pregnant worker', '1 mSv', 'Remainder of pregnancy'],
        ['Public (general)', '1 mSv', 'Annual'],
        ['Emergency (life-saving)', '500 mSv', 'Single event'],
        ['Emergency (other)', '100 mSv', 'Single event'],
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
