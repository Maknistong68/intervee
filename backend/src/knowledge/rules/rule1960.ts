// Rule 1960 - Occupational Health Services
// OSHS Original + Multiple Amendments

export const RULE_1960 = {
  ruleNumber: '1960',
  title: 'Occupational Health Services',
  amendments: [
    'DO 252, s. 2025',
    'DO 53, s. 2003',
    'DO 73, s. 2005 (amended by LA 21, s. 2023)',
    'DO 102, s. 2010 (amended by LA 22, s. 2023)',
    'DO 178, s. 2017',
    'DO 184, s. 2017',
    'DO 208, s. 2020 (amended by LA 19, s. 2023)',
    'DO 235, s. 2022',
    'DA 05, s. 2010',
    'LA 01, s. 2023',
    'LA 08, s. 2023',
    'LA 19, s. 2023',
    'LA 20, s. 2023',
    'LA 21, s. 2023',
    'LA 22, s. 2023',
    'LA 23, s. 2023',
  ],

  // ===========================================
  // SECTION 1961: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1961',

    employerObligation: {
      subsection: '1961(1)',
      rule: 'Every employer shall establish in his place of employment occupational health services in accordance with this rule',
    },

    cooperation: {
      subsection: '1961(2)',
      rule: 'Employer, workers, and their representatives shall cooperate and participate in implementation of organizational and other measures',
    },
  },

  // ===========================================
  // SECTION 1961.01: COVERAGE
  // ===========================================
  coverage: {
    subsection: '1961.01',
    applies: [
      'All establishments whether for profit or not',
      'Government and political subdivisions',
      'Government-owned or controlled corporations',
    ],
    dentalStandards: 'Bureau of Dental Health Services of the Department of Health',
  },

  // ===========================================
  // SECTION 1961.02: DEFINITIONS
  // ===========================================
  definitions: {
    subsection: '1961.02',

    occupationalHealthServices: {
      description: 'Services entrusted with essentially preventive functions',
      responsibilities: [
        'Advising employers, workers, and representatives',
        'Establishing and maintaining safe and healthy working environment',
        'Facilitating optimal physical and mental health in relation to work',
        'Adapting work to capabilities of workers based on their health state',
      ],
    },

    occupationalHealthPersonnel:
      'Qualified first-aider, nurse, dentist, or physician engaged by employer to provide occupational health services',

    firstAidTreatment: {
      definition:
        'Adequate, immediate and necessary medical and/or dental attendance or remedy given in case of injury or sudden illness',
      scope: 'Irrespective of whether injury/illness is occupational in nature',
      timing: 'Before more extensive treatment can be secured',
      excludes: 'Following treatment for an injury or illness',
    },

    firstAider:
      'Any person trained and duly certified to administer first-aid by Philippine National Red Cross or accredited organization',

    occupationalHealthPractitioner: {
      definition: 'Physician, nurse, engineer, dentist or chemist licensed to practice in the Philippines',
      additionalRequirement: 'Possessing qualifications required under Rule 1964.01',
    },

    emergencyTreatmentRoom:
      'Enclosed area or room equipped with necessary medical facilities and supplies, located within premises for examination and treatment in emergencies',

    emergencyClinic: {
      definition: 'Enclosed area, room or building within premises for emergency examination and treatment',
      features: [
        'More elaborate instruments and equipment',
        'Examining bed, oxygen tank',
        'More competent medical staff',
        'Can handle simple cases needing short-term confinement',
        'May refer cases to hospitals',
      ],
    },
  },

  // ===========================================
  // SECTION 1961.03: OCCUPATIONAL HEALTH SERVICES FUNCTIONS
  // ===========================================
  functions: {
    subsection: '1961.03',
    list: [
      {
        letter: 'a',
        function: 'Identification and assessment of risks from health hazards in the workplace',
      },
      {
        letter: 'b',
        function:
          'Surveillance of working environment factors and practices affecting worker health, including sanitation, canteens, and housing',
      },
      {
        letter: 'c',
        function:
          'Advice on planning and organization of work, including workplace design, machinery choice/maintenance, and substances used',
      },
      {
        letter: 'd',
        function:
          'Participation in development of programs for improvement of working practices and testing/evaluation of new equipment',
      },
      {
        letter: 'e',
        function: 'Advice on occupational health, safety, hygiene, ergonomics, and protective equipment',
      },
      {
        letter: 'f',
        function: "Surveillance of worker's health in relation to work",
      },
      {
        letter: 'g',
        function: 'Promoting adaptation of work to workers',
      },
      {
        letter: 'h',
        function: 'Collaboration in providing information, training, education in occupational health, hygiene, ergonomics',
      },
      {
        letter: 'i',
        function: 'Organizing first-aid and emergency treatment',
      },
      {
        letter: 'j',
        function: 'Participation in analysis of occupational accidents and diseases',
      },
    ],
  },

  // ===========================================
  // SECTION 1961.04: ORGANIZATION AND PREVENTIVE SERVICES
  // ===========================================
  organization: {
    subsection: '1961.04',

    organizedBy: [
      'The establishment/undertaking',
      'Government authorities or official services recognized by the Bureau',
      'Social security institution',
      'Any other bodies authorized by the Bureau',
      'Combination of any of the above',
    ],

    inspectionFrequency: {
      smallScaleHazardous1to50: 'At least once every 2 months',
      smallScaleHazardous51to99: 'At least once every month',
      smallScaleNonHazardous1to99: 'At least once every 6 months',
      mediumScaleNonHazardous100to199: 'At least once every 3 months',
      mediumScaleHazardous100to199: 'Part-time occupational health physician required',
      largeScale200plus: 'Part-time or full-time occupational health physician per Rule 1963',
    },

    commonService: {
      smallScale: 'Maximum 10 establishments',
      mediumScale: 'Maximum 4 establishments',
    },
  },

  // ===========================================
  // SECTION 1962: HAZARDOUS WORKPLACE
  // ===========================================
  hazardousWorkplace: {
    section: '1962',
    reference: 'List provided in Rule 1010',
    authority: 'Bureau may add to list with Secretary approval',
  },

  // ===========================================
  // SECTION 1963: EMERGENCY HEALTH SERVICES
  // ===========================================
  emergencyHealthServices: {
    section: '1963',

    medicinesAndFacilities: {
      subsection: '1963.01',
      reference: 'Table 47 (appendix)',
      location: 'Kept inside treatment room/medical clinic',
      replacement: 'Same quantity immediately after use or consumption',
      substitution: 'Comparable medicines as prescribed by occupational health physician',
    },

    hazardousWorkplaces: {
      subsection: '1963.02(1)',

      smallScale1to50: {
        workers: '1-50',
        personnel: 'Full-time first aider (may be one of the workers)',
        facility: 'Access to first-aid medicines',
      },

      smallScale51to99: {
        workers: '51-99',
        personnel: [
          'Part-time occupational health nurse (4 hours/day, 6 days/week)',
          'Full-time first-aider',
        ],
        facility: 'Emergency treatment room',
        multiShift: 'Nurse stays during shift with biggest number of workers',
      },

      mediumScale100to199: {
        workers: '100-199',
        personnel: [
          'Part-time occupational health physician (4 hours/day, 3 days/week)',
          'Part-time dentist (4 hours/day, 3 days/week, alternate days with physician)',
          'Full-time occupational health nurse',
          'Full-time first-aider',
        ],
        facility: 'Emergency treatment room',
        multiShift: 'Physician and dentist stay during shift with biggest number of workers',
      },

      largeScale200to600: {
        workers: '200-600',
        personnel: [
          'Part-time occupational health physician (4 hours/day, 6 days/week)',
          'Part-time dentist (4 hours/day, 6 days/week, alternate periods)',
          'Full-time occupational health nurse',
          'Full-time first-aider',
        ],
        facility: 'Emergency medical clinic',
        multiShift: 'Physician and dentist stay during shift with biggest number of workers',
      },

      largeScale601to2000: {
        workers: '601-2000',
        personnel: [
          'Full-time occupational health physician (8 hours/day, 6 days/week) OR 2 part-time physicians (4 hours each, alternate)',
          'Full-time dentist',
          'Full-time occupational health nurse per shift',
          'Full-time first-aider per shift',
        ],
        facility: 'Emergency medical and dental clinic',
        multiShift: 'Physician and dentist stay during shift with biggest number of workers',
      },

      largeScaleOver2000: {
        workers: 'Over 2000',
        personnel: [
          'Full-time occupational health physician (8 hours/day, 6 days/week)',
          'Part-time occupational health physician for each other shift (4 hours/day, 6 days/week)',
          'Full-time dentist',
          'Full-time occupational health nurse per shift',
          'Full-time first-aider per shift',
        ],
        facility: 'Emergency hospital (1 bed per 100 workers) and dental clinic',
      },

      pesticidePlants: {
        applies: 'Factories using or producing pesticides under WHO toxicity categories I and II',
        requirements: [
          'Medical clinic within 100 meters of working area',
          'Full-time occupational health physician (8 hours/day)',
          'Bathroom with shower and eyewash facilities within/beside medical clinic',
          'Examining table with Trendelenburg position capability',
        ],
      },
    },

    nonHazardousWorkplaces: {
      subsection: '1963.02(2)',

      smallScale1to99: {
        workers: '1-99',
        personnel: 'Full-time first-aider',
        facility51to99: 'Emergency treatment room for 51-99 workers',
      },

      mediumScale100to199: {
        workers: '100-199',
        personnel: [
          'Part-time occupational health nurse (4 hours/day, 6 days/week)',
          'Full-time first-aider',
        ],
        facility: 'Emergency treatment room',
      },

      largeScale200to600: {
        workers: '200-600',
        personnel: [
          'Part-time occupational health physician (4 hours/day, 3 days/week)',
          'Part-time dentist (4 hours/day, 3 days/week, alternate days)',
          'Full-time occupational health nurse',
          'Full-time first-aider',
        ],
        facility: 'Emergency treatment room',
      },

      largeScale601to2000: {
        workers: '601-2000',
        personnel: [
          'Part-time occupational health physician (4 hours/day, 6 days/week)',
          'Part-time dentist (4 hours/day, 6 days/week, alternate periods)',
          'Full-time occupational health nurse',
          'Full-time first-aider',
        ],
        facility: 'Emergency clinic',
      },

      largeScaleOver2000: {
        workers: 'Over 2000',
        personnel: [
          'Full-time occupational health physician (8 hours/day, 6 days/week)',
          'Part-time physician for other shifts (4 hours/day, 6 days/week)',
          'Full-time dentist',
          'Full-time occupational health nurse per shift',
          'Full-time first-aider',
        ],
        facility: 'Emergency medical and dental clinic',
      },
    },

    additionalRequirements: {
      subsection: '1963.02(3)',

      multiShift: 'Full-time first-aider for every work shift',

      treatmentRoomOnly: {
        access: 'Nearest medical/dental clinic or within 5 km',
        requirements: ['Transportation facilities', 'Written agreement with clinic for emergencies'],
      },

      onCall: 'Physician/dentist subject to call anytime during other shifts for emergencies',
    },

    emergencyHospital: {
      subsection: '1963.03',
      exception: {
        urbanArea: 'Hospital/clinic within 5 km',
        ruralArea: 'Hospital/clinic reachable in 25 minutes',
        requirements: [
          'Transportation facilities readily available',
          'Written contract with hospital/clinic',
        ],
      },
      stillRequired: 'Emergency treatment room still required',
    },

    contracts: {
      subsection: '1963.04',

      requirements: [
        'Only with accredited practitioners/clinics or authorized agencies',
        'Practitioner: max 10 establishments',
        'Part-time physician/nurse: max 4 establishments',
        'Full-time personnel: cannot engage with any other establishment',
        'No retainership contract in place of occupational health services',
        'Furnish copy to Bureau and Regional Labor Office',
      ],
    },
  },

  // ===========================================
  // SECTION 1964: TRAINING AND QUALIFICATION
  // ===========================================
  qualifications: {
    section: '1964',
    subsection: '1964.01',

    firstAider: {
      requirements: [
        'Able to read and write',
        'Completed first aid course by Philippine National Red Cross or accredited organization',
      ],
    },

    nurse: {
      requirements: [
        'Passed Board of Examiners for Nurses examination',
        'Licensed to practice nursing in the Philippines',
        'At least 50 hours Basic training in occupational nursing',
      ],
      trainingProviders: ['Bureau/Regional Office', 'College of Public Health (UP)', 'Accredited institutions'],
    },

    physician: {
      requirements: [
        'Passed Board of Examiners for Physicians examination',
        'Licensed to practice medicine in the Philippines',
        'Graduate of Basic training course in occupational medicine',
      ],
      trainingProviders: ['Bureau', 'College of Public Health (UP)', 'Accredited institutions'],
    },

    physicianHazardousOver2000: {
      additionalRequirements: [
        'Diploma or master\'s degree in occupational/industrial health, OR',
        'Completed residency training in occupational medicine',
        'Certified by Bureau',
        'Registered with Regional Labor Office',
      ],
    },

    dentist: {
      requirements: [
        'Passed Board of Examiners for Dentists examination',
        'Licensed to practice dentistry in the Philippines',
        'Completed basic training course in occupational dentistry',
      ],
      trainingProvider: 'Bureau of Dental Health Services (DOH) or accredited organization',
    },

    occupationalHealthPractitioner: {
      requirements: [
        'Graduate of advanced training course in occupational health and safety',
        'At least 5 years experience in occupational health and safety',
        'Certified/accredited by Bureau',
        'Registered with Regional Office',
      ],
    },
  },

  trainingOpportunity: {
    subsection: '1964.02',
    complianceDeadline: '6 months from date of employment',
    firstAiderDeadline: '6 months from effectivity of Standards',
  },

  refresherTraining: {
    subsection: '1964.03',
    duration: 'Minimum 8 hours',
    frequency: 'At least once a year',
    applies: 'Occupational health personnel and first-aiders',
  },

  // ===========================================
  // SECTION 1965: DUTIES
  // ===========================================
  duties: {
    section: '1965',

    employer: {
      subsection: '1965.01',
      duties: [
        'Establish occupational health services for healthful workplace',
        'Adopt and implement comprehensive health program',
        'Enter into contract with hospitals/dental clinics if not available in workplace',
        'Maintain health record and submit annual medical report (form DOLE/BWC/HSD/OH-47)',
      ],
      reportDeadline: 'Last day of March of year following covered period',
      reportRecipients: ['Regional Labor Office', 'Bureau of Working Conditions (copy)'],
    },

    occupationalHealthPhysician: {
      subsection: '1965.02',
      duties: [
        'Organize, administer and maintain occupational health program integrating safety program',
        'Monitor work environment for health hazards through periodic inspection',
        'Prevent diseases/injury through proper medical supervision over substances, processes, environment',
        'Conserve worker health through physical examinations, placement advice, health education',
        'Provide medical and surgical care to restore health and earning capacity',
        'Maintain and analyze records, prepare annual medical reports (form DOLE/BWC/OH-47)',
        'Conduct studies on occupational health',
        'Act as adviser to management and labor on health matters',
        'Report directly to top management',
      ],
    },

    dentist: {
      subsection: '1965.03',
      reference: 'Standards prescribed by Bureau of Dental Health Services, DOH',
    },

    occupationalHealthNurse: {
      subsection: '1965.04',
      duties: [
        'Organize and administer health service program integrating occupational safety (if no physician)',
        'Provide nursing care to injured or ill workers',
        'Participate in health maintenance examination',
        'Participate in maintenance of occupational health and safety',
        'Maintain reporting and records system',
        'Prepare and submit annual medical report if no physician (form DOLE/BWC/HSD/OH-47)',
      ],
    },

    firstAider: {
      subsection: '1965.05',
      duties: [
        'Give immediate temporary treatment before physician services available',
        'Participate in maintenance of OSH programs if member of Safety Committee',
        'Maintain medical services and facilities',
      ],
    },

    occupationalHealthPractitioner: {
      subsection: '1965.06',
      duties: [
        'Advise employers, workers, and representatives on safe and healthful working environment',
        'Conduct periodic inspection as required under Rule 1961.04',
        'Act as adviser on organization, administration and maintenance of health program',
        'Maintain reporting and records system',
        'Prepare and submit annual medical report (form DOLE/BWC/HSD/OH-47)',
      ],
    },
  },

  // ===========================================
  // SECTION 1966: OCCUPATIONAL HEALTH PROGRAM
  // ===========================================
  healthProgram: {
    section: '1966',

    objectives: {
      subsection: '1966.01',
      list: [
        'Assess worker\'s physical, emotional and psychological assets and liabilities for proper placement',
        'Protect employees against health hazards to prevent occupational and non-occupational diseases',
        'Provision for first-aid and emergency services based on industry nature',
        'Assure adequate medical care of ill and injured workers',
        'Encourage personal health maintenance, physical fitness, and proper nutrition',
        'Provide guidance, information and services for family planning programs',
      ],
    },

    activities: {
      subsection: '1966.02',
      list: [
        {
          activity: 'Healthful work environment maintenance',
          includes: ['Regular sanitation appraisal', 'Periodic premises inspection', 'Working environment evaluation'],
        },
        {
          activity: 'Health Examinations',
          types: ['Entrance', 'Periodic', 'Special examination', 'Transfer examination', 'Separation examination'],
        },
        {
          activity: 'Diagnosis and treatment of all injuries and diseases (occupational and non-occupational)',
        },
        {
          activity: 'Immunization programs',
        },
        {
          activity: 'Medical records',
          requirements: [
            'Accurate and complete for each worker',
            'Starting from first examination or treatment',
            'Exclusive custody of occupational health personnel',
            'Available to worker or authorized representative',
            'Not used for discriminatory purposes',
          ],
        },
        {
          activity: 'Health Education and Counseling',
          includes: [
            'Health hazards and proper precautions',
            'Habits of cleanliness and orderliness',
            'Safe work practices',
            'Use and maintenance of PPE',
            'Use of health services and facilities',
          ],
        },
        {
          activity: 'Nutrition program',
          supervision: 'Under dietician, supervised by physician if present',
        },
      ],
    },
  },

  // ===========================================
  // SECTION 1967: PHYSICAL EXAMINATION
  // ===========================================
  physicalExamination: {
    section: '1967',

    generalRequirements: {
      when: [
        'Before entering employment for the first time',
        'Periodically based on work conditions and risks',
        'When transferred or separated from employment',
        'When injured or ill',
      ],
      requirements: [
        'Complete and thorough',
        'Free of charge to workers',
        'Include X-ray or special laboratory when necessary',
      ],
      records: 'Recorded carefully and legibly by health service personnel',
      confidentiality: 'Strictly confidential',
    },

    preEmployment: {
      subsection: '1967.01',
      purposes: [
        'Determine physical condition at time of hiring',
        'Prevent placement where worker may be dangerous due to defects',
      ],
      includes: [
        'General clinical examination',
        'Special laboratory when necessary',
        'Chest x-ray examination',
      ],
      xrayFreeOfCharge: [
        'Where employer required to engage occupational health physician with x-ray facilities',
        'Government clinics or hospitals',
        'Occupational health physician',
        'Private clinics when referred',
      ],
      classifications: {
        classA: 'Physically fit for any work',
        classB: 'Physically under-developed or with correctable defects (error of refraction, dental caries, defective hearing) but otherwise fit to work',
        classC: 'Employable but requires special placement or limited duty due to impairments (heart disease, hypertension, anatomical defects) requiring follow-up treatment/periodic evaluation',
        classD: 'Unfit or unsafe for any type of employment (active PTB, advanced heart disease with threatened failure, malignant hypertension)',
      },
    },

    periodic: {
      subsection: '1967.03',
      purposes: [
        'Follow-up previous findings',
        'Allow early detection of occupational and non-occupational diseases',
        'Determine effect of exposure to health hazards',
      ],
      requirements: [
        'As complete as pre-employment examination',
        'Include general clinical examinations',
        'Special examinations free of charge for workers exposed to occupational hazards',
        'Chest x-ray at least once a year (free of charge)',
        'Frequency based on nature of employment and hazards',
        'Biochemical monitoring free for workers exposed to WHO toxicity category I and II substances',
        'Maximum interval: 1 year between consecutive examinations',
      ],
    },

    toxicSubstanceWorkers: {
      subsection: '1967.04',
      rule: 'Only persons pronounced medically fit shall be employed in toxic substance handling or hazardous environments',
    },

    occupationalDiseaseDetection: {
      subsection: '1967.05',
      rule: 'Employment discontinued until complete or satisfactory recovery if continued employment may jeopardize health',
      alternative: 'Assign other job consistent with health state that will not impede recovery',
    },

    transfer: {
      subsection: '1967.06',
      rule: 'Workers shall not be transferred to another job until examined and certified by physician that transfer is medically advisable',
    },

    special: {
      subsection: '1967.07',
      when: 'Undue exposure to health hazards',
      examples: ['Lead', 'Mercury', 'Hydrogen sulfide', 'Sulfur dioxide', 'Nitro glycol'],
    },

    returnToWork: {
      subsection: '1967.08',
      purposes: [
        'Detect if illness is still contagious',
        'Determine if worker is fit to return',
        'After prolonged absence for health reasons, determine possible occupational causes',
      ],
    },

    separation: {
      subsection: '1967.09',
      purposes: [
        'Determine if employee is suffering from occupational disease',
        'Determine if suffering from injury or illness not completely healed',
        'Determine if has sustained an injury',
      ],
    },
  },

  // ===========================================
  // QUICK REFERENCE
  // ===========================================
  quickReference: {
    // Hazardous Workplaces Personnel Requirements
    hazardous: {
      '1-50': 'Full-time first aider',
      '51-99': 'Part-time nurse (4h/6d) + Full-time first aider + Treatment room',
      '100-199': 'Part-time physician (4h/3d) + Part-time dentist (alternate) + Full-time nurse + Full-time first aider + Treatment room',
      '200-600': 'Part-time physician (4h/6d) + Part-time dentist (alternate) + Full-time nurse + Full-time first aider + Medical clinic',
      '601-2000': 'Full-time physician (8h/6d) OR 2 part-time + Full-time dentist + Full-time nurse per shift + Full-time first aider per shift + Medical/dental clinic',
      'Over 2000': 'Full-time physician + Part-time physician per other shift + Full-time dentist + Full-time nurse per shift + Full-time first aider per shift + Hospital (1 bed/100 workers)',
    },

    // Non-Hazardous Workplaces Personnel Requirements
    nonHazardous: {
      '1-50': 'Full-time first aider',
      '51-99': 'Full-time first aider + Treatment room',
      '100-199': 'Part-time nurse (4h/6d) + Full-time first aider + Treatment room',
      '200-600': 'Part-time physician (4h/3d) + Part-time dentist (alternate) + Full-time nurse + Full-time first aider + Treatment room',
      '601-2000': 'Part-time physician (4h/6d) + Part-time dentist (alternate) + Full-time nurse + Full-time first aider + Emergency clinic',
      'Over 2000': 'Full-time physician + Part-time physician per other shift + Full-time dentist + Full-time nurse per shift + Full-time first aider + Medical/dental clinic',
    },

    inspectionFrequency: {
      hazardous1to50: 'Every 2 months',
      hazardous51to99: 'Every month',
      nonHazardous1to99: 'Every 6 months',
      nonHazardous100to199: 'Every 3 months',
    },

    physicalExamClasses: {
      A: 'Fit for any work',
      B: 'Correctable defects, fit to work',
      C: 'Employable with special placement',
      D: 'Unfit for any employment',
    },

    nurseTraining: '50 hours minimum',
    refresherTraining: '8 hours annually',
    complianceDeadline: '6 months from employment',
    reportDeadline: 'March 31 of following year',
    reportForm: 'DOLE/BWC/HSD/OH-47',
    maxEstablishmentsPerPractitioner: 10,
    maxEstablishmentsPerPartTimePersonnel: 4,
    hospitalException: 'Within 5 km (urban) or 25 minutes (rural)',
  },
};

