// Rule 1140 - Explosives
// OSHS Original + Fire Code of the Philippines

export const RULE_1140 = {
  ruleNumber: '1140',
  title: 'Explosives',
  amendments: [],
  relatedLaw: 'Fire Code of the Philippines (Rule 20 on Storage of Explosives adopted)',

  // ===========================================
  // SECTION 1141: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1141',

    scope: {
      subsection: '1141.01',
      applies: 'Manufacture, handling, and storage of explosives, fireworks, and other pyrotechnic products',
    },

    transportation: {
      subsection: '1141.02',
      rule: 'Fire Code of the Philippines applies for transportation outside plant site',
    },

    adopted: {
      subsection: '1141.03',
      rule: 'Rule 20 of Fire Code of the Philippines on Storage of Explosives is adopted',
    },
  },

  // ===========================================
  // SECTION 1142: DEFINITIONS
  // ===========================================
  definitions: {
    section: '1142',

    explosives: 'Any chemical compound or substance intended for producing an explosion, or containing oxidizing/combustible units that ignition by fire, friction, concussion, or detonation may produce explosion capable of causing injury or damage',

    inhabitedBuilding: 'Building regularly occupied as habitation, including church, school, railroad station, store, or other public assembly places (except buildings in explosive plants)',

    explosivesPlant: 'All lands and buildings used for manufacturing, processing, or storage of explosives, including premises where explosives are used as component in manufacturing',

    factoryOrExplosiveBuilding: 'Building (except magazines) where explosives are manufactured or processes involving explosives are carried on',

    magazine: 'Building or structure (other than factory building) used exclusively for storage of explosives',

    railway: 'Any steam, diesel, electric or other railroad or railway for public use',

    highway: 'Any public street, alley, road, or navigable stream used for transport',

    barricaded: 'Building containing explosives is effectively screened from other structures by natural or artificial barricade of such height that a straight line from eave line to point 3.70 m (12 ft.) above center of railway/highway will pass through the barricade',

    naturalBarricade: 'Natural ground features or timber of sufficient density that surrounding exposures cannot be seen from magazine when trees are without leaves',

    artificialBarricade: 'Artificial mound or revetted wall of earth of minimum thickness 1 m (3.3 ft.)',
  },

  // ===========================================
  // SECTION 1143: AUTHORIZATION
  // ===========================================
  authorization: {
    section: '1143',
    requirements: [
      'Explosives shall be manufactured, handled, or stored only in approved places',
      'Buildings for explosive manufacture shall not be used for any other purpose',
      'Special precautions for primary or initiating explosives',
    ],
  },

  // ===========================================
  // SECTION 1144: LIMITATIONS
  // ===========================================
  limitations: {
    section: '1144',

    classification: {
      explosivesBuildings: 'Buildings where explosives are manufactured, handled, used, or temporarily stored',
      magazine: 'Buildings where finished explosives are kept/stored for more than 48 hours',
    },

    workroomStorage: {
      maxQuantity: '45 kg (100 lbs.) for 8-hour work',
      rule: 'Only this quantity at any one time, suitably protected',
      resupply: 'Additional supply from magazine after first 45 kg is processed',
    },

    magazineMaximum: {
      explosives: '136,360 kg (300,000 lbs.)',
      blastingCaps: '20,000,000 caps',
    },

    prohibited: 'Explosives shall NOT be stored in dwellings, schools, theaters, or public assembly places',
  },

  // ===========================================
  // SECTION 1145: QUANTITY AND DISTANCE TABLES
  // ===========================================
  distanceTables: {
    section: '1145',
    reference: 'Rule 1141.03 (Fire Code) and Table 15',

    precautions: [
      'Not applicable to transportation, handling, or temporary storage',
      'Not applicable to bombs, projectiles, or heavily encased explosives',
      'If NOT barricaded: distances shall be DOUBLED',
      'Multiple magazines: Each must comply with minimum distances',
      'If magazines closer than specified: Treated as single magazine with combined quantity',
    },

    intraPlantTable: 'Table 15 for factory buildings and magazines within explosives plants',
    barricadeReduction: 'If effectively barricaded, distances may be reduced by ONE HALF',
  },

  // ===========================================
  // SECTION 1146: STORAGE OF EXPLOSIVES
  // ===========================================
  storage: {
    section: '1146',

    classI: {
      subsection: '1146.01',
      capacity: 'Over 22.5 kg (50 lbs.) of explosives',
      openings: 'Only for ventilation and entrance',
      construction: 'Masonry, metal, or combination',

      specifications: {
        doors: {
          size: '1 m (3.28 ft.) wide x 1.8 m (6 ft.) high',
          construction: 'At least 3 layers of hardwood (2.5 cm/1 in.) covered with No. 20 gauge steel',
          bulletproof: 'Min 1 cm (3/8 in.) steel sheet',
          rule: 'Keep closed and locked except for storage/removal or authorized entry',
        },
        signs: {
          text: 'EXPLOSIVE KEEP OFF',
          letterHeight: 'Not less than 15 cm (6 in.)',
          placement: 'NOT on magazine - located so bullet through sign will not strike magazine',
        },
        walls: {
          wood: '5 cm x 10 cm studding with plank, covered with No. 26 gauge galvanized iron/steel, lined inside with tongued and grooved reefers, space filled with dry coarse sand or weak cement mortar',
          brick: '20 cm (8 in.) thickness, medium soft variety, laid in cement mortar (max 25% lime)',
          concrete: '15 cm (6 in.) thickness, 9 parts sand to 1 part cement',
          cementBlock: '20 cm (8 in.) hollow block, 7 parts sand to 1 part cement, spaces filled with dry coarse sand',
          fabricatedMetal: 'No. 14 gauge metal, walls lined with 10 cm brick or 15 cm sand fill',
        },
        nails: 'All heads countersunk, no spark-producing metal exposed inside',
        roof: 'Bullet-proof sand roof with 10 cm (4 in.) dry coarse sand',
        ventilation: '3 cm space at floor and ceiling, foundation ventilators max 150 cm (5 ft.) spacing, screened',
      },
    },

    classII: {
      subsection: '1146.02',
      capacity: 'Not more than 22.5 kg (50 lbs.) of explosives',
      construction: 'Wood, metal, or combination (box within box with 12.5 cm/5 in. sand fill)',

      specifications: {
        outerBox: 'Tongued and grooved lumber (2.5 cm) with No. 24 gauge iron sheet outside',
        innerBox: 'Surfaced inside, no exposed nail/bolt/screw heads',
        sandFill: 'Dry coarse sand (not gravel or crushed rock)',
        ventilation: '0.625 cm x 5 cm notches at top, spaced 0.33 m apart',
        setting: 'Level, on wooden sills/bricks/piers, bottom 15 cm off ground',
        signs: 'MAGAZINE-EXPLOSIVE-DANGEROUS at each end, on top, and on barricades',
      },
    },

    temporaryStorage: {
      subsection: '1146.03',
      over11_4kg: 'At least 45 m (150 ft.) from work site',
      under11_4kg: 'At least 15 m (50 ft.) from work site',
      portableMagazines: '5 cm (2 in.) hardwood or 7.5 cm (3 in.) softwood, braced corners, sheet metal exterior',
    },
  },

  // ===========================================
  // SECTION 1146.05-1146.10: GENERAL PRECAUTIONS
  // ===========================================
  generalPrecautions: {
    employees: {
      subsection: '1146.05',
      rule: 'Limited to minimum requirements of manufacturing',
    },

    admission: {
      subsection: '1146.06',
      fencing: 'Plants shall be fenced',
      visitors: 'Only authorized employees, enforcement officers, or accompanied visitors with permission',
      records: 'Record of visits kept on file, signed by visitor and owner/representative',
    },

    planApproval: {
      subsection: '1146.07',
      submitTo: 'Integrated National Police, copy to Regional Labor Office',
      required: [
        'Maps/plans/sketches of topographical site (scale 1:2000 m)',
        'Location of buildings, highways, barricades',
        'Plans and specifications of magazines/buildings (scale 1:50 m)',
      ],
    },

    certificates: {
      subsection: '1146.08',
      required: 'Certificate of safety inspection from Regional Office',
      validity: '1 year from date issued, renewable annually',
    },

    handlingAndHousekeeping: {
      subsection: '1146.09(1)',
      openingPackages: {
        distance: 'Not within 15 m (50 ft.) of any magazine',
        tools: 'Only wooden, rubber, rawhide, fiber, zinc, or babbitt mallet and wood wedge',
      },
      premises: 'Keep free from bush, dry grass for at least 7.5 m (25 ft.) around',
      access: 'Only authorized persons',
    },

    lighting: {
      subsection: '1146.09(2)',
      prohibited: 'No open or naked lights (lanterns, stoves, torches) in manufacturing areas',
      portable: 'Electric safety flashlights or electric safety lanterns only',
      magazines: 'Only approved portable electric dry cell battery lamps or lanterns',
      electric: 'Conduit or lead-encased cables, vapor-proof lamps, switches/fuses located away',
      motors: 'Only sparkless induction type',
    },

    materials: {
      subsection: '1146.09(3)',
      rule: 'Keep clear of unnecessary tools, refuse, debris',
      prohibition: 'Shall not be used as temporary storehouse or for other materials',
    },

    matches: {
      subsection: '1146.09(4)',
      prohibition: 'Workers shall not carry matches or flame-producing devices',
      exception: 'Written authorization from plant superintendent, only safety matches, properly recorded',
    },

    clothing: {
      subsection: '1146.09(5)',
      shoes: 'Rubber-soled, no iron/steel nails, no metal attachments',
      shoeCleaners: 'Suitable device at each entrance to clean shoes',
    },

    lockerHouse: {
      subsection: '1146.09(6)',
      required: 'Suitable change or locker houses for washing and changing clothes',
      prohibition: 'No lockers in explosives buildings',
    },

    transportation: {
      subsection: '1146.09(7)',
      trucks: 'Side or end rails/guards to prevent materials from slipping off',
      inspection: 'Daily inspection by plant foreman',
      machinery: 'All dangerous machinery and moving parts shall be guarded',
      wheels: 'Non-sparking materials for wheels and rails inside explosives buildings',
    },

    handCarrying: {
      subsection: '1146.09(8)',
      interval: 'At least 1 minute in time OR 30 m (110 ft.) in distance between carriers',
    },

    cleanliness: {
      subsection: '1146.09(9)',
      spills: 'Clean immediately',
      floors: 'Free from cracks, no projecting iron/steel nails',
    },
  },

  // ===========================================
  // SECTION 1146.10: LIGHTNING PROTECTION
  // ===========================================
  lightningProtection: {
    subsection: '1146.10',

    electricConduits: 'Lightning arresters installed outside buildings for all electric conduits and circuits',

    smallMagazines: {
      capacity: '2,270 kg (5,000 lbs.) or less',
      conductor: '2 cm x 0.3 cm copper tape on vertical pole',
      distance: 'Not less than 1.2 m (4 ft.) from magazine',
      height: 'At least 3 m (10 ft.) higher than highest point of magazine',
      groundRod: 'Copper rod 2 cm diameter, driven at least 3 m (10 ft.) deep',
      resistance: 'Less than 10 ohms',
    },

    largeMagazines: {
      capacity: 'Over 2,270 kg (5,000 lbs.)',
      masts: 'At each end of longer axis, at least 0.33 m from magazine',
      aerial: 'Copper tape suspended between masts, at least 3 m higher than magazine',
      groundRods: 'Same as small magazines',
    },
  },

  // ===========================================
  // SECTION 1147: RECORDS
  // ===========================================
  records: {
    section: '1147',
    requirement: 'Accurate journal or record of all purchases, sales, and dispositions',
    mustShow: [
      'Names and addresses of persons to whom sold/disposed',
      'Name of person to whom delivered',
      'Nature of business of persons receiving',
    ],
    submitTo: 'Integrated National Police and Regional Labor Office',
  },

  // ===========================================
  // QUICK REFERENCE
  // ===========================================
  quickReference: {
    classIMagazine: 'Over 22.5 kg (50 lbs.)',
    classIIMagazine: 'Up to 22.5 kg (50 lbs.)',
    workroomLimit: '45 kg (100 lbs.) for 8-hour work',
    magazineMax: '136,360 kg or 20 million blasting caps',
    storageDuration: 'Over 48 hours = Magazine classification',
    signLetterHeight: '15 cm (6 in.) minimum',
    premisesClearance: '7.5 m (25 ft.) from vegetation',
    packageOpening: '15 m (50 ft.) from magazine',
    carrierInterval: '1 minute OR 30 m (110 ft.)',
    temporaryStorage: '45 m (over 11.4 kg) or 15 m (under 11.4 kg) from work site',
    certificateValidity: '1 year, renewable annually',
    unbarricaded: 'DOUBLE all distances',
    barricaded: 'May reduce distances by HALF',
    lightningResistance: 'Less than 10 ohms to earth',
  },
};

