// Rule 1080 - Personal Protective Equipment and Devices
// Original OSHS + RA 11058 + DO 198 (Construction)

export const RULE_1080 = {
  ruleNumber: '1080',
  title: 'Personal Protective Equipment and Devices',
  amendments: ['RA 11058', 'DO 198 (Construction)'],

  // ===========================================
  // SECTION 1081: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1081',

    '1081.01': {
      employerDuty: {
        provision: 'Every employer shall at his own expense furnish workers with protective equipment',
        protectionFor: ['Eyes', 'Face', 'Hands', 'Feet', 'Protective shields and barriers'],
        whenRequired: 'Whenever necessary by reason of:',
        hazards: [
          'Hazardous nature of process or environment',
          'Chemical irritants or hazards',
          'Radiological irritants or hazards',
          'Mechanical irritants or hazards',
          'Hazards capable of causing injury or impairment through absorption',
          'Hazards capable of causing injury or impairment through inhalation',
          'Hazards capable of causing injury or impairment through physical contact',
        ],
      },
      deductions: {
        governedBy: 'Article 114, Book III, Labor Code of the Philippines',
        also: 'Section 14, Rule VIII, Book III, Omnibus Rules Implementing the Labor Code',
        note: 'Deduction for loss or damage of PPE',
      },
    },

    '1081.02': {
      requirement: 'All PPE shall be of approved design and construction appropriate for the exposure and work to be performed',
    },

    '1081.03': {
      employerResponsibility: 'Adequacy and proper maintenance of PPE used in workplace',
    },

    '1081.04': {
      prohibition: 'No person shall be subjected or exposed to a hazardous environmental condition without protection',
    },
  },

  // ===========================================
  // SECTION 1082: EYE AND FACE PROTECTION
  // ===========================================
  eyeAndFaceProtection: {
    section: '1082',

    '1082.01': {
      whenRequired: 'Where there is reasonable probability of exposure to such hazards',
      hazards: ['Flying objects', 'Liquids', 'Injurious radiation', 'Glare', 'Combination of these'],
      duty: 'Employer furnishes, employees use',
    },

    '1082.02': {
      title: 'Minimum Requirements',
      requirements: [
        'Provide adequate protection against the particular hazard',
        'Be reasonably comfortable to use',
        'Fit snugly and not unduly interfere with movements',
        'Be durable, easily cleaned and capable of being disinfected',
        'Be kept clean and in good condition',
        'Be of the approved type',
      ],
    },

    '1082.03': {
      title: 'For Persons with Corrective Lenses',
      options: [
        'Spectacles which provide optical correction',
        'Goggles that can be worn over corrective spectacles without disturbing adjustment',
        'Goggles that incorporate corrective lenses mounted behind protective lenses',
      ],
    },

    '1082.04': {
      manufacturerLimitations: 'Limitations and precautions shall be transmitted to user and strictly followed',
    },

    '1082.05': {
      standard: 'American National Standards for Occupational Eye and Face Protection Equipment (ANSI Z87.1-1968)',
      note: 'Adopted for design, construction, testing, and use',
    },
  },

  // ===========================================
  // SECTION 1083: RESPIRATORY PROTECTION
  // ===========================================
  respiratoryProtection: {
    section: '1083',

    '1083.01': {
      title: 'Primary Control Measures',
      primaryMeasure: 'Prevent atmospheric contamination through:',
      engineeringControls: [
        'Enclosure or confinement of operation',
        'General and local ventilation',
        'Substitution of less toxic materials',
        'Combination of these',
      ],
      respirators: 'Used when effective engineering controls are not feasible or while being instituted',
      contaminants: ['Dusts', 'Fogs', 'Fumes', 'Mists', 'Gases', 'Smokes', 'Sprays', 'Vapors'],
    },

    '1083.02': {
      employerDuty: 'Furnish appropriate respirators when necessary to protect employee health',
    },

    '1083.03': {
      employeeDuty: 'Use respiratory protection in accordance with instructions',
    },

    '1083.04': {
      title: 'Respiratory Protective Program',
      programElements: [
        'Proper selection of respirators based on hazards',
        'Sufficient instruction and training in proper use and limitations',
        'When practicable, assignment of respirators to individual workers for exclusive use',
        'Regular cleaning and disinfecting (daily for exclusive use, after each use for shared)',
        'Examination and testing of work area conditions to assure allowable exposure maintained',
      ],
    },

    '1083.05': {
      title: 'Selection of Respirators',
      standard: 'American National Standards Practices for Respiratory Protection (ANSI Z88.2-1969)',
      note: 'Adopted for proper selection, design, construction, testing and use',
    },

    '1083.06': {
      title: 'Use of Respirators',
      standardProcedures: 'Develop standard procedures for selection, use and care including emergency uses',
      writtenProcedures: 'Prepare written procedures for safe use in dangerous atmospheres',

      enclosedAtmospheres: {
        requirement: 'Workers in toxic or oxygen-deficient atmosphere shall be assisted by at least one additional worker',
        standbyLocation: 'Stationed in area unaffected by incident',
        equipment: 'Proper rescue equipment',
        communication: 'Visual, voice, or signal line maintained',
      },

      selfContainedApparatus: {
        when: 'Used in atmospheres dangerous to life or health',
        requirement: 'Standby men with suitable rescue equipment',
      },

      airLineRespirators: {
        when: 'In atmospheres hazardous to life or health',
        requirements: [
          'Safety harnesses and safety lines for lifting/removing persons',
          'Standby man with self-contained breathing apparatus at nearest fresh air base',
        ],
      },

      training: 'User shall be properly instructed in selection, use and maintenance',
    },

    '1083.07': {
      title: 'Maintenance and Care of Respirators',
      program: 'Adopted to type of plant, working conditions, and hazards',
      services: [
        'Inspection for defects (including leak check)',
        'Cleaning and disinfecting',
        'Repair and storage',
      ],
    },
  },

  // ===========================================
  // SECTION 1084: HEAD PROTECTION
  // ===========================================
  headProtection: {
    section: '1084',

    '1084.01': {
      title: 'Hard Hats',
      whenRequired: 'Reasonable probability of exposure to:',
      hazards: ['Impact/penetration from falling and flying objects', 'Blows', 'Limited electric shock and burns'],

      specifications: {
        material: 'Non-combustible or slow-burning materials',
        electrical: 'Non-conductor of electricity when used in electrical environment',
        weight: 'Not more than 0.45 kg (16 ounces) total',
        brim: 'Brim all around for head, face, and back of neck protection',
        confinedSpaces: 'Hard hats without brims and low crowns may be allowed only in confined spaces',
        cradle: 'Cradle and sweatband shall be detachable and replaceable',
        moisture: 'Water-proof material for work in excessive moisture',
      },

      standard: 'American National Standards Safety Requirement for Industrial Head Protection (ANSI Z59.1-1969)',
    },

    '1084.02': {
      title: 'Hair Protection',
      requirement: 'All persons with long hair employed around machinery shall completely cover hair',
      protection: 'Well-fitting caps or equivalent protection',
      capMaterial: 'Not easily flammable, sufficiently durable for regular laundering, disinfecting and cleaning',
    },
  },

  // ===========================================
  // SECTION 1085: HAND AND ARM PROTECTION
  // ===========================================
  handAndArmProtection: {
    section: '1085',

    '1085.01': {
      selection: 'Consider hazards to which wearer may be exposed and ease/free movement of fingers',
    },

    '1085.02': {
      prohibition: 'Gloves shall NOT be worn by workers operating drills, punch presses, or other machinery where hand may be caught by moving parts',
    },

    '1085.03': {
      sharpEdgedObjects: 'Tough materials with special reinforcement where necessary',
    },

    '1085.04': {
      hotMetals: 'Suitable heat resisting material',
    },

    '1085.05': {
      electricalWork: 'Rubber or other suitable materials conforming with test requirements on dielectric strength',
    },

    '1085.06': {
      corrosiveSubstances: {
        hazards: 'Acids and caustics',
        materials: ['Natural rubber', 'Synthetic rubber', 'Pliable plastic material resistant to corrosion'],
      },
    },

    '1085.07': {
      toxicSubstances: {
        hazards: 'Toxic, irritating, or infectious substances',
        requirements: [
          'Cover the forearm as much as possible',
          'Close fit at the upper end',
          'Not have the slightest break',
        ],
        tornGloves: 'Replace immediately',
      },
    },
  },

  // ===========================================
  // SECTION 1086: SAFETY BELTS, LIFE LINES AND SAFETY NETS
  // ===========================================
  fallProtection: {
    section: '1086',

    '1086.01': {
      title: 'General Provisions',

      whenRequired: {
        situations: [
          'Unguarded surface above open pits or tanks',
          'Steep slopes',
          'Moving machinery and similar locations',
          'Unguarded surfaces 6 meters (20 ft.) or more above water, ground, or any surface',
          'Exposed to possibility of falls hazardous to life or limb',
        ],
        protection: 'Safety belts and life lines',
        alternative: 'Safety nets when belts and life lines not feasible',
      },

      windowWashers: {
        height: '6 meters (20 ft.) or more above ground',
        requirement: 'Safety belts attached to suitable anchors (unless protected by other means)',
      },

      confinedSpaces: {
        examples: 'Sewer, flue, duct, or other confined places',
        requirements: [
          'Safety belts with life lines attached',
          'Another person stationed at opening',
          'Respond to agreed signals',
        ],
      },

      poleWork: {
        height: '6 meters or more',
        requirement: 'Safety belts',
        noStrapLocation: 'Messenger line shall be installed for strapping safety belt or life line',
      },
    },

    '1086.02': {
      title: 'Requirements',

      safetyBelts: {
        materials: ['Chromed tanned leather', 'Linen or cotton webbing', 'Other suitable materials'],
        width: 'At least 11.5 cm (4.5 in.)',
        thickness: 'At least 0.65 cm (0.25 in.)',
        strength: 'Support 114 kg (250 lbs.) without breaking',
      },

      hardware: {
        strength: 'Approximately equal to full strength of waist band',
        buckles: 'Hold securely without slippage, single insertion through buckle',
      },

      beltAnchors: {
        material: 'Metal machined from bar stock, forged or heat treated',
        strength: 'Support pull of 2,730 kg (6,000 lbs.) without fracture',
        prevention: 'Means to prevent turning, backing off, or becoming loose',
        prohibited: 'Anchor fittings with single thread section merely screwed into reinforcing plates',
        recommendedMetals: ['Nickel copper alloy', 'Stainless steel'],
      },

      lifeLines: {
        manilaRope: 'At least 1.9 cm (0.75 in.) diameter',
        nylonRope: 'At least 1.27 cm (0.5 in.) diameter',
        strength: 'Support 1,140 kg (2,500 lbs.) without breaking',
      },

      safetyNets: {
        meshRopes: 'Not less than 0.94 cm (0.375 in.) diameter',
        borderRopes: 'Not less than 1.90 cm (0.75 in.) diameter (perimeter)',
        material: 'Manila rope or equivalent impact-absorbing material',
        meshSize: 'Not to exceed 15.25 cm (6 in.) on centers',
        attachment: 'Positively and securely attached at each crossing point and border contact',
        supports: 'Sufficient size and strength to catch any falling worker',
        installation: 'Outside and beyond area of possible fall, sufficient height to prevent sagging',
      },

      inspection: {
        frequency: 'Before use and at least once each week thereafter',
        defective: 'Immediately discarded and replaced or repaired before reuse',
      },
    },
  },

  // ===========================================
  // SECTION 1087: SAFETY SHOES
  // ===========================================
  safetyShoes: {
    section: '1087',
    requirement: 'Workers shall be provided with approved safety shoes and leg protection whenever necessary',
    basis: 'Nature of work',
  },

  // ===========================================
  // MODERN PPE TYPES AND STANDARDS (Reference)
  // ===========================================
  ppeTypes: {
    head: {
      equipment: ['Hard hats', 'Bump caps', 'Hair nets'],
      hazards: ['Falling objects', 'Low clearance', 'Machinery entanglement'],
      standards: 'ANSI Z89.1, PS/PSEC (Philippine Standards)',
    },
    eye: {
      equipment: ['Safety glasses', 'Goggles', 'Face shields', 'Welding helmets'],
      hazards: ['Flying particles', 'Chemical splash', 'Radiation (welding arc)'],
      standards: 'ANSI Z87.1',
    },
    hearing: {
      equipment: ['Earplugs', 'Earmuffs'],
      hazards: ['Noise above 85 dB over 8-hour TWA'],
      standards: 'ANSI S3.19',
    },
    respiratory: {
      equipment: ['Dust masks (N95)', 'Half-face respirators', 'Full-face respirators', 'SCBA'],
      hazards: ['Dust', 'Fumes', 'Vapors', 'Oxygen deficiency'],
      standards: 'NIOSH approved',
      special: 'Medical clearance required for respirator users',
    },
    hand: {
      equipment: ['Leather gloves', 'Chemical-resistant gloves', 'Cut-resistant gloves', 'Electrical gloves'],
      hazards: ['Cuts', 'Chemicals', 'Heat', 'Electrical shock'],
      standards: 'ANSI/ISEA 105',
    },
    foot: {
      equipment: ['Steel-toe boots', 'Metatarsal guards', 'Chemical-resistant boots'],
      hazards: ['Falling objects', 'Punctures', 'Chemicals', 'Electrical'],
      standards: 'ASTM F2413',
    },
    body: {
      equipment: ['Coveralls', 'Aprons', 'Chemical suits', 'High-visibility vests'],
      hazards: ['Chemicals', 'Heat', 'Visibility hazards'],
      standards: 'ANSI/ISEA 107 (high-vis)',
    },
    fall: {
      equipment: ['Full body harness', 'Lanyards', 'Lifelines', 'Anchor points', 'Safety nets'],
      hazards: ['Falls from height (6 meters or more per OSHS, 1.8m per modern standards)'],
      standards: 'ANSI Z359.1',
      special: 'Required for work at heights per Rule 1086',
    },
  },

  // ===========================================
  // PPE HIERARCHY
  // ===========================================
  ppeHierarchy: {
    description: 'PPE is the LAST LINE OF DEFENSE',
    controlHierarchy: [
      '1. Elimination - Remove the hazard entirely',
      '2. Substitution - Replace with less hazardous alternative',
      '3. Engineering Controls - Isolate people from hazard',
      '4. Administrative Controls - Change work procedures',
      '5. PPE - Protect individual workers (last resort)',
    ],
  },

  // ===========================================
  // EMPLOYER AND WORKER DUTIES
  // ===========================================
  employerDuties: [
    'Assess workplace for PPE needs',
    'Select appropriate PPE for hazards',
    'Provide PPE at NO COST to workers (per RA 11058)',
    'Ensure proper fit for each worker',
    'Train workers on proper use and limitations',
    'Maintain and replace PPE as needed',
    'Enforce PPE use',
    'Keep records of PPE training and issuance',
  ],

  workerDuties: [
    'Use PPE as required',
    'Attend PPE training',
    'Inspect PPE before use',
    'Care for PPE properly',
    'Report damaged or defective PPE',
    'Not alter PPE without authorization',
  ],

  // ===========================================
  // SPECIAL INDUSTRIES
  // ===========================================
  specialIndustries: {
    construction: {
      mandatory: ['Hard hat', 'Safety boots', 'High-vis vest'],
      heightWork: 'Full body harness above 6 meters (per OSHS) / 1.8m (per DO 198)',
      reference: 'DO 198, s. 2018',
    },
    welding: {
      mandatory: ['Welding helmet', 'Gloves', 'Leather apron', 'Safety boots'],
      eye: 'Filter lens shade based on process',
    },
    chemical: {
      mandatory: ['Chemical-resistant gloves', 'Eye protection', 'Respirator'],
      special: 'Must match chemical hazard (check SDS)',
    },
  },

  // ===========================================
  // KEY SPECIFICATIONS QUICK REFERENCE
  // ===========================================
  keySpecifications: {
    hardHat: {
      maxWeight: '0.45 kg (16 oz)',
      material: 'Non-combustible, non-conductor for electrical',
    },
    safetyBelt: {
      width: '11.5 cm (4.5 in.)',
      thickness: '0.65 cm (0.25 in.)',
      strength: '114 kg (250 lbs.)',
    },
    beltAnchor: {
      strength: '2,730 kg (6,000 lbs.)',
    },
    lifeLine: {
      manila: '1.9 cm (0.75 in.) diameter',
      nylon: '1.27 cm (0.5 in.) diameter',
      strength: '1,140 kg (2,500 lbs.)',
    },
    safetyNet: {
      mesh: '0.94 cm (0.375 in.) diameter',
      border: '1.90 cm (0.75 in.) diameter',
      meshSize: 'Max 15.25 cm (6 in.)',
    },
    fallProtectionHeight: '6 meters (20 ft.)',
  },
};

