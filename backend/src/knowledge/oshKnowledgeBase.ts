// Philippine OSH Knowledge Base - Pure Reference Data
// AI uses this data as context to generate dynamic answers

export const OSH_KNOWLEDGE = {
  // ===========================================
  // RULE 1020 - REGISTRATION
  // ===========================================
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
    reRegistrationRequired: [
      'Change in business name',
      'Change in location',
      'Change in ownership',
      'Re-opening after closing',
    ],
    layoutPlan: {
      scale: '1:100 meters',
      mustShow: ['Physical features', 'Storage areas', 'Exits', 'Aisles', 'Machinery', 'Clinic', 'Emergency devices'],
    },
  },

  // ===========================================
  // RULE 1030 - SAFETY OFFICERS (as amended by DO 252)
  // ===========================================
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

    consultantRequirements: {
      experience: '5 years as OSH practitioner + training',
      alternative: '10 years experience (may waive training with certification)',
      minimumPresence: '6 hours/week in establishment',
    },
  },

  // ===========================================
  // RULE 1040 - HEALTH AND SAFETY COMMITTEE
  // ===========================================
  rule1040: {
    title: 'Health and Safety Committee',
    amendments: ['DO 252, s. 2025'],

    whenRequired: '10+ workers OR hazardous workplace regardless of size',

    organizationDeadline: {
      existing: '60 days after Standards effectivity',
      new: '1 month from start of operations',
      reorganize: 'Every January',
    },

    types: {
      typeA: { workers: 'Over 400', members: 'Manager + 2 dept heads + 4 workers + physician', secretary: 'Safety Officer' },
      typeB: { workers: '200-400', members: 'Manager + 1 supervisor + 3 workers + physician/nurse', secretary: 'Safety Officer' },
      typeC: { workers: '100-200', members: 'Manager + 1 foreman + 3 workers + nurse', secretary: 'Part-time SO' },
      typeD: { workers: 'Under 100', members: 'Manager + 1 foreman + 3 workers + nurse/first-aider', secretary: 'Part-time SO' },
      typeE: { description: 'Joint Committee for multiple establishments in one building' },
    },

    meetings: {
      hazardous: 'Monthly',
      nonHazardous: 'Quarterly',
    },

    duties: [
      'Plan and develop OSH programs',
      'Direct accident prevention efforts',
      'Conduct safety inspections',
      'Review accident investigation reports',
      'Supervise OSH training',
      'Develop emergency procedures',
    ],

    termOfOffice: {
      departmentHeads: '1 year',
      workerMembersTypeAB: '2 years each',
      workerMembersTypeCDE: '1 year',
      permanentMembers: 'Chairman, physician/nurse, safety officer',
    },

    reporting: {
      initial: 'Within 1 month after organization - policies and HSC organization (2 copies)',
      quarterly: 'Every 3 months from January - programs, activities, performance',
    },
  },

  // ===========================================
  // RULE 1050 - ACCIDENT REPORTING
  // ===========================================
  rule1050: {
    title: 'Notification and Keeping of Records',
    amendments: ['LA 07, s. 2022', 'DO 252, s. 2025'],

    reportingDeadlines: {
      fatalOrPermanentTotal: { initial: '24 hours (fastest means)', formal: '20th of following month' },
      disablingInjury: '20th of following month',
      dangerousOccurrence: 'Upon occurrence',
      annualReport: 'January 30th (form IP-6b)',
    },

    forms: {
      'IP-6': 'Work Accident/Illness Report',
      'IP-6a': 'Death/Permanent Total Disability Investigation Report',
      'IP-6b': 'Annual Work Accident/Illness Exposure Data Report',
    },

    scheduledCharges: {
      death: 6000,
      permanentTotalDisability: 6000,
      armAboveShoulder: 4500,
      legAboveKnee: 4500,
      handAtWrist: 3000,
      footAtAnkle: 2400,
      oneEye: 1800,
      bothEyes: 6000,
      oneEar: 600,
      bothEars: 3000,
      maximumCharge: 6000,
    },

    formulas: {
      frequencyRate: '(Disabling Injuries x 1,000,000) / Employee-hours',
      severityRate: '(Days Lost x 1,000,000) / Employee-hours',
    },

    dangerousOccurrences: [
      'Boiler explosions',
      'Pressure vessel explosions',
      'Grinding wheel bursting',
      'Crane collapse/overturning',
      'Fire/explosion causing 24+ hour stoppage',
      'Electrical failure with fire',
    ],

    disabilityTypes: {
      death: 'Any fatality from work injury regardless of time between injury and death',
      permanentTotal: 'Permanently incapacitated from gainful occupation (loss of both eyes, two limbs, etc.)',
      permanentPartial: 'Loss or loss of use of any body member',
      temporaryTotal: 'Unable to work for a day or more but will recover',
    },
  },

  // ===========================================
  // RULE 1060 - PREMISES
  // ===========================================
  rule1060: {
    title: 'Premises of Establishments',

    spaceRequirements: {
      workroomHeight: { minimum: '2.7 m (8 ft 10 in)', airConditioned: '2.4 m (7 ft 10 in)' },
      spacePerPerson: '11.5 cubic meters (400 cu ft)',
      machineryPassageway: '60 cm (24 in) minimum',
    },

    stairs: {
      width: { minimum: '1.10 m', withoutHandrails: '90 cm', service: '56 cm' },
      pitch: { normal: '30-38 degrees', rampIfBelow: '20 degrees', ladderIfAbove: '45 degrees' },
      maxHeightBetweenLandings: '3.6 m (12 ft)',
      headroom: '2.0 m (6 ft 7 in) minimum',
      tread: '25 cm (9 in) minimum',
      riser: '20 cm (8 in) maximum',
      handrailsRequired: '4 or more risers',
      handrailHeight: '80-90 cm',
    },

    railings: {
      height: '1 m (3.3 ft) from floor',
      postSpacing: '2 m (6.6 ft) maximum',
      intermediateRail: 'Halfway between top rail and floor',
      loadCapacity: '100 kg from any direction',
      toeboardHeight: '15 cm (6 in) minimum',
    },

    fixedLadders: {
      maxPitch: '90 degrees',
      landingsRequired: 'Every 6 m for heights over 9 m',
      alternatives: 'Staggered sections OR cages/baskets',
    },

    platformsRunways: {
      railingsRequired: '2 m or more above floor',
    },

    housekeeping: [
      'Clean buildings, yards, machines',
      'Regular waste disposal',
      'Orderly arrangement of processes and storage',
    ],
  },

  // ===========================================
  // RULE 1070 - ENVIRONMENTAL CONTROL
  // ===========================================
  rule1070: {
    title: 'Occupational Health and Environmental Control',
    amendments: ['DO 136, s. 2014', 'DO 160, s. 2016', 'DO 254, s. 2016', 'DO 224, s. 2021'],

    noise: {
      permissibleExposure: {
        '90 dBA': '8 hours',
        '92 dBA': '6 hours',
        '95 dBA': '4 hours',
        '97 dBA': '3 hours',
        '100 dBA': '2 hours',
        '102 dBA': '1.5 hours',
        '105 dBA': '1 hour',
        '110 dBA': '30 minutes',
        '115 dBA': '15 minutes',
      },
      impactNoiseCeiling: '140 dB peak',
      mixedExposureFormula: 'C1/T1 + C2/T2 + ... must be < 1',
    },

    illumination: {
      yardsRoadways: '20 lux (2 ft-candles)',
      passageways: '50 lux (5 ft-candles)',
      generalWork: '100 lux (10 ft-candles)',
      moderateDetail: '200 lux (20 ft-candles)',
      closeDetail: '300 lux (30 ft-candles)',
      fineDetail: '500-1000 lux (50-100 ft-candles)',
      extremeDetail: '1000 lux (100 ft-candles)',
      emergency: '5 lux minimum for 1 hour',
      conversion: '1 foot-candle = 10 lux',
    },

    ventilation: {
      airSupplyPerWorker: '20-40 cubic meters/hour',
      airChanges: { sedentary: '4 per hour', active: '8 per hour' },
      maxAirVelocity: { rainy: '15 m/min', summer: '45 m/min' },
    },

    tlv: {
      basedOn: '8-hour workday, 48-hour workweek',
      ceilingValue: 'C prefix - never exceed',
      skinNotation: 'Potential absorption through skin',
      complianceOrder: ['Engineering controls', 'Administrative controls', 'PPE (when others not feasible)'],
    },

    workingEnvironmentMeasurement: {
      frequency: 'At least annually for hazardous workplaces',
      parameters: ['Temperature', 'Humidity', 'Pressure', 'Illumination', 'Ventilation', 'Contaminants', 'Noise'],
    },
  },

  // ===========================================
  // RULE 1080 - PPE
  // ===========================================
  rule1080: {
    title: 'Personal Protective Equipment',
    amendments: ['RA 11058', 'DO 198 (Construction)'],

    employerDuty: 'Furnish PPE at own expense, FREE to workers',
    employerResponsibility: 'Adequacy and proper maintenance',

    eyeFaceProtection: {
      standard: 'ANSI Z87.1',
      requirements: ['Adequate protection', 'Comfortable', 'Fit snugly', 'Durable', 'Cleanable', 'Approved type'],
    },

    headProtection: {
      weight: 'Not more than 0.45 kg (16 oz)',
      standard: 'ANSI Z59.1',
      classes: {
        classA: 'General service - impact and penetration',
        classB: 'Electrical hazards up to 20,000 volts',
        classC: 'Comfort only - no electrical protection',
      },
    },

    respiratoryProtection: {
      standard: 'ANSI Z88.2',
      primaryControl: 'Engineering controls first (enclosure, ventilation, substitution)',
      respiratorsWhen: 'When engineering controls not feasible',
    },

    fallProtection: {
      requiredHeight: '6 meters (20 ft) or more',
      alternative: 'Safety nets when belts/lifelines not feasible',
      safetyBelt: { width: '11.5 cm (4.5 in) minimum', thickness: '4.76 mm (3/16 in) minimum' },
      lifeLine: { diameter: '1.9 cm (0.75 in) minimum', manila: '2.5 cm (1 in) minimum' },
    },

    gloveProhibition: 'NOT worn near drills, punch presses, or machinery where hands may be caught',
  },

  // ===========================================
  // RULE 1090 - HAZARDOUS MATERIALS
  // ===========================================
  rule1090: {
    title: 'Hazardous Materials',

    controlHierarchy: [
      'Substitute with harmless substances',
      'Revise process to reduce exposure',
      'Separate rooms with minimum workers',
      'Air-tight enclosure',
      'Local exhaust ventilation',
      'General ventilation',
      'PPE as supplement',
    ],

    labelingRequirements: {
      mustContain: [
        'Hazard symbol',
        'Trade name and chemical name',
        'Principal risks',
        'Precautions',
        'First-aid measures',
      ],
      categories: ['Explosive', 'Flammable', 'Oxidizing', 'Toxic', 'Corrosive', 'Radioactive'],
    },

    acidRule: 'Pour ACID INTO WATER with constant stirring - NEVER water into acid',

    atmosphereTesting: 'At least annually to ensure within TLV',

    spillage: 'Remove as quickly as possible by best technical means',

    workingClothing: {
      removal: 'Before eating or leaving premises',
      storage: 'In designated places only',
      cleaning: 'At least once a week',
      prohibition: 'Not taken out of factory',
    },

    mealsProhibition: 'No food, drink, or tobacco in workroom with hazardous substances',
  },

  // ===========================================
  // RULE 1100 - WELDING & CUTTING
  // ===========================================
  rule1100: {
    title: 'Gas and Electric Welding and Cutting',

    prohibitedLocations: [
      'Rooms with combustible materials',
      'Near explosives or flammable substances',
    ],

    closedContainers: {
      prohibition: 'Never weld containers with explosives/flammables',
      beforeWelding: ['Clean thoroughly', 'OR fill with inert gas', 'OR fill with water'],
    },

    screens: {
      required: 'When others work or pass nearby',
      height: '2 m (6.5 ft) minimum',
      material: 'Opaque, sturdy, fire-resistant',
    },

    fireExtinguisher: 'Required at location',

    authorization: {
      largeEstablishments: 'Safety inspection before operations',
      writtenPermit: 'Required with precautions listed',
    },

    ppe: {
      welders: ['Goggles/helmet with filter lens', 'Hand shields', 'Aprons'],
      assistants: ['Gloves', 'Goggles', 'Protective clothing'],
    },

    confinedSpaces: 'Local exhaust + general ventilation + respiratory protection',
  },

  // ===========================================
  // RULE 1120 - CONFINED SPACES
  // ===========================================
  rule1120: {
    title: 'Hazardous Work Processes - Confined Spaces',

    beforeEntry: [
      'Check water level below 15 cm (6 in) - if water present, provide dry wooden platform',
      'Test air for: explosive gases, oxygen content, carbon monoxide',
      'If abnormal levels: DO NOT ENTER until blower ventilation effected',
      'Breathing apparatus and PPE must be available',
    ],

    watcherRequired: {
      mandatory: true,
      requirements: [
        'Familiar with the job',
        'In regular contact with workers',
        'Has breathing apparatus ready',
      ],
      prohibition: 'No worker shall enter unless watcher is available',
    },

    prohibitions: [
      'No smoking',
      'No open lights, torches, arcs, flames',
      'No volatile solvent spraying/painting without respiratory protection',
    ],

    unattendedOpenings: {
      day: 'Barricades',
      night: 'Barricades + lanterns + warning signs',
    },

    ingressEgress: 'Adequate means required',
  },

  // ===========================================
  // RULE 1140 - EXPLOSIVES
  // ===========================================
  rule1140: {
    title: 'Explosives',
    relatedLaw: 'Fire Code of the Philippines',

    workroomLimit: '45 kg (100 lbs) for 8-hour work',
    magazineMaximum: { explosives: '136,360 kg', blastingCaps: '20,000,000 caps' },

    magazineClasses: {
      classI: { capacity: 'Over 22.5 kg (50 lbs)', construction: 'Masonry or metal' },
      classII: { capacity: 'Up to 22.5 kg (50 lbs)', construction: 'Box within box with sand fill' },
    },

    temporaryStorage: {
      over11kg: '45 m (150 ft) from work site',
      under11kg: '15 m (50 ft) from work site',
    },

    distanceRule: 'If NOT barricaded, distances must be DOUBLED',

    signs: { text: 'EXPLOSIVE KEEP OFF', letterHeight: '15 cm (6 in) minimum' },

    certificateValidity: '1 year, renewable annually',

    prohibited: ['Matches or flame-producing devices', 'Metal-nailed shoes', 'Storage in dwellings/schools/theaters'],

    openingPackages: { distance: '15 m (50 ft) from magazine', tools: 'Wooden, rubber, fiber tools only' },
  },

  // ===========================================
  // RULE 1160 - BOILER
  // ===========================================
  rule1160: {
    title: 'Boiler',
    relatedLaw: 'RA 8495 - Philippine Mechanical Engineering Act',

    definitions: {
      powerBoiler: 'Working pressure exceeding 1.055 kg/cm2g (15 psig)',
      lowPressure: 'Pressure not exceeding 1.055 kg/cm2g OR temperature not exceeding 121C (250F)',
    },

    permitRequired: 'No boiler shall be installed/operated without permit from Secretary of Labor',

    inspection: {
      phases: [
        { phase: 'Construction', test: '1.5x design pressure' },
        { phase: 'After installation', test: '1.5x design pressure' },
        { phase: 'After repair', test: '1.2x working pressure' },
        { phase: 'Periodic', interval: 'Every 12 months' },
      ],
      annualNotice: '30 days before permit expiration',
      waterTemperature: '21-71 C (70-160 F)',
    },

    boilerRoom: {
      clearance: '100 cm minimum around boiler',
      exits: '2 independent doors required',
      wetBottom: '30 cm between boiler bottom and floor',
    },

    factorOfSafety: { minimum: 5, afterDeterioration: 'Increase by 10% or more' },

    safetyValves: {
      under500sqft: '1 valve minimum',
      over500sqft: '2 or more valves',
      dischargeHeight: '3 m above platforms',
    },

    fusiblePlugRenewal: '12 months',
    lapRivetedAgeLimit: '25 years',
    ownershipTransfer: 'Report within 30 days',
  },

  // ===========================================
  // RULE 1960 - HEALTH SERVICES
  // ===========================================
  rule1960: {
    title: 'Occupational Health Services',
    amendments: ['DO 252', 'DO 53', 'DO 73', 'DO 102', 'DO 178', 'DO 184', 'DO 208', 'DO 235'],

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
      dentist: 'Licensed dentist + basic occupational dentistry training',
    },

    trainingDeadline: '6 months from employment',
    refresherTraining: '8 hours minimum, at least once a year',

    physicalExamClasses: {
      classA: 'Fit for any work',
      classB: 'Correctable defects, fit to work',
      classC: 'Special placement required',
      classD: 'Unfit for employment',
    },

    annualReport: { deadline: 'March 31', form: 'DOLE/BWC/HSD/OH-47' },
  },

  // ===========================================
  // RA 11058 - OSH LAW
  // ===========================================
  ra11058: {
    title: 'Occupational Safety and Health Standards Act',
    effectiveDate: 'February 2019',

    coverage: 'ALL establishments and workers (regular, contractual, subcontracted)',

    employerDuties: [
      'Provide safe workplace free from hazards',
      'Give complete job safety instructions',
      'Inform workers of all hazards',
      'Use only approved devices and equipment',
      'Comply with OSH standards',
      'Provide FREE PPE',
      'Provide facilities for workers exposed to hazards',
      'Arrange emergency medical/dental services',
      'Report all accidents to DOLE',
    ],

    workerRights: [
      'Know workplace hazards',
      'Refuse unsafe work without threat of dismissal',
      'Report accidents to employer and DOLE',
      'Receive PPE at no cost',
      'Access personal exposure and medical records',
    ],

    workerDuties: [
      'Use safeguards and safety devices properly',
      'Comply with instructions to prevent accidents',
      'Report unsafe conditions',
      'Use PPE provided',
      'Undergo OSH training',
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