// Helper functions
export function getMagazineClass(quantity: number): string {
  if (quantity > 22.5) return 'Class I Magazine (masonry/metal construction required)';
  return 'Class II Magazine (box-within-box with sand fill)';
}

export function getTemporaryStorageDistance(quantity: number): string {
  if (quantity > 11.4) return '45 m (150 ft.) minimum from work site';
  return '15 m (50 ft.) minimum from work site';
}

export function getExplosivesDefinitions(): object {
  return RULE_1140.definitions;
}

export function getStorageRequirements(magazineClass: string): object {
  if (magazineClass.toLowerCase().includes('i') && !magazineClass.toLowerCase().includes('ii')) {
    return RULE_1140.storage.classI;
  }
  return RULE_1140.storage.classII;
}

export function getGeneralPrecautions(): object {
  return RULE_1140.generalPrecautions;
}

export function getRule1140Summary(): string {
  return `
Rule 1140 - Explosives Key Points:

CLASSIFICATIONS:
- Class I Magazine: Over 22.5 kg (50 lbs.) - masonry/metal construction
- Class II Magazine: Up to 22.5 kg (50 lbs.) - box-in-box with sand fill
- Explosives Building: Where explosives are manufactured/handled
- Magazine: Storage for more than 48 hours

LIMITS:
- Workroom: Max 45 kg (100 lbs.) for 8-hour work
- Magazine: Max 136,360 kg or 20 million blasting caps
- PROHIBITED: Storage in dwellings, schools, theaters, public places

DISTANCES:
- Not barricaded: DOUBLE all distances
- Effectively barricaded: May reduce by HALF
- Temporary (>11.4 kg): Min 45 m from work site
- Temporary (≤11.4 kg): Min 15 m from work site
- Package opening: Min 15 m from magazine
- Carrier interval: Min 1 minute OR 30 m

SIGNS:
- Class I: "EXPLOSIVE KEEP OFF"
- Class II: "MAGAZINE-EXPLOSIVE-DANGEROUS"
- Letters: Min 15 cm (6 in.) height
- Placement: NOT on magazine (bullet safety)

PRECAUTIONS:
- Rubber-soled shoes, no metal
- No open lights/flames
- No matches (unless written authorization)
- Daily machinery inspection
- Non-sparking wheel treads
- Clear vegetation 7.5 m around

CERTIFICATES:
- Safety inspection certificate required
- Valid 1 year, renewable annually
- Submit plans to INP, copy to Regional Labor Office
  `.trim();
}
