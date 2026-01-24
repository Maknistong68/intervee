// Rule 1070 - Occupational Health and Environmental Control
// Original OSHS + Amended by DO 136 s. 2014, DO 160 s. 2016, DO 254 s. 2016, DO 224 s. 2021

export const RULE_1070 = {
  ruleNumber: '1070',
  title: 'Occupational Health and Environmental Control',
  amendments: ['DO 136, s. 2014', 'DO 160, s. 2016', 'DO 254, s. 2016', 'DO 224, s. 2021'],

  // ===========================================
  // SECTION 1071: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1071',

    thresholdLimitValues: {
      definition: 'Airborne concentrations of substances representing conditions under which nearly all workers may be repeatedly exposed daily without adverse effect',
      covers: ['Toxic substances', 'Carcinogenic substances', 'Physical agents'],
    },

    specialRules: {
      authority: 'Regional Office (on advice of Director)',
      purpose: 'Establish TLVs for toxic substances not found in the table',
      validity: 'Until permanent standard is issued by Secretary',
    },

    periodicReview: {
      responsibility: 'Secretary shall periodically review/update standards',
      covers: [
        'Threshold limit values',
        'Permissible noise exposure levels',
        'Illumination levels',
        'Human carcinogens',
        'Temperature and humidity',
        'Other technical standards',
      ],
      technicalCommittee: {
        convenedBy: 'Director of Bureau of Working Conditions',
        qualifications: {
          professionals: 'Physician, engineer, chemist, or nurse',
          training: 'Completed OSH training course required by Standards',
          experience: 'OSH practitioner for not less than 3 years',
        },
        otherMembers: 'Labor and employers\' sectors',
      },
      effectivity: 'Upon announcement by Secretary of Labor and Employment',
    },
  },

  // ===========================================
  // SECTION 1072: THRESHOLD LIMIT VALUES FOR AIRBORNE CONTAMINANTS
  // ===========================================
  thresholdLimitValues: {
    section: '1072',

    definition: {
      subsection: '1072.01',
      timeWeighted: '8-hour workday',
      weeklyExposure: '48 hours per week',
    },

    exposureLimits: {
      subsection: '1072.02',

      ceilingValues: {
        indicator: 'Names preceded by "C" (e.g., Boron trifluoride)',
        rule: 'Employee exposure shall at NO TIME exceed the ceiling value',
      },

      timeWeightedAverage: {
        indicator: 'Names NOT preceded by "C"',
        rule: '8-hour workshift shall not exceed 8-hour TWA limit',
        shortTermExcursions: {
          allowed: 'For short period of time',
          limits: [
            { concentration: '0 to 1', multiplier: '3 times' },
            { concentration: '1 to 10', multiplier: '2 times' },
            { concentration: 'over 10 to 100', multiplier: '1.5 times' },
            { concentration: 'over 100 to 1000', multiplier: '1.25 times' },
          ],
        },
      },

      skinNotation: {
        indicator: '"Skin" designation (e.g., DDT-Skin)',
        meaning: 'Potential contribution to overall exposure by cutaneous route',
        includes: ['Mucous membrane', 'Eye', 'Airborne exposure', 'Direct contact'],
        purpose: 'Suggest appropriate measures for prevention of cutaneous absorption',
      },
    },

    complianceHierarchy: {
      subsection: '1072.03',
      order: [
        '1. Administrative controls (first priority)',
        '2. Engineering controls (first priority)',
        '3. Protective equipment (when controls not feasible)',
        '4. Other appropriate measures',
      ],
    },
  },

  // ===========================================
  // SECTION 1073: TABLES
  // ===========================================
  tables: {
    section: '1073',
    table8: 'Threshold limit values for airborne contaminants',
    table8a: 'Mineral dust',
    table8d: 'Human Carcinogens: Recognized to have carcinogenic potentials',
  },

  // ===========================================
  // SECTION 1074: PHYSICAL AGENTS - NOISE
  // ===========================================
  noise: {
    section: '1074',

    definition: {
      subsection: '1074.01',
      tlvNoise: 'Sound pressure levels under which nearly all workers may be repeatedly exposed without adverse effect on ability to hear and understand normal speech',
    },

    controls: {
      requirement: 'Feasible administrative or engineering controls when workers exposed to sound levels exceeding Table 8b',
      measurement: 'Standard sound level meter at slow response',
      ifControlsFail: 'Ear protective devices capable of bringing sound to permissible levels',
      responsibility: 'Provided by employer, used by worker',
    },

    permissibleExposure: {
      subsection: '1074.02',
      reference: 'Table 8b',
      // Standard permissible noise exposure levels
      levels: [
        { hours: 8, dBA: 90 },
        { hours: 6, dBA: 92 },
        { hours: 4, dBA: 95 },
        { hours: 3, dBA: 97 },
        { hours: 2, dBA: 100 },
        { hours: 1.5, dBA: 102 },
        { hours: 1, dBA: 105 },
        { hours: 0.5, dBA: 110 },
        { hours: 0.25, dBA: 115 },
      ],
    },

    applicationRules: {
      subsection: '1074.03',
      totalExposure: 'Values apply to total time per working day (continuous or short-term)',
      doesNotApply: 'Impact or impulsive type of noise',
      intervalRule: {
        continuous: 'Maximum intervals of 1 second or less',
        impulse: 'Intervals over 1 second',
      },
      mixedExposure: {
        formula: 'C1/T1 + C2/T2 + C3/T3',
        rule: 'If sum exceeds unity (1), mixed exposure exceeds TLV',
        note: 'Noise exposures less than 90 dBA do not enter calculations',
        C: 'Total time exposure at specified noise level',
        T: 'Total time permitted at that level',
      },
      impactNoise: {
        ceiling: '140 decibels peak sound pressure level',
        note: 'Shall not exceed',
      },
    },
  },

  // ===========================================
  // SECTION 1075: ILLUMINATION
  // ===========================================
  illumination: {
    section: '1075',

    generalProvisions: {
      subsection: '1075.01',
      requirement: 'All places where persons work, pass, or may work/pass in emergencies shall have adequate lighting',
      types: ['Natural lighting', 'Artificial lighting', 'Both'],
      suitable: 'For the operation and special type of work performed',
    },

    naturalLighting: {
      subsection: '1075.02',
      skylightsWindows: 'Located and spaced for fairly uniform daylight over working area',
      glare: 'Means to avoid glare where necessary',
      cleaning: 'Regular system to ensure skylights and windows kept clean',
    },

    artificialLighting: {
      subsection: '1075.03',
      when: 'When daylight fails or where daylight illumination is insufficient',
      quality: [
        'Uniform level, widely distributed',
        'Avoid harsh shadows or strong contrast',
        'Free from direct or reflected glare',
      ],
      supplementary: {
        when: 'Where intense local lighting is necessary',
        requirement: 'Combination of general and supplementary at point of work',
        design: 'Specially designed for particular visual task with shading/diffusing devices',
      },
    },

    intensityLevels: {
      subsection: '1075.04',
      conversion: '1 foot candle = 10 lux (approximately 10.75 lux)',

      levels: {
        lux20: {
          value: '20 lux (2 foot candles)',
          for: 'Yards, roadways, outside thoroughfares',
        },
        lux50: {
          value: '50 lux (5 foot candles)',
          for: [
            'Handling coarse materials, coal, ashes',
            'Rough sorting or grinding of clay products',
            'Passageways, corridors, stairways',
            'Warehouses, storerooms for rough and bulky materials',
          ],
        },
        lux100: {
          value: '100 lux (10 foot candles)',
          for: [
            'Slight discrimination of detail',
            'Semi-finished iron and steel products',
            'Rough assembling, milling of grains',
            'Opening, picking, carding of cotton',
            'Engine and boiler rooms',
            'Passenger and freight elevators',
            'Crating and boxing departments',
            'Receiving and shipping rooms',
            'Storerooms for medium and fine materials',
            'Locker rooms, toilets, washrooms',
          ],
        },
        lux200: {
          value: '200 lux (20 foot candles)',
          for: [
            'Moderate discrimination of details',
            'Medium assembling',
            'Rough bench and machine work',
            'Rough inspection or testing',
            'Sewing light-colored textile or leather',
            'Canning, preserving, meat packing',
            'Planing lumber and veneering',
          ],
        },
        lux300: {
          value: '300 lux (30 foot candles)',
          for: [
            'Close discrimination of details',
            'Medium bench and machine work',
            'Medium inspection, fine testing',
            'Flour grading, leather finishing',
            'Weaving cotton goods or light-colored cloth',
            'Office desk work with intermittent reading/writing',
            'Filing and mail sorting',
          ],
        },
        lux500to1000: {
          value: '500 to 1,000 lux (50 to 100 foot candles)',
          for: [
            'Discrimination of fine details with fair contrast',
            'Fine assembling, fine bench and machine work',
            'Fine inspection, fine polishing',
            'Beveling of glass, fine woodworking',
            'Weaving dark-colored cloth',
            'Accounting, bookkeeping, drafting',
            'Stenographic work, typing',
            'Prolonged close office desk work',
          ],
        },
        lux1000: {
          value: '1,000 lux (100 foot candles)',
          for: [
            'Extremely fine detail with poor contrast for long periods',
            'Extra fine assembling',
            'Instrument, jewelry, watch manufacturing',
            'Grading and sorting tobacco products',
            'Makeup and proof-reading in printing plants',
            'Inspection of sewing dark-colored cloth',
          ],
        },
      },

      adjustments: {
        averageConditions: 'Values apply to average operating conditions',
        initialProvision: 'May need at least 25% more initially',
        dirtyLocations: 'Initial level at least 50% above recommended standards',
      },

      windowlessRooms: 'General lighting sufficient for most exacting operations',
      reference: 'Table 8c for detailed standards',
    },

    emergencyLighting: {
      subsection: '1075.06',
      when: 'Large numbers of persons in buildings more than one story',
      where: ['Important stairways', 'Exits', 'Workplaces', 'Passages'],
      requirements: {
        duration: 'At least 1 hour',
        intensity: 'Minimum 5 lux (0.5 ft. candle)',
        powerSource: 'Independent of general lighting system',
        activation: 'Automatic upon failure of general lighting system',
      },
    },
  },

  // ===========================================
  // SECTION 1076: GENERAL VENTILATION
  // ===========================================
  ventilation: {
    section: '1076',

    atmosphericConditions: {
      subsection: '1076.01',
      requirement: 'Suitable atmospheric conditions by natural or artificial means',
      avoid: [
        'Insufficient air supply',
        'Stagnant or vitiated air',
        'Harmful drafts',
        'Excessive heat or cold',
        'Sudden variations in temperature',
        'Excessive humidity or dryness',
        'Objectionable odors',
      ],
    },

    airSupply: {
      subsection: '1076.02',
      requirement: 'Clean fresh air to enclosed workplaces',
      rate: '20 to 40 cubic meters (700 to 1400 cu. ft.) per hour per worker',
      alternative: 'Complete air change per hour:',
      changes: {
        sedentaryWorkers: '4 times per hour',
        activeWorkers: '8 times per hour',
      },
      mechanicalVentilation: 'Required when natural ventilation inadequate or creates uncomfortable drafts',
    },

    cleanliness: {
      subsection: '1076.03',
      contaminants: ['Dusts', 'Gases', 'Vapors', 'Mists'],
      rule: 'Removed at points of origin, not permitted to permeate workroom atmosphere',
      internalCombustionEngines: {
        fuels: ['Gasoline', 'Diesel', 'LPG'],
        requirement: 'Located such that exhaust gases are prevented from permeating atmosphere',
      },
    },

    airMovement: {
      subsection: '1076.04',
      requirement: 'Workers not subjected to objectionable drafts',
      velocityLimits: {
        rainySeason: '15 meters (50 ft.) per minute maximum',
        summerSeason: '45 meters (150 ft.) per minute maximum',
      },
    },

    temperatureAndHumidity: {
      subsection: '1076.05',
      requirement: 'Temperature suitable for type of work, adjusted with humidity as needed',
      radiationProtection: 'Insulation or other means against radiation from steam/hot water pipes or heated machinery',
      extremeTemperatures: 'Passage rooms for gradual adjustment to prevailing temperature',
    },
  },

  // ===========================================
  // SECTION 1077: WORKING ENVIRONMENT MEASUREMENT
  // ===========================================
  workingEnvironmentMeasurement: {
    section: '1077',

    definition: {
      subsection: '1077.02',
      meaning: 'Sampling and analysis of atmospheric working environment and other fundamental elements to determine actual conditions',
    },

    parameters: {
      subsection: '1077.03(1)',
      includes: [
        'Temperature',
        'Humidity',
        'Pressure',
        'Illumination',
        'Ventilation',
        'Concentration of substances',
        'Noise',
      ],
    },

    requirements: {
      subsection: '1077.03',
      where: 'Indoor or other workplaces where hazardous work is performed',
      records: 'Keep record of measurements, available to enforcing authority',
      frequency: 'Periodically as necessary, but not longer than annually',
      personnel: 'Safety and medical personnel with adequate training and experience in working environment measurement',
      alternative: 'If unable to perform, commission Bureau/COSH/Regional Labor Office or accredited institutions',
    },

    employerDuty: {
      subsection: '1077.01',
      duty: 'Exert efforts to maintain and control working environment in comfortable and healthy conditions',
      purpose: 'Promoting and maintaining health of workers',
    },
  },

  // ===========================================
  // QUICK REFERENCE - KEY VALUES
  // ===========================================
  quickReference: {
    noise: {
      permissible8hour: '90 dBA',
      impactCeiling: '140 dB peak',
      mixedExposureFormula: 'C1/T1 + C2/T2 + ... < 1',
    },
    illumination: {
      yards: '20 lux',
      passageways: '50 lux',
      generalWork: '100 lux',
      moderateDetail: '200 lux',
      closeDetail: '300 lux',
      fineDetail: '500-1000 lux',
      extremeDetail: '1000 lux',
      emergency: '5 lux (1 hour minimum)',
    },
    ventilation: {
      airSupplyPerWorker: '20-40 m³/hour',
      airChanges: '4-8 per hour',
      maxAirVelocityRainy: '15 m/min',
      maxAirVelocitySummer: '45 m/min',
    },
    tlv: {
      workday: '8 hours',
      workweek: '48 hours',
      skinNotation: 'Potential cutaneous absorption',
      ceilingValue: 'Never exceed',
    },
    measurement: {
      frequency: 'At least annually',
      parameters: 'Temperature, humidity, pressure, illumination, ventilation, substances, noise',
    },
  },
};