// Helper functions
export function getPPERequirements(hazardType: string): string[] {
  const hazardMap: Record<string, string[]> = {
    falling_objects: ['Hard hat', 'Safety boots (steel-toe)'],
    chemicals: ['Chemical-resistant gloves', 'Goggles/Face shield', 'Chemical-resistant apron', 'Respirator (if vapors)'],
    noise: ['Earplugs or earmuffs (above 85 dB)'],
    dust: ['N95 mask or respirator', 'Safety glasses'],
    heights: ['Full body harness', 'Lanyard', 'Hard hat', 'Safety belt with life line'],
    welding: ['Welding helmet', 'Leather gloves', 'Leather apron', 'Safety boots'],
    electrical: ['Electrical-rated gloves', 'Safety boots', 'Face shield'],
    construction: ['Hard hat', 'Safety boots', 'High-vis vest', 'Gloves'],
    hot_metals: ['Heat-resistant gloves', 'Face shield', 'Heat-resistant apron'],
    sharp_objects: ['Cut-resistant gloves', 'Safety boots', 'Eye protection'],
    machinery: ['Hair protection (caps)', 'Close-fitting clothing', 'NO loose gloves near moving parts'],
  };

  return hazardMap[hazardType.toLowerCase()] || ['Assess specific hazards to determine PPE'];
}