// Helper functions
export function getDefinitions(): object {
  return RULE_1960.definitions;
}

export function getOHSFunctions(): object[] {
  return RULE_1960.functions.list;
}

export function getPersonnelRequirements(workerCount: number, isHazardous: boolean): object {
  const category = isHazardous
    ? RULE_1960.emergencyHealthServices.hazardousWorkplaces
    : RULE_1960.emergencyHealthServices.nonHazardousWorkplaces;

  if (workerCount <= 50) {
    return isHazardous ? category.smallScale1to50 : category.smallScale1to99;
  } else if (workerCount <= 99) {
    return isHazardous ? category.smallScale51to99 : category.smallScale1to99;
  } else if (workerCount <= 199) {
    return isHazardous ? category.mediumScale100to199 : category.mediumScale100to199;
  } else if (workerCount <= 600) {
    return isHazardous ? category.largeScale200to600 : category.largeScale200to600;
  } else if (workerCount <= 2000) {
    return isHazardous ? category.largeScale601to2000 : category.largeScale601to2000;
  } else {
    return isHazardous ? category.largeScaleOver2000 : category.largeScaleOver2000;
  }
}

export function getQualifications(role: string): object | null {
  const roles: { [key: string]: any } = {
    firstAider: RULE_1960.qualifications.firstAider,
    nurse: RULE_1960.qualifications.nurse,
    physician: RULE_1960.qualifications.physician,
    dentist: RULE_1960.qualifications.dentist,
    practitioner: RULE_1960.qualifications.occupationalHealthPractitioner,
  };
  return roles[role.toLowerCase()] || null;
}

