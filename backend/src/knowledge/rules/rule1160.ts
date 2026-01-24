// Rule 1160 - Boiler
// OSHS Original

export const RULE_1160 = {
  ruleNumber: '1160',
  title: 'Boiler',
  amendments: [],
  relatedLaw: 'R.A. 8495 - The Philippine Mechanical Engineering Act of 1998',

  // ===========================================
  // SECTION 1161: DEFINITIONS
  // ===========================================
  definitions: {
    section: '1161',

    steamBoiler:
      'Any closed vessel wherein steam or other vapor is or is intended to be generated above atmospheric pressure by the application of fire, by the product of combustion, by electrical means, or by other heat source',

    powerBoiler: 'A steam boiler with a working pressure exceeding 1.055 kg/cm2 gauge (15 psig)',

    miniatureBoiler: {
      description: 'A power boiler which does not exceed any of the following limits',
      limits: {
        insideDiameter: '40.5 cm (16 in.) inside diameter of shell',
        overallLength: '106.5 cm (42 in.) overall length of the shell',
        waterHeatingSurface: '1.85 m² (20 ft²) water heating surface',
        maxWorkingPressure: '7.03 kg/cm² (100 psig) maximum allowable working pressure',
      },
    },

    lowPressureHeatingBoiler:
      'A steam boiler used exclusively for operation at a pressure not exceeding 1.055 kg/cm² (15 psig) or a temperature not exceeding 121°C (250°F)',

    hotWaterBoiler:
      'A vessel completely filled with water and is intended to be heated above atmospheric pressure by the application of fire or such products of combustion, by electrical means, or other heat source',

    workingPressure: 'Gauge pressure above atmospheric pressure in kg/cm² (psig)',

    boilerHorsepower: {
      description: "In the absence of Manufacturer's Data",
      verticalTube: '0.95 sq. m. (10 sq. ft.) of heating surface',
      otherTypes: '0.46 sq. m. (5 sq. ft.) of heating surface',
    },
  },

  // ===========================================
  // SECTION 1162: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1162',

    permitRequirement: {
      subsection: '1162(1)',
      rule: 'No boiler shall be installed and/or operated in the Philippines without the permit issued by the Secretary of Labor or authorized representative',
    },

    newBoilerApplication: {
      subsection: '1162(2)',
      submitTo: 'Bureau or Regional Office with available PME',
      copies: 5,
      requirements: [
        "Manufacturer's data sheets",
        'Working drawings',
        'Foundation design computation',
        'Installation and location plans',
      ],
    },

    localFabrication: {
      subsection: '1162(3)',
      submitTo: 'Bureau or Regional Office',
      copies: 5,
      requirements: ['Design drawings', 'Computations', 'Specifications'],
    },

    majorRepairs: {
      subsection: '1162(4)',
      approval: 'Bureau or Regional Office must approve details and design plan',
      postRepair: 'Boiler shall not be operated without permit from Secretary',
    },

    ownershipTransfer: {
      subsection: '1162(5)',
      deadline: '30 days after sale or transfer',
      reportTo: 'Bureau or Regional Office by old and new owners',
      rule: 'Boiler shall not be operated without required permit',
    },

    portablePressureVessels: {
      subsection: '1162(6)',
      rule: 'Operating permit issued by Secretary shall be honored nationwide during permit period',
    },

    personnelRequirement: {
      subsection: '1162(7)',
      reference: 'Section 36, Article IV of R.A. 8495 (The Philippine Mechanical Engineering Act of 1998)',
    },
  },

  // ===========================================
  // SECTION 1162.01: STANDARDS REQUIREMENTS
  // ===========================================
  standards: {
    subsection: '1162.01',
    purpose: 'Fabrication, inspection, checking, test and other consideration',
    adoptedStandards: [
      { code: 'ASME', name: 'Boiler and Pressure Vessel Code' },
      { code: 'ASME', name: 'Code for Pressure Piping' },
      { code: 'API', name: 'Code for Petroleum Gases and Liquids' },
      { code: 'ISO', name: 'ISO Code' },
      { code: 'PSME', name: 'Philippine Society of Mechanical Engineers Code' },
    ],
  },

  // ===========================================
  // SECTION 1162.02: INSPECTION OF BOILERS
  // ===========================================
  inspection: {
    subsection: '1162.02',

    phases: [
      {
        phase: 'a',
        description: 'During construction/fabrication if manufactured in the Philippines',
        hydrostaticTest: '1.5 times the design pressure',
      },
      {
        phase: 'b',
        description: 'Before being placed into service after completion of installation',
        hydrostaticTest: '1.5 times the design pressure',
      },
      {
        phase: 'c',
        description: 'Before being placed into service after reconstruction or repair',
        hydrostaticTest: '1.2 times the maximum working or operating pressure',
      },
      {
        phase: 'd',
        description: 'Periodically',
        interval: 'Not exceeding 12 months',
      },
    ],

    annualInspectionNotice: {
      timing: '30 days before permit expiration',
      preparation: 'Boiler drained, cooled, opened-up and thoroughly cleaned',
      equipment: 'Hydrostatic pump ready',
    },

    hydrostaticTest: {
      testPressure: '1.2 times the maximum working or operating pressure',
      waterTemperature: {
        minimum: '21°C (70°F)',
        maximum: '71°C (160°F)',
      },
      pressureControl: 'Reach required test pressure gradually, not exceed by more than 6%',
      safetyValves: 'Remove and hold down by testing clamps, NOT by screwing down compression screw',
    },

    alternativeTests: [
      'Radiographic',
      'Ultrasonic',
      'Thickness gauging',
      'Magnetic particle',
      'Liquid penetrant',
      'Other equivalent non-destructive test',
    ],

    unsafeBoilers: 'Shall not be operated until defects corrected and fittings in good condition',
  },

  // ===========================================
  // SECTION 1162.03: AGE LIMIT OF LAP-RIVETED BOILERS
  // ===========================================
  ageLimits: {
    subsection: '1162.03',
    horizontalReturnTubular: {
      pressureThreshold: '3.5 kg/cm²g (50 psig)',
      ageLimit: '25 years',
    },
    discontinuation: 'No riveted joint boiler shall be discontinued solely on account of age',
    gracePeriod: '5 years after effectivity of Standards',
    requirements: [
      'Lap-joints thoroughly investigated for cracks',
      'Boiler hydrostatically tested at 1.2 times working pressure',
      'General condition warrants further use',
      'Total service age not more than 25 years',
    ],
  },

  // ===========================================
  // SECTION 1162.04: CONSTRUCTION OF STEAM BOILERS
  // ===========================================
  construction: {
    subsection: '1162.04',
    standards: 'Rule 1162.01 standards requirements',
    requirements: [
      'Designed to adopt to the condition of their use',
      'Constructed of sufficient strength to sustain internal pressure',
    ],
  },

  // ===========================================
  // SECTION 1162.05: BOILER RECORDS
  // ===========================================
  records: {
    subsection: '1162.05',

    newBoiler: {
      certificate: 'Technical specifications, design standards, dimensions, maker\'s nameplate',
    },

    secondHandBoiler: {
      requirements: [
        'Detailed working drawings',
        'Certificates by PME with:',
        '- Ultimate tensile stress not exceeding 3,873 kg/cm² (55,000 psi)',
        '- Joint efficiency not more than 90% for radiographed and heat-treated butt fusion weld',
        '- Factor of safety not less than 5',
      ],
    },

    certificates: {
      contents: 'Results of all control tests during manufacture and construction',
      storage: 'Kept on file by owner, ready for inspection',
    },

    maintenanceRegister: {
      required: true,
      contents: 'Dates of all tests, internal and external inspections, replacements and repairs',
    },
  },

  // ===========================================
  // SECTION 1163: POWER BOILERS
  // ===========================================
  powerBoilers: {
    section: '1163',

    boilerRooms: {
      subsection: '1163.01',

      clearance: '100 cm (3.28 ft.) minimum around boiler to walls or equipment',
      exits: '2 independent doors required',

      location: {
        separateBuilding: {
          material: 'Fire-resistant materials',
          distance: 'Not less than 3 m (10 ft.) from non-factory buildings',
        },
        sameBuilding: {
          requirement: 'Structure of fire-resistant materials',
        },
      },

      flammableAreas: 'No exits or wall openings in intervening walls to workrooms with flammable/explosive substances',

      exits2: 'Not less than 2 adequate exits, kept clear of obstructions',

      access: 'Rails, walls, runways and stairs of iron/steel with non-slip surface for overhead valves',

      runways: 'Not less than 2 means of descent on top or alongside battery of boilers',

      height: '90 cm (3 ft.) minimum clearance above highest valve fitting or levers',

      pits: 'Covered or guarded by standard railings and toeboards',

      structuralSupport: 'Located or insulated that heat from furnace cannot impair steel strength',

      expansionOpenings: 'Suitably packed openings or sleeves for pipe expansion/contraction',

      wetBottom: '30 cm (12 in.) minimum between bottom of boiler and floor line',
    },

    factorOfSafety: {
      subsection: '1163.02',
      minimum: 5,
      increase: '10% or more under deterioration or after 25 years of service',
    },

    accessAndInspection: {
      subsection: '1163.03',
      requirement: 'Suitable manholes or other openings for inspection, examination and cleaning',
      handHoleMinimum: '70mm x 90mm (2 3/4 in. x 3 1/2 in.)',
    },

    safetyValves: {
      subsection: '1163.03(2)',

      quantity: {
        upTo46_5sqm: 'At least 1 safety valve (≤500 sq.ft. heating surface)',
        over46_5sqm: '2 or more safety valves (>500 sq.ft. heating surface)',
      },

      placement: [
        'As close as possible to the boiler',
        'Connected independent of any other steam connection',
        'Between boiler and discharge point when in pipeline',
      ],

      capacity: 'Discharge all steam without pressure rising more than 6% above max allowable',

      materials: 'Seats and discs of corrosion-resistant materials',

      construction: [
        'Failure of any part will not obstruct free discharge',
        'No shock injurious to valves or boiler',
        'Valve can be turned on its seat',
      ],

      requirements: [
        'Adjustable without chattering',
        'Sealed or protected against tampering',
        'Means for lifting valve for testing',
        'Located for attendant to hear discharge',
      ],

      dischargeOutlets: {
        location: 'Not less than 3 m (10 ft.) above platforms',
        pipes: 'Not less than full area of valve outlets',
        drains: 'Open drains to prevent water lagging',
      },
    },

    stopValves: {
      subsection: '1163.04',
      location: 'Accessible point in steam delivery line, as near boiler as practicable',
      operation: 'Quick and convenient means from floor or outside boiler room',
      multipleBoilers: 'Two stop valves with ample free-flow drain between them',
    },

    waterColumnPipes: {
      subsection: '1163.05',
      minimumSize: '25 mm (1 in.) pipe size',
      installation: 'As short and direct as possible',
      horizontalReturn: 'From top of shell in upper part of head',
      waterConnection: 'Not less than 15 cm (6 in.) below lowest center line of shell',
      fireBoxType: 'Not less than 25 cm (10 in.) below lowest water line, not less than 45 cm (18 in.) above mud ring',
      drainCocks: 'Fitted with drain cocks or valves to safe point of disposal',
    },

    steamGauges: {
      subsection: '1163.06',
      placement: ['Free from vibrations', 'Conveniently adjusted', 'Clear view from operating position'],
      connection: 'By siphons or equivalent devices with sufficient capacity',
      dialRequirements: {
        visibility: 'Clear from 1.5 times the width of boiler front',
        graduation: 'Not less than 1.5 times safety valve pressure, preferably double',
        workingPressure: 'Indicated in red on dial',
      },
      uniformity: 'All gauges in power boiler room shall be same type, size and graduation',
    },

    waterGaugeGlasses: {
      subsection: '1163.07',
      requirements: [
        'Located within range of vision of attendant',
        'Quick closing valves at top and bottom',
        'Connected by not less than 12 mm (15/32 in.) diameter pipe',
        'Valve drain piped to safe disposal',
        'Wire glass or suitable guard for protection',
      ],
      waterLevel: {
        firetubeBoilers: '75 mm (3 in.) above highest point of tubes/flues/crown sheets',
        watertubeBoilers: '50 mm (2 in.) above lowest permissible level',
      },
      miniatureBoilers: 'Glass bull\'s eye type indicators permitted',
    },

    gaugeCocks: {
      subsection: '1163.08',
      quantity: '3 or more within visible length of water glass',
      exception: 'May omit if 2 water gauges 70 cm (28 in.) apart on same line',
      tryCock: 'At least 1 per gauge cock',
      smallBoilers: '2 gauge cocks for locomotive type ≤90 cm or fire box ≤5 sq.m heating surface',
      aboveReach: 'Provide attached rods with chains and protection from discharge',
    },

    fusiblePlugs: {
      subsection: '1163.09',
      renewalInterval: 'Not exceeding 12 months',
      casings: 'Used casings shall not be refilled',
      pressureLimit: 'Not used above 17.5 kg/cm²g (250 psig)',
    },

    blowOff: {
      subsection: '1163.10',
      requirement: 'At least 1 blow-off pipe fitted with valve cock at lowest water space',
      multipleBoilers: [
        '2 slow opening valves, OR',
        '1 slow opening valve + 1 quick opening valve or cock, OR',
        'Key-operated valve (only key available for range)',
      ],
      valves: 'Free from dams or pockets collecting sediment',
      heatProtection: 'Fire bricks or heat-resistant materials when exposed to furnace heat',
      discharge: 'At safe point, not connected to sewer unless through blow-off tank',
      blowOffTank: ['Vent pipe of sufficient size', 'All parts accessible for inspection'],
    },

    feedWater: {
      subsection: '1163.11',
      dischargeLocation: 'Not directly against surfaces exposed to fire or high temperature gases',
      valves: 'Check valve near boiler + valve or stop cock between check valve and boiler',
      multipleBoilers: 'Check valve in main feed pipe to prevent water backing',
      economizers: 'Feed and check valves on inlet of economizers or water heaters',
      miniatureBoilers: 'At least 1 feed pump except closed system with suitable connection',
    },
  },

  // ===========================================
  // SECTION 1164: HEATING BOILERS
  // ===========================================
  heatingBoilers: {
    section: '1164',

    workingPressure: {
      subsection: '1164.01',
      lowPressureSteam: '1.055 kg/cm²g (15 psig) maximum',
      hotWaterTemperature: '121°C (250°F) maximum',
      exceedingLimits: 'Rule 1163 (Power Boilers) shall apply',
    },

    accessAndOpenings: {
      subsection: '1164.02',
      steelPlate: 'Manhole or washout openings for inspection, cleaning, maintenance',
      exception: 'Manhole may be omitted where entrance is impracticable',
      castIron: 'Suitable washout openings to permit removal of sediments',
      accessDoors: 'Not less than 30 cm x 40 cm (12 in. x 16 in.)',
    },

    safetyValves: {
      subsection: '1164.03',
      requirement: 'At least 1 safety valve conforming to Rule 1163.03(2)-(8)',
      setting: 'Sealed and adjusted to discharge at not exceeding 1.055 kg/cm²g (15 psig)',
    },

    waterReliefValves: {
      subsection: '1164.04',
      placement: 'On vertical dead-end pipe attached to cold water supply or directly to boiler',
      setting: 'Open at or below maximum allowable working pressure',
      prohibitedMaterials: 'Rubber or composition liable to fail due to hot water/steam',
      location: 'Where no danger of scalding persons',
    },

    stopValves: {
      subsection: '1164.05',
      rule: 'If stop valve in supply pipe, also provide in return pipe',
    },

    waterColumnPipe: {
      subsection: '1164.06',
      reference: 'Rule 1163.05(1)-(6)',
    },

    steamGauges: {
      subsection: '1164.07',
      reference: 'Rule 1163.06',
      dialGraduation: 'Not less than 2 kg/cm²g (28.5 psig)',
      faceSize: 'Not less than 75 mm (3 in.)',
    },

    pressureOrAltitudeGauge: {
      subsection: '1164.08',
      connection: 'Cannot be shut off except by cock near gauge with tee/level handle',
      graduation: 'Not less than 1.5 times max allowable pressure',
      workingPressure: 'Indicated in red',
    },

    pressureCombustionRegulators: {
      subsection: '1164.09',
      setting: 'Prevent steam pressure above 1 kg/cm²g (14.25 psig)',
    },

    thermometers: {
      subsection: '1164.10',
      requirements: ['Properly located for easy reading', 'Indicate temperature at all times'],
    },

    waterGaugeGlasses: {
      subsection: '1164.11',
      requirement: 'One or more water gauge glasses',
      lowerFitting: 'Valve or pet cock for cleaning',
      reference: 'Rule 1163.08(1) and (2)',
    },

    pipeInstallation: {
      subsection: '1164.12',
      rule: 'Fluid release column cannot be accidentally shut-off',
    },

    blowOffEquipment: {
      subsection: '1164.13',
      reference: 'Rule 1163.10(1)-(6)',
    },

    feedPiping: {
      subsection: '1164.14',
      rules: [
        'Not discharged directly against parts exposed to radiant heat',
        'Connected to piping system, not directly to boiler when from steam/water pressure line',
        'Not through water column gauge glasses or gauge cocks openings',
      ],
    },

    automaticDevices: {
      subsection: '1164.15',
      lowWaterCutoff: 'Automatically fed steam/vapor system boilers require automatic low-water cutoff or water-feeding device',
      actions: ['Cut-off fuel supply', 'Supply requisite feed water', 'Simultaneously cut-off fuel and feed water'],
    },
  },

  // ===========================================
  // SECTION 1165: CLEANING AND REPAIRS
  // ===========================================
  cleaningAndRepairs: {
    section: '1165',

    rules: [
      {
        subsection: '1165.01',
        rule: 'Repairs and adjustments shall not be made on boilers and steam lines while under pressure',
      },
      {
        subsection: '1165.02',
        rule: 'Before workers enter boilers for repairs, all valves shall be closed, locked and marked with tags',
        valves: ['Blow-off', 'Feed water', 'Main steam stop', 'Other valves'],
      },
      {
        subsection: '1165.03',
        rule: 'Battery of boilers: main steam valves tightly closed and locked with free flow drain open',
      },
      {
        subsection: '1165.04',
        rule: 'Common header blow-off valves of boilers in service shall be marked and locked',
      },
      {
        subsection: '1165.05',
        rule: 'No worker shall enter boiler unless another worker is stationed outside ready to assist',
      },
      {
        subsection: '1165.06',
        rule: 'Workers shall never enter boiler until sufficiently cooled to ambient temperature',
        precautions: ['Hot flue dust', 'Falling loose parts', 'Explosion from water on hot flue dust'],
      },
      {
        subsection: '1165.07',
        rule: 'Boiler shall be thoroughly ventilated before entry to expel combustible or toxic gases',
        note: 'Particularly when scale solvents have been used',
      },
      {
        subsection: '1165.08',
        rule: 'During cleaning and repair, ventilation by running forced/induced drafts at low speed',
        reason: 'Eliminate flue gases from other boilers',
      },
      {
        subsection: '1165.09',
        rule: 'Lights used inside boiler shall be in good condition suitable for the work',
      },
      {
        subsection: '1165.10',
        rule: 'Blowtorches shall NEVER be used inside boilers',
      },
      {
        subsection: '1165.11',
        rule: 'Power source of steam/air driven tools shall be generated outside the boiler',
        requirement: 'All connections inspected at frequent intervals',
      },
      {
        subsection: '1165.12',
        rule: 'Mechanical cleaning tools shall not be operated in one spot for considerable time',
        reason: 'Reduces strength of metal',
      },
      {
        subsection: '1165.13',
        afterCleaning: [
          'One worker examines interior for tools/equipment left inside',
          'Boiler shall not be closed until certain all workers are outside',
        ],
      },
      {
        subsection: '1165.14',
        bulging: 'Maximum 2% of the area of the bulge',
        exceedingLimit: 'Discontinue use or patch work per Rule 1162',
        materials: 'Certified by supplier, verified by Industrial Safety Engineer',
      },
      {
        subsection: '1165.15',
        welding: 'By certified welders per ASME Section IX (Welding Qualifications)',
      },
      {
        subsection: '1165.16',
        localFabrication: 'Stamped by Department with:',
        stampRequirements: [
          'Name of manufacturer and year built',
          'Application number',
          "Manufacturer's serial number",
          'Design pressure and temperature',
          'Rating in horsepower for boiler and cubic meter for pressure vessel',
        ],
      },
    ],
  },

  // ===========================================
  // SECTION 1166: PERSONAL PROTECTIVE EQUIPMENT
  // ===========================================
  ppe: {
    section: '1166',
    requirement: 'Workers in boiler rooms exposed to work hazards shall be provided PPE conforming to Rule 1080',
  },

  // ===========================================
  // SECTION 1167: COLOR CODING
  // ===========================================
  colorCoding: {
    section: '1167',
    requirement: 'Feed water and steam pipes shall be marked with identifiable color per Rule 1230',
  },

  // ===========================================
  // SECTION 1168: PLAN REQUIREMENTS
  // ===========================================
  planRequirements: {
    section: '1168',
    submitTo: 'Bureau or Regional Office with available PME',
    copies: 5,

    requirements: {
      locationPlan: {
        description: 'Site of compound with landmarks, streets, NORTH direction',
        scale: 'Not necessarily to scale',
      },

      roomLayout: {
        contents: [
          'Detail of room drawn to scale',
          'Position of boiler/pressure vessel relative to walls and equipment',
          'Type of material for room walls (concrete, adobe, hollow blocks, fire resistant)',
        ],
      },

      installationAndFoundation: {
        contents: [
          'Front and side views with anchorage details',
          'Water column assembly, main steam line, blow-off line, safety valves, feed water appliances, pressure gauge, manholes (for boilers)',
          'Inlet/outlet pipes, drain pipe, inspection plug, manholes, glass gauge, relief valves, pressure gauge (for pressure vessels)',
          'Clearance: lowest portion of shell to floor not less than 45 cm (17.80 in.) for horizontal fire tube boiler',
          'Type of furnace',
        ],
      },

      foundationDesignComputation: {
        contents: [
          'Total weight of boiler/pressure vessel and accessories',
          'Weight of water when full',
          'Base area and volume of concrete foundation',
          'Concrete mixture',
          'Bearing capacity of soil',
          'Factor of safety of foundation',
        ],
      },

      detailedConstructionDrawing: {
        contents: [
          'Sectional front and side elevation with dimensions',
          'Details of longitudinal and circumferential joints',
          'Head attachments, nozzle and manhole attachments',
          "Manufacturer's data and specification",
          'Technical details of furnace',
        ],
      },

      planSizes: {
        minimum: '375 mm x 530 mm',
        medium: '530 mm x 750 mm',
        maximum: '750 mm x 1065 mm',
      },

      titleBlock: {
        width: '7.62 cm',
        contents: [
          'PME name, signature, seal, registration number, PTR number, TIN',
          'Draftsman initials, date, sheet number, scale (minimum 1:100)',
          'Title of plan',
          'Owner/manager name, signature, TIN',
          'Name and address of establishment',
        ],
      },
    },

    installation: {
      supervision: 'By professional mechanical engineer',
      minorDeviations: 'Inform Bureau or Regional Office in writing or in person',
      majorAlterations: 'Resubmit plans as new application',
      approval: 'Approved application and plans serve as permit for installation',
    },

    postInstallation: {
      request: 'Regional Office for final inspection',
      permit: '1 year operating permit if in accordance with approved plans and standards',
      gracePeriod: '30 days if cannot stop operation due to unavoidable circumstances',
    },

    boilerTenders: 'Licensed in accordance with Mechanical Engineering Law',
    repairs: 'Plans and specifications approved by Bureau/Regional Office before repair',

    effectiveDate: '18 December 2001',
  },

  // ===========================================
  // QUICK REFERENCE
  // ===========================================
  quickReference: {
    powerBoilerPressure: 'Over 1.055 kg/cm²g (15 psig)',
    lowPressureMax: '1.055 kg/cm²g (15 psig) or 121°C (250°F)',
    factorOfSafety: 'Not less than 5',
    annualInspection: 'Not exceeding 12 months',
    hydrostaticTest: '1.5x design pressure (new), 1.2x working pressure (repair)',
    boilerRoomClearance: '100 cm (3.28 ft.) minimum',
    boilerRoomExits: '2 independent doors required',
    wetBottomClearance: '30 cm (12 in.) floor clearance',
    safetyValveHeight: '3 m (10 ft.) above platforms',
    waterGaugeMinimum: '75 mm (3 in.) above tubes for fire tube boilers',
    fusiblePlugRenewal: 'Every 12 months',
    lapRivetedAgeLimit: '25 years',
    ownershipTransferDeadline: '30 days',
    planCopies: '5 copies required',
    bulgeLimit: '2% maximum of bulge area',
    operatingPermit: '1 year validity',
  },
};