export function getPPECostResponsibility(): string {
  return `
Per RA 11058 and Rule 1080:
PPE must be provided FREE OF CHARGE by the employer.
Workers cannot be charged for PPE needed for their work.
This includes initial provision, maintenance, and replacement.

Deductions for loss/damage governed by:
- Article 114, Book III, Labor Code
- Section 14, Rule VIII, Book III, Omnibus Rules
  `.trim();
}

export function getFallProtectionRequirements(): object {
  return RULE_1080.fallProtection;
}

export function getRespiratoryProgram(): string[] {
  return RULE_1080.respiratoryProtection['1083.04'].programElements;
}

export function getEyeProtectionRequirements(): string[] {
  return RULE_1080.eyeAndFaceProtection['1082.02'].requirements;
}

export function getGloveProhibition(): string {
  return RULE_1080.handAndArmProtection['1085.02'].prohibition;
}

export function getRule1080Summary(): string {
  return `
Rule 1080 - Personal Protective Equipment Key Points:

EMPLOYER DUTIES:
- Provide PPE at OWN EXPENSE (FREE to workers per RA 11058)
- Ensure PPE is of approved design and appropriate for hazard
- Responsible for adequacy and proper maintenance

FALL PROTECTION (Section 1086):
- Required at 6 meters (20 ft.) or more
- Safety belts: Min 11.5 cm wide, 114 kg strength
- Belt anchors: 2,730 kg strength
- Life lines: Manila 1.9 cm or Nylon 1.27 cm diameter
- Safety nets: Mesh 0.94 cm, border 1.90 cm diameter

HEAD PROTECTION:
- Hard hats: Max 0.45 kg, non-combustible, brim all around
- Hair protection for long hair around machinery

EYE/FACE PROTECTION:
- Standard: ANSI Z87.1
- Options for corrective lens wearers

RESPIRATORY PROTECTION:
- Engineering controls FIRST, then respirators
- Respiratory protective program required
- Standby personnel for confined spaces

HAND PROTECTION:
- NO gloves near drills, punch presses, or machinery with moving parts
- Material matched to hazard (heat, chemical, electrical)

STANDARDS ADOPTED:
- Eye/Face: ANSI Z87.1-1968
- Respiratory: ANSI Z88.2-1969
- Head: ANSI Z59.1-1969
  `.trim();
}