export function getDuties(role: string): object | null {
  const roles: { [key: string]: any } = {
    employer: RULE_1960.duties.employer,
    physician: RULE_1960.duties.occupationalHealthPhysician,
    nurse: RULE_1960.duties.occupationalHealthNurse,
    firstAider: RULE_1960.duties.firstAider,
    practitioner: RULE_1960.duties.occupationalHealthPractitioner,
  };
  return roles[role.toLowerCase()] || null;
}

export function getPhysicalExamClassification(classCode: string): string {
  const classes: { [key: string]: string } = {
    A: 'Physically fit for any work',
    B: 'Physically under-developed or with correctable defects but otherwise fit to work',
    C: 'Employable but requires special placement or limited duty due to impairments',
    D: 'Unfit or unsafe for any type of employment',
  };
  return classes[classCode.toUpperCase()] || 'Unknown classification';
}

export function getInspectionFrequency(workerCount: number, isHazardous: boolean): string {
  if (isHazardous) {
    if (workerCount <= 50) return 'At least once every 2 months';
    if (workerCount <= 99) return 'At least once every month';
    return 'Part-time or full-time occupational health physician required';
  } else {
    if (workerCount <= 99) return 'At least once every 6 months';
    if (workerCount <= 199) return 'At least once every 3 months';
    return 'Part-time or full-time occupational health physician required';
  }
}

