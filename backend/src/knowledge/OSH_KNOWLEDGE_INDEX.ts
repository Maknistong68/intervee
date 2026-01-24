// OSH Knowledge Index - Compiled for AI System Prompt
// This file contains condensed, searchable knowledge from all OSHS rules
// Load this into the AI system prompt for accurate, fast responses

export const OSH_KNOWLEDGE_INDEX = {
  // ===========================================
  // METADATA
  // ===========================================
  metadata: {
    version: '1.0.0',
    lastUpdated: '2026-01-24',
    source: 'Philippine Occupational Safety and Health Standards (OSHS)',
    rulesIncluded: [
      'Rule 1020 - Registration',
      'Rule 1030 - Training',
      'Rule 1040 - Health and Safety Committee',
      'Rule 1050 - Notification and Records',
      'Rule 1060 - Premises of Establishments',
      'Rule 1070 - Occupational Health and Environmental Control',
      'Rule 1080 - Personal Protective Equipment',
      'Rule 1090 - Hazardous Materials',
      'Rule 1100 - Welding and Cutting',
      'Rule 1120 - Hazardous Work Processes',
      'Rule 1140 - Explosives',
      'Rule 1160 - Boiler',
      'Rule 1960 - Occupational Health Services',
    ],
  },

  // ===========================================
  // QUICK LOOKUP TABLES
  // ===========================================

  // Registration Requirements (Rule 1020)
  registration: {
    newEstablishment: '30 days from start of operation',
    existingEstablishment: '60 days from effectivity of Standards',
    where: 'Regional Labor Office',
    form: 'Rule 1020 Form',
    renewalRequired: false,
    freeOfCharge: true,
  },

  // Safety Officer Requirements (Rule 1030)
  safetyOfficerLevels: {
    SO1: {
      training: '8 hours',
      workers: '1-9 (high risk) or 1-50 (low risk)',
      type: 'Part-time',
    },
    SO2: {
      training: '40 hours',
      workers: '10-50 (high risk) or 51-199 (low risk)',
      type: 'Part-time',
    },
    SO3: {
      training: '80 hours + 2 years experience',
      workers: '51-199 (high risk) or 200-500 (low risk)',
      type: 'Full-time',
    },
    SO4: {
      training: 'OSH Practitioner certified',
      workers: '200+ (high risk) or 500+ (low risk)',
      type: 'Full-time',
    },
  },

  // Health and Safety Committee (Rule 1040)
  hscTypes: {
    typeA: { workers: '10-50 (hazardous)', meetings: 'Monthly' },
    typeB: { workers: '51-200', meetings: 'Monthly' },
    typeC: { workers: '201-400', meetings: 'Monthly' },
    typeD: { workers: '401-1000', meetings: 'Monthly' },
    typeE: { workers: 'Over 1000', meetings: 'Monthly' },
  },

  // Accident Reporting (Rule 1050)
  accidentReporting: {
    fatalOrMultiple: 'Report within 24 hours',
    disabling: 'Report within 5 days',
    forms: {
      fatal: 'IP-6b (Employer\'s Work Accident/Illness Report)',
      disabling: 'IP-6a (Employer\'s Work Accident/Illness Report)',
      annualReport: 'Annual Accident/Illness Exposure Data Report',
    },
    formulae: {
      frequencyRate: '(Total disabling injuries × 1,000,000) ÷ Total worker-hours',
      severityRate: '(Total days charged × 1,000,000) ÷ Total worker-hours',
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
    },
  },

  // Premises Requirements (Rule 1060)
  premises: {
    workroomHeight: '2.75 m (9 ft) minimum, 2.45 m (8 ft) with ventilation',
    floorSpace: '2 sq.m per worker for factories, 3.5 sq.m for offices',
    passageways: '1 m minimum width',
    stairWidth: '1.15 m (45 in) for 25-45 persons, 1.52 m (60 in) for 45+',
    stairRiserMax: '21.6 cm (8.5 in)',
    stairTreadMin: '22.9 cm (9 in)',
    handrailHeight: '76-86 cm (30-34 in)',
    ladderRungs: '30 cm (12 in) apart, 40 cm (16 in) minimum width',
    ladderCage: 'Required above 6 m (20 ft)',
    exitDoors: 'Swing outward, unlocked during working hours',
  },

  // Environmental Control (Rule 1070)
  environmentalLimits: {
    noise: {
      '90dBA': '8 hours',
      '95dBA': '4 hours',
      '100dBA': '2 hours',
      '105dBA': '1 hour',
      '110dBA': '30 minutes',
      '115dBA': '15 minutes',
      impactMax: '140 dB peak',
    },
    illumination: {
      corridors: '20 lux',
      regularOffice: '200 lux',
      accounting: '300 lux',
      drafting: '500-1000 lux',
      fineAssembly: '500-1000 lux',
    },
    temperature: {
      sedentaryWork: '23-26°C',
      lightWork: '21-24°C',
      heavyWork: '17-21°C',
    },
    ventilation: {
      airFlowMin: '0.25 m/s (50 ft/min)',
      airFlowMax: '2.5 m/s (500 ft/min)',
      freshAirPerPerson: '0.5-1.0 m³/min',
    },
  },

  // PPE Requirements (Rule 1080)
  ppe: {
    eyeProtection: {
      welding: 'Filter lens shade 10-14',
      dusty: 'Safety goggles with side shields',
      chemical: 'Chemical splash goggles',
    },
    headProtection: {
      hardHatClasses: {
        A: 'General service, impact and penetration',
        B: 'Electrical hazards up to 20,000 volts',
        C: 'Comfort only, no electrical protection',
      },
    },
    fallProtection: {
      safetyBelt: {
        width: '11.5 cm (4.5 in) minimum',
        thickness: '4.76 mm (3/16 in) minimum',
      },
      lifeLine: {
        diameter: '1.9 cm (0.75 in) minimum',
        manillaRope: '2.5 cm (1 in) minimum',
      },
      requiredHeight: 'Above 1.8 m (6 ft)',
    },
    respiratoryProtection: {
      dustMask: 'Nuisance dusts <TLV',
      halfMask: 'Up to 10× TLV',
      fullFace: 'Up to 50× TLV',
      scba: 'IDLH atmospheres',
    },
  },

  // Hazardous Materials (Rule 1090)
  hazardousMaterials: {
    labelCategories: [
      'Explosives',
      'Flammable liquids/gases/solids',
      'Oxidizing substances',
      'Poisonous/infectious substances',
      'Radioactive materials',
      'Corrosives',
    ],
    leadExposure: {
      bloodTest: 'Every 3 months',
      medicalExam: 'Every 6 months',
      maxBloodLead: '80 µg/100ml (removal required)',
    },
  },

  // Welding Safety (Rule 1100)
  welding: {
    screenHeight: '2 m (6.5 ft) minimum',
    fireExtinguisher: 'Required at location',
    closedContainers: 'Clean, inert gas fill, or water fill before welding',
    confinedSpaces: 'Ventilation + respiratory protection required',
    ppeWelder: ['Filter lens goggles/helmet', 'Hand shields', 'Aprons'],
    ppeAssistant: ['Gloves', 'Goggles', 'Protective clothing'],
  },

  // Confined Space (Rule 1120)
  confinedSpace: {
    precautions: [
      'Check water level below 15 cm',
      'Test for explosive gases',
      'Test oxygen content',
      'Test for carbon monoxide',
      'Ventilate if abnormal levels',
      'Provide breathing apparatus',
      'WATCHER REQUIRED',
      'No smoking/open flames',
      'Protect unattended openings',
    ],
    watcher: {
      required: true,
      duties: ['Familiar with job', 'Regular contact', 'Has breathing apparatus'],
    },
  },

  // Explosives (Rule 1140)
  explosives: {
    magazineClasses: {
      classI: 'Over 22.5 kg (50 lbs) - masonry/metal construction',
      classII: 'Up to 22.5 kg (50 lbs) - box-in-box with sand fill',
    },
    limits: {
      workroom: '45 kg (100 lbs) for 8-hour work',
      magazineMax: '136,360 kg or 20 million blasting caps',
    },
    distances: {
      notBarricaded: 'DOUBLE all distances',
      barricaded: 'May reduce by HALF',
      temporaryOver11kg: '45 m from work site',
      temporaryUnder11kg: '15 m from work site',
      packageOpening: '15 m from magazine',
    },
    signLetterHeight: '15 cm (6 in) minimum',
    certificateValidity: '1 year, renewable annually',
  },

  // Boiler (Rule 1160)
  boiler: {
    types: {
      powerBoiler: 'Over 1.055 kg/cm²g (15 psig)',
      lowPressure: '≤1.055 kg/cm²g or ≤121°C',
    },
    factorOfSafety: 5,
    inspectionInterval: '12 months maximum',
    hydrostaticTest: {
      new: '1.5× design pressure',
      repair: '1.2× working pressure',
    },
    boilerRoom: {
      clearance: '100 cm minimum to walls',
      exits: '2 independent doors',
      wetBottomClearance: '30 cm from floor',
    },
    safetyValves: {
      under500sqft: '1 valve minimum',
      over500sqft: '2+ valves',
      dischargeHeight: '3 m above platforms',
    },
    fusiblePlugRenewal: '12 months',
    lapRivetedAgeLimit: '25 years',
    operatingPermit: '1 year validity',
    ownershipTransfer: 'Report within 30 days',
  },

  // Occupational Health Services (Rule 1960)
  healthServices: {
    hazardousWorkplace: {
      '1-50': 'Full-time first aider',
      '51-99': 'Part-time nurse (4h/6d) + First aider + Treatment room',
      '100-199': 'Part-time physician (4h/3d) + Part-time dentist + Nurse + First aider',
      '200-600': 'Part-time physician (4h/6d) + Dentist + Medical clinic',
      '601-2000': 'Full-time physician + Full-time dentist + Staff per shift',
      'Over 2000': 'Hospital (1 bed/100 workers) + Full staff',
    },
    nonHazardousWorkplace: {
      '1-50': 'Full-time first aider',
      '51-99': 'First aider + Treatment room',
      '100-199': 'Part-time nurse (4h/6d) + First aider',
      '200-600': 'Part-time physician (4h/3d) + Part-time dentist + Nurse',
      '601-2000': 'Part-time physician (4h/6d) + Part-time dentist + Clinic',
      'Over 2000': 'Full-time physician + Part-time for other shifts + Dental clinic',
    },
    inspectionFrequency: {
      hazardous1to50: 'Every 2 months',
      hazardous51to99: 'Every month',
      nonHazardous1to99: 'Every 6 months',
      nonHazardous100to199: 'Every 3 months',
    },
    qualifications: {
      firstAider: 'Red Cross trained',
      nurse: 'Licensed + 50 hours occupational nursing',
      physician: 'Licensed + Basic occupational medicine training',
      practitioner: 'Advanced training + 5 years experience',
    },
    physicalExamClasses: {
      A: 'Fit for any work',
      B: 'Correctable defects, fit to work',
      C: 'Special placement required',
      D: 'Unfit for employment',
    },
    trainingDeadline: '6 months from employment',
    refresherTraining: '8 hours annually',
    annualReportDeadline: 'March 31',
    reportForm: 'DOLE/BWC/HSD/OH-47',
  },

  // ===========================================
  // COMMON Q&A PATTERNS
  // ===========================================
  commonQuestions: {
    'safety officer requirement': 'See safetyOfficerLevels - based on worker count and risk level',
    'hsc requirement': 'See hscTypes - required for 10+ workers in hazardous, meetings monthly',
    'accident report deadline': 'Fatal: 24 hours, Disabling: 5 days',
    'noise exposure limit': '90 dBA for 8 hours, halves with each 5 dB increase',
    'fall protection height': 'Required above 1.8 m (6 ft)',
    'confined space entry': 'WATCHER required, air testing, ventilation, breathing apparatus',
    'boiler inspection': 'Every 12 months, hydrostatic test required',
    'first aid requirements': 'Based on worker count and hazard level, see healthServices',
    'physical exam classes': 'A=Fit, B=Correctable, C=Special placement, D=Unfit',
    'registration deadline': 'New: 30 days, Existing: 60 days',
  },
};

