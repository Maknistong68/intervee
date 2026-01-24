// Philippine OSH Knowledge Base - Pure Reference Data
// AI uses this data as context to generate dynamic answers

export const OSH_KNOWLEDGE = {
  // RULE 1020 - REGISTRATION
  rule1020: {
    title: 'Registration',
    deadlines: {
      newEstablishment: '30 days before operation',
      existingEstablishment: '60 days after Standards effectivity',
    },
    where: 'Regional Labor Office (DOLE-RO)',
    form: 'DOLE-BWC-IP-3 (3 copies)',
    fee: 'FREE',
    validity: 'Lifetime of establishment',
    reRegistrationRequired: ['Change in business name', 'Change in location', 'Change in ownership', 'Re-opening after closing'],
  },

  // RULE 1030 - SAFETY OFFICERS (as amended by DO 252)
  rule1030: {
    title: 'Training of Personnel / Safety Officers',
    amendments: ['DO 252, s. 2025', 'DO 253, s. 2025'],
    safetyOfficerLevels: {
      SO1: { hours: 40, renewal: '8 hours every 2 years' },
      SO2: { hours: 80, renewal: '16 hours every 2 years' },
      SO3: { hours: 200, otherName: 'COSH', renewal: '24 hours every 2 years' },
      SO4: { requirement: "Bachelor's degree + experience", for: 'Consultants, trainers' },
    },
    requirementsByRisk: {
      highRisk: {
        '10-50 workers': 'SO2 (1 full-time)',
        '51-200 workers': 'SO2 (1 full-time) + SO1 (per shift)',
        '201+ workers': 'SO3 (1 full-time) + SO2 (per shift)',
      },
      mediumRisk: {
        '10-50 workers': 'SO1 (1 part-time)',
        '51-200 workers': 'SO2 (1 full-time)',
        '201+ workers': 'SO2 (1 full-time) + SO1 (per shift)',
      },
      lowRisk: {
        '10-50 workers': 'SO1 (1 part-time)',
        '51-200 workers': 'SO1 (1 full-time)',
        '201+ workers': 'SO2 (1 full-time)',
      },
      construction: 'SO3 (COSH) required regardless of size',
    },
    workerTraining: {
      orientation: { when: 'First day of employment', duration: '8 hours minimum' },
      refresher: { frequency: 'Annual', duration: '4 hours minimum' },
    },
  },

  // RULE 1040 - HEALTH AND SAFETY COMMITTEE
  rule1040: {
    title: 'Health and Safety Committee',
    whenRequired: '10+ workers OR hazardous workplace regardless of size',
    organizationDeadline: { existing: '60 days after Standards effectivity', new: '1 month from start of operations', reorganize: 'Every January' },
    types: {
      typeA: { workers: 'Over 400', members: 'Manager + 2 dept heads + 4 workers + physician', secretary: 'Safety Officer' },
      typeB: { workers: '200-400', members: 'Manager + 1 supervisor + 3 workers + physician/nurse', secretary: 'Safety Officer' },
      typeC: { workers: '100-200', members: 'Manager + 1 foreman + 3 workers + nurse', secretary: 'Part-time SO' },
      typeD: { workers: 'Under 100', members: 'Manager + 1 foreman + 3 workers + nurse/first-aider', secretary: 'Part-time SO' },
      typeE: { description: 'Joint Committee for multiple establishments in one building' },
    },
    meetings: { hazardous: 'Monthly', nonHazardous: 'Quarterly' },
  },

  // RULE 1050 - ACCIDENT REPORTING
  rule1050: {
    title: 'Notification and Keeping of Records',
    reportingDeadlines: {
      fatalOrPermanentTotal: { initial: '24 hours (fastest means)', formal: '20th of following month' },
      disablingInjury: '20th of following month',
      dangerousOccurrence: 'Upon occurrence',
      annualReport: 'January 30th (form IP-6b)',
    },
    scheduledCharges: {
      death: 6000, permanentTotalDisability: 6000, armAboveShoulder: 4500, legAboveKnee: 4500,
      handAtWrist: 3000, footAtAnkle: 2400, oneEye: 1800, bothEyes: 6000, oneEar: 600, bothEars: 3000,
    },
    formulas: {
      frequencyRate: '(Disabling Injuries x 1,000,000) / Employee-hours',
      severityRate: '(Days Lost x 1,000,000) / Employee-hours',
    },
  },

  // RULE 1060 - PREMISES
  rule1060: {
    title: 'Premises of Establishments',
    spaceRequirements: {
      workroomHeight: { minimum: '2.7 m (8 ft 10 in)', airConditioned: '2.4 m (7 ft 10 in)' },
      spacePerPerson: '11.5 cubic meters (400 cu ft)',
    },
    stairs: {
      width: { minimum: '1.10 m', withoutHandrails: '90 cm', service: '56 cm' },
      pitch: { normal: '30-38 degrees', rampIfBelow: '20 degrees', ladderIfAbove: '45 degrees' },
      maxHeightBetweenLandings: '3.6 m (12 ft)',
      headroom: '2.0 m (6 ft 7 in) minimum',
      handrailsRequired: '4 or more risers',
    },
    railings: { height: '1 m (3.3 ft) from floor', toeboardHeight: '15 cm (6 in) minimum' },
  },

  // RULE 1070 - ENVIRONMENTAL CONTROL
  rule1070: {
    title: 'Occupational Health and Environmental Control',
    noise: {
      permissibleExposure: {
        '90 dBA': '8 hours', '92 dBA': '6 hours', '95 dBA': '4 hours', '97 dBA': '3 hours',
        '100 dBA': '2 hours', '102 dBA': '1.5 hours', '105 dBA': '1 hour', '110 dBA': '30 minutes', '115 dBA': '15 minutes',
      },
      impactNoiseCeiling: '140 dB peak',
    },
    illumination: {
      yardsRoadways: '20 lux', passageways: '50 lux', generalWork: '100 lux',
      moderateDetail: '200 lux', closeDetail: '300 lux', fineDetail: '500-1000 lux',
      emergency: '5 lux minimum for 1 hour',
    },
    ventilation: { airSupplyPerWorker: '20-40 cubic meters/hour' },
  },

  // RULE 1080 - PPE
  rule1080: {
    title: 'Personal Protective Equipment',
    employerDuty: 'Furnish PPE at own expense, FREE to workers',
    headProtection: {
      weight: 'Not more than 0.45 kg (16 oz)',
      classes: {
        classA: 'General service - impact and penetration',
        classB: 'Electrical hazards up to 20,000 volts',
        classC: 'Comfort only - no electrical protection',
      },
    },
    fallProtection: {
      requiredHeight: '6 meters (20 ft) or more',
      safetyBelt: { width: '11.5 cm (4.5 in) minimum', thickness: '4.76 mm (3/16 in) minimum' },
      lifeLine: { diameter: '1.9 cm (0.75 in) minimum' },
    },
    gloveProhibition: 'NOT worn near drills, punch presses, or machinery where hands may be caught',
  },

  // RULE 1090 - HAZARDOUS MATERIALS
  rule1090: {
    title: 'Hazardous Materials',
    controlHierarchy: ['Substitute', 'Revise process', 'Separate rooms', 'Air-tight enclosure', 'Local exhaust', 'General ventilation', 'PPE'],
    acidRule: 'Pour ACID INTO WATER with constant stirring - NEVER water into acid',
    mealsProhibition: 'No food, drink, or tobacco in workroom with hazardous substances',
  },

  // RULE 1100 - WELDING & CUTTING
  rule1100: {
    title: 'Gas and Electric Welding and Cutting',
    prohibitedLocations: ['Rooms with combustible materials', 'Near explosives or flammable substances'],
    closedContainers: { prohibition: 'Never weld containers with explosives/flammables', beforeWelding: ['Clean thoroughly', 'OR fill with inert gas', 'OR fill with water'] },
    screens: { required: 'When others work or pass nearby', height: '2 m (6.5 ft) minimum', material: 'Opaque, sturdy, fire-resistant' },
    fireExtinguisher: 'Required at location',
    confinedSpaces: 'Local exhaust + general ventilation + respiratory protection',
  },

  // RULE 1120 - CONFINED SPACES
  rule1120: {
    title: 'Hazardous Work Processes - Confined Spaces',
    beforeEntry: [
      'Check water level below 15 cm (6 in)',
      'Test air for: explosive gases, oxygen content, carbon monoxide',
      'If abnormal levels: DO NOT ENTER until blower ventilation effected',
      'Breathing apparatus and PPE must be available',
    ],
    watcherRequired: { mandatory: true, prohibition: 'No worker shall enter unless watcher is available' },
    prohibitions: ['No smoking', 'No open lights, torches, arcs, flames'],
  },

  // RULE 1140 - EXPLOSIVES
  rule1140: {
    title: 'Explosives',
    workroomLimit: '45 kg (100 lbs) for 8-hour work',
    temporaryStorage: { over11kg: '45 m (150 ft) from work site', under11kg: '15 m (50 ft) from work site' },
    distanceRule: 'If NOT barricaded, distances must be DOUBLED',
    certificateValidity: '1 year, renewable annually',
    prohibited: ['Matches or flame-producing devices', 'Metal-nailed shoes', 'Storage in dwellings/schools/theaters'],
  },

  // RULE 1160 - BOILER
  rule1160: {
    title: 'Boiler',
    permitRequired: 'No boiler shall be installed/operated without permit from Secretary of Labor',
    inspection: { phases: ['Construction: 1.5x design pressure', 'After installation: 1.5x design pressure', 'After repair: 1.2x working pressure', 'Periodic: Every 12 months'] },
    boilerRoom: { clearance: '100 cm minimum around boiler', exits: '2 independent doors required' },
    fusiblePlugRenewal: '12 months',
  },

  // RULE 1960 - HEALTH SERVICES
  rule1960: {
    title: 'Occupational Health Services',
    hazardousWorkplaces: {
      '1-50 workers': { personnel: 'Full-time first-aider', facility: 'First-aid medicines' },
      '51-99 workers': { personnel: 'Part-time nurse (4h/6d) + First-aider', facility: 'Treatment room' },
      '100-199 workers': { personnel: 'Part-time physician (4h/3d) + Part-time dentist + Nurse + First-aider', facility: 'Treatment room' },
      '200-600 workers': { personnel: 'Part-time physician (4h/6d) + Dentist + Nurse + First-aider', facility: 'Medical clinic' },
      '601-2000 workers': { personnel: 'Full-time physician + Full-time dentist + Nurse per shift + First-aider per shift', facility: 'Medical and dental clinic' },
      'Over 2000 workers': { personnel: 'Full-time physician + Part-time physician (other shifts) + Full-time dentist + Staff per shift', facility: 'Hospital (1 bed per 100 workers)' },
    },
    nonHazardousWorkplaces: {
      '1-99 workers': { personnel: 'Full-time first-aider', facility: 'Treatment room for 51-99' },
      '100-199 workers': { personnel: 'Part-time nurse (4h/6d) + First-aider', facility: 'Treatment room' },
      '200-600 workers': { personnel: 'Part-time physician (4h/3d) + Part-time dentist + Nurse + First-aider', facility: 'Treatment room' },
      '601-2000 workers': { personnel: 'Part-time physician (4h/6d) + Part-time dentist + Nurse + First-aider', facility: 'Clinic' },
      'Over 2000 workers': { personnel: 'Full-time physician + Part-time (other shifts) + Dentist + Nurse per shift', facility: 'Medical and dental clinic' },
    },
    qualifications: {
      firstAider: 'Able to read/write + Red Cross first aid course',
      nurse: 'Licensed nurse + 50 hours basic occupational nursing training',
      physician: 'Licensed physician + basic occupational medicine training',
    },
    annualReport: { deadline: 'March 31', form: 'DOLE/BWC/HSD/OH-47' },
  },

  // RA 11058 - OSH LAW
  ra11058: {
    title: 'Occupational Safety and Health Standards Act',
    effectiveDate: 'February 2019',
    coverage: 'ALL establishments and workers (regular, contractual, subcontracted)',
    employerDuties: [
      'Provide safe workplace free from hazards',
      'Give complete job safety instructions',
      'Inform workers of all hazards',
      'Provide FREE PPE',
      'Report all accidents to DOLE',
    ],
    workerRights: [
      'Know workplace hazards',
      'Refuse unsafe work without threat of dismissal',
      'Report accidents to employer and DOLE',
      'Receive PPE at no cost',
    ],
    penalties: {
      firstOffense: { micro: 'PHP 50,000', small: 'PHP 100,000', medium: 'PHP 200,000', large: 'PHP 300,000' },
      secondOffense: { micro: 'PHP 100,000', small: 'PHP 200,000', medium: 'PHP 400,000', large: 'PHP 600,000' },
      thirdOffense: { micro: 'PHP 200,000', small: 'PHP 400,000', medium: 'PHP 800,000', large: 'PHP 1,000,000' },
      willfulViolation: '6 months to 6 years imprisonment + fine',
      deathOrInjury: 'PHP 1,000,000 to PHP 5,000,000',
    },
    jointLiability: 'Principal employer, contractor, and subcontractor are JOINTLY AND SEVERALLY LIABLE',
    workStoppage: 'DOLE may issue Work Stoppage Orders for imminent danger',
  },
};

export default OSH_KNOWLEDGE;
