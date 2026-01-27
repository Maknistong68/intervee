// Philippine OSH Policy Data for Interactive Diagram
// Contains 32 policies with hierarchical relationships

export type PolicyType = 'republic_act' | 'oshs_rule' | 'dept_order' | 'labor_advisory' | 'dept_advisory';

export type RelationshipType = 'implements' | 'amends' | 'supersedes' | 'supplements' | 'updates';

export interface PolicyRelationship {
  targetId: string;
  type: RelationshipType;
}

export interface OSHPolicy {
  id: string;
  type: PolicyType;
  shortName: string;
  title: string;
  effectiveDate: string;
  reason: string;
  keyProvisions: string[];
  coverage: string;
  status: 'current' | 'superseded';
  relationships: PolicyRelationship[];
}

// Color scheme for policy types (dark theme)
export const POLICY_TYPE_COLORS: Record<PolicyType, { border: string; bg: string; text: string }> = {
  republic_act: { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  oshs_rule: { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  dept_order: { border: 'border-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  labor_advisory: { border: 'border-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  dept_advisory: { border: 'border-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  republic_act: 'Republic Act',
  oshs_rule: 'OSHS Rule',
  dept_order: "Department Order",
  labor_advisory: 'Labor Advisory',
  dept_advisory: 'Department Advisory',
};

export const OSH_POLICIES: OSHPolicy[] = [
  // ============================================
  // PRIMARY LEGISLATION
  // ============================================
  {
    id: 'ra-11058',
    type: 'republic_act',
    shortName: 'RA 11058',
    title: 'Occupational Safety and Health Standards Act',
    effectiveDate: '2018-08-17',
    reason: 'To strengthen compliance with OSH standards and provide penalties for violations. Prior to this law, penalties were weak and enforcement was difficult. This act ensures safe and healthful workplaces for all Filipino workers.',
    keyProvisions: [
      'Employers must provide safe workplace free from hazardous conditions',
      'Workers have right to know about workplace hazards',
      'Workers can refuse unsafe work without retaliation',
      'Free PPE must be provided to all workers',
      'Daily fines up to PHP 100,000 for violations',
      'Joint and solidary liability for employers and contractors',
    ],
    coverage: 'All private sector establishments, PEZA enterprises, and places where work is undertaken',
    status: 'current',
    relationships: [],
  },

  // ============================================
  // IMPLEMENTING RULES AND REGULATIONS
  // ============================================
  {
    id: 'do-252-25',
    type: 'dept_order',
    shortName: 'DO 252-25',
    title: 'Revised Implementing Rules and Regulations of RA 11058',
    effectiveDate: '2025-05-16',
    reason: 'To provide updated, comprehensive guidelines for implementing RA 11058, replacing the original IRR (DO 198-18) with modernized provisions covering new workplace arrangements like co-working spaces and remote work setups.',
    keyProvisions: [
      'Covers non-traditional workplaces including co-working spaces',
      'Safety officers must be present on all workdays',
      'DOLE Hotline 1349 for accident reporting',
      'Monthly and annual WAIR submissions mandatory',
      'Workers protected from retaliation for reporting hazards',
      'Lactation stations and facilities for PWDs required',
    ],
    coverage: 'All private sector workplaces, GOCCs without original charter, economic zones',
    status: 'current',
    relationships: [
      { targetId: 'ra-11058', type: 'implements' },
      { targetId: 'do-198-18', type: 'supersedes' },
      { targetId: 'rule-1030', type: 'updates' },
      { targetId: 'rule-1040', type: 'updates' },
      { targetId: 'rule-1050', type: 'updates' },
      { targetId: 'rule-1060', type: 'updates' },
      { targetId: 'rule-1070', type: 'updates' },
      { targetId: 'rule-1080', type: 'updates' },
      { targetId: 'rule-1960', type: 'updates' },
    ],
  },
  {
    id: 'do-198-18',
    type: 'dept_order',
    shortName: 'DO 198-18',
    title: 'Original Implementing Rules and Regulations of RA 11058',
    effectiveDate: '2018-12-15',
    reason: 'To provide the initial implementing guidelines for RA 11058. Superseded by DO 252-25 which contains updated provisions for modern workplace arrangements.',
    keyProvisions: [
      'Original IRR for OSH Standards Act',
      'Established initial compliance requirements',
      'Defined roles of safety officers and committees',
      'Set initial penalty guidelines',
    ],
    coverage: 'All private sector establishments',
    status: 'superseded',
    relationships: [
      { targetId: 'ra-11058', type: 'implements' },
    ],
  },

  // ============================================
  // OSHS RULES (1978 BASE)
  // ============================================
  {
    id: 'rule-1020',
    type: 'oshs_rule',
    shortName: 'Rule 1020',
    title: 'Registration of Establishments',
    effectiveDate: '1978-01-01',
    reason: 'To create a registry of all establishments for OSH monitoring and compliance verification. Registration enables DOLE to track workplace safety across the country.',
    keyProvisions: [
      'New establishments must register 30 days before operation',
      'Registration at Regional Labor Office (DOLE-RO)',
      'Registration is FREE and valid for lifetime of establishment',
      'DOLE-BWC-IP-3 form required with layout plan',
      'Each branch registered separately',
      'Re-registration needed for name/location/ownership changes',
    ],
    coverage: 'All establishments with workers',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1030',
    type: 'oshs_rule',
    shortName: 'Rule 1030',
    title: 'Training of Personnel / Safety Officers',
    effectiveDate: '1978-01-01',
    reason: 'To ensure workplaces have trained personnel who can identify hazards, implement safety programs, and protect workers. Different workplace sizes and hazard levels require different safety officer competencies.',
    keyProvisions: [
      'SO1: 8-hour orientation course',
      'SO2: 40-hour BOSH training',
      'SO3: BOSH + 40-hour specialized training',
      'SO4: Advanced OSH management for highly hazardous workplaces',
      'COSH required for construction industry',
      'Refresher training every 2 years',
    ],
    coverage: 'All establishments based on size and hazard level',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1040',
    type: 'oshs_rule',
    shortName: 'Rule 1040',
    title: 'Health and Safety Committee',
    effectiveDate: '1978-01-01',
    reason: 'To establish a workplace body that plans, monitors, and evaluates OSH programs. Worker participation through elected representatives ensures safety concerns are heard.',
    keyProvisions: [
      'Required for 10+ workers or hazardous workplace',
      'Types A-E based on workforce size',
      'Worker representatives must be included',
      'Monthly meetings for hazardous workplaces',
      'Quarterly meetings for non-hazardous',
      'Reorganize every January',
    ],
    coverage: 'Establishments with 10+ workers or hazardous operations',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1050',
    type: 'oshs_rule',
    shortName: 'Rule 1050',
    title: 'Notification and Keeping of Records',
    effectiveDate: '1978-01-01',
    reason: 'To ensure proper documentation and reporting of workplace accidents for statistical analysis, trend identification, and prevention planning. Records enable evidence-based OSH policy making.',
    keyProvisions: [
      'Fatal accidents: report within 24 hours',
      'Disabling injuries: report by 20th of following month',
      'Annual report due January 30th',
      'IP-6 form for accident/illness reports',
      'Scheduled charges: 6000 days for death',
      'Frequency and severity rate calculations required',
    ],
    coverage: 'All establishments',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1060',
    type: 'oshs_rule',
    shortName: 'Rule 1060',
    title: 'Premises of Establishments',
    effectiveDate: '1978-01-01',
    reason: 'To set minimum physical standards for workplaces ensuring adequate space, proper construction, and safe structural elements. Poor premises design leads to accidents and health issues.',
    keyProvisions: [
      'Minimum ceiling height: 2.7m (2.4m if air-conditioned)',
      'Space per person: 11.5 cubic meters',
      'Stair width minimum: 1.10m',
      'Railing height: 1m from floor',
      'Handrails required for 4+ risers',
      'Machinery passageway: 60cm minimum',
    ],
    coverage: 'All workplace premises',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1070',
    type: 'oshs_rule',
    shortName: 'Rule 1070',
    title: 'Occupational Health and Environmental Control',
    effectiveDate: '1978-01-01',
    reason: 'To protect workers from environmental hazards including noise, poor lighting, inadequate ventilation, and chemical exposure. These factors cause occupational diseases if uncontrolled.',
    keyProvisions: [
      'Noise limit: 90 dBA for 8 hours',
      'Office illumination: 300 lux',
      'Emergency lighting: 5 lux minimum for 1 hour',
      'Air supply: 20-40 cubic meters/hour per worker',
      'TLV compliance for chemical exposure',
      'Annual workplace environment measurement',
    ],
    coverage: 'All workplaces with environmental hazards',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1080',
    type: 'oshs_rule',
    shortName: 'Rule 1080',
    title: 'Personal Protective Equipment',
    effectiveDate: '1978-01-01',
    reason: 'To ensure workers are protected from hazards when engineering and administrative controls are insufficient. PPE is the last line of defense against workplace hazards.',
    keyProvisions: [
      'Employer must furnish PPE FREE to workers',
      'Fall protection required at 6 feet (1.8m) height',
      'Safety belt width: 11.5cm minimum',
      'Hard hat weight: 0.45kg maximum',
      'ANSI standards for eye/head protection',
      'Gloves prohibited near rotating machinery',
    ],
    coverage: 'All workers exposed to hazards',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1090',
    type: 'oshs_rule',
    shortName: 'Rule 1090',
    title: 'Hazardous Materials',
    effectiveDate: '1978-01-01',
    reason: 'To prevent injuries and illnesses from hazardous substances through proper handling, storage, labeling, and control measures. Chemical accidents can cause mass casualties.',
    keyProvisions: [
      'Control hierarchy: substitution > engineering > PPE',
      'Proper labeling with hazard symbols',
      'Pour acid INTO water, never reverse',
      'Annual atmosphere testing',
      'No eating in hazardous workrooms',
      'Cleaning of work clothes weekly minimum',
    ],
    coverage: 'Workplaces handling hazardous materials',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1100',
    type: 'oshs_rule',
    shortName: 'Rule 1100',
    title: 'Gas and Electric Welding and Cutting',
    effectiveDate: '1978-01-01',
    reason: 'Welding operations pose fire, explosion, and fume hazards. These rules protect welders and nearby workers from burns, toxic exposure, and fires.',
    keyProvisions: [
      'No welding near combustibles or explosives',
      'Clean or fill containers before welding',
      'Screens required: 2m height minimum',
      'Fire extinguisher required at location',
      'Written permit for large establishments',
      'PPE mandatory for welders and assistants',
    ],
    coverage: 'All welding and cutting operations',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1120',
    type: 'oshs_rule',
    shortName: 'Rule 1120',
    title: 'Confined Spaces',
    effectiveDate: '1978-01-01',
    reason: 'Confined space entry is one of the most dangerous workplace activities. Oxygen deficiency, toxic gases, and engulfment cause multiple fatalities annually.',
    keyProvisions: [
      'Oxygen level: 19.5%-23.5% required',
      'Flammable gas below 10% of LEL',
      'Water level below 15cm before entry',
      'Standby watcher mandatory',
      'Breathing apparatus must be available',
      'No smoking or open flames',
    ],
    coverage: 'All confined space work',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1140',
    type: 'oshs_rule',
    shortName: 'Rule 1140',
    title: 'Explosives',
    effectiveDate: '1978-01-01',
    reason: 'Explosives handling requires strict controls to prevent accidental detonation. Improper storage or handling can cause mass casualties and property destruction.',
    keyProvisions: [
      'Workroom limit: 45kg for 8-hour work',
      'Magazine max: 136,360kg explosives',
      'Class I magazine for >22.5kg',
      'EXPLOSIVE KEEP OFF signs required',
      'Certificate valid for 1 year',
      'Wooden/rubber tools only for opening packages',
    ],
    coverage: 'Workplaces handling explosives',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1160',
    type: 'oshs_rule',
    shortName: 'Rule 1160',
    title: 'Boiler Safety',
    effectiveDate: '1978-01-01',
    reason: 'Boiler explosions can cause catastrophic damage and multiple fatalities. Regular inspection and proper operation prevent pressure vessel failures.',
    keyProvisions: [
      'Permit required from Secretary of Labor',
      'Annual inspection (every 12 months)',
      'Hydrostatic test: 1.5x design pressure',
      'Factor of safety: minimum 5',
      'Boiler room: 100cm clearance, 2 exits',
      'Fusible plug renewal every 12 months',
    ],
    coverage: 'All boiler operations',
    status: 'current',
    relationships: [],
  },
  {
    id: 'rule-1960',
    type: 'oshs_rule',
    shortName: 'Rule 1960',
    title: 'Occupational Health Services',
    effectiveDate: '1978-01-01',
    reason: 'To ensure adequate medical care and health monitoring for workers. Early detection of occupational diseases and prompt treatment of injuries saves lives.',
    keyProvisions: [
      'First-aider required for all workplaces',
      'Part-time nurse for 51-99 workers (hazardous)',
      'Part-time physician for 100+ workers',
      'Hospital for 2000+ workers (1 bed per 100)',
      'Physical exam classes A-D',
      'Annual medical report due March 31',
    ],
    coverage: 'All establishments based on size and hazard',
    status: 'current',
    relationships: [],
  },

  // ============================================
  // HEALTH DEPARTMENT ORDERS
  // ============================================
  {
    id: 'do-53-03',
    type: 'dept_order',
    shortName: 'DO 53-03',
    title: 'Drug-Free Workplace Guidelines',
    effectiveDate: '2003-08-14',
    reason: 'To implement RA 9165 (Dangerous Drugs Act) in workplaces. Drug abuse impairs worker judgment and reflexes, leading to accidents and reduced productivity.',
    keyProvisions: [
      'Mandatory for 10+ workers',
      'Random drug testing program',
      'DOH-accredited testing centers only',
      'Treatment and rehabilitation referral',
      'Drug test valid for one year',
      'Display "DRUG-FREE WORKPLACE" signs',
    ],
    coverage: 'All private establishments with 10+ workers',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
    ],
  },
  {
    id: 'do-73-05',
    type: 'dept_order',
    shortName: 'DO 73-05',
    title: 'TB Prevention and Control in the Workplace',
    effectiveDate: '2005-03-30',
    reason: 'Tuberculosis is a major occupational health concern in the Philippines. Workplace transmission can be prevented through proper ventilation and early detection through DOTS.',
    keyProvisions: [
      'Mandatory TB prevention program',
      'DOTS (Directly Observed Treatment) implementation',
      'Adequate ventilation per OSHS',
      'Non-discrimination against TB patients',
      'Flexible leave for treatment',
      'Report all TB cases in Annual Medical Report',
    ],
    coverage: 'All private sector workplaces',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
      { targetId: 'rule-1070', type: 'supplements' },
    ],
  },
  {
    id: 'do-102-10',
    type: 'dept_order',
    shortName: 'DO 102-10',
    title: 'HIV/AIDS Prevention and Control in the Workplace',
    effectiveDate: '2010-03-23',
    reason: 'To implement RA 8504 (AIDS Prevention Act) protecting workers with HIV from discrimination while promoting prevention education. HIV status cannot be used for employment decisions.',
    keyProvisions: [
      'Compulsory HIV testing is UNLAWFUL',
      'No discrimination based on HIV status',
      'Voluntary confidential counseling and testing',
      'HIV information kept strictly confidential',
      'Flexible work arrangements for treatment',
      'Education on prevention methods',
    ],
    coverage: 'All private sector workplaces',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
    ],
  },
  {
    id: 'do-136-14',
    type: 'dept_order',
    shortName: 'DO 136-14',
    title: 'GHS Chemical Safety Program Guidelines',
    effectiveDate: '2014-02-28',
    reason: 'To adopt the Globally Harmonized System for chemical classification and labeling, ensuring consistent hazard communication. Workers can recognize hazards regardless of chemical origin.',
    keyProvisions: [
      'GHS labeling with pictograms required',
      '16-section Safety Data Sheets',
      'Chemical safety training mandatory',
      'Proper chemical storage and segregation',
      'Emergency preparedness for chemical incidents',
      'Establishments using chemicals are hazardous priority',
    ],
    coverage: 'All workplaces with industrial chemicals',
    status: 'current',
    relationships: [
      { targetId: 'rule-1090', type: 'supplements' },
      { targetId: 'rule-1070', type: 'supplements' },
    ],
  },
  {
    id: 'do-160-16',
    type: 'dept_order',
    shortName: 'DO 160-16',
    title: 'Work Environment Measurement Accreditation',
    effectiveDate: '2016-06-27',
    reason: 'To ensure quality and accuracy of workplace environment measurements by requiring OSHC accreditation for WEM providers. Reliable measurements are essential for hazard control.',
    keyProvisions: [
      'WEM providers must be OSHC-accredited',
      'Measures: temperature, humidity, noise, illumination',
      'Frequency: at least annually',
      'Internal monitoring allowed with trained personnel',
      'Quality management system required',
      'Results used for TLV compliance verification',
    ],
    coverage: 'All hazardous workplaces requiring WEM',
    status: 'current',
    relationships: [
      { targetId: 'rule-1070', type: 'supplements' },
    ],
  },
  {
    id: 'do-178-17',
    type: 'dept_order',
    shortName: 'DO 178-17',
    title: 'Safety Measures for Workers Standing at Work',
    effectiveDate: '2017-08-25',
    reason: 'Prolonged standing causes musculoskeletal disorders, varicose veins, and fatigue. Retail workers, security guards, and cashiers are especially affected and need protection.',
    keyProvisions: [
      'Rest periods to break standing time',
      'Anti-fatigue mats or rubber flooring',
      'Accessible seats for rest periods',
      'Proper footwear with arch support',
      'Adjustable work surfaces',
      'Notify DOLE within 30 days of adoption',
    ],
    coverage: 'Workers required to stand during shifts',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
    ],
  },
  {
    id: 'do-184-17',
    type: 'dept_order',
    shortName: 'DO 184-17',
    title: 'Safety Measures for Sedentary Workers',
    effectiveDate: '2017-10-18',
    reason: 'Prolonged sitting causes obesity, heart disease, and musculoskeletal problems. Office workers, call center agents, and computer operators need breaks and ergonomic interventions.',
    keyProvisions: [
      '5-minute breaks every 2 hours mandatory',
      'Standing or walking meetings encouraged',
      'Ergonomic workstations required',
      'Adjustable chairs and proper desk height',
      'Movement and stretching education',
      'Notify DOLE of adoption',
    ],
    coverage: 'Workers who sit for long hours',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
      { targetId: 'do-178-17', type: 'supplements' },
    ],
  },
  {
    id: 'do-208-20',
    type: 'dept_order',
    shortName: 'DO 208-20',
    title: 'Mental Health Workplace Policies and Programs',
    effectiveDate: '2020-03-03',
    reason: 'To implement RA 11036 (Mental Health Act) in workplaces. Mental health conditions affect productivity and safety. Stigma prevents workers from seeking help.',
    keyProvisions: [
      'Mental health program mandatory for all workplaces',
      'No discrimination based on mental health status',
      'Confidentiality of mental health records',
      'Access to mental health services',
      'Stress management and counseling',
      'Applies to establishments deploying OFWs',
    ],
    coverage: 'All formal sector workplaces',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
    ],
  },
  {
    id: 'do-224-21',
    type: 'dept_order',
    shortName: 'DO 224-21',
    title: 'Workplace Ventilation Guidelines (COVID-19)',
    effectiveDate: '2021-01-01',
    reason: 'To prevent airborne disease transmission through adequate workplace ventilation. Proper air circulation reduces risk of respiratory infection spread.',
    keyProvisions: [
      'Assess and improve ventilation systems',
      'Natural ventilation through windows/doors',
      'Proper HVAC maintenance and filter replacement',
      'Maximize outdoor air intake',
      'Minimize air recirculation',
      'Include ventilation in OSH programs',
    ],
    coverage: 'All private sector workplaces',
    status: 'current',
    relationships: [
      { targetId: 'rule-1070', type: 'supplements' },
    ],
  },
  {
    id: 'do-235-22',
    type: 'dept_order',
    shortName: 'DO 235-22',
    title: 'Hepatitis B Prevention and Control in the Workplace',
    effectiveDate: '2022-01-01',
    reason: 'Hepatitis B is a serious occupational health risk, especially for healthcare workers. Vaccination and proper precautions prevent transmission.',
    keyProvisions: [
      'Hepatitis B prevention program required',
      'Vaccination for at-risk workers',
      'Standard precautions for bloodborne pathogens',
      'Non-discrimination against HBV carriers',
      'Confidentiality of HBV status',
      'Post-exposure prophylaxis protocols',
    ],
    coverage: 'All private sector workplaces',
    status: 'current',
    relationships: [
      { targetId: 'rule-1960', type: 'supplements' },
    ],
  },

  // ============================================
  // LABOR ADVISORIES
  // ============================================
  {
    id: 'la-07-22',
    type: 'labor_advisory',
    shortName: 'LA 07-22',
    title: 'Work Accident/Illness Report (WAIR) Submission',
    effectiveDate: '2022-03-16',
    reason: 'To streamline accident reporting by using the DOLE Establishment Report System. Monthly reporting ensures timely data collection for prevention planning.',
    keyProvisions: [
      'WAIR submission by 30th of each month',
      'Submit even without accidents/illnesses',
      'COVID cases included in WAIR',
      'DOLE Establishment Report System used',
      'WAIR Form supports claims filing',
      'COVID FORM online submission discontinued',
    ],
    coverage: 'All establishments',
    status: 'current',
    relationships: [
      { targetId: 'rule-1050', type: 'supplements' },
    ],
  },
  {
    id: 'la-04-21',
    type: 'labor_advisory',
    shortName: 'LA 04-21',
    title: 'TB Screening and Prevention Guidelines',
    effectiveDate: '2021-01-01',
    reason: 'Updated TB screening protocols for workplaces during pandemic conditions when respiratory health became a priority.',
    keyProvisions: [
      'Enhanced TB screening for workers',
      'Integration with COVID-19 protocols',
      'Respiratory etiquette education',
      'Proper isolation procedures',
      'Coordination with health facilities',
      'Updated reporting requirements',
    ],
    coverage: 'All private sector workplaces',
    status: 'current',
    relationships: [
      { targetId: 'do-73-05', type: 'supplements' },
    ],
  },
  {
    id: 'la-11-20',
    type: 'labor_advisory',
    shortName: 'LA 11-20',
    title: 'Mental Health Support Guidelines',
    effectiveDate: '2020-05-01',
    reason: 'Pandemic conditions increased mental health concerns. Additional guidance was needed for implementing workplace mental health support during crisis situations.',
    keyProvisions: [
      'Mental health first aid awareness',
      'Employee assistance programs encouraged',
      'Stress management during emergencies',
      'Remote work mental health considerations',
      'Access to counseling services',
      'Manager training on mental health',
    ],
    coverage: 'All workplaces',
    status: 'current',
    relationships: [
      { targetId: 'do-208-20', type: 'supplements' },
    ],
  },

  // ============================================
  // DEPARTMENT ADVISORY
  // ============================================
  {
    id: 'da-01-23',
    type: 'dept_advisory',
    shortName: 'DA 01-23',
    title: 'OSH Compliance Self-Assessment Checklist',
    effectiveDate: '2023-01-01',
    reason: 'To help employers conduct internal audits of OSH compliance before DOLE inspections. Self-assessment promotes proactive safety management.',
    keyProvisions: [
      'Self-assessment checklist for employers',
      'Covers all major OSHS requirements',
      'Identifies compliance gaps',
      'Guides corrective action planning',
      'Does not replace DOLE inspection',
      'Encouraged for annual internal audits',
    ],
    coverage: 'All private sector establishments',
    status: 'current',
    relationships: [
      { targetId: 'ra-11058', type: 'supplements' },
      { targetId: 'do-252-25', type: 'supplements' },
    ],
  },
];

// Helper function to get policy by ID
export function getPolicyById(id: string): OSHPolicy | undefined {
  return OSH_POLICIES.find(p => p.id === id);
}

// Helper function to get related policies
export function getRelatedPolicies(policy: OSHPolicy): OSHPolicy[] {
  const relatedIds = policy.relationships.map(r => r.targetId);
  // Also find policies that reference this one
  OSH_POLICIES.forEach(p => {
    if (p.relationships.some(r => r.targetId === policy.id) && !relatedIds.includes(p.id)) {
      relatedIds.push(p.id);
    }
  });
  return relatedIds.map(id => getPolicyById(id)).filter((p): p is OSHPolicy => p !== undefined);
}

// Helper function to get policies by type
export function getPoliciesByType(type: PolicyType): OSHPolicy[] {
  return OSH_POLICIES.filter(p => p.type === type);
}
