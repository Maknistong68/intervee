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
      frequency: { value: 'At least annually for hazardous workplaces', citation: 'Rule 1070, Section 1077' },
      parameters: {
        value: ['Temperature', 'Humidity', 'Pressure', 'Illumination', 'Ventilation', 'Contaminants', 'Noise'],
        citation: 'Rule 1070, Section 1077',
      },
      purpose: { value: 'To ensure compliance with TLVs and environmental standards', citation: 'Rule 1070, Section 1077' },
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

    atmosphericRequirements: {
      oxygenMinimum: { value: '19.5%', citation: 'Rule 1120, Section 1121; OSHA 1910.146' },
      oxygenMaximum: { value: '23.5%', citation: 'Rule 1120, Section 1121; OSHA 1910.146' },
      oxygenDeficient: { value: 'Below 19.5% - requires supplied air respirator', citation: 'Rule 1120, Section 1121' },
      oxygenEnriched: { value: 'Above 23.5% - fire/explosion hazard', citation: 'Rule 1120, Section 1121' },
      flammableGasLimit: { value: 'Less than 10% of LEL (Lower Explosive Limit)', citation: 'Rule 1120, Section 1121' },
      toxicSubstances: { value: 'Below permissible exposure limits (PEL)', citation: 'Rule 1120, Section 1121' },
    },

    beforeEntry: {
      waterLevel: { value: 'Below 15 cm (6 in)', citation: 'Rule 1120, Section 1121' },
      airTest: { value: 'Explosive gases, oxygen content, carbon monoxide', citation: 'Rule 1120, Section 1121' },
      ifAbnormal: { value: 'DO NOT ENTER until ventilation effected', citation: 'Rule 1120, Section 1121' },
      breathingApparatus: { value: 'Must be available', citation: 'Rule 1120, Section 1121' },
      preEntryChecklist: {
        value: [
          'Atmospheric testing (O2, combustibles, toxics)',
          'Ventilation if needed',
          'Entry permit signed',
          'Standby watcher assigned',
          'Rescue equipment ready',
          'Communication system established',
          'PPE donned and checked',
        ],
        citation: 'Rule 1120, Section 1121',
      },
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

    firstAiderRequirements: {
      perShift: { value: 'At least 1 first-aider per shift', citation: 'Rule 1960, Section 1963' },
      ratio: { value: '1 first-aider per 25-50 workers (recommended)', citation: 'Rule 1960, Section 1963' },
      hazardousWorkplace: {
        '1-50 workers': { value: '1 full-time first-aider', citation: 'Rule 1960, Section 1963' },
        '51-99 workers': { value: '1 first-aider + part-time nurse', citation: 'Rule 1960, Section 1963' },
        '100+ workers': { value: '1 first-aider per shift + nurse', citation: 'Rule 1960, Section 1963' },
      },
      nonHazardousWorkplace: {
        '1-99 workers': { value: '1 full-time first-aider', citation: 'Rule 1960, Section 1963' },
        '100-199 workers': { value: '1 first-aider + part-time nurse', citation: 'Rule 1960, Section 1963' },
        '200+ workers': { value: '1 first-aider per shift + nurse', citation: 'Rule 1960, Section 1963' },
      },
    },

    physicalExamClasses: {
      classA: { value: 'Fit for any work', citation: 'Rule 1960, Section 1966' },
      classB: { value: 'Correctable defects, fit to work', citation: 'Rule 1960, Section 1966' },
      classC: { value: 'Special placement required', citation: 'Rule 1960, Section 1966' },
      classD: { value: 'Unfit for employment', citation: 'Rule 1960, Section 1966' },
    },

    annualReport: { deadline: 'March 31', form: 'DOLE/BWC/HSD/OH-47' },
  },

  // ===========================================
  // RA 11058 - OSH LAW & PENALTIES (COMPREHENSIVE)
  // Republic Act No. 11058 - An Act Strengthening Compliance with
  // Occupational Safety and Health Standards and Providing Penalties for Violations Thereof
  // Approved: August 17, 2018 | Effective: 15 days after publication
  // ===========================================
  ra11058: {
    title: 'Occupational Safety and Health Standards Act',
    fullTitle: 'An Act Strengthening Compliance with Occupational Safety and Health Standards and Providing Penalties for Violations Thereof',
    citation: 'RA 11058',
    approvedDate: { value: 'August 17, 2018', citation: 'RA 11058' },
    effectiveDate: { value: '15 days after publication in Official Gazette or 2 newspapers of general circulation', citation: 'RA 11058, Section 35' },

    // CHAPTER I - DECLARATION OF POLICY
    declarationOfPolicy: {
      citation: 'RA 11058, Section 1',
      principles: [
        { value: 'Labor is a primary social and economic force', citation: 'RA 11058, Section 1' },
        { value: 'Safe and healthy workforce is integral to nation building', citation: 'RA 11058, Section 1' },
        { value: 'State shall ensure safe and healthful workplace for all working people', citation: 'RA 11058, Section 1' },
        { value: 'Full protection against all hazards in work environment', citation: 'RA 11058, Section 1' },
        { value: 'Protection against injury, sickness or death through safe working conditions', citation: 'RA 11058, Section 1' },
        { value: 'Promote strict but dynamic, inclusive, and gender-sensitive measures', citation: 'RA 11058, Section 1' },
      ],
    },

    // CHAPTER II - GENERAL PROVISIONS
    coverage: {
      included: {
        value: 'All establishments, projects, sites including PEZA establishments, and all other places where work is being undertaken in all branches of economic activity',
        citation: 'RA 11058, Section 2',
      },
      excluded: { value: 'Public sector', citation: 'RA 11058, Section 2' },
      determinedBy: { value: 'Secretary of Labor and Employment based on number of employees, nature of operations, and risk/hazard involved', citation: 'RA 11058, Section 2' },
    },

    // SECTION 3 - DEFINITION OF TERMS
    definitions: {
      certifiedFirstAider: {
        value: 'Any person trained and duly certified to administer first aid by the Philippine Red Cross or any organization authorized by the Secretary of Labor and Employment',
        citation: 'RA 11058, Section 3(a)',
      },
      competencyStandards: {
        value: 'Industry-determined specification of proficiency required for effective work performance, expressed as outcomes with focus on workplace activity rather than training or personal attributes',
        citation: 'RA 11058, Section 3(b)',
      },
      coveredWorkplaces: {
        value: 'Establishments, projects, sites and all other places where work is being undertaken wherein the number of employees, nature of operations, and risk or hazard involved require compliance with provisions of this Act',
        citation: 'RA 11058, Section 3(c)',
      },
      employer: {
        value: 'Any person, natural or juridical, including the principal employer, contractor or subcontractor, if any, who directly or indirectly benefits from the services of the employee',
        citation: 'RA 11058, Section 3(d)',
      },
      equipment: {
        value: 'Any machine with engine or electric motor as prime mover',
        citation: 'RA 11058, Section 3(e)',
      },
      generalSafetyAndHealthInspection: {
        value: 'Examination of the work environment including location and operation of machinery, adequacy of work space, ventilation, lighting, conditions of work environment, handling, storage of work procedures, protection facilities and other possible sources of safety and health hazards',
        citation: 'RA 11058, Section 3(f)',
      },
      imminentDanger: {
        value: 'A situation caused by a condition or practice in any place of employment that could reasonably be expected to lead to death or serious physical harm',
        citation: 'RA 11058, Section 3(g)',
      },
      microEnterprise: {
        value: 'Establishments employing less than 10 employees',
        citation: 'RA 11058, Section 3(h)',
      },
      smallEnterprise: {
        value: 'Establishments employing less than 100 employees',
        citation: 'RA 11058, Section 3(h)',
      },
      occupationalHealthPersonnel: {
        value: 'Qualified first aider, nurse, dentist or physician engaged by the employer to provide occupational health services in the establishment, project, site or workplace',
        citation: 'RA 11058, Section 3(i)',
      },
      oshStandards: {
        value: 'Standards issued by the Secretary of Labor and Employment pursuant to Articles 168 and 171, Chapter 2, Title I of Book Four of PD 442 (Labor Code of the Philippines)',
        citation: 'RA 11058, Section 3(j)',
      },
      safetyAndHealthAudit: {
        value: 'Regular and critical examination of project sites, safety programs, records, and management performance on program standards on safety and health',
        citation: 'RA 11058, Section 3(k)',
      },
      safetyAndHealthCommittee: {
        value: 'Body created within the workplace tasked with authority to monitor, inspect and investigate all aspects of the work pertaining to the safety and health of workers',
        citation: 'RA 11058, Section 3(l)',
      },
      safetyAndHealthProgram: {
        value: 'Set of detailed rules to govern the processes and practices in all economic activities to conform with OSH standards, including the personnel responsible, and penalties for any violation thereof',
        citation: 'RA 11058, Section 3(m)',
      },
      safetyOfficer: {
        value: 'Any employee or officer of the company trained by DOLE and tasked by the employer to implement an occupational safety and health program in accordance with OSH standards',
        citation: 'RA 11058, Section 3(n)',
      },
      safetySignage: {
        value: 'Any emergency, warning or danger signpost or any safety instruction using standard colors and sizes, including standard symbols for safety instructions and warnings in the workplace, prescribed by DOLE',
        citation: 'RA 11058, Section 3(o)',
      },
      workplace: {
        value: 'Any site or location where workers need to be or to go to by reason of their work, and which are under the direct or indirect control of the employer',
        citation: 'RA 11058, Section 3(p)',
      },
    },

    // CHAPTER III - DUTIES AND RIGHTS
    employerDuties: {
      citation: 'RA 11058, Section 4(a)',
      duties: [
        { value: 'Furnish workers a place of employment free from hazardous conditions causing or likely to cause death, illness or physical harm', citation: 'RA 11058, Section 4(a)(1)' },
        { value: 'Give complete job safety instructions or orientation to all workers especially those entering the job for the first time, including familiarization with work environment', citation: 'RA 11058, Section 4(a)(2)' },
        { value: 'Inform workers of hazards associated with their work, health risks involved, preventive measures to eliminate or minimize risks, and steps in cases of emergency', citation: 'RA 11058, Section 4(a)(3)' },
        { value: 'Use only approved devices and equipment for the workplace', citation: 'RA 11058, Section 4(a)(4)' },
        { value: 'Comply with OSH standards including training, medical examination, provision of protective and safety devices such as PPE and machine guards', citation: 'RA 11058, Section 4(a)(5)' },
        { value: 'Allow workers and their safety representatives to participate actively in organizing, planning, implementing and evaluating the safety and health program', citation: 'RA 11058, Section 4(a)(6)' },
        { value: 'Provide measures to deal with emergencies and accidents including first-aid arrangements', citation: 'RA 11058, Section 4(a)(7)' },
      ],
    },

    workerDuties: {
      citation: 'RA 11058, Section 4(b)',
      duties: [
        { value: 'Participate in ensuring compliance with OSH standards in the workplace', citation: 'RA 11058, Section 4(b)' },
        { value: 'Make proper use of all safeguards and safety devices furnished for protection', citation: 'RA 11058, Section 4(b)' },
        { value: 'Observe instructions to prevent accidents or imminent danger situations', citation: 'RA 11058, Section 4(b)' },
        { value: 'Observe prescribed steps in cases of emergency', citation: 'RA 11058, Section 4(b)' },
        { value: 'Report to supervisor any work hazard discovered in the workplace', citation: 'RA 11058, Section 4(b)' },
      ],
    },

    otherPersonsDuties: {
      citation: 'RA 11058, Section 4(c)',
      value: 'Any person including builder or contractor who visits, builds, renovates or installs devices or conducts business in any establishment shall comply with the provisions of this Act',
    },

    multipleUndertakings: {
      citation: 'RA 11058, Section 4(d)',
      value: 'When two or more undertakings are engaged in activities simultaneously in one workplace, all engaged shall collaborate in the application of OSH standards and regulations',
    },

    // WORKERS RIGHTS
    workerRights: {
      rightToKnow: {
        citation: 'RA 11058, Section 5',
        value: 'Right to safety and health at work shall be guaranteed. All workers shall be appropriately informed about all types of hazards in the workplace, provided access to training and education on chemical safety, electrical safety, mechanical safety, and ergonomical safety',
      },
      rightToRefuseUnsafeWork: {
        citation: 'RA 11058, Section 6',
        value: 'Worker has the right of refusal to work without threat or reprisal from employer if, as determined by DOLE, an imminent danger situation exists that may result in illness, injury or death, and corrective actions have not been undertaken by employer',
      },
      rightToReportAccidents: {
        citation: 'RA 11058, Section 7',
        value: 'Workers and their representatives shall have the right to report accidents, dangerous occurrences, and hazards to the employer, to DOLE and other concerned government agencies',
      },
      rightToPPE: {
        citation: 'RA 11058, Section 8',
        value: 'Every employer, contractor or subcontractor shall provide workers, FREE OF CHARGE, protective equipment for eyes, face, hands and feet, lifeline, safety belt or harness, gas or dust respirators or masks, protective shields whenever necessary by reason of hazardous work process or environment',
        ppeTypes: [
          'Eyes protection',
          'Face protection',
          'Hands protection',
          'Feet protection',
          'Lifeline',
          'Safety belt or harness',
          'Gas or dust respirators or masks',
          'Protective shields',
        ],
        ppeCost: { value: 'Part of the safety and health program - separate pay item pursuant to Section 20', citation: 'RA 11058, Section 8' },
        ppeApproval: { value: 'All PPE shall be of appropriate type as tested and approved by DOLE based on its standards', citation: 'RA 11058, Section 8' },
        ppeUsage: { value: 'Based on evaluation and recommendation of the safety officer', citation: 'RA 11058, Section 8' },
      },
    },

    // SAFETY SIGNAGE AND DEVICES
    safetySignage: {
      citation: 'RA 11058, Section 9',
      requirement: { value: 'All establishments, projects, sites shall have safety signage and devices to warn workers and public of hazards', citation: 'RA 11058, Section 9' },
      placement: { value: 'Posted in prominent positions and strategic locations', citation: 'RA 11058, Section 9' },
      language: { value: 'In a language understandable to all', citation: 'RA 11058, Section 9' },
      standard: { value: 'In accordance with standard set by DOLE', citation: 'RA 11058, Section 9' },
    },

    // SAFETY IN USE OF EQUIPMENT
    equipmentSafety: {
      citation: 'RA 11058, Section 10',
      value: 'Employer, contractor or subcontractor must comply with DOLE requirements in different phases of company or project operation including transport to and from the establishment',
    },

    // OSH INFORMATION
    oshInformation: {
      citation: 'RA 11058, Section 11',
      value: 'Workers shall be provided adequate and suitable information on safety and health hazards, appropriate measures including probable location of workers, for prevention, control and protection against those hazards',
    },

    // CHAPTER IV - COVERED WORKPLACES
    oshProgram: {
      citation: 'RA 11058, Section 12',
      requiredComponents: [
        { item: 'Statement of commitment to comply with OSH requirements', citation: 'RA 11058, Section 12(a)' },
        { item: 'General safety and health, including a drug-free workplace', citation: 'RA 11058, Section 12(b)' },
        { item: 'HIV/AIDS/tuberculosis/hepatitis prevention control', citation: 'RA 11058, Section 12(c)' },
        { item: 'Company or project details', citation: 'RA 11058, Section 12(d)' },
        { item: 'Composition and duties of the safety and health committee', citation: 'RA 11058, Section 12(e)' },
        { item: 'Occupational Safety and health personnel and facilities', citation: 'RA 11058, Section 12(f)' },
        { item: 'Safety and health promotion, training and education', citation: 'RA 11058, Section 12(g)' },
        { item: 'Conduct of toolbox meetings', citation: 'RA 11058, Section 12(h)' },
        { item: 'Accident/incident/illness investigation, recording and reporting', citation: 'RA 11058, Section 12(i)' },
        { item: 'Provision and use of PPE', citation: 'RA 11058, Section 12(j)' },
        { item: 'Provision of safety signage', citation: 'RA 11058, Section 12(k)' },
        { item: 'Dust control and management, regulations on building temporary structures, lifting and operation of electrical, mechanical, communications systems and other equipment', citation: 'RA 11058, Section 12(l)' },
        { item: 'Provision of workers welfare facilities', citation: 'RA 11058, Section 12(m)' },
        { item: 'Emergency preparedness and response plan', citation: 'RA 11058, Section 12(n)' },
        { item: 'Waste management system', citation: 'RA 11058, Section 12(o)' },
        { item: 'Prohibited acts and penalties for violations', citation: 'RA 11058, Section 12(p)' },
      ],
      preparation: { value: 'Prepared and executed by employer, contractor or subcontractor in consultation with workers and their representatives', citation: 'RA 11058, Section 12' },
      submission: { value: 'Submitted to DOLE which shall approve, disapprove or modify according to existing laws, rules and regulations', citation: 'RA 11058, Section 12' },
      communication: { value: 'Approved safety and health program shall be communicated and made readily available to all persons in the workplace', citation: 'RA 11058, Section 12' },
    },

    // OSH COMMITTEE
    oshCommittee: {
      citation: 'RA 11058, Section 13',
      purpose: { value: 'To ensure safety and health program is observed and enforced', citation: 'RA 11058, Section 13' },
      composition: [
        { member: 'Employer or representative', role: 'Chairperson ex officio', citation: 'RA 11058, Section 13(a)' },
        { member: 'Safety officer of the company or project', role: 'Secretary', citation: 'RA 11058, Section 13(b)' },
        { member: 'Safety officer representing the contractor or subcontractor', role: 'Members', citation: 'RA 11058, Section 13(c)' },
        { member: 'Physicians, nurses, certified first-aiders, and dentists', role: 'Members, ex officio (if applicable)', citation: 'RA 11058, Section 13(d)' },
        { member: 'Workers representatives from union (if organized) or elected by workers through simple majority vote (if unorganized)', role: 'Members', citation: 'RA 11058, Section 13(e)' },
      ],
      functions: { value: 'Effectively plan, develop, oversee and monitor the implementation of the safety and health program', citation: 'RA 11058, Section 13' },
    },

    // SAFETY OFFICER
    safetyOfficerRequirements: {
      citation: 'RA 11058, Section 14',
      duties: [
        { value: 'Oversee the overall management of the safety and health program', citation: 'RA 11058, Section 14(a)' },
        { value: 'Frequently monitor and inspect any health or safety aspect of the operation being undertaken', citation: 'RA 11058, Section 14(b)' },
        { value: 'Assist government inspectors in the conduct of safety and health inspection at any time whenever work is being performed or during accident investigation', citation: 'RA 11058, Section 14(c)' },
        { value: 'Issue work stoppage orders when necessary', citation: 'RA 11058, Section 14(d)' },
      ],
      number: { value: 'Proportionate to total number of workers and equipment, size of work area, and other criteria prescribed by DOLE', citation: 'RA 11058, Section 14' },
      contractor: { value: 'Must deploy safety officer at each specific area of operations to oversee management of safety and health programs of its own workforce', citation: 'RA 11058, Section 14' },
    },

    // OCCUPATIONAL HEALTH PERSONNEL AND FACILITIES
    healthPersonnelAndFacilities: {
      citation: 'RA 11058, Section 15',
      personnel: { value: 'Qualified physicians, nurses, certified first-aiders, and dentists', citation: 'RA 11058, Section 15' },
      facilities: { value: 'Required medical supplies, equipment and facilities', citation: 'RA 11058, Section 15' },
      proportion: { value: 'Number of health personnel, equipment, facilities, and amount of supplies shall be proportionate to total number of workers and risk of hazard involved, ratio prescribed by DOLE', citation: 'RA 11058, Section 15' },
    },

    // SAFETY AND HEALTH TRAINING
    safetyTraining: {
      citation: 'RA 11058, Section 16',
      safetyPersonnel: {
        value: 'All safety and health personnel shall undergo mandatory training on basic occupational safety and health for safety officers as prescribed by DOLE',
        citation: 'RA 11058, Section 16(a)',
      },
      allWorkers: {
        value: 'All workers shall undergo mandatory 8-hour safety and health seminar as required by DOLE, including a portion on joint employer-employee orientation',
        hours: 8,
        citation: 'RA 11058, Section 16(b)',
      },
      specializedTraining: {
        value: 'All personnel engaged in operation, erection and dismantling of equipment and scaffolds, structural erections, excavations, blasting operations, demolition, confined spaces, hazardous chemicals, welding, and flame cutting shall undergo specialized instruction and training',
        activities: [
          'Operation, erection and dismantling of equipment and scaffolds',
          'Structural erections',
          'Excavations',
          'Blasting operations',
          'Demolition',
          'Confined spaces',
          'Hazardous chemicals',
          'Welding',
          'Flame cutting',
        ],
        citation: 'RA 11058, Section 16(c)',
      },
    },

    // OSH REPORTS
    oshReports: {
      citation: 'RA 11058, Section 17',
      value: 'All employers, contractors or subcontractors shall submit all safety health reports and notifications prescribed by DOLE',
    },

    // WORKERS COMPETENCY CERTIFICATION
    competencyCertification: {
      citation: 'RA 11058, Section 18',
      purpose: { value: 'To professionalize, upgrade and update the level of competence of workers', citation: 'RA 11058, Section 18' },
      certifyingBody: { value: 'TESDA or PRC', citation: 'RA 11058, Section 18' },
      criticalOccupations: {
        definition: 'Occupation is critical when:',
        criteria: [
          { value: 'Performance of job affects peoples lives and safety', citation: 'RA 11058, Section 18(a)' },
          { value: 'Job involves handling of tools, equipment and supplies', citation: 'RA 11058, Section 18(b)' },
          { value: 'Job requires relatively long period of education and training', citation: 'RA 11058, Section 18(c)' },
          { value: 'Performance may compromise safety, health and environmental concerns within immediate vicinity of establishment', citation: 'RA 11058, Section 18(d)' },
        ],
      },
      requirement: { value: 'All critical occupations shall undergo mandatory competence assessment and certification by TESDA', citation: 'RA 11058, Section 18' },
    },

    // WORKERS WELFARE FACILITIES
    welfareFacilities: {
      citation: 'RA 11058, Section 19',
      purpose: { value: 'To ensure humane working conditions', citation: 'RA 11058, Section 19' },
      required: [
        { value: 'Adequate supply of safe drinking water', citation: 'RA 11058, Section 19(a)' },
        { value: 'Adequate sanitary and washing facilities', citation: 'RA 11058, Section 19(b)' },
        { value: 'Suitable living accommodation for workers (as applicable)', citation: 'RA 11058, Section 19(c)' },
        { value: 'Separate sanitary, washing and sleeping facilities for men and women workers (as applicable)', citation: 'RA 11058, Section 19(d)' },
      ],
    },

    // COST OF SAFETY AND HEALTH PROGRAM
    programCost: {
      citation: 'RA 11058, Section 20',
      value: 'Total cost of implementing a duly approved safety and health program shall be an integral part of the operations cost',
      construction: { value: 'Shall be a separate pay item in construction and in all contracting or subcontracting arrangements', citation: 'RA 11058, Section 20' },
    },

    // CHAPTER V - JOINT AND SOLIDARITY LIABILITY
    jointLiability: {
      citation: 'RA 11058, Section 21',
      liable: { value: 'Employer, project owner, general contractor, contractor or subcontractor, and any person who manages, controls or supervises the work being undertaken', citation: 'RA 11058, Section 21' },
      type: { value: 'Jointly and solidarily liable for compliance with this Act', citation: 'RA 11058, Section 21' },
    },

    // CHAPTER VI - ENFORCEMENT
    enforcement: {
      visitorialPower: {
        citation: 'RA 11058, Section 22',
        authority: { value: 'Secretary of Labor and Employment or authorized representatives', citation: 'RA 11058, Section 22' },
        powers: [
          { value: 'Enforce mandatory OSH standards in all establishments', citation: 'RA 11058, Section 22' },
          { value: 'Conduct annual spot audit on compliance with OSH standards together with labor and employer sector representatives', citation: 'RA 11058, Section 22' },
          { value: 'Enter workplaces at anytime of day or night where work is being performed', citation: 'RA 11058, Section 22' },
          { value: 'Examine records and investigate facts, conditions or matters necessary to determine compliance', citation: 'RA 11058, Section 22' },
        ],
        obstruction: { value: 'No person or entity shall obstruct, impede, delay or otherwise render ineffective the orders of the Secretary', citation: 'RA 11058, Section 22' },
        injunctions: { value: 'No lower court or entity shall issue temporary or permanent injunction or restraining order over enforcement orders', citation: 'RA 11058, Section 22' },
        workStoppage: { value: 'Secretary may order stoppage of work or suspension of operations when noncompliance poses grave and imminent danger to health and safety of workers', citation: 'RA 11058, Section 22' },
        inspectionScope: { value: 'Shall inspect establishments and workplaces regardless of size and nature of operation', citation: 'RA 11058, Section 22' },
        selfAssessment: { value: 'Any kind of self-assessment shall not take the place of labor inspection conducted by DOLE', citation: 'RA 11058, Section 22' },
        charteredCities: { value: 'May be allowed to conduct industrial safety inspections within their jurisdiction in coordination with DOLE, provided they have adequate facilities and competent personnel', citation: 'RA 11058, Section 22' },
      },
    },

    // PAYMENT DURING WORK STOPPAGE
    paymentDuringStoppage: {
      citation: 'RA 11058, Section 23',
      condition: { value: 'If stoppage of work due to imminent danger occurs as result of employers violation or fault', citation: 'RA 11058, Section 23' },
      requirement: { value: 'Employer shall pay workers their wages during period of stoppage of work or suspension of operation', citation: 'RA 11058, Section 23' },
    },

    // DELEGATION OF AUTHORITY
    delegationOfAuthority: {
      citation: 'RA 11058, Section 24',
      value: 'Authority to enforce mandatory OSH standards may be delegated by the Secretary of Labor and Employment to a competent government authority',
    },

    // STANDARDS SETTING POWER
    standardsSettingPower: {
      citation: 'RA 11058, Section 25',
      authority: { value: 'Secretary of Labor and Employment in consultation with concerned government agencies and relevant stakeholders', citation: 'RA 11058, Section 25' },
      considerations: { value: 'Number of employees, nature of business operations, and risk or hazard involved', citation: 'RA 11058, Section 25' },
      programs: { value: 'Shall institute new and update existing programs especially in hazardous industries such as mining, fishing, construction, and maritime industry', citation: 'RA 11058, Section 25' },
    },

    // EMPLOYEES COMPENSATION CLAIM
    compensationClaim: {
      citation: 'RA 11058, Section 26',
      value: 'Worker may file claims for compensation benefit arising out of work-related disability or death',
      processing: { value: 'Claims shall be processed independently of the finding of fault, gross negligence or bad faith of the employer', citation: 'RA 11058, Section 26' },
    },

    // INCENTIVES TO EMPLOYERS
    incentives: {
      citation: 'RA 11058, Section 27',
      value: 'Established package of incentives to qualified employers to recognize their efforts toward ensuring compliance with OSH and general labor standards',
      types: [
        'OSH training packages',
        'Additional protective equipment',
        'Technical guidance',
        'Recognition awards',
        'Other similar incentives',
      ],
    },

    // SECTION 28 - PROHIBITED ACTS AND PENALTIES
    prohibitedActs: {
      citation: 'RA 11058, Section 28',
      willfulFailure: {
        penalty: { value: 'Administrative fine not exceeding PHP 100,000.00 per day until violation is corrected', citation: 'RA 11058, Section 28(a)' },
        countingStart: { value: 'From date employer is notified of violation or date compliance order is duly served', citation: 'RA 11058, Section 28(a)' },
        factors: { value: 'Amount depends on frequency or gravity of violation committed or damage caused', citation: 'RA 11058, Section 28(a)' },
        maximumCondition: { value: 'Maximum amount imposed only when violation exposes workers to risk of death, serious injury or serious illness', citation: 'RA 11058, Section 28(a)' },
      },
      aggravatingActs: {
        penalty: { value: 'Maximum PHP 100,000.00 administrative fine separate from daily fine', citation: 'RA 11058, Section 28(b)' },
        acts: [
          { value: 'Repeated obstruction, delay or refusal to provide Secretary of Labor and Employment or authorized representatives access to covered workplace or refusal to provide or allow access to relevant records and documents or obstruct conduct of investigation', citation: 'RA 11058, Section 28(b)(1)' },
          { value: 'Misrepresentation in relation to adherence to OSH standards, knowing such statement, report or record submitted to DOLE to be false in any material aspect', citation: 'RA 11058, Section 28(b)(2)' },
          { value: 'Making retaliatory measures such as termination of employment, refusal to pay, reducing wages and benefits or in any manner discriminates against any worker who has given information relative to the inspection being conducted', citation: 'RA 11058, Section 28(b)(3)' },
        ],
      },
      fineUse: { value: 'Fine collected shall be used for operation of OSH initiatives, including OSH training and education and other OSH programs', citation: 'RA 11058, Section 28' },
    },

    penalties: {
      dailyFine: {
        maximum: { value: 'PHP 100,000.00 per day until violation is corrected', citation: 'RA 11058, Section 28(a)' },
        maximumCondition: { value: 'Imposed only when violation exposes workers to risk of death, serious injury or serious illness', citation: 'RA 11058, Section 28(a)' },
      },
      aggravatingFine: {
        maximum: { value: 'PHP 100,000.00 (separate from daily fine)', citation: 'RA 11058, Section 28(b)' },
      },
      additionalLiability: { value: 'Without prejudice to filing of criminal or civil case in regular courts', citation: 'RA 11058, Section 28' },
    },

    // CHAPTER VII - MISCELLANEOUS PROVISIONS
    laborInspectionSystem: {
      citation: 'RA 11058, Section 29',
      value: 'Secretary of Labor and Employment shall maintain an updated labor inspection system of computerized gathering and generation of real time data on compliances, monitoring of enforcement, and a system of notification on workplace accidents and injuries',
    },

    // MSE APPLICABILITY
    mseApplicability: {
      citation: 'RA 11058, Section 30',
      value: 'DOLE shall develop OSH core compliance standards specific to MSEs to ensure safe and healthy workplaces',
      requirements: [
        'Housekeeping',
        'Materials handling and storage',
        'Electrical and mechanical safety',
        'PPE',
        'Regular hazard monitoring',
      ],
    },

    // INTER-GOVERNMENTAL COORDINATION
    interGovernmentalCoordination: {
      citation: 'RA 11058, Section 31',
      deadline: { value: '60 days from issuance of IRR', citation: 'RA 11058, Section 31' },
      agencies: [
        'DOLE',
        'DENR',
        'DOE',
        'DOTr',
        'DA',
        'DPWH',
        'DTI',
        'DILG',
        'DOH',
        'DICT',
        'PEZA',
        'Local Government Units',
      ],
      purpose: { value: 'Regularly convene to monitor effective implementation and related programs to prevent and eliminate incidence of injury, sickness or death in all workplaces', citation: 'RA 11058, Section 31' },
    },

    // IRR
    implementingRulesAndRegulations: {
      citation: 'RA 11058, Section 32',
      deadline: { value: '90 days after effectivity of this Act', citation: 'RA 11058, Section 32' },
      formulation: { value: 'By Secretary of Labor and Employment in coordination with agencies concerned', citation: 'RA 11058, Section 32' },
    },

    // SEPARABILITY CLAUSE
    separabilityClause: {
      citation: 'RA 11058, Section 33',
      value: 'If any part, section or provision of this Act shall be held invalid or unconstitutional, the other provisions not affected shall remain in full force and effect',
    },

    // REPEALING CLAUSE
    repealingClause: {
      citation: 'RA 11058, Section 34',
      value: 'All laws, acts, decrees, executive orders, rules and regulations or other issuances inconsistent with this Act are hereby modified or repealed',
    },

    // EFFECTIVITY
    effectivity: {
      citation: 'RA 11058, Section 35',
      value: '15 days after publication in the Official Gazette or at least two (2) newspapers of general circulation',
    },

    // SIGNATORIES
    signatories: {
      senatePresident: 'Vicente C. Sotto III',
      houseOfRepresentativesSpeaker: 'Pantaleon D. Alvarez',
      approvedBy: 'Rodrigo Roa Duterte',
      dateApproved: 'August 17, 2018',
    },
  },

  // ===========================================
  // DO 252, s. 2025 - REVISED IRR OF RA 11058
  // ===========================================
  do252: {
    title: 'Revised Implementing Rules and Regulations of RA 11058',
    citation: 'DO 252, s. 2025',
    effectiveDate: { value: 'May 16, 2025', citation: 'DO 252, s. 2025' },
    supersedes: { value: 'DO 198-18, s. 2018', citation: 'DO 252, s. 2025' },

    coverage: {
      value: [
        'All private sector workplaces',
        'GOCCs without original charter',
        'Economic zone enterprises',
        'Contracting and subcontracting activities',
        'Residences converted into workplaces',
        'Co-working spaces',
        'Non-traditional workplace arrangements',
      ],
      citation: 'DO 252, s. 2025, Section 2',
    },

    workersRightToKnow: {
      citation: 'DO 252, s. 2025, Section 5',
      trainingTopics: [
        'Chemical safety',
        'Orientation on safety data sheets',
        'Chemical emergency preparedness and response',
        'Electrical safety',
        'Mechanical safety',
        'Construction heavy equipment',
        'Ergonomics',
        'Other applicable hazards and risks',
      ],
    },

    rightToRefuseUnsafeWork: {
      citation: 'DO 252, s. 2025, Section 6',
      safetyOfficerAuthority: { value: 'May implement work stoppage or suspend operations in case of imminent danger', citation: 'DO 252, s. 2025, Section 6' },
      workerProtection: { value: 'Cannot be required to return to work until WSO is lifted and corrective measures implemented', citation: 'DO 252, s. 2025, Section 6' },
    },

    rightToReportAccidents: {
      citation: 'DO 252, s. 2025, Section 7',
      reportingChannels: [
        { channel: 'DOLE Hotline', value: '1349', citation: 'DO 252, s. 2025, Section 7' },
        { channel: 'DOLE Regional/Provincial/Field/Satellite Office', citation: 'DO 252, s. 2025, Section 7' },
      ],
      protection: { value: 'Free from any form of retaliation for reporting', citation: 'DO 252, s. 2025, Section 7' },
    },

    oshInformation: {
      citation: 'DO 252, s. 2025, Section 11',
      required: [
        'Workplace hazards and risks',
        'Control mechanisms and preventive strategies',
        'Appropriate measures for prevention, control and protection',
        'OSH emergency and disaster management protocols including evacuation and shutdown procedures',
      ],
    },

    universalHealthCare: {
      citation: 'DO 252, s. 2025, Section 13',
      employerDuties: [
        'Register workers with National Health Insurance Program',
        'Remit contributions to PhilHealth',
        'Register with DOH-licensed and PhilHealth-accredited primary care facility',
      ],
      referralServices: [
        'Consultation and screening',
        'Testing (HIV/AIDS, TB, hepatitis, drugs, poison, rabies)',
        'Diagnosis and medication',
        'Treatment and psychosocial support for mental health services',
      ],
    },

    safetyOfficerRequirements: {
      citation: 'DO 252, s. 2025, Section 14',
      presence: { value: 'Safety officer shall be present in the workplace on all workdays', citation: 'DO 252, s. 2025, Section 14' },
      specializedTraining: { value: 'Required for high-risk industries and emerging hazards', citation: 'DO 252, s. 2025, Section 14' },
    },

    welfareFacilities: {
      citation: 'DO 252, s. 2025, Section 16',
      required: [
        { item: 'Adequate supply of safe drinking water', citation: 'DO 252, s. 2025, Section 16' },
        { item: 'Adequate sanitary and washing facilities', citation: 'DO 252, s. 2025, Section 16' },
        { item: 'Suitable living accommodations (construction, shipping, fishing, night shifts)', citation: 'DO 252, s. 2025, Section 16' },
        { item: 'Separate facilities for all genders', citation: 'DO 252, s. 2025, Section 16' },
        { item: 'Lactation station', citation: 'DO 252, s. 2025, Section 16' },
        { item: 'Facilities for differently-abled workers (ramps, railings)', citation: 'DO 252, s. 2025, Section 16' },
      ],
      cost: { value: 'FREE to workers', citation: 'DO 252, s. 2025, Section 16' },
    },

    penalties: {
      citation: 'DO 252, s. 2025, Section 42',
      willfulViolation: {
        definition: { value: 'Unreasonable failure to address safety violations after receiving official inspection reports, attending mandatory conferences, or being otherwise notified', citation: 'DO 252, s. 2025, Section 42' },
        dailyFine: { value: 'PHP 100,000.00 for willful non-compliance', citation: 'DO 252, s. 2025, Section 42' },
        progressive: { value: 'Higher penalties for repeated violations (1st, 2nd, 3rd offenses)', citation: 'DO 252, s. 2025, Section 42' },
      },
      complianceDocuments: { value: 'Must be submitted within 10 days after close of proceedings', citation: 'DO 252, s. 2025, Section 42' },
    },

    reportingRequirements: {
      annualMedicalReport: { due: 'March 31 following the reporting year', citation: 'DO 252, s. 2025' },
      annualWAIR: { due: 'January 30 (regardless of incident occurrence)', citation: 'DO 252, s. 2025' },
      monthlyWAIR: { due: '30th of every month (regardless of incident occurrence)', citation: 'DO 252, s. 2025' },
      submission: { value: 'Through DOLE Online Compliance Portal or DOLE Regional Office', citation: 'DO 252, s. 2025' },
    },
  },

  // ===========================================
  // LA 07, s. 2022 - WORK ACCIDENT ILLNESS REPORT
  // ===========================================
  la07: {
    title: 'Work Accident/Illness Report (WAIR)',
    citation: 'LA 07, s. 2022',
    effectiveDate: { value: 'March 16, 2022', citation: 'LA 07, s. 2022' },

    keyProvisions: {
      covidFormRemoval: { value: 'Submission of WAIR COVID FORM online is no longer mandatory', citation: 'LA 07, s. 2022' },
      wairSubmission: {
        deadline: { value: '30th of the month', citation: 'LA 07, s. 2022' },
        requirement: { value: 'With or without accidents or reportable illnesses, including COVID cases', citation: 'LA 07, s. 2022' },
        system: { value: 'DOLE Establishment Report System', citation: 'LA 07, s. 2022' },
        legalBasis: { value: 'Rule 1050 of OSHS', citation: 'LA 07, s. 2022' },
      },
      additionalUse: { value: 'WAIR Form may be used as supporting document for filing claims', citation: 'LA 07, s. 2022' },
    },

    wairFormSections: {
      section1: {
        name: 'Employer Information',
        fields: ['Establishment name', 'Address', 'Nature of Business', 'Name of Employer', 'Nationality', 'Number of Employees (Male/Female/Total)'],
      },
      section2: {
        name: 'Injured Person Information',
        fields: ['Name', 'Age', 'Sex', 'Civil Status', 'Address', 'Average Weekly Wage', 'Number of Dependents', 'Length of service prior to accident'],
      },
      section3: {
        name: 'Occupational History',
        fields: ['Occupation', 'Experience at Occupation', 'Time of Shift', 'Hours of work'],
      },
      section4: {
        name: 'Illness Record',
        fields: ['Reportable Illness', 'Number Affected by Sex', 'Number Affected by Age (<18, 18-26, 27-65, >65)', 'Affected Work Location', 'Control Instituted (Engineering/Administrative/PPE with Cost)'],
      },
      section5: {
        name: 'Accident Record',
        fields: ['Date of accident', 'Time', 'Personal injury/Property Damage', 'Description of accident', 'Regular job at time of accident'],
      },
      section6: {
        name: 'Nature and Extent of Disability',
        fields: ['Extent of Disability (Medical Treatment, Fatal, Permanent Partial, Temporary Total, Permanent Total)', 'Nature of injury (ILO Reference)', 'Parts of Body Affected', 'Date Disability Begun', 'Date Returned to Work'],
      },
      requiredSignatures: ['OH Personnel/Safety Officer', 'Employer Representative'],
    },
  },

  // ===========================================
  // DO 136, s. 2014 - GHS CHEMICAL SAFETY
  // ===========================================
  do136: {
    title: 'Guidelines for Implementation of Globally Harmonized System (GHS) in Chemical Safety Program',
    citation: 'DO 136, s. 2014',
    effectiveDate: { value: 'February 28, 2014', citation: 'DO 136, s. 2014' },

    coverage: { value: 'All workplaces engaged in manufacture, use, storage of industrial chemicals in the private sector, including their supply chain', citation: 'DO 136, s. 2014, Section 1' },

    objective: { value: 'Protect workers and properties from hazards of chemicals and prevent chemically induced accidents, illnesses, injuries and death', citation: 'DO 136, s. 2014, Section 2' },

    ghsPhysicalHazards: {
      citation: 'DO 136, s. 2014, Section 5',
      categories: [
        'Explosives', 'Flammable Gases', 'Flammable Aerosols', 'Oxidizing Gases',
        'Gases Under Pressure', 'Flammable Liquids', 'Flammable Solids', 'Self-Reactive Substances',
        'Pyrophoric Liquids', 'Pyrophoric Solids', 'Self-Heating Substances',
        'Substances Which in Contact with Water Emit Flammable Gases',
        'Oxidizing Liquids', 'Oxidizing Solids', 'Organic Peroxides', 'Corrosive to Metal',
      ],
    },

    ghsHealthHazards: {
      citation: 'DO 136, s. 2014, Section 5',
      categories: [
        'Acute Toxicity', 'Skin Corrosion', 'Skin Irritation', 'Eye Effects',
        'Sensitization', 'Germ Cell Mutagenicity', 'Carcinogenicity',
        'Reproductive Toxicity', 'Systematic Target Organ Toxicity (Single & Repeated Exposure)',
        'Aspiration Toxicity',
      ],
    },

    ghsLabelElements: {
      citation: 'DO 136, s. 2014, Section 5',
      required: [
        'Product Identifier',
        'Supplier Identifier',
        'Chemical Identity',
        'Pictograms',
        'Signal Words',
        'Hazard Statement',
        'Precautionary Statement',
      ],
    },

    safetyDataSheet: {
      citation: 'DO 136, s. 2014, Section 5',
      sections: [
        '1. Identification of substance/mixture and supplier',
        '2. Hazards identification',
        '3. Composition/information on ingredients',
        '4. First aid measures',
        '5. Firefighting measures',
        '6. Accidental release measures',
        '7. Handling and storage',
        '8. Exposure controls/personal protection',
        '9. Physical and chemical properties',
        '10. Stability and reactivity',
        '11. Toxicological information',
        '12. Ecological information',
        '13. Disposal considerations',
        '14. Transport information',
        '15. Regulatory information',
        '16. Other information including preparation and revision of SDS',
      ],
      requirement: { value: 'Must be well-communicated and made available to workers', citation: 'DO 136, s. 2014, Section 5' },
    },

    chemicalSafetyProgramElements: {
      citation: 'DO 136, s. 2014, Section 6',
      elements: [
        { name: 'Facilities', description: 'Overall facility maintained in orderly and safe manner with appropriate control measures' },
        { name: 'Engineering Controls', examples: ['Enclosed process', 'Segregation of hazardous process', 'Local exhaust ventilation', 'General ventilation'] },
        { name: 'Administrative Controls', examples: ['Reduction of exposed workers', 'Reduction of exposure period', 'Regular cleaning', 'Adequate washing facilities'] },
        { name: 'Workers Right to Know', description: 'Information on hazards, training, education on chemical safety' },
        { name: 'Storage Requirements and Inventory', requirements: ['Proper GHS labeling', 'Adequate ventilated storage', 'Chemical segregation by hazard', 'Periodic examination', 'Minimum quantities', 'Security and limited access', 'Periodic inventories'] },
        { name: 'Waste Management', description: 'Disposal per DENR DAO 92-26 Title III on Hazardous Waste Management' },
        { name: 'Information and Training', description: 'Chemical Safety Training including GHS, storage, transport, disposal, emergency measures' },
        { name: 'PPE', description: 'Per Rule 1080 of OSHS' },
        { name: 'Work Environmental Monitoring', description: 'Per Rule 1070 of OSHS' },
        { name: 'Occupational Health and Medical Surveillance', description: 'Per Rule 1960 of OSHS, including biochemical monitoring for WHO Category I and II toxic substances' },
        { name: 'Emergency Preparedness and Response', description: 'Written emergency procedure posted, adequate equipment, trained response team' },
      ],
    },

    hazardousWorkplaceClassification: { value: 'Establishments using industrial chemicals are considered hazardous and priority for inspection', citation: 'DO 136, s. 2014, Section 7; MC 02, s. 1998' },
  },

  // ===========================================
  // DO 160, s. 2016 - WEM ACCREDITATION
  // ===========================================
  do160: {
    title: 'Guidelines on Accreditation of Consulting Organizations to Provide Work Environment Measurement (WEM) Services',
    citation: 'DO 160, s. 2016',
    effectiveDate: { value: 'June 27, 2016', citation: 'DO 160, s. 2016' },

    wemDefinition: { value: 'Sampling and analysis carried out in respect of atmospheric working environment and other physical factors to measure workers exposure and compare with appropriate standards', citation: 'DO 160, s. 2016, Section 2' },

    wemParameters: {
      citation: 'DO 160, s. 2016, Section 3',
      measurements: ['Temperature', 'Humidity', 'Pressure', 'Illumination', 'Noise', 'Ventilation', 'Concentration of substances and chemicals'],
    },

    frequency: { value: 'Periodically as necessary but NOT LONGER THAN ANNUALLY', citation: 'DO 160, s. 2016, Section 4' },

    accreditation: {
      citation: 'DO 160, s. 2016, Section 5',
      requirement: { value: 'WEM providers must be ACCREDITED by OSHC', citation: 'DO 160, s. 2016, Section 5' },
      requirements: ['Application form', 'Proof of legal existence', 'List of qualified personnel', 'Equipment inventory', 'Quality management system documentation'],
    },

    internalMonitoring: { value: 'Companies may conduct internal WEM if safety and medical personnel have adequate training and experience', citation: 'DO 160, s. 2016, Section 7' },
  },

  // ===========================================
  // DO 224, s. 2021 - VENTILATION GUIDELINES
  // ===========================================
  do224: {
    title: 'Guidelines on Ventilation for Workplaces and Public Transport to Prevent and Control the Spread of COVID-19',
    citation: 'DO 224, s. 2021',

    coverage: { value: 'All workplaces in the private sector, public transport vehicles, enclosed spaces', citation: 'DO 224, s. 2021' },

    ventilationRequirements: {
      general: { value: 'Ensure adequate ventilation to reduce risk of airborne transmission', citation: 'DO 224, s. 2021' },
      assessment: { value: 'Employers shall assess ventilation systems and implement improvements', citation: 'DO 224, s. 2021' },
      naturalVentilation: { methods: ['Opening windows and doors', 'Cross-ventilation techniques', 'Adequate air circulation'], citation: 'DO 224, s. 2021' },
      mechanicalVentilation: { requirements: ['Properly maintained HVAC', 'Regularly cleaned/replaced air filters', 'Maximized outdoor air intake', 'Minimized air recirculation'], citation: 'DO 224, s. 2021' },
    },

    employerDuties: {
      citation: 'DO 224, s. 2021',
      duties: [
        'Assess current ventilation conditions',
        'Implement necessary improvements',
        'Monitor air quality regularly',
        'Train workers on ventilation protocols',
        'Include ventilation measures in OSH programs',
      ],
    },
  },

  // ===========================================
  // DO 53, s. 2003 - DRUG-FREE WORKPLACE
  // ===========================================
  do53: {
    title: 'Guidelines for Implementation of Drug-Free Workplace Policies and Programs for the Private Sector',
    citation: 'DO 53, s. 2003',
    effectiveDate: { value: 'August 14, 2003', citation: 'DO 53, s. 2003' },
    legalBasis: { value: 'RA 9165 - Comprehensive Dangerous Drugs Act of 2002', citation: 'DO 53, s. 2003' },

    coverage: { value: 'All establishments in the private sector, including contractors and concessionaires', citation: 'DO 53, s. 2003, Section A' },

    programMandatory: {
      required: { value: 'All private establishments employing 10 or more workers', citation: 'DO 53, s. 2003, Section B.1' },
      encouraged: { value: 'Establishments with less than 10 workers', citation: 'DO 53, s. 2003, Section B.1' },
      integration: { value: 'Made integral part of OSH and related workplace programs', citation: 'DO 53, s. 2003, Section B.2' },
    },

    programComponents: {
      citation: 'DO 53, s. 2003, Section C',
      components: [
        {
          name: 'Advocacy, Education and Training',
          topics: [
            'Salient Features of RA 9165 and IRR',
            'Company policies on drug-free workplace',
            'Adverse effects of dangerous drugs',
            'Preventive measures',
            'Intervention steps and available services',
          ],
          billboard: { value: 'Display "THIS IS A DRUG-FREE WORKPLACE; LETS KEEP IT THIS WAY!" or similar', citation: 'DO 53, s. 2003, Section C.1.a.ii' },
        },
        {
          name: 'Drug Testing Program',
          type: { value: 'Random drug test with equal chance of selection', citation: 'DO 53, s. 2003, Section C.1.b' },
          requirements: [
            'DOH-accredited testing centers only',
            'Screening test + Confirmatory test (if positive)',
            'Employee must be informed of results',
            'Valid for one year',
            'Cost borne by employer',
          ],
          additionalTestingTriggers: ['After workplace accidents including near miss', 'After treatment/rehabilitation', 'Clinical findings', 'Assessment team recommendation'],
        },
        {
          name: 'Treatment, Rehabilitation and Referral',
          assessmentTeam: { value: 'Determines if employee needs referral to DOH-accredited center', citation: 'DO 53, s. 2003, Section C.1.c' },
          eligibility: { value: 'First-time diagnosis, voluntary disclosure, or likely to benefit from treatment', citation: 'DO 53, s. 2003, Section C.1.c' },
        },
        {
          name: 'Monitoring and Evaluation',
          responsibility: { value: 'Health and Safety Committee or similar', citation: 'DO 53, s. 2003, Section C.1.d' },
        },
      ],
    },

    dueProcess: { value: 'All officers and employees shall enjoy the right to due process', citation: 'DO 53, s. 2003, Section D.4' },
    confidentiality: { value: 'Employer shall maintain confidentiality of all drug test information', citation: 'DO 53, s. 2003, Section D.2' },
  },

  // ===========================================
  // DO 73, s. 2005 - TB PREVENTION AND CONTROL
  // ===========================================
  do73: {
    title: 'Guidelines for Implementation of Policy and Program on Tuberculosis (TB) Prevention and Control in the Workplace',
    citation: 'DO 73, s. 2005',
    effectiveDate: { value: 'March 30, 2005', citation: 'DO 73, s. 2005' },
    legalBasis: { value: 'EO 187 - Comprehensive and Unified Policy for TB Control (CUP)', citation: 'DO 73, s. 2005' },

    coverage: { value: 'All establishments, workplaces and worksites in the private sector', citation: 'DO 73, s. 2005, Section A' },

    programMandatory: { value: 'Mandatory for all private establishments', citation: 'DO 73, s. 2005, Section B.1' },

    dots: {
      definition: { value: 'Directly Observed Treatment Short Course - comprehensive TB control strategy', citation: 'DO 73, s. 2005, Section C.1.1.2' },
      components: [
        'Political will/commitment to TB control',
        'Case detection by sputum-smear microscopy',
        'Standard short-course chemotherapy (6-8 months)',
        'Direct observation by designated treatment partner',
        'Regular uninterrupted supply of anti-TB drugs',
        'Standard recording and reporting system',
      ],
    },

    workplaceConditions: {
      citation: 'DO 73, s. 2005, Section C.1.3',
      ventilation: { requirement: 'Adequate and appropriate ventilation per OSHS Rule 1076.01', citation: 'DO 73, s. 2005, Section C.1.3.1' },
      spaceRequirement: { requirement: 'Workers shall not exceed required number for specified area per OSHS Rule 1062', citation: 'DO 73, s. 2005, Section C.1.3.2' },
    },

    nonDiscrimination: { value: 'Workers with TB shall not be discriminated against; entitled to work as long as certified medically fit', citation: 'DO 73, s. 2005, Section C.4.1' },

    workAccommodation: {
      citation: 'DO 73, s. 2005, Section C.4.2',
      measures: ['Flexible leave arrangements', 'Rescheduling of working times', 'Arrangements for return to work'],
    },

    reporting: {
      requirement: { value: 'Report all diagnosed TB cases using Annual Medical Report', citation: 'DO 73, s. 2005, Section C.3.1' },
      legalBasis: { value: 'OSHS Rule 1965.01(4) and Rule 1053.01(1)', citation: 'DO 73, s. 2005, Section C.3.1' },
    },
  },

  // ===========================================
  // DO 102, s. 2010 - HIV/AIDS PREVENTION
  // ===========================================
  do102: {
    title: 'Guidelines for Implementation of HIV and AIDS Prevention and Control in the Workplace Program',
    citation: 'DO 102, s. 2010',
    effectiveDate: { value: 'March 23, 2010', citation: 'DO 102, s. 2010' },
    legalBasis: { value: 'RA 8504 - Philippine AIDS Prevention and Control Act of 1998', citation: 'DO 102, s. 2010' },

    coverage: { value: 'All workplaces and establishments in the private sector', citation: 'DO 102, s. 2010, Section I' },

    programMandatory: { value: 'Mandatory for all private workplaces per RA 8504', citation: 'DO 102, s. 2010, Section II.A' },

    programComponents: {
      citation: 'DO 102, s. 2010, Section III',
      components: [
        {
          name: 'Advocacy, Information, Education and Training',
          topics: [
            'Magnitude of HIV/AIDS epidemic',
            'Nature, transmission and causes',
            'Prevention methods including responsible sexual behavior and condom promotion',
            'Diagnosis, care, support and treatment',
            'Impact on individual, family, community and workplace',
            'Company policy and program',
            'RA 8504 and DOLE National Workplace Policy',
          ],
        },
        {
          name: 'Non-Discriminatory Policy',
          provisions: [
            { value: 'No discrimination from pre to post-employment based on HIV status', citation: 'DO 102, s. 2010, Section III.B.1.a' },
            { value: 'No termination based on actual, perceived or suspected HIV status', citation: 'DO 102, s. 2010, Section III.B.1.b' },
          ],
        },
        {
          name: 'Confidentiality',
          provisions: [
            { value: 'No compelled disclosure of HIV status', citation: 'DO 102, s. 2010, Section III.B.2.a' },
            { value: 'HIV information kept strictly confidential in medical files', citation: 'DO 102, s. 2010, Section III.B.2.c' },
          ],
        },
        {
          name: 'Voluntary Confidential Counseling and Testing (VCCT)',
          keyRule: { value: 'Compulsory HIV testing as precondition to employment is UNLAWFUL', citation: 'DO 102, s. 2010, Section III.C.3.a' },
        },
      ],
    },

    workAccommodation: {
      citation: 'DO 102, s. 2010, Section III.B.3',
      measures: ['Flexible leave arrangements', 'Rescheduling of working time', 'Return to work arrangements'],
    },
  },

  // ===========================================
  // DO 178, s. 2017 - STANDING AT WORK
  // ===========================================
  do178: {
    title: 'Safety and Health Measures for Workers Who by the Nature of Their Work Have to Stand at Work',
    citation: 'DO 178, s. 2017',
    effectiveDate: { value: 'August 25, 2017', citation: 'DO 178, s. 2017' },

    coverage: {
      citation: 'DO 178, s. 2017, Section I',
      workers: [
        'Retail and service employees',
        'Assembly line workers',
        'Teachers',
        'Security personnel',
        'Cashiers',
        'Sales clerks',
        'Pharmacists',
        'Workers required to stand during entire shift',
      ],
      issues: ['Wearing of high heeled female shoes', 'Standing for long periods', 'Frequent walking'],
    },

    healthRisks: {
      citation: 'DO 178, s. 2017, Section II',
      risks: [
        'Strain on lower limbs',
        'Aching muscles',
        'Hazardous pressure on hip, knee and ankle joints',
        'Sore feet',
        'Other musculoskeletal disorders',
      ],
    },

    controlMeasures: {
      citation: 'DO 178, s. 2017, Section III',
      measures: [
        { name: 'Rest Periods', description: 'Implement rest periods to break time spent standing or walking' },
        { name: 'Appropriate Flooring', description: 'Install wood floorings, rubber floorings, or anti-fatigue mats' },
        { name: 'Adjustable Work Surfaces', description: 'Provide tables with adjustable heights to alternate sitting and standing' },
        { name: 'Accessible Seats', description: 'Provide readily accessible seats (small foldable stools) for rest periods or while performing duties' },
        {
          name: 'Proper Footwear',
          requirements: [
            'Not pinch feet or toes',
            'Well-fitted and non-slipping',
            'Adequate cushion and arch support',
            'Flat or low heels providing stability',
          ],
        },
      ],
    },

    notificationRequirement: { value: 'Notify DOLE Regional Office within 30 DAYS from effectivity of adoption of safety measures', citation: 'DO 178, s. 2017, Section IV' },
  },

  // ===========================================
  // DO 184, s. 2017 - SITTING AT WORK
  // ===========================================
  do184: {
    title: 'Safety and Health Measures for Workers Who, by the Nature of Their Work, Have to Spend Long Hours Sitting',
    citation: 'DO 184, s. 2017',
    effectiveDate: { value: 'October 18, 2017', citation: 'DO 184, s. 2017' },
    complementsOrder: { value: 'DO 178-17 (Standing at Work)', citation: 'DO 184, s. 2017, Section I' },

    coverage: {
      citation: 'DO 184, s. 2017, Section II',
      workers: [
        'Office workers',
        'Desk workers',
        'Call center agents',
        'Computer operators',
        'Administrative staff',
        'Other sedentary workers',
      ],
    },

    healthRisks: {
      citation: 'DO 184, s. 2017, Section III',
      risks: [
        'Musculoskeletal disorders',
        'High blood pressure',
        'Heart disease',
        'Anxiety',
        'Diabetes',
        'Obesity',
      ],
    },

    controlMeasures: {
      citation: 'DO 184, s. 2017, Section IV',
      measures: [
        { name: 'Regular Breaks', requirement: 'FIVE-MINUTE BREAKS EVERY TWO HOURS from sitting time', citation: 'DO 184, s. 2017, Section IV.1' },
        { name: 'Reduce Sedentary Work', methods: ['Standing meetings', 'Walking meetings', 'Standing desks', 'Movement during work hours'] },
        { name: 'Ergonomic Workstations', items: ['Adjustable chairs', 'Proper desk height', 'Monitor positioning', 'Keyboard and mouse placement'] },
        { name: 'Movement Encouragement', description: 'Encourage regular movement and stretching' },
        { name: 'Health Awareness', description: 'Educate workers on health risks and preventive measures' },
      ],
    },

    notificationRequirement: { value: 'Notify DOLE Regional Office of adoption of safety measures', citation: 'DO 184, s. 2017, Section V' },
  },

  // ===========================================
  // DO 208, s. 2020 - MENTAL HEALTH
  // ===========================================
  do208: {
    title: 'Guidelines for Implementation of Mental Health Workplace Policies and Programs for the Private Sector',
    citation: 'DO 208, s. 2020',
    effectiveDate: { value: 'March 3, 2020', citation: 'DO 208, s. 2020' },
    legalBasis: { value: 'RA 11036 (Mental Health Act) and RA 11058 (OSH Standards)', citation: 'DO 208, s. 2020' },

    coverage: { value: 'All workplaces and establishments in the formal sector including those deploying OFWs', citation: 'DO 208, s. 2020, Section I' },

    programMandatory: {
      value: 'MANDATORY for all workplaces',
      citation: 'DO 208, s. 2020, Section II',
      purposes: [
        'Raise awareness',
        'Prevent stigma and discrimination',
        'Provide support to at-risk workers and those with mental health conditions',
        'Facilitate access to mental health services',
      ],
    },

    programComponents: {
      citation: 'DO 208, s. 2020, Section IV',
      components: [
        {
          name: 'Advocacy, Information, Education and Training',
          topics: [
            'Understanding mental health and its impact',
            'Identification and management of mental health problems',
            'RA 11036 salient features (basic rights, consent to treatment)',
            'Confidentiality of medical records',
          ],
        },
        {
          name: 'Promotion of Workers Well-being',
          activities: [
            'Identification and management of work-related stress',
            'Addressing interpersonal issues',
            'Wellness programs and activities',
          ],
        },
        {
          name: 'Prevention of Stigma and Discrimination',
          prohibitions: ['Stigmatization', 'Discrimination', 'Bullying', 'Mobbing', 'Harassment'],
        },
        {
          name: 'Referral System',
          description: 'Establish referral system for treatment and rehabilitation',
        },
        {
          name: 'Benefits and Compensation',
          description: 'Workers with mental health conditions shall receive appropriate benefits',
        },
      ],
    },

    employeeProhibitions: {
      citation: 'DO 208, s. 2020, Section VI',
      prohibited: [
        'Bullying',
        'Cyber bullying/mobbing',
        'Verbal, sexual and physical harassment',
        'Work-related violence, threats, shaming, alienation',
        'Discrimination leading to mental health problems',
      ],
    },

    reporting: { value: 'Mental Health Policy and Program submitted to DOLE Regional Office as part of OSH Programs', citation: 'DO 208, s. 2020, Section VII.2' },
    review: { value: 'Reviewed and evaluated annually or as necessary', citation: 'DO 208, s. 2020, Section VII.3' },
  },

  // ===========================================
  // DO 235, s. 2022 - FIRST AID CERTIFICATION
  // ===========================================
  do235: {
    title: 'Rules on Certification of First Aiders and Accreditation of First Aid Training Providers',
    citation: 'DO 235, s. 2022',
    legalBasis: { value: 'Section 25 of RA 11058', citation: 'DO 235, s. 2022' },

    authorizedTrainingProviders: {
      citation: 'DO 235, s. 2022, Section 1',
      providers: [
        'Philippine Red Cross (PRC)',
        'Armed Forces of the Philippines (AFP)',
        'Philippine National Police (PNP)',
        'DOLE-accredited TVIs with TESDA-registered EMS NC programs',
        'Other DOLE-accredited first aid training providers',
      ],
    },

    trainingCourseTypes: {
      citation: 'DO 235, s. 2022, Section 2',
      types: [
        { name: 'Emergency First Aid Training', duration: 'One-day training course', description: 'Knowledge on day-to-day emergencies until full medical treatment is available' },
        { name: 'Occupational First Aid and Basic Life Support Training', duration: 'Two-day training course', description: 'Knowledge and skills to establish, maintain, and facilitate effective life support in workplace until full medical treatment is available' },
        { name: 'Standard First Aid and Basic Life Support Training', duration: 'Multi-day comprehensive course', description: 'Comprehensive first aid training' },
      ],
    },

    certificationValidity: { value: 'THREE (3) YEARS from date of issuance', citation: 'DO 235, s. 2022, Section 3' },

    renewal: {
      citation: 'DO 235, s. 2022, Section 5',
      deadline: { value: 'Within SIXTY (60) DAYS prior to expiration', citation: 'DO 235, s. 2022, Section 5' },
      requirements: ['Valid certificate and ID', 'Satisfactory skills and knowledge assessment by FATPro'],
      cost: { value: 'Shouldered by employer per Section 16(b) of DO 198-18', citation: 'DO 235, s. 2022, Section 5' },
    },

    emsNcHolder: { value: 'EMS NC Program certificate holder may be designated as first aider regardless of employment size and risk level', citation: 'DO 235, s. 2022, Section 4' },
  },

  // ===========================================
  // DA 05, s. 2010 - HEPATITIS B
  // ===========================================
  da05: {
    title: 'Guidelines for Implementation of Workplace Policy and Program on Hepatitis B',
    citation: 'DA 05, s. 2010',
    effectiveDate: { value: 'January 4, 2011', citation: 'DA 05, s. 2010' },

    coverage: { value: 'All workplaces in the private sector including their supply chain', citation: 'DA 05, s. 2010, Section I' },

    programMandatory: { value: 'Mandatory for all private workplaces', citation: 'DA 05, s. 2010, Section II.A' },

    highRiskOccupations: { value: 'Healthcare workers and workers whose occupation involves potential for exchange of bodily fluids', citation: 'DA 05, s. 2010' },

    preventiveStrategies: {
      citation: 'DA 05, s. 2010, Section III.B',
      strategies: [
        { name: 'Vaccination', encouraged: 'All workers', required: 'High-risk occupations (healthcare workers, etc.)' },
        { name: 'Workplace Conditions', items: ['Adequate hygiene facilities', 'Containment of infectious materials', 'Proper disposal of contaminated materials'] },
        { name: 'PPE', requirement: 'Available for all workers in high-risk occupations at all times' },
        { name: 'Training', content: 'Standard/universal precautions adherence' },
      ],
    },

    nonDiscrimination: {
      citation: 'DA 05, s. 2010, Section III.C.1',
      provisions: [
        'No discrimination based on Hepatitis B status per ILO C111',
        'HBsAg positive shall not be declared unfit without appropriate medical evaluation and counseling',
        'No termination based on actual, perceived or suspected Hepatitis B status',
      ],
    },

    screening: { value: 'Screening for Hepatitis B as pre-requisite to employment shall NOT be mandatory', citation: 'DA 05, s. 2010, Section III.D.3' },

    compensation: { value: 'Worker who contracts Hepatitis B in performance of duty entitled to SSS sickness benefits and ECC benefits under PD 626', citation: 'DA 05, s. 2010, Section III.E' },
  },

  // ===========================================
  // LA 01, s. 2023 - FOOD/WATERBORNE DISEASE
  // ===========================================
  la01: {
    title: 'Food and Waterborne Disease Prevention and Control in the Workplace',
    citation: 'LA 01, s. 2023',
    effectiveDate: { value: 'January 16, 2023', citation: 'LA 01, s. 2023' },

    coverage: { value: 'All establishments and workplaces in the private sector', citation: 'LA 01, s. 2023, Section I' },

    purpose: { value: 'Prevent and control cases of cholera, diarrhea, and other food/waterborne diseases', citation: 'LA 01, s. 2023, Section II' },

    welfareFacilities: {
      citation: 'LA 01, s. 2023, Section III.A',
      required: [
        { item: 'Adequate supply of safe drinking water', cost: 'FREE', citation: 'LA 01, s. 2023, Section III.A.1' },
        { item: 'Sanitary and washing facilities', cost: 'FREE', citation: 'LA 01, s. 2023, Section III.A.2' },
      ],
    },

    oshProgramRequirements: {
      citation: 'LA 01, s. 2023, Section IV',
      elements: [
        'Promote hygiene and sanitation',
        'Provide disease awareness training',
        'Assist ill employees',
        'Advocate for worker and community health',
      ],
    },

    reportingRequirement: {
      citation: 'LA 01, s. 2023, Section V',
      requirement: { value: 'Report cholera, diarrhea, and food/waterborne diseases to LGU and DOH', citation: 'LA 01, s. 2023, Section V' },
      legalBasis: { value: 'RA 11332 - Mandatory Reporting of Notifiable Diseases and Health Events of Public Health Concern Act', citation: 'LA 01, s. 2023, Section V' },
    },
  },

  // ===========================================
  // LA 08, s. 2023 - HEAT STRESS PREVENTION
  // ===========================================
  la08: {
    title: 'Safety and Health Measures to Prevent and Control Heat Stress at the Workplace',
    citation: 'LA 08, s. 2023',

    coverage: { value: 'All private sector employers and workplaces', citation: 'LA 08, s. 2023, Section I' },

    heatRiskFactors: {
      citation: 'LA 08, s. 2023, Section III.A',
      factors: [
        'Environmental temperature',
        'Humidity levels',
        'Radiant heat sources',
        'Air movement/ventilation',
        'Workload intensity',
        'Duration of exposure',
        'Worker health conditions',
      ],
    },

    controlMeasures: {
      citation: 'LA 08, s. 2023, Section III.B',
      engineering: ['Improving ventilation', 'Installing cooling systems', 'Providing shade structures', 'Using reflective barriers'],
      administrative: ['Adjusting break schedules', 'Rotating workers between hot and cooler areas', 'Scheduling heavy work during cooler hours', 'Adjusting work locations'],
      personal: ['Proper uniforms', 'Appropriate PPE for heat protection', 'Cooling vests or equipment'],
    },

    drinkingWater: { value: 'Adequate supply of safe drinking water with accessible stations', citation: 'LA 08, s. 2023, Section III.C' },

    training: {
      citation: 'LA 08, s. 2023, Section III.D',
      topics: [
        'Heat-related illnesses and symptoms',
        'Prevention measures',
        'First aid for heat stress',
        'Importance of hydration',
        'Recognition of warning signs',
      ],
    },

    flexibleWorkArrangements: {
      citation: 'LA 08, s. 2023, Section IV',
      permitted: ['Adjusted work schedules', 'Modified break times', 'Alternative work locations', 'Reduced outdoor work during peak heat hours'],
    },

    heatRelatedIllnesses: {
      citation: 'LA 08, s. 2023, Section VI',
      conditions: ['Heat exhaustion', 'Heat stroke', 'Heat cramps', 'Heat rash', 'Heat syncope (fainting)'],
    },
  },

  // ===========================================
  // LA 19, s. 2023 - MENTAL HEALTH SUPPLEMENTAL
  // ===========================================
  la19: {
    title: 'Supplemental Guidelines on Implementation of Mental Health Policy and Program in the Workplace',
    citation: 'LA 19, s. 2023',
    effectiveDate: { value: 'September 15, 2023', citation: 'LA 19, s. 2023' },
    supplements: { value: 'DO 208, s. 2020', citation: 'LA 19, s. 2023' },

    coverage: { value: 'All workplaces and establishments in the private sector', citation: 'LA 19, s. 2023, Section I' },

    accessToServices: {
      citation: 'LA 19, s. 2023, Section II',
      requirement: { value: 'Provide effective access to mental health and self-care services including DOH Lusog-isip application', citation: 'LA 19, s. 2023, Section II' },
      referralFacilities: ['DOH-retained hospitals', 'Rural health units'],
      services: ['Consultation', 'Screening', 'Diagnosis', 'Medication', 'Treatment', 'Psychosocial support'],
    },

    workAccommodations: {
      citation: 'LA 19, s. 2023, Section III',
      types: [
        { name: 'Paid Leave Benefit', description: 'On top of existing leave benefits (company policy, CBA, Labor Code, special laws)' },
        { name: 'Flexible Work Arrangements', examples: ['Re-scheduling of work hours', 'Telecommuting', 'Other arrangements'] },
      ],
    },

    confidentiality: { value: 'Medical records handled per RA 10173 (Data Privacy Act of 2012)', citation: 'LA 19, s. 2023, Section IV' },

    annualReporting: {
      citation: 'LA 19, s. 2023, Section V',
      contents: ['Number of cases handled or referred to mental health service providers', 'Activities and programs to promote mental health'],
    },
  },

  // ===========================================
  // LA 20, s. 2023 - CANCER PREVENTION
  // ===========================================
  la20: {
    title: 'Guidelines on Implementation of Workplace Policy and Program on Cancer Prevention and Control in the Private Sector',
    citation: 'LA 20, s. 2023',
    effectiveDate: { value: 'September 15, 2023', citation: 'LA 20, s. 2023' },

    coverage: { value: 'All workplaces and establishments in the private sector', citation: 'LA 20, s. 2023, Section I' },

    mandatoryProgramComponents: {
      citation: 'LA 20, s. 2023, Section II',
      components: [
        'Promotion of safe and healthy lifestyle including mental and social well-being',
        'Adjustment and updating of existing cancer policy based on medical surveillance',
        'Awareness campaigns on cancer (self-breast examination, ill-effects of smoking/alcohol, signs/symptoms/prevention)',
        'Implementation of appropriate control measures (engineering, administrative, PPE) to avoid exposure to cancer-causing chemicals, processes, and conditions',
        'Prevention of stigma and discrimination against employees with cancer',
        'Facilitation of timely referral mechanisms for screening, diagnosis, treatment, social services, and mental health services to DOH cancer centers',
        'Return-to-work and re-integration measures for employees diagnosed with cancer',
        'Employee-centric program monitoring (awareness attendance, employees availing prevention measures, employees assisted for treatment)',
      ],
    },

    workAccommodations: {
      citation: 'LA 20, s. 2023, Section III',
      types: [
        { name: 'Paid Leave Benefit', description: 'On top of existing leave benefits' },
        { name: 'Flexible Work Arrangements', examples: ['Re-scheduling of work hours', 'Telecommuting'] },
      ],
    },

    confidentiality: { value: 'Medical records handled per RA 10173 (Data Privacy Act of 2012)', citation: 'LA 20, s. 2023, Section IV' },

    annualReporting: { value: 'Report number of cancer-related activities and programs implemented', citation: 'LA 20, s. 2023, Section V' },
  },

  // ===========================================
  // LA 21, s. 2023 - TB SUPPLEMENTAL
  // ===========================================
  la21: {
    title: 'Supplemental Guidelines on Implementation of Safety and Health Measures for Prevention and Control of Tuberculosis in the Workplace',
    citation: 'LA 21, s. 2023',
    effectiveDate: { value: 'September 15, 2023', citation: 'LA 21, s. 2023' },
    supplements: { value: 'DO 73, s. 2005', citation: 'LA 21, s. 2023' },

    coverage: { value: 'All private sector employers and employees', citation: 'LA 21, s. 2023, Section I' },

    accessToServices: {
      citation: 'LA 21, s. 2023, Section III',
      options: [
        'Employees may directly consult private or public TB DOTS facilities',
        'Employers may refer employees to TB DOTS facilities or PhilHealth healthcare services',
      ],
    },

    workAccommodations: {
      citation: 'LA 21, s. 2023, Section IV',
      forPhase: { value: 'Especially during the usual 14-day infectious phase of treatment', citation: 'LA 21, s. 2023, Section IV' },
      types: [
        { name: 'Paid Leave Benefit', description: 'On top of existing leave benefits' },
        { name: 'Flexible Work Arrangements', examples: ['Flexible hours', 'Telecommuting'] },
      ],
    },

    confidentiality: { value: 'Medical records handled per RA 10173 (Data Privacy Act of 2012)', citation: 'LA 21, s. 2023, Section V' },

    annualReporting: { value: 'Report employee chest x-rays, TB diagnoses, and other TB-related data', citation: 'LA 21, s. 2023, Section VI' },
  },

  // ===========================================
  // LA 22, s. 2023 - HIV/AIDS SUPPLEMENTAL
  // ===========================================
  la22: {
    title: 'Supplemental Guidelines on Implementation of Prevention and Control of HIV/AIDS in the Workplace',
    citation: 'LA 22, s. 2023',
    effectiveDate: { value: 'September 15, 2023', citation: 'LA 22, s. 2023' },
    supplements: { value: 'DO 102, s. 2010', citation: 'LA 22, s. 2023' },

    coverage: { value: 'All workplaces and establishments in the private sector', citation: 'LA 22, s. 2023, Section I' },

    keyProvisions: {
      citation: 'LA 22, s. 2023, Section III',
      areas: [
        { name: 'Access to HIV/AIDS Services', services: ['Testing and counseling', 'Treatment and care', 'Support services through DOH facilities'] },
        { name: 'Non-Discrimination', provisions: ['Reinforcement of non-discrimination policies', 'Protection of workers living with HIV/AIDS', 'Prevention of stigma'] },
        { name: 'Confidentiality', provisions: ['Strict confidentiality of HIV status', 'Compliance with Data Privacy Act of 2012', 'Limited access to medical records'] },
        { name: 'Workplace Education and Awareness', topics: ['Information dissemination', 'Prevention strategies', 'Available services and support'] },
        { name: 'Referral Mechanisms', destinations: ['DOH-retained hospitals', 'Antiretroviral therapy access', 'Psychosocial support services'] },
      ],
    },

    workAccommodations: {
      citation: 'LA 22, s. 2023, Section IV',
      types: ['Paid leave benefits', 'Flexible work arrangements', 'Return-to-work support', 'Reasonable workplace adjustments'],
    },

    confidentiality: { value: 'Medical records handled per RA 10173 (Data Privacy Act of 2012)', citation: 'LA 22, s. 2023, Section V' },
  },

  // ===========================================
  // LA 23, s. 2023 - COVID-19 POST-EMERGENCY
  // ===========================================
  la23: {
    title: 'Guidelines on Minimum Public Health Standards in Workplaces Relative to the Lifting of the State of Public Health Emergency Due to COVID-19',
    citation: 'LA 23, s. 2023',
    effectiveDate: { value: 'September 20, 2023', citation: 'LA 23, s. 2023' },
    legalBasis: { value: 'Proclamation No. 297, s. 2023 and DOH Circular 2023-0324', citation: 'LA 23, s. 2023' },

    coverage: { value: 'All workplaces and establishments in the private sector', citation: 'LA 23, s. 2023, Section II' },

    vaccinationPolicy: {
      citation: 'LA 23, s. 2023, Section IV',
      provisions: [
        { name: 'Promotion', value: 'Employers encouraged to promote vaccination', citation: 'LA 23, s. 2023, Section IV.1' },
        { name: 'Non-Discrimination', value: 'Unvaccinated employees CANNOT be discriminated against or terminated', citation: 'LA 23, s. 2023, Section IV.2' },
        { name: 'Prohibition', value: '"No Vaccine, No Work" policy is PROHIBITED', citation: 'LA 23, s. 2023, Section IV.3' },
      ],
    },

    employerObligations: {
      citation: 'LA 23, s. 2023, Section V',
      costs: { value: 'Employer must cover costs of preventive and control measures for workplace illnesses including vaccines if provided', citation: 'LA 23, s. 2023, Section V.1' },
      reporting: {
        reports: ['Work Accident and Injuries Report', 'Annual Medical Report', 'List of COVID-19-positive cases'],
        submittedTo: ['DOLE', 'Relevant LGUs'],
        citation: 'LA 23, s. 2023, Section V.2',
      },
    },

    withdrawnIssuances: { value: 'All issuances effective only during State of Public Health Emergency are withdrawn, revoked, and canceled', citation: 'LA 23, s. 2023, Section VI' },

    continuingObligations: {
      citation: 'LA 23, s. 2023, Section VII',
      duties: [
        'Ensure safe and healthy workplace conditions',
        'Comply with occupational safety and health standards',
        'Implement appropriate health protocols as needed',
        'Report workplace illnesses and diseases',
      ],
    },
  },
};

export default OSH_KNOWLEDGE;