// Helper functions
export function getNoisePermissibleHours(dBA: number): number | string {
  const levels = RULE_1070.noise.permissibleExposure.levels;
  const found = levels.find(l => l.dBA === dBA);
  if (found) return found.hours;

  // Approximate for values not in table
  if (dBA < 90) return 'No limit (below 90 dBA)';
  if (dBA > 115) return 'Not permitted';
  return 'Refer to Table 8b';
}

export function calculateMixedNoiseExposure(exposures: Array<{ hours: number; dBA: number }>): {
  sum: number;
  exceeds: boolean;
} {
  const permissibleHours: Record<number, number> = {
    90: 8, 92: 6, 95: 4, 97: 3, 100: 2, 102: 1.5, 105: 1, 110: 0.5, 115: 0.25,
  };

  let sum = 0;
  for (const exp of exposures) {
    if (exp.dBA >= 90) {
      const permitted = permissibleHours[exp.dBA] || 0;
      if (permitted > 0) {
        sum += exp.hours / permitted;
      }
    }
  }

  return {
    sum: Math.round(sum * 100) / 100,
    exceeds: sum > 1,
  };
}

export function getIlluminationLevel(area: string): string {
  const levels = RULE_1070.illumination.intensityLevels.levels;

  const areaLower = area.toLowerCase();

  if (areaLower.includes('yard') || areaLower.includes('roadway') || areaLower.includes('outside')) {
    return '20 lux (2 foot candles)';
  }
  if (areaLower.includes('passageway') || areaLower.includes('corridor') || areaLower.includes('stairway') || areaLower.includes('warehouse')) {
    return '50 lux (5 foot candles)';
  }
  if (areaLower.includes('locker') || areaLower.includes('toilet') || areaLower.includes('washroom') || areaLower.includes('elevator')) {
    return '100 lux (10 foot candles)';
  }
  if (areaLower.includes('office') || areaLower.includes('typing') || areaLower.includes('accounting')) {
    return '500-1000 lux (50-100 foot candles)';
  }
  if (areaLower.includes('jewelry') || areaLower.includes('watch') || areaLower.includes('instrument')) {
    return '1000 lux (100 foot candles)';
  }

  return 'Refer to Table 8c for specific area';
}

