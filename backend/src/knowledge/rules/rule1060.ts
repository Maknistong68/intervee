// Rule 1060 - Premises of Establishments
// OSHS Original

export const RULE_1060 = {
  ruleNumber: '1060',
  title: 'Premises of Establishments',
  amendments: [],

  // ===========================================
  // SECTION 1060.01: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1060.01',

    signs: {
      requirement: 'Building premises shall have adequate fire, emergency or danger signs and safety instructions',
      specifications: 'Standard colors and sizes visible at all times (per Table II)',
      reference: 'Table II - Standard colors of signs for safety instruction and warnings in building premises',
    },

    vehicleSigns: {
      types: ['STOP', 'YIELD', 'DO NOT ENTER'],
      purpose: 'Direct motorized vehicle drivers within compound',
      placement: 'Properly positioned, especially for night safety',
    },

    handicappedEmployees: {
      restriction: 'Restricted only to designated workplaces',
      facilities: 'Shall be provided with facilities for safe and convenient movement (as far as practicable)',
    },

    housekeeping: {
      requirement: 'Good housekeeping maintained at all times',
      includes: [
        'Cleanliness of building and yards',
        'Cleanliness of machines and equipment',
        'Regular waste disposal',
        'Orderly arrangement of processes, operations, storage, and filing of materials',
      ],
    },

    personalFacilities: {
      comfortRooms: 'Adequate, separate for male and female workers',
      dressingRooms: 'Adequate for female workers',
      lockerRooms: 'Adequate for male workers',
      reference: 'Article 132, Chapter 1, Title III, Book III of the Labor Code',
      standard: 'Number shall conform with Department of Health requirements',
    },
  },

  // ===========================================
  // SECTION 1061: CONSTRUCTION AND MAINTENANCE
  // ===========================================
  constructionAndMaintenance: {
    section: '1061',

    buildings: {
      requirement: 'All buildings (permanent or temporary) shall be structurally safe and sound',
      purpose: 'To prevent collapse',
    },

    roof: {
      requirement: 'Sufficient strength to withstand:',
      loads: ['Normal load', 'Typhoons', 'Strong winds', 'Normal weather conditions', 'Suspended loads (where required)'],
    },

    foundationsAndFloors: {
      requirement: 'Sufficient strength to sustain safely the loads for which they are designed',
      prohibition: 'Under no condition shall they be overloaded',
    },

    planApproval: {
      requirement: 'Plans for new construction, alterations, or substantial repairs shall be submitted to Building Official',
      purpose: 'Examination and approval',
    },
  },

  // ===========================================
  // SECTION 1062: SPACE REQUIREMENT
  // ===========================================
  spaceRequirement: {
    section: '1062',

    workroomHeight: {
      minimum: {
        value: '2.7 meters (8 ft. 10 in.)',
        from: 'Floor to ceiling',
      },
      airConditioned: {
        allowedMinimum: '2.4 meters (7 ft. 10 in.)',
        condition: 'Air-conditioned and process allows free movement',
      },
    },

    personsPerArea: {
      maximum: '1 person per 11.5 cubic meters (400 cu. ft.)',
      calculation: 'No deductions for benches, furniture, machinery, or materials',
      heightLimit: 'Heights exceeding 3 meters (9 ft. 10 in.) shall not be included',
    },

    machinerySpacing: {
      requirement: 'Adequate spaces between machinery/equipment for:',
      purposes: ['Normal operation', 'Maintenance or repair', 'Free flow of materials'],
      minimumPassageway: '60 cm (24 in.) minimum between machinery/equipment',
    },
  },

  // ===========================================
  // SECTION 1063: WALKWAY SURFACE
  // ===========================================
  walkwaySurface: {
    section: '1063',

    stumblingHazards: {
      subsection: '1063.01',
      floorRequirement: 'Sufficiently even to afford safe walking and safe trucking of materials',
      mustBeFreeFrom: [
        'Holes and splinters',
        'Improperly fitted gutters or conduits',
        'Protruding nails and bolts',
        'Projecting valves or pipes',
        'Other projections or obstructions',
      ],
    },

    slippingHazards: {
      subsection: '1063.02',
      floorRequirement: 'Floors, stair-treads and landings shall not be slippery under any condition',
      materialRequirement: 'Not made of material which will become slippery through wear',
      nonSlipRequired: ['Stairways', 'Ramps', 'Elevator platforms', 'Similar hazardous places'],
    },
  },

  // ===========================================
  // SECTION 1064: FLOOR AND WALL OPENING
  // ===========================================
  floorAndWallOpening: {
    section: '1064',

    ladderwayOpening: {
      subsection: '1064.01',
      guarding: 'Permanent railings and toeboards on all exposed sides (except entrance)',
      passage: 'Barrier or gate so arranged that person cannot walk directly through opening',
    },

    stairwayOpening: {
      subsection: '1064.02',
      guarding: 'Permanent railings and toeboards on all exposed sides (except entrance)',
      infrequentUse: 'Flush-hinged covers with attached railings (one side exposed when open)',
      hatchways: 'Removable railings with toeboards (max 2 sides) + permanent railings on other sides, OR flush-hinged covers',
    },

    manholes: {
      subsection: '1064.03',
      covers: 'Adequate strength, need not be hinged',
      whenNotInPlace: 'Constantly attended or protected by portable enclosing railings',
      fixedMachinery: 'Covers with openings max 2.5 cm (1 in.) width, securely held',
    },

    wallOpenings: {
      subsection: '1064.03(5-6)',
      heightFromFloor: 'Less than 1 meter (3.3 ft.)',
      minimumHeight: '75 cm (30 in.)',
      minimumWidth: '45 cm (18 in.)',
      dropMore: '2 meters (6.6 ft.)',
      requirement: 'Solidly enclosed or guarded by barriers (min 100 kg load capacity)',
    },

    railingConstruction: {
      subsection: '1064.04',
      materials: ['Wood', 'Pipe', 'Structural metal', 'Other material of sufficient strength'],
      height: 'At least 1 meter (3.3 ft.) from floor to top rail',
      postSpacing: 'Not more than 2 meters (6.6 ft.) apart',
      intermediateRail: 'Halfway between top rail and floor',
      loadCapacity: 'Min 100 kg (220 lbs.) from any direction',
      specifications: {
        wood: 'Top rails/posts: min 5 cm x 10 cm (2 in. x 4 in.); Intermediate: min 5 cm x 5 cm or 2 cm x 10 cm',
        pipe: 'Top rails/posts: min 30 mm (1 in.) diameter',
        structuralMetal: 'Top rails/posts: min 38 mm x 38 mm x 5 mm angle iron; Intermediate: min 32 mm x 32 mm x 3 mm',
      },
    },

    toeboardConstruction: {
      subsection: '1064.05',
      height: 'At least 15 cm (6 in.)',
      materials: ['Wood', 'Iron', 'Steel', 'Other equivalent material'],
      clearance: 'Not more than 6 mm (0.3 in.)',
    },
  },

  // ===========================================
  // SECTION 1065: STAIRS
  // ===========================================
  stairs: {
    section: '1065',

    strength: {
      subsection: '1065.01',
      liveLoad: 'Min 490 kg/m² (100 lbs/ft²)',
      safetyFactor: 4,
    },

    width: {
      subsection: '1065.02',
      minimum: '1.10 meters (3 ft. 7 in.) clear of obstructions (except handrails)',
      withoutHandrails: 'Not less than 90 cm (35 in.)',
      serviceStairs: '56 cm (22 in.) minimum',
    },

    pitch: {
      subsection: '1065.03',
      normalRange: '30° to 38° from horizontal',
      absoluteRange: 'Not less than 20° or more than 45°',
      lessThan20: 'Install a ramp',
      moreThan45: 'Provide fixed ladder',
      serviceStairs: 'Max 60°',
    },

    height: {
      subsection: '1065.04',
      maxBetweenLandings: '3.6 meters (12 ft.)',
    },

    headroom: {
      subsection: '1065.05',
      minimum: '2.0 meters (6 ft. 7 in.) vertical clearance from top of tread',
    },

    treadsAndRisers: {
      subsection: '1065.06',
      treadWidth: 'Min 25 cm (9 in.) exclusive of nosing',
      riserHeight: 'Max 20 cm (8 in.)',
      consistency: 'No variation in width of treads and height of risers in any flight',
      serviceStairs: 'Tread min 15 cm (6 in.)',
    },

    railings: {
      subsection: '1065.07',
      when: '4 or more risers',
      enclosedStairs: {
        lessThan112cm: 'At least one handrail (preferably right side descending)',
        moreThan112cm: 'One stair railing each open side + one handrail each enclosed side',
      },
      height: '80 cm to 90 cm (31 in. to 35 in.) from tread surface',
      handrailSize: {
        wood: 'Min 5 cm x 5 cm (2 in. x 2 in.)',
        pipe: '2.54 cm to 6.75 cm (1 in. to 2.5 in.) diameter',
      },
      bracketSpacing: 'Max 2 meters (6 ft. 6 in.) apart',
      wallClearance: 'Min 4 cm (1.5 in.)',
      loadCapacity: 'Min 100 kg (220 lbs.) from any direction',
      continuous: 'Throughout flight and at landings without obstruction',
    },

    ramps: {
      subsection: '1065.07(13-14)',
      maxRise: '1 in 10',
      heavyStress: 'Additional strength with heavier stock, closer post spacing, bracing',
      safetyFactor: 4,
    },
  },

  // ===========================================
  // SECTION 1066: WINDOW OPENINGS
  // ===========================================
  windowOpenings: {
    section: '1066',
    atStairLandings: {
      whenWidth: 'More than 30 cm (12 in.)',
      whenSill: 'Less than 1.9 m (6 ft.) above landing',
      requirement: 'Guard securely by bars, slats, or grills to prevent falling through',
    },
  },

  // ===========================================
  // SECTION 1067: FIXED LADDERS
  // ===========================================
  fixedLadders: {
    section: '1067',

    materials: ['Steel', 'Wrought iron', 'Malleable cast iron', 'Other equivalent strength materials'],

    installation: {
      climbingSideClearance: {
        at75degrees: 'Min 90 cm (35 in.) from center of rungs',
        at90degrees: 'Min 75 cm (30 in.) from center of rungs',
      },
      backClearance: 'Min 15 cm (6 in.) from back of rungs',
      sideClearance: 'Min 20 cm (8 in.) from either side (except caged ladders)',
      maxPitch: '90° (no fixed ladders over 90°)',
    },

    heightOver9m: {
      applies: 'Heights exceeding 9 meters (30 ft.)',
      requirements: [
        'Landing platform for each 6 meters (20 ft.) or fraction thereof',
        'Ladder sections shall be staggered',
        'If (a) or (b) not practical: ladders with cages, baskets, or equivalent guards',
      ],
    },
  },

  // ===========================================
  // SECTION 1068: OVERHEAD WALKS, RUNWAYS AND PLATFORMS
  // ===========================================
  overheadWalksRunwaysPlatforms: {
    section: '1068',

    heightThreshold: '2 meters (6.6 ft.) or more above floor/ground',
    requirement: 'Standard railings and toeboards on all open sides',
    exception: 'Platforms for motors or similar equipment not affording standing space',

    fillingTankCars: {
      railingExemption: 'One side may be omitted if necessary',
      minimumWidth: '56 cm (22 in.)',
    },

    overConveyors: 'Standard railings and toeboards on all open sides',
  },

  // ===========================================
  // SECTION 1069: YARDS
  // ===========================================
  yards: {
    section: '1069',

    surface: {
      subsection: '1069.01',
      requirements: [
        'Properly drained and graded',
        'Facilitate safe access to buildings',
        'Facilitate safe handling of materials and equipment',
        'Properly covered drain pools and catch basins where necessary',
        'Ditches, pits, and hazardous openings with adequate covers, enclosed or surrounded by guards',
        'Walkways, roadways, railroad tracks laid out to avoid dangerous grade crossings',
      ],
    },

    walkways: {
      subsection: '1069.02',
      requirements: [
        'Constructed along shortest line between important points',
        'Not located under eaves where may become slippery',
        'Bridges or underpasses where pedestrians cross railroad tracks or vehicular roadways',
        'Track/roadway fenced to prevent direct crossing at such points',
        'Unauthorized persons not allowed to walk along railroad tracks',
        'Railings on bridges, steep slopes, slippery places, and where vehicles may injure pedestrians',
      ],
    },

    roadways: {
      subsection: '1069.03',
      requirements: [
        'Soundly constructed with good wearing surfaces',
        'Adequate width for two-way traffic: 2x widest vehicle + 1.25 m (4 ft.)',
        'Sufficient overhead clearance',
        'Protected grade/level crossings',
        'Adequate railings or walls along bridges, slopes, and sharp curves',
      ],
    },

    gates: {
      subsection: '1069.04',
      requirements: [
        'Separate entrance/exit gates for pedestrian, vehicular, and railroad traffic',
        'Pedestrian gates at safe distance from vehicular/railroad gates',
        'Sufficient width for rush hour traffic',
        'Located to avoid crossing vehicular or railroad traffic',
      ],
    },

    parkingVehicles: {
      subsection: '1069.05',
      regulations: [
        'Entry and exit driveways',
        'Speed limits',
        'Space allotments',
        'Methods of parking',
      ],
      enforcement: 'Strictly enforced',
    },
  },

  // ===========================================
  // QUICK REFERENCE - KEY MEASUREMENTS
  // ===========================================
  keyMeasurements: {
    workroomHeight: '2.7 m minimum (2.4 m if air-conditioned)',
    spacePerPerson: '11.5 cubic meters (400 cu. ft.) per person',
    machineryPassageway: '60 cm (24 in.) minimum',
    railingHeight: '1 meter (3.3 ft.)',
    railingPostSpacing: '2 meters (6.6 ft.) maximum',
    toeboardHeight: '15 cm (6 in.) minimum',
    stairWidth: '1.10 m minimum (90 cm without handrails)',
    stairPitch: '30° to 38° (20° to 45° absolute)',
    maxStairHeight: '3.6 m between landings',
    headroom: '2.0 m minimum',
    treadWidth: '25 cm minimum',
    riserHeight: '20 cm maximum',
    handrailHeight: '80 cm to 90 cm',
    ladderLandingInterval: 'Every 6 m for heights over 9 m',
    overheadPlatformThreshold: '2 m above floor',
    twoWayRoadWidth: '2x widest vehicle + 1.25 m',
  },
};