// ===========================================
// SYSTEM PROMPT GENERATOR
// ===========================================
export function generateSystemPrompt(): string {
  return `
You are an expert on Philippine Occupational Safety and Health Standards (OSHS). Use the following knowledge to answer questions accurately.

## REGISTRATION (Rule 1020)
- New establishments: Register within 30 days of operation
- Existing establishments: Register within 60 days
- Where: Regional Labor Office, free of charge

## SAFETY OFFICERS (Rule 1030)
| Level | Training | Workers (High Risk) | Workers (Low Risk) |
|-------|----------|---------------------|-------------------|
| SO1 | 8 hours | 1-9 | 1-50 |
| SO2 | 40 hours | 10-50 | 51-199 |
| SO3 | 80 hours + 2 yrs exp | 51-199 | 200-500 |
| SO4 | OSH Practitioner | 200+ | 500+ |

## HEALTH & SAFETY COMMITTEE (Rule 1040)
- Required for 10+ workers in hazardous workplaces
- Types A-E based on worker count (10-50, 51-200, 201-400, 401-1000, 1000+)
- Monthly meetings required

## ACCIDENT REPORTING (Rule 1050)
- Fatal/Multiple: Report within 24 hours
- Disabling injury: Report within 5 days
- Frequency Rate = (Injuries × 1,000,000) ÷ Worker-hours
- Severity Rate = (Days charged × 1,000,000) ÷ Worker-hours
- Scheduled charges: Death/PTD = 6000 days

## PREMISES (Rule 1060)
- Workroom height: 2.75 m (9 ft) minimum
- Floor space: 2 sq.m/worker (factories), 3.5 sq.m (offices)
- Passageways: 1 m minimum width
- Stair riser max: 21.6 cm, Tread min: 22.9 cm

## ENVIRONMENTAL LIMITS (Rule 1070)
- Noise: 90 dBA = 8 hrs, 95 = 4 hrs, 100 = 2 hrs, 105 = 1 hr
- Illumination: Office 200 lux, Drafting 500-1000 lux
- Temperature: Sedentary 23-26°C, Light work 21-24°C

## PPE (Rule 1080)
- Fall protection required above 1.8 m (6 ft)
- Safety belt: 11.5 cm wide, 4.76 mm thick
- Life line: 1.9 cm diameter minimum
- Hard hat classes: A (general), B (electrical 20kV), C (comfort)

## CONFINED SPACE (Rule 1120)
- WATCHER REQUIRED at all times
- Test for: explosive gases, oxygen, carbon monoxide
- Ventilate before entry if abnormal levels
- No smoking/flames until hazards eliminated

## BOILER (Rule 1160)
- Power boiler: >1.055 kg/cm²g (15 psig)
- Factor of safety: Not less than 5
- Inspection: Every 12 months
- Hydrostatic test: 1.5× design (new), 1.2× working (repair)
- Boiler room: 2 exits, 100 cm clearance

## HEALTH SERVICES (Rule 1960)
### Hazardous Workplaces:
- 1-50 workers: First aider
- 51-99: Part-time nurse + First aider + Treatment room
- 100-199: Part-time physician + Dentist + Nurse
- 200-600: Part-time physician (4h/6d) + Medical clinic
- 601-2000: Full-time physician + Full-time dentist
- 2000+: Hospital (1 bed/100 workers)

### Physical Exam Classes:
- Class A: Fit for any work
- Class B: Correctable defects, fit to work
- Class C: Employable with special placement
- Class D: Unfit for employment

### Key Deadlines:
- Training compliance: 6 months from employment
- Refresher training: 8 hours annually
- Annual report: March 31 (Form DOLE/BWC/HSD/OH-47)

Always cite the specific rule number when answering (e.g., "According to Rule 1050...").
`.trim();
}

// Get the character count for token estimation
export function getPromptSize(): { characters: number; estimatedTokens: number } {
  const prompt = generateSystemPrompt();
  return {
    characters: prompt.length,
    estimatedTokens: Math.ceil(prompt.length / 4), // Rough estimate: 4 chars per token
  };
}

// Export for use in application
export default OSH_KNOWLEDGE_INDEX;