// Helper functions
export function getBoilerDefinitions(): object {
  return RULE_1160.definitions;
}

export function getBoilerType(pressure: number, unit: 'kg' | 'psig' = 'kg'): string {
  const threshold = unit === 'psig' ? 15 : 1.055;
  if (pressure > threshold) {
    return 'Power Boiler - Rule 1163 applies';
  }
  return 'Low Pressure Heating Boiler - Rule 1164 applies';
}

export function getAdoptedStandards(): object[] {
  return RULE_1160.standards.adoptedStandards;
}

export function getInspectionPhases(): object[] {
  return RULE_1160.inspection.phases;
}

export function getHydrostaticTestRequirements(): object {
  return RULE_1160.inspection.hydrostaticTest;
}

export function getPowerBoilerRoomRequirements(): object {
  return RULE_1160.powerBoilers.boilerRooms;
}

export function getSafetyValveRequirements(): object {
  return RULE_1160.powerBoilers.safetyValves;
}

export function getCleaningAndRepairRules(): object[] {
  return RULE_1160.cleaningAndRepairs.rules;
}

export function getPlanRequirements(): object {
  return RULE_1160.planRequirements;
}

export function getRule1160Summary(): string {
  return `
Rule 1160 - Boiler Key Points:

DEFINITIONS:
- Power Boiler: Working pressure > 1.055 kg/cm²g (15 psig)
- Low Pressure Heating Boiler: ≤1.055 kg/cm²g or ≤121°C
- Hot Water Boiler: Water heated above atmospheric pressure

PERMITS & INSPECTIONS:
- Permit required from Secretary of Labor
- Annual inspection: Not exceeding 12 months
- Hydrostatic test: 1.5x design (new), 1.2x working (repair)
- Ownership transfer: Report within 30 days

ADOPTED STANDARDS:
- ASME Boiler and Pressure Vessel Code
- ASME Code for Pressure Piping
- API Code for Petroleum Gases and Liquids
- ISO Code
- PSME Code

POWER BOILER ROOM:
- Clearance: 100 cm (3.28 ft.) minimum to walls
- Exits: 2 independent doors required
- Height: 90 cm above highest valve fitting
- Wet-bottom: 30 cm floor clearance

SAFETY VALVES:
- ≤46.5 sq.m heating surface: 1 valve
- >46.5 sq.m heating surface: 2+ valves
- Discharge outlets: 3 m above platforms
- Capacity: Discharge all steam, max 6% pressure rise

KEY SPECIFICATIONS:
- Factor of Safety: Not less than 5
- Water gauge glass: 75 mm above tubes (fire tube)
- Fusible plug renewal: Every 12 months
- Lap-riveted boiler age limit: 25 years
- Bulge limit: 2% maximum of bulge area

CLEANING & REPAIRS:
- Never while under pressure
- Lock and tag all valves
- Cool to ambient temperature before entry
- Watcher required outside manhole
- Never use blowtorches inside
- Ventilate thoroughly
- Welding by certified welders (ASME Section IX)

PLAN REQUIREMENTS:
- Submit 5 copies to Bureau/Regional Office
- Location plan, room layout, installation plan
- Foundation design computation
- Detailed construction drawing
- Title block with PME seal

OPERATING PERMIT: 1 year validity
  `.trim();
}
