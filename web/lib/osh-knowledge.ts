// Philippine OSH Knowledge Base - Pure Reference Data WITH CITATIONS
// AI uses this data as context to generate dynamic answers
// IMPORTANT: AI MUST cite the legal reference when answering questions

export const OSH_KNOWLEDGE = {
  // ===========================================
  // RULE 1020 - REGISTRATION (15 Q&A Points)
  // ===========================================
  rule1020: {
    title: 'Registration',
    citation: 'Rule 1020, OSHS',

    deadlines: {
      newEstablishment: { value: '30 days before operation', citation: 'Rule 1020, Section 1023' },
      existingEstablishment: { value: '60 days after Standards effectivity', citation: 'Rule 1020, Section 1023' },
    },

    where: { value: 'Regional Labor Office (DOLE-RO)', citation: 'Rule 1020, Section 1021' },

    form: {
      number: { value: 'DOLE-BWC-IP-3', citation: 'Rule 1020, Section 1024' },
      copies: { value: '3 copies', citation: 'Rule 1020, Section 1024' },
    },

    fee: { value: 'FREE', citation: 'Rule 1020, Section 1021' },

    validity: { value: 'Lifetime of establishment', citation: 'Rule 1020, Section 1021' },

    coverage: { value: 'All establishments with workers', citation: 'Rule 1020, Section 1021' },

    registrableUnit: { value: 'Each branch/unit registered separately', citation: 'Rule 1020, Section 1022' },

    layoutPlan: {
      scale: { value: '1:100 meters', citation: 'Rule 1020, Section 1024' },
      format: { value: 'White or blue print', citation: 'Rule 1020, Section 1024' },
      mustShow: {
        value: ['Physical features', 'Storage areas', 'Exits', 'Aisles', 'Machinery', 'Clinic', 'Emergency devices'],
        citation: 'Rule 1020, Section 1024',
      },
    },

    reRegistrationTriggers: {
      value: ['Change in business name', 'Change in location', 'Change in ownership', 'Re-opening after closing'],
      citation: 'Rule 1020, Section 1025',
    },

    certificateRequirement: { value: 'Posted in conspicuous place', citation: 'Rule 1020, Section 1026' },

    penalties: { value: 'PHP 50,000 - 1,000,000', citation: 'RA 11058, Section 28' },
  },

  // ===========================================
  // RULE 1030 - SAFETY OFFICERS (20 Q&A Points)
  // ===========================================
  rule1030: {
    title: 'Training of Personnel / Safety Officers',
    citation: 'Rule 1030, OSHS; DO 252, s. 2025',
    amendments: ['DO 252, s. 2025', 'DO 253, s. 2025'],

    safetyOfficerLevels: {
      SO1: {
        hours: { value: 40, citation: 'Rule 1030; DO 252, s. 2025' },
        renewal: { value: '8 hours every 2 years', citation: 'DO 252, s. 2025' },
      },
      SO2: {
        hours: { value: 80, citation: 'Rule 1030; DO 252, s. 2025' },
        renewal: { value: '16 hours every 2 years', citation: 'DO 252, s. 2025' },
      },
      SO3: {
        hours: { value: 200, citation: 'Rule 1030; DO 252, s. 2025' },
        otherName: 'COSH',
        renewal: { value: '24 hours every 2 years', citation: 'DO 252, s. 2025' },
      },
      SO4: {
        requirement: { value: "Bachelor's degree + experience", citation: 'DO 252, s. 2025' },
        for: 'Consultants, trainers',
      },
    },

    requirementsByRisk: {
      highRisk: {
        '10-50 workers': { value: 'SO2 (1 full-time)', citation: 'Rule 1030, Section 1031; DO 252' },
        '51-200 workers': { value: 'SO2 (1 full-time) + SO1 (per shift)', citation: 'Rule 1030, Section 1031; DO 252' },
        '201+ workers': { value: 'SO3 (1 full-time) + SO2 (per shift)', citation: 'Rule 1030, Section 1031; DO 252' },
      },
      mediumRisk: {
        '10-50 workers': { value: 'SO1 (1 part-time)', citation: 'Rule 1030, Section 1031; DO 252' },
        '51-200 workers': { value: 'SO2 (1 full-time)', citation: 'Rule 1030, Section 1031; DO 252' },
        '201+ workers': { value: 'SO2 (1 full-time) + SO1 (per shift)', citation: 'Rule 1030, Section 1031; DO 252' },
      },
      lowRisk: {
        '10-50 workers': { value: 'SO1 (1 part-time)', citation: 'Rule 1030, Section 1031; DO 252' },
        '51-200 workers': { value: 'SO1 (1 full-time)', citation: 'Rule 1030, Section 1031; DO 252' },
        '201+ workers': { value: 'SO2 (1 full-time)', citation: 'Rule 1030, Section 1031; DO 252' },
      },
      construction: { value: 'SO3 (COSH) required regardless of size', citation: 'DO 13, s. 1998; DO 198, s. 2018' },
    },

    workerTraining: {
      orientation: {
        when: { value: 'First day of employment', citation: 'Rule 1030, Section 1033' },
        duration: { value: '8 hours minimum', citation: 'Rule 1030, Section 1033' },
      },
      refresher: {
        frequency: { value: 'Annual', citation: 'Rule 1030, Section 1033' },
        duration: { value: '4 hours minimum', citation: 'Rule 1030, Section 1033' },
      },
    },

    consultantRequirements: {
      experience: '5 years as OSH practitioner + training',
      alternative: '10 years experience (may waive training with certification)',
      minimumPresence: { value: '6 hours/week in establishment', citation: 'Rule 1030, Section 1034.01' },
    },
  },

  // ===========================================
  // RULE 1040 - HEALTH AND SAFETY COMMITTEE (20 Q&A Points)
  // ===========================================
  rule1040: {
    title: 'Health and Safety Committee',
    citation: 'Rule 1040, OSHS; DO 252, s. 2025',
    amendments: ['DO 252, s. 2025'],

    whenRequired: { value: '10+ workers OR hazardous workplace regardless of size', citation: 'Rule 1040, Section 1041' },

    organizationDeadline: {
      existing: { value: '60 days after Standards effectivity', citation: 'Rule 1040, Section 1041' },
      new: { value: '1 month from start of operations', citation: 'Rule 1040, Section 1041' },
      reorganize: { value: 'Every January', citation: 'Rule 1040, Section 1041' },
    },

    types: {
      typeA: {
        workers: { value: 'Over 400', citation: 'Rule 1040, Section 1042' },
        members: { value: 'Manager + 2 dept heads + 4 workers + physician', citation: 'Rule 1040, Section 1042' },
        secretary: 'Safety Officer',
      },
      typeB: {
        workers: { value: '200-400', citation: 'Rule 1040, Section 1042' },
        members: { value: 'Manager + 1 supervisor + 3 workers + physician/nurse', citation: 'Rule 1040, Section 1042' },
        secretary: 'Safety Officer',
      },
      typeC: {
        workers: { value: '100-200', citation: 'Rule 1040, Section 1042' },
        members: { value: 'Manager + 1 foreman + 3 workers + nurse', citation: 'Rule 1040, Section 1042' },
        secretary: 'Part-time SO',
      },
      typeD: {
        workers: { value: 'Under 100', citation: 'Rule 1040, Section 1042' },
        members: { value: 'Manager + 1 foreman + 3 workers + nurse/first-aider', citation: 'Rule 1040, Section 1042' },
        secretary: 'Part-time SO',
      },
      typeE: {
        description: { value: 'Joint Committee for multiple establishments in one building', citation: 'Rule 1040, Section 1042' },
      },
    },

    meetings: {
      hazardous: { value: 'Monthly', citation: 'Rule 1040, Section 1043; DO 252' },
      nonHazardous: { value: 'Quarterly', citation: 'Rule 1040, Section 1043' },
    },

    termOfOffice: {
      departmentHeads: { value: '1 year', citation: 'Rule 1040, Section 1044' },
      workerMembersTypeAB: { value: '2 years each', citation: 'Rule 1040, Section 1044' },
      workerMembersTypeCDE: { value: '1 year', citation: 'Rule 1040, Section 1044' },
      permanentMembers: { value: 'Chairman, physician/nurse, safety officer', citation: 'Rule 1040, Section 1044' },
    },

    reporting: {
      initial: { value: 'Within 1 month after organization', citation: 'Rule 1040, Section 1045' },
      quarterly: 'Every 3 months from January - programs, activities, performance',
    },

    duties: [
      'Plan and develop OSH programs',
      'Direct accident prevention efforts',
      'Conduct safety inspections',
      'Review accident investigation reports',
      'Supervise OSH training',
      'Develop emergency procedures',
    ],
  },

  // ===========================================
  // RULE 1050 - ACCIDENT REPORTING (20 Q&A Points)
  // ===========================================
  rule1050: {
    title: 'Notification and Keeping of Records',
    citation: 'Rule 1050, OSHS; LA 07, s. 2022',
    amendments: ['LA 07, s. 2022', 'DO 252, s. 2025'],

    reportingDeadlines: {
      fatalAccident: {
        initial: { value: '24 hours (fastest means)', citation: 'Rule 1050, Section 1051; LA 07, s. 2022' },
        formal: { value: '20th of following month', citation: 'Rule 1050, Section 1051' },
      },
      disablingInjury: { value: '20th of following month', citation: 'Rule 1050, Section 1051' },
      dangerousOccurrence: { value: 'Upon occurrence', citation: 'Rule 1050, Section 1051' },
      annualReport: { value: 'January 30th', citation: 'Rule 1050, Section 1051' },
    },

    forms: {
      'IP-6': { value: 'Work Accident/Illness Report', citation: 'Rule 1050, Section 1051' },
      'IP-6a': { value: 'Death/Permanent Total Disability Investigation Report', citation: 'Rule 1050, Section 1051' },
      'IP-6b': { value: 'Annual Work Accident/Illness Exposure Data Report', citation: 'Rule 1050, Section 1051' },
    },

    scheduledCharges: {
      death: { value: 6000, unit: 'days', citation: 'Rule 1050, Table 6' },
      permanentTotalDisability: { value: 6000, unit: 'days', citation: 'Rule 1050, Table 6' },
      armAboveShoulder: { value: 4500, unit: 'days', citation: 'Rule 1050, Table 6' },
      legAboveKnee: { value: 4500, unit: 'days', citation: 'Rule 1050, Table 6' },
      handAtWrist: { value: 3000, unit: 'days', citation: 'Rule 1050, Table 6' },
      footAtAnkle: { value: 2400, unit: 'days', citation: 'Rule 1050, Table 6' },
      oneEye: { value: 1800, unit: 'days', citation: 'Rule 1050, Table 6' },
      bothEyes: { value: 6000, unit: 'days', citation: 'Rule 1050, Table 6' },
      oneEar: { value: 600, unit: 'days', citation: 'Rule 1050, Table 6' },
      bothEars: { value: 3000, unit: 'days', citation: 'Rule 1050, Table 6' },
      maximumCharge: { value: 6000, unit: 'days', citation: 'Rule 1050, Section 1056' },
    },

    formulas: {
      frequencyRate: { value: '(Disabling Injuries x 1,000,000) / Employee-hours', citation: 'Rule 1050, Section 1057' },
      severityRate: { value: '(Days Lost x 1,000,000) / Employee-hours', citation: 'Rule 1050, Section 1057' },
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
  // RULE 1060 - PREMISES (20 Q&A Points)
  // ===========================================
  rule1060: {
    title: 'Premises of Establishments',
    citation: 'Rule 1060, OSHS',

    spaceRequirements: {
      workroomHeight: {
        minimum: { value: '2.7 m (8 ft 10 in)', citation: 'Rule 1060, Section 1062' },
        airConditioned: { value: '2.4 m (7 ft 10 in)', citation: 'Rule 1060, Section 1062' },
      },
      spacePerPerson: { value: '11.5 cubic meters (400 cu ft)', citation: 'Rule 1060, Section 1062' },
      machineryPassageway: { value: '60 cm (24 in) minimum', citation: 'Rule 1060, Section 1063' },
    },

    stairs: {
      width: {
        minimum: { value: '1.10 m', citation: 'Rule 1060, Section 1065' },
        withoutHandrails: { value: '90 cm', citation: 'Rule 1060, Section 1065' },
        service: { value: '56 cm', citation: 'Rule 1060, Section 1065' },
      },
      pitch: {
        normal: { value: '30-38 degrees', citation: 'Rule 1060, Section 1065' },
        rampIfBelow: { value: '20 degrees', citation: 'Rule 1060, Section 1065' },
        ladderIfAbove: { value: '45 degrees', citation: 'Rule 1060, Section 1065' },
      },
      maxHeightBetweenLandings: { value: '3.6 m (12 ft)', citation: 'Rule 1060, Section 1065' },
      headroom: { value: '2.0 m (6 ft 7 in) minimum', citation: 'Rule 1060, Section 1065' },
      tread: { value: '25 cm (9 in) minimum', citation: 'Rule 1060, Section 1065' },
      riser: { value: '20 cm (8 in) maximum', citation: 'Rule 1060, Section 1065' },
      handrailsRequired: { value: '4 or more risers', citation: 'Rule 1060, Section 1065' },
      handrailHeight: { value: '80-90 cm', citation: 'Rule 1060, Section 1065' },
    },

    railings: {
      height: { value: '1 m (3.3 ft) from floor', citation: 'Rule 1060, Section 1064' },
      postSpacing: { value: '2 m (6.6 ft) maximum', citation: 'Rule 1060, Section 1064' },
      intermediateRail: 'Halfway between top rail and floor',
      loadCapacity: { value: '100 kg from any direction', citation: 'Rule 1060, Section 1064' },
      toeboardHeight: { value: '15 cm (6 in) minimum', citation: 'Rule 1060, Section 1064' },
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
  // RULE 1070 - ENVIRONMENTAL CONTROL (20 Q&A Points)
  // ===========================================
  rule1070: {
    title: 'Occupational Health and Environmental Control',
    citation: 'Rule 1070, OSHS; DO 136, s. 2014',
    amendments: ['DO 136, s. 2014', 'DO 160, s. 2016', 'DO 254, s. 2016', 'DO 224, s. 2021'],

    noise: {
      permissibleExposure: {
        '90 dBA': { value: '8 hours', citation: 'Rule 1070, Table 7; DO 136, s. 2014' },
        '92 dBA': { value: '6 hours', citation: 'Rule 1070, Table 7' },
        '95 dBA': { value: '4 hours', citation: 'Rule 1070, Table 7' },
        '97 dBA': { value: '3 hours', citation: 'Rule 1070, Table 7' },
        '100 dBA': { value: '2 hours', citation: 'Rule 1070, Table 7' },
        '102 dBA': { value: '1.5 hours', citation: 'Rule 1070, Table 7' },
        '105 dBA': { value: '1 hour', citation: 'Rule 1070, Table 7' },
        '110 dBA': { value: '30 minutes', citation: 'Rule 1070, Table 7' },
        '115 dBA': { value: '15 minutes', citation: 'Rule 1070, Table 7' },
      },
      impactNoiseCeiling: { value: '140 dB peak', citation: 'Rule 1070, Section 1074' },
      mixedExposureFormula: 'C1/T1 + C2/T2 + ... must be < 1',
    },

    illumination: {
      yardsRoadways: { value: '20 lux (2 ft-candles)', citation: 'Rule 1070, Section 1075, Table 8' },
      passageways: { value: '50 lux (5 ft-candles)', citation: 'Rule 1070, Table 8' },
      generalWork: { value: '100 lux (10 ft-candles)', citation: 'Rule 1070, Table 8' },
      moderateDetail: { value: '200 lux (20 ft-candles)', citation: 'Rule 1070, Table 8' },
      closeDetail: { value: '300 lux (30 ft-candles)', citation: 'Rule 1070, Table 8' },
      fineDetail: { value: '500-1000 lux (50-100 ft-candles)', citation: 'Rule 1070, Table 8' },
      extremeDetail: '1000 lux (100 ft-candles)',
      emergency: { value: '5 lux minimum for 1 hour', citation: 'Rule 1070, Section 1075' },
      conversion: '1 foot-candle = 10 lux',
    },

    ventilation: {
      airSupplyPerWorker: { value: '20-40 cubic meters/hour', citation: 'Rule 1070, Section 1076' },
      airChanges: { sedentary: '4 per hour', active: '8 per hour' },
      maxAirVelocity: {
        rainy: { value: '15 m/min maximum', citation: 'Rule 1070, Section 1076' },
        summer: { value: '45 m/min maximum', citation: 'Rule 1070, Section 1076' },
      },
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
  // RULE 1080 - PPE (20 Q&A Points)
  // ===========================================
  rule1080: {
    title: 'Personal Protective Equipment',
    citation: 'Rule 1080, OSHS; RA 11058',
    amendments: ['RA 11058', 'DO 198 (Construction)'],

    employerDuty: { value: 'Furnish PPE FREE to workers', citation: 'Rule 1080, Section 1081; RA 11058' },
    employerResponsibility: 'Adequacy and proper maintenance',

    eyeFaceProtection: {
      standard: { value: 'ANSI Z87.1', citation: 'Rule 1080, Section 1082' },
      requirements: ['Adequate protection', 'Comfortable', 'Fit snugly', 'Durable', 'Cleanable', 'Approved type'],
    },

    headProtection: {
      weight: { value: '0.45 kg (16 oz) maximum', citation: 'Rule 1080, Section 1084' },
      standard: { value: 'ANSI Z59.1', citation: 'Rule 1080, Section 1084' },
      classes: {
        classA: { value: 'General service - impact and penetration', citation: 'Rule 1080, Section 1084; ANSI Z59.1' },
        classB: { value: 'Electrical hazards up to 20,000 volts', citation: 'Rule 1080, Section 1084; ANSI Z59.1' },
        classC: { value: 'Comfort only - no electrical protection', citation: 'Rule 1080, Section 1084; ANSI Z59.1' },
      },
    },

    respiratoryProtection: {
      standard: { value: 'ANSI Z88.2', citation: 'Rule 1080, Section 1083' },
      primaryControl: 'Engineering controls first (enclosure, ventilation, substitution)',
      respiratorsWhen: 'When engineering controls not feasible',
    },

    fallProtection: {
      requiredHeight: { value: '6 meters (20 ft) or more', citation: 'Rule 1080, Section 1086' },
      alternative: 'Safety nets when belts/lifelines not feasible',
      safetyBelt: {
        width: { value: '11.5 cm (4.5 in) minimum', citation: 'Rule 1080, Section 1086' },
        thickness: { value: '4.76 mm (3/16 in) minimum', citation: 'Rule 1080, Section 1086' },
      },
      lifeLine: {
        diameter: { value: '1.9 cm (0.75 in) minimum', citation: 'Rule 1080, Section 1086' },
        manila: { value: '2.5 cm (1 in) minimum', citation: 'Rule 1080, Section 1086' },
      },
      anchorSupport: { value: '2,730 kg (6,000 lbs)', citation: 'Rule 1080, Section 1086' },
      hardwareStrength: { value: 'Support 114 kg (250 lbs)', citation: 'Rule 1080, Section 1086' },
      lifelineSupport: { value: '1,140 kg', citation: 'Rule 1080, Section 1086' },
    },

    safetyNet: {
      meshDiameter: { value: '0.94 cm', citation: 'Rule 1080, Section 1086' },
      border: { value: '1.90 cm', citation: 'Rule 1080, Section 1086' },
      maxMeshSize: { value: '15.25 cm', citation: 'Rule 1080, Section 1086' },
    },

    gloveProhibition: { value: 'NOT worn near drills, punch presses, or rotating machinery', citation: 'Rule 1080, Section 1085' },
  },

  // ===========================================
  // RULE 1090 - HAZARDOUS MATERIALS (15 Q&A Points)
  // ===========================================
  rule1090: {
    title: 'Hazardous Materials',
    citation: 'Rule 1090, OSHS',

    controlHierarchy: {
      step1: { value: 'Substitute with harmless substances', citation: 'Rule 1090, Section 1093' },
      step2: { value: 'Revise process to reduce exposure', citation: 'Rule 1090, Section 1093' },
      step3: { value: 'Separate rooms with minimum workers', citation: 'Rule 1090, Section 1093' },
      step4: { value: 'Air-tight enclosure', citation: 'Rule 1090, Section 1093' },
      step5: { value: 'Local exhaust ventilation', citation: 'Rule 1090, Section 1093' },
      step6: { value: 'General ventilation', citation: 'Rule 1090, Section 1093' },
      step7: { value: 'PPE as supplement', citation: 'Rule 1090, Section 1093' },
    },

    labelingRequirements: {
      shape: { value: 'Rectangular', citation: 'Rule 1090, Section 1092' },
      largeContainerHeight: { value: '2.54 cm (1 in) minimum for containers over 18.92 liters', citation: 'Rule 1090, Section 1092' },
      mustContain: [
        'Hazard symbol',
        'Trade name and chemical name',
        'Principal risks',
        'Precautions',
        'First-aid measures',
      ],
      categories: ['Explosive', 'Flammable', 'Oxidizing', 'Toxic', 'Corrosive', 'Radioactive'],
    },

    acidRule: { value: 'Pour ACID INTO WATER with constant stirring - NEVER water into acid', citation: 'Rule 1090, Section 1094' },

    acidSpillCleanup: { value: 'Flush with water OR neutralize with chalk/lime', citation: 'Rule 1090, Section 1094' },

    atmosphereTesting: { value: 'At least annually', citation: 'Rule 1090, Section 1093' },

    spillage: 'Remove as quickly as possible by best technical means',

    workingClothing: {
      removal: { value: 'Before eating or leaving premises', citation: 'Rule 1090, Section 1095' },
      storage: 'In designated places only',
      cleaning: { value: 'At least once a week', citation: 'Rule 1090, Section 1095' },
      prohibition: 'Not taken out of factory',
    },

    mealsProhibition: { value: 'No food, drink, or tobacco in hazardous workroom', citation: 'Rule 1090, Section 1095' },
  },

  // ===========================================
  // RULE 1100 - WELDING & CUTTING (15 Q&A Points)
  // ===========================================
  rule1100: {
    title: 'Gas and Electric Welding and Cutting',
    citation: 'Rule 1100, OSHS',

    prohibitedLocations: {
      value: ['Rooms with combustible materials', 'Near explosives or flammable substances'],
      citation: 'Rule 1100, Section 1100.01',
    },

    closedContainers: {
      prohibition: { value: 'Never weld containers with explosives/flammables', citation: 'Rule 1100, Section 1100.01' },
      beforeWelding: {
        option1: { value: 'Clean thoroughly', citation: 'Rule 1100, Section 1100.01' },
        option2: { value: 'Fill with inert gas', citation: 'Rule 1100, Section 1100.01' },
        option3: { value: 'Fill with water', citation: 'Rule 1100, Section 1100.01' },
      },
    },

    screens: {
      required: { value: 'When others work or pass nearby', citation: 'Rule 1100, Section 1100.02' },
      height: { value: '2 m (6.5 ft) minimum', citation: 'Rule 1100, Section 1100.02' },
      material: { value: 'Opaque, sturdy, fire-resistant', citation: 'Rule 1100, Section 1100.02' },
      surface: { value: 'Light flat paint', citation: 'Rule 1100, Section 1100.02' },
    },

    fireExtinguisher: { value: 'Required at location', citation: 'Rule 1100, Section 1100.02' },

    authorization: {
      largeEstablishments: { value: 'Safety inspection before operations', citation: 'Rule 1100, Section 1100.02' },
      writtenPermit: { value: 'Required with precautions listed', citation: 'Rule 1100, Section 1100.02' },
    },

    ppe: {
      welders: { value: ['Goggles/helmet with filter lens', 'Hand shields', 'Aprons'], citation: 'Rule 1100, Section 1100.02' },
      assistants: { value: ['Gloves', 'Goggles', 'Protective clothing'], citation: 'Rule 1100, Section 1100.02' },
    },

    confinedSpaces: { value: 'Local exhaust + general ventilation + respiratory protection', citation: 'Rule 1100, Section 1100.03' },
  },

  // ===========================================
  // RULE 1120 - CONFINED SPACES (15 Q&A Points)
  // ===========================================
  rule1120: {
    title: 'Hazardous Work Processes - Confined Spaces',
    citation: 'Rule 1120, OSHS',

    beforeEntry: {
      waterLevel: { value: 'Below 15 cm (6 in)', citation: 'Rule 1120, Section 1121' },
      airTest: { value: 'Explosive gases, oxygen content, carbon monoxide', citation: 'Rule 1120, Section 1121' },
      ifAbnormal: { value: 'DO NOT ENTER until ventilation effected', citation: 'Rule 1120, Section 1121' },
      breathingApparatus: { value: 'Must be available', citation: 'Rule 1120, Section 1121' },
    },

    watcherRequired: {
      mandatory: { value: true, citation: 'Rule 1120, Section 1121' },
      qualification: { value: 'Familiar with the job', citation: 'Rule 1120, Section 1121' },
      equipment: { value: 'Breathing apparatus ready', citation: 'Rule 1120, Section 1121' },
      contact: { value: 'Regular contact with workers', citation: 'Rule 1120, Section 1121' },
      prohibition: { value: 'No worker shall enter unless watcher is available', citation: 'Rule 1120, Section 1121' },
    },

    prohibitions: {
      noSmoking: { value: 'Prohibited', citation: 'Rule 1120, Section 1121' },
      noOpenLights: { value: 'Torches, arcs, flames prohibited', citation: 'Rule 1120, Section 1121' },
      noVolatileSolvent: { value: 'Without respiratory protection', citation: 'Rule 1120, Section 1121' },
    },

    unattendedOpenings: {
      day: { value: 'Barricades required', citation: 'Rule 1120, Section 1121' },
      night: { value: 'Barricades + lanterns + warning signs', citation: 'Rule 1120, Section 1121' },
    },

    ingressEgress: { value: 'Adequate means required', citation: 'Rule 1120, Section 1121' },
  },

  // ===========================================
  // RULE 1140 - EXPLOSIVES (15 Q&A Points)
  // ===========================================
  rule1140: {
    title: 'Explosives',
    citation: 'Rule 1140, OSHS',
    relatedLaw: 'Fire Code of the Philippines',

    workroomLimit: { value: '45 kg (100 lbs) for 8-hour work', citation: 'Rule 1140, Section 1145' },

    magazineMaximum: {
      explosives: { value: '136,360 kg', citation: 'Rule 1140, Section 1146' },
      blastingCaps: { value: '20,000,000 caps', citation: 'Rule 1140, Section 1146' },
    },

    magazineClasses: {
      classI: {
        capacity: { value: 'Over 22.5 kg (50 lbs)', citation: 'Rule 1140, Section 1142' },
        construction: { value: 'Masonry or metal', citation: 'Rule 1140, Section 1142' },
      },
      classII: {
        capacity: { value: 'Up to 22.5 kg (50 lbs)', citation: 'Rule 1140, Section 1143' },
        construction: { value: 'Box within box with sand fill', citation: 'Rule 1140, Section 1143' },
      },
    },

    temporaryStorage: {
      over11kg: { value: '45 m (150 ft) from work site', citation: 'Rule 1140, Section 1146' },
      under11kg: { value: '15 m (50 ft) from work site', citation: 'Rule 1140, Section 1146' },
    },

    distanceRule: { value: 'If NOT barricaded, distances must be DOUBLED', citation: 'Rule 1140, Section 1146' },

    signs: {
      text: { value: 'EXPLOSIVE KEEP OFF', citation: 'Rule 1140, Section 1147' },
      letterHeight: { value: '15 cm (6 in) minimum', citation: 'Rule 1140, Section 1147' },
    },

    certificateValidity: { value: '1 year, renewable annually', citation: 'Rule 1140, Section 1141' },

    openingPackages: {
      distance: { value: '15 m (50 ft) from magazine', citation: 'Rule 1140, Section 1148' },
      tools: { value: 'Wooden, rubber, fiber tools only', citation: 'Rule 1140, Section 1148' },
    },

    prohibited: ['Matches or flame-producing devices', 'Metal-nailed shoes', 'Storage in dwellings/schools/theaters'],
  },

  // ===========================================
  // RULE 1160 - BOILER (20 Q&A Points)
  // ===========================================
  rule1160: {
    title: 'Boiler',
    citation: 'Rule 1160, OSHS; RA 8495',
    relatedLaw: 'RA 8495 - Philippine Mechanical Engineering Act',

    definitions: {
      powerBoiler: { value: 'Working pressure exceeding 1.055 kg/cm2g (15 psig)', citation: 'Rule 1160, Section 1161' },
      lowPressure: {
        pressure: { value: 'Not exceeding 1.055 kg/cm2g', citation: 'Rule 1160, Section 1161' },
        temperature: { value: 'Not exceeding 121°C (250°F)', citation: 'Rule 1160, Section 1161' },
      },
    },

    permitRequired: { value: 'From Secretary of Labor', citation: 'Rule 1160, Section 1162; RA 8495' },

    inspection: {
      construction: { value: '1.5x design pressure', citation: 'Rule 1160, Section 1163' },
      afterInstallation: { value: '1.5x design pressure', citation: 'Rule 1160, Section 1163' },
      afterRepair: { value: '1.2x working pressure', citation: 'Rule 1160, Section 1163' },
      periodic: { value: 'Every 12 months', citation: 'Rule 1160, Section 1163' },
      annualNotice: { value: '30 days before permit expiration', citation: 'Rule 1160, Section 1163' },
      waterTemperature: { value: '21-71°C (70-160°F)', citation: 'Rule 1160, Section 1163' },
    },

    boilerRoom: {
      clearance: { value: '100 cm minimum around boiler', citation: 'Rule 1160, Section 1166' },
      exits: { value: '2 independent doors required', citation: 'Rule 1160, Section 1166' },
      wetBottom: { value: '30 cm between boiler bottom and floor', citation: 'Rule 1160, Section 1166' },
    },

    factorOfSafety: {
      minimum: { value: 5, citation: 'Rule 1160, Section 1164' },
      afterDeterioration: { value: 'Increase by 10% or more', citation: 'Rule 1160, Section 1164' },
    },

    safetyValves: {
      under500sqft: { value: '1 valve minimum', citation: 'Rule 1160, Section 1165' },
      over500sqft: { value: '2 or more valves', citation: 'Rule 1160, Section 1165' },
      dischargeHeight: { value: '3 m above platforms', citation: 'Rule 1160, Section 1165' },
    },

    fusiblePlugRenewal: { value: '12 months', citation: 'Rule 1160, Section 1165' },
    lapRivetedAgeLimit: { value: '25 years', citation: 'Rule 1160, Section 1164' },
    ownershipTransfer: 'Report within 30 days',
  },

  // ===========================================
  // RULE 1960 - HEALTH SERVICES (20 Q&A Points)
  // ===========================================
  rule1960: {
    title: 'Occupational Health Services',
    citation: 'Rule 1960, OSHS; DO 252',
    amendments: ['DO 252', 'DO 53', 'DO 73', 'DO 102', 'DO 178', 'DO 184', 'DO 208', 'DO 235'],

    hazardousWorkplaces: {
      '1-50 workers': {
        personnel: { value: 'Full-time first-aider', citation: 'Rule 1960, Section 1963; DO 252' },
        facility: { value: 'First-aid medicines', citation: 'Rule 1960, Section 1963' },
      },
      '51-99 workers': {
        personnel: { value: 'Part-time nurse (4h/6d) + First-aider', citation: 'Rule 1960, Section 1963' },
        facility: { value: 'Treatment room', citation: 'Rule 1960, Section 1963' },
      },
      '100-199 workers': {
        personnel: { value: 'Part-time physician (4h/3d) + Dentist + Nurse + First-aider', citation: 'Rule 1960, Section 1963' },
        facility: { value: 'Treatment room', citation: 'Rule 1960, Section 1963' },
      },
      '200-600 workers': {
        personnel: { value: 'Part-time physician (4h/6d) + Dentist + Nurse + First-aider', citation: 'Rule 1960, Section 1963' },
        facility: { value: 'Medical clinic', citation: 'Rule 1960, Section 1963' },
      },
      '601-2000 workers': {
        personnel: { value: 'Full-time physician + Full-time dentist + Nurse per shift', citation: 'Rule 1960, Section 1963' },
        facility: { value: 'Medical and dental clinic', citation: 'Rule 1960, Section 1963' },
      },
      'Over 2000 workers': {
        personnel: 'Full-time physician + Part-time physician (other shifts) + Full-time dentist + Staff per shift',
        facility: { value: 'Hospital (1 bed per 100 workers)', citation: 'Rule 1960, Section 1963' },
      },
    },

    nonHazardousWorkplaces: {
      '1-99 workers': { personnel: 'Full-time first-aider', facility: 'Treatment room for 51-99' },
      '100-199 workers': { personnel: 'Part-time nurse (4h/6d) + First-aider', facility: 'Treatment room' },
      '200-600 workers': { personnel: 'Part-time physician (4h/3d) + Part-time dentist + Nurse + First-aider', facility: 'Treatment room' },
      '601-2000 workers': { personnel: 'Part-time physician (4h/6d) + Part-time dentist + Nurse + First-aider', facility: 'Clinic' },
      'Over 2000 workers': { personnel: 'Full-time physician + Part-time (other shifts) + Dentist + Nurse per shift', facility: 'Medical and dental clinic' },
    },

    qualifications: {
      firstAider: { value: 'Able to read/write + Red Cross first aid course', citation: 'Rule 1960, Section 1964' },
      nurse: { value: 'Licensed nurse + 50 hours basic occupational nursing training', citation: 'Rule 1960, Section 1964; DO 53' },
      physician: { value: 'Licensed physician + basic occupational medicine training', citation: 'Rule 1960, Section 1964' },
      dentist: 'Licensed dentist + basic occupational dentistry training',
    },

    trainingDeadline: { value: '6 months from employment', citation: 'Rule 1960, Section 1964' },
    refresherTraining: { value: '8 hours minimum, at least once a year', citation: 'Rule 1960, Section 1964' },

    physicalExamClasses: {
      classA: { value: 'Fit for any work', citation: 'Rule 1960, Section 1966' },
      classB: { value: 'Correctable defects, fit to work', citation: 'Rule 1960, Section 1966' },
      classC: { value: 'Special placement required', citation: 'Rule 1960, Section 1966' },
      classD: { value: 'Unfit for employment', citation: 'Rule 1960, Section 1966' },
    },

    annualReport: { deadline: 'March 31', form: 'DOLE/BWC/HSD/OH-47' },
  },

  // ===========================================
  // RA 11058 - OSH LAW & PENALTIES (20 Q&A Points)
  // ===========================================
  ra11058: {
    title: 'Occupational Safety and Health Standards Act',
    citation: 'RA 11058',

    effectiveDate: { value: 'February 2019', citation: 'RA 11058, Section 1' },

    coverage: { value: 'ALL establishments and workers', citation: 'RA 11058, Section 3' },

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

    workerRights: {
      knowHazards: 'Know workplace hazards',
      refuseUnsafeWork: { value: 'Refuse unsafe work without threat of dismissal', citation: 'RA 11058, Section 5' },
      reportAccidents: 'Report accidents to employer and DOLE',
      receivePPE: 'Receive PPE at no cost',
      accessRecords: 'Access personal exposure and medical records',
    },

    workerDuties: [
      'Use safeguards and safety devices properly',
      'Comply with instructions to prevent accidents',
      'Report unsafe conditions',
      'Use PPE provided',
      'Undergo OSH training',
    ],

    ppeRequirement: { value: 'Employer provides FREE', citation: 'RA 11058, Section 6' },

    penalties: {
      firstOffense: {
        micro: { value: 'PHP 50,000', citation: 'RA 11058, Section 28' },
        small: { value: 'PHP 100,000', citation: 'RA 11058, Section 28' },
        medium: { value: 'PHP 200,000', citation: 'RA 11058, Section 28' },
        large: { value: 'PHP 300,000', citation: 'RA 11058, Section 28' },
      },
      secondOffense: {
        micro: { value: 'PHP 100,000', citation: 'RA 11058, Section 28' },
        small: { value: 'PHP 200,000', citation: 'RA 11058, Section 28' },
        medium: { value: 'PHP 400,000', citation: 'RA 11058, Section 28' },
        large: { value: 'PHP 600,000', citation: 'RA 11058, Section 28' },
      },
      thirdOffense: {
        micro: { value: 'PHP 200,000', citation: 'RA 11058, Section 28' },
        small: { value: 'PHP 400,000', citation: 'RA 11058, Section 28' },
        medium: { value: 'PHP 800,000', citation: 'RA 11058, Section 28' },
        large: { value: 'PHP 1,000,000', citation: 'RA 11058, Section 28' },
      },
      willfulViolation: { value: '6 months to 6 years imprisonment + fine', citation: 'RA 11058, Section 29' },
      deathOrInjury: { value: 'PHP 1,000,000 to PHP 5,000,000', citation: 'RA 11058, Section 29' },
    },

    jointLiability: { value: 'Principal employer, contractor, subcontractor', citation: 'RA 11058, Section 27' },

    workStoppage: { value: 'DOLE may issue for imminent danger', citation: 'RA 11058, Section 15' },
  },
};

export default OSH_KNOWLEDGE;