// Helper functions
export function getStairRequirements(): object {
  return {
    width: RULE_1060.stairs.width,
    pitch: RULE_1060.stairs.pitch,
    height: RULE_1060.stairs.height,
    headroom: RULE_1060.stairs.headroom,
    treadsAndRisers: RULE_1060.stairs.treadsAndRisers,
    railings: RULE_1060.stairs.railings,
  };
}

export function getRailingSpecifications(): object {
  return RULE_1060.floorAndWallOpening.railingConstruction;
}

export function getSpaceRequirements(): object {
  return RULE_1060.spaceRequirement;
}

export function getKeyMeasurement(item: string): string {
  const measurements = RULE_1060.keyMeasurements as Record<string, string>;
  return measurements[item] || 'Measurement not found';
}

export function getFixedLadderRequirements(): object {
  return RULE_1060.fixedLadders;
}

export function getYardRequirements(): object {
  return RULE_1060.yards;
}

export function getRule1060Summary(): string {
  return `
Rule 1060 - Premises of Establishments Key Points:

SPACE REQUIREMENTS:
- Workroom height: Min 2.7 m (2.4 m if air-conditioned)
- Space per person: 11.5 cubic meters
- Passageway between machinery: Min 60 cm

STAIRS:
- Width: Min 1.10 m (90 cm without handrails)
- Pitch: 30° to 38° (ramp if <20°, ladder if >45°)
- Max height between landings: 3.6 m
- Headroom: Min 2.0 m
- Tread: Min 25 cm, Riser: Max 20 cm
- Handrails required for 4+ risers

RAILINGS:
- Height: 1 meter from floor
- Posts: Max 2 m apart
- Intermediate rail halfway
- Load capacity: 100 kg from any direction
- Toeboards: Min 15 cm height

FIXED LADDERS:
- Max pitch: 90°
- Over 9 m: Landing every 6 m OR staggered sections OR cages

PLATFORMS/RUNWAYS:
- 2 m+ above floor: Railings and toeboards required

HOUSEKEEPING:
- Clean buildings, yards, machines
- Regular waste disposal
- Orderly arrangement
  `.trim();
}