export function getHealthProgramObjectives(): string[] {
  return RULE_1960.healthProgram.objectives.list;
}

export function getRule1960Summary(): string {
  return `
Rule 1960 - Occupational Health Services Key Points:

COVERAGE: All establishments including government

OCCUPATIONAL HEALTH SERVICES FUNCTIONS:
- Identify and assess health hazards
- Surveillance of working environment
- Advice on planning and organization of work
- Participation in improvement programs
- Organize first-aid and emergency treatment
- Participate in accident/disease analysis

HAZARDOUS WORKPLACE REQUIREMENTS:
- 1-50 workers: Full-time first aider
- 51-99 workers: Part-time nurse (4h/6d) + First aider + Treatment room
- 100-199 workers: Part-time physician + Part-time dentist + Nurse + First aider
- 200-600 workers: Part-time physician (4h/6d) + Dentist + Medical clinic
- 601-2000 workers: Full-time physician + Full-time dentist + Personnel per shift
- Over 2000 workers: Hospital (1 bed/100 workers) + Full-time staff

NON-HAZARDOUS WORKPLACE REQUIREMENTS:
(Generally one tier lower than hazardous)

INSPECTION FREQUENCY:
- Hazardous 1-50: Every 2 months
- Hazardous 51-99: Every month
- Non-hazardous 1-99: Every 6 months
- Non-hazardous 100-199: Every 3 months

QUALIFICATIONS:
- First Aider: Red Cross trained
- Nurse: Licensed + 50 hours occupational nursing training
- Physician: Licensed + Basic occupational medicine training
- Practitioner: Advanced training + 5 years experience + Certified

PHYSICAL EXAM CLASSIFICATIONS:
- Class A: Fit for any work
- Class B: Correctable defects, fit to work
- Class C: Special placement required
- Class D: Unfit for employment

HEALTH PROGRAM INCLUDES:
- Pre-employment, periodic, transfer, separation examinations
- Immunization programs
- Health education and counseling
- Nutrition program
- Medical records (confidential)

KEY DEADLINES:
- Training compliance: 6 months from employment
- Refresher training: 8 hours annually
- Annual report: March 31 (Form DOLE/BWC/HSD/OH-47)

CONTRACTS:
- Max 10 establishments per practitioner
- Max 4 establishments per part-time personnel
- Full-time personnel: 1 establishment only
  `.trim();
}