export function getVentilationRequirements(): object {
  return RULE_1070.ventilation;
}

export function getTLVComplianceHierarchy(): string[] {
  return RULE_1070.thresholdLimitValues.complianceHierarchy.order;
}

export function getWorkingEnvironmentParameters(): string[] {
  return RULE_1070.workingEnvironmentMeasurement.parameters.includes;
}

export function getRule1070Summary(): string {
  return `
Rule 1070 - Occupational Health and Environmental Control Key Points:

THRESHOLD LIMIT VALUES (TLV):
- Based on 8-hour workday, 48-hour workweek
- "C" prefix = Ceiling value (never exceed)
- "Skin" notation = Cutaneous absorption risk
- Compliance hierarchy: Engineering/Admin controls first, then PPE

NOISE (Table 8b):
- 90 dBA = 8 hours permitted
- 95 dBA = 4 hours
- 100 dBA = 2 hours
- 105 dBA = 1 hour
- 110 dBA = 30 minutes
- Impact noise ceiling: 140 dB peak
- Mixed exposure: Sum of C/T fractions must be < 1

ILLUMINATION:
- Yards/roadways: 20 lux
- Passageways: 50 lux
- General work: 100 lux
- Moderate detail: 200 lux
- Close detail: 300 lux
- Fine detail: 500-1000 lux
- Extreme detail: 1000 lux
- Emergency: 5 lux (1 hour minimum)
- 1 foot candle = 10 lux

VENTILATION:
- Air supply: 20-40 m³/hour per worker
- Air changes: 4 (sedentary) to 8 (active) per hour
- Air velocity: Max 15 m/min (rainy), 45 m/min (summer)
- Remove contaminants at source

WORKING ENVIRONMENT MEASUREMENT:
- At least annually for hazardous workplaces
- Parameters: Temperature, humidity, pressure, illumination, ventilation, substances, noise
  `.trim();
}
