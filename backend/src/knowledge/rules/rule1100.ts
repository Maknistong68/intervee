// Rule 1100 - Gas and Electric Welding and Cutting Operations
// OSHS Original

export const RULE_1100 = {
  ruleNumber: '1100',
  title: 'Gas and Electric Welding and Cutting Operations',
  amendments: [],

  // ===========================================
  // SECTION 1100.01: GENERAL PROVISIONS
  // ===========================================
  generalProvisions: {
    section: '1100.01',

    prohibited: {
      locations: [
        'Rooms or areas containing combustible materials',
        'Proximity to explosives or flammable liquids, dusts, gases, or vapors',
      ],
      condition: 'Until all fire and explosion hazards are eliminated',
    },

    containers: {
      prohibition: 'Welding or cutting on containers filled with explosives or flammable substances is PROHIBITED',
      closedContainers: {
        requirement: 'May only be undertaken after containers have been:',
        options: [
          'Thoroughly cleaned and found completely free of combustible gases or vapors',
          'Filled with inert gas',
          'Filled with water',
        ],
      },
    },

    screens: {
      when: 'Operations in places where other persons work or pass',
      requirement: 'Enclosed by suitable stationary or portable screens',
      specifications: {
        type: 'Opaque',
        construction: 'Sturdy, withstand rough usage',
        material: 'Not readily set on fire by sparks or hot metal',
        height: 'At least 2 m (6.5 ft.)',
        paint: 'Preferably light flat paint',
      },
    },

    fireExtinguisher: {
      requirement: 'Portable fire extinguisher shall be provided at place of operations',
    },

    authorization: {
      largeEstablishments: 'Area shall be inspected by safetyman before operations',
      permit: 'Written permit or authorization for welding and cutting',
      contents: 'Precautions to be followed to avoid fire or accidents',
    },
  },

  // ===========================================
  // SECTION 1100.02: PERSONAL PROTECTIVE EQUIPMENT
  // ===========================================
  ppe: {
    section: '1100.02',

    directlyEngaged: {
      description: 'All workers directly engaged in welding or cutting',
      required: [
        'Goggles, helmets, or head shields fitted with suitable filter lenses',
        'Hand shields',
        'Suitable aprons',
      ],
    },

    assistingPersonnel: {
      description: 'All persons directly assisting in operations',
      required: [
        'Gloves',
        'Goggles',
        'Other protective clothing as necessary',
      ],
    },
  },

  // ===========================================
  // SECTION 1100.03: WELDING IN CONFINED SPACES
  // ===========================================
  confinedSpaces: {
    section: '1100.03',
    objective: 'Prevent inhalation of fumes, gases, or dusts',
    controls: [
      'Local exhaust and general ventilation to keep contaminants within TLV',
      'Approved respiratory protective equipment',
    ],
  },

  // ===========================================
  // QUICK REFERENCE
  // ===========================================
  quickReference: {
    screenHeight: '2 m (6.5 ft.) minimum',
    fireExtinguisher: 'Required at location',
    writtenPermit: 'Required in large establishments',
    closedContainers: 'Clean, fill with inert gas, or fill with water before welding',
    confinedSpaces: 'Ventilation + respiratory protection',
  },
};

// Helper functions
export function getWeldingPPE(role: string): string[] {
  if (role.toLowerCase().includes('weld') || role.toLowerCase().includes('cut')) {
    return RULE_1100.ppe.directlyEngaged.required;
  }
  return RULE_1100.ppe.assistingPersonnel.required;
}

export function getScreenRequirements(): object {
  return RULE_1100.generalProvisions.screens.specifications;
}

export function getContainerWeldingRequirements(): string[] {
  return RULE_1100.generalProvisions.containers.closedContainers.options;
}

export function getRule1100Summary(): string {
  return `
Rule 1100 - Welding and Cutting Operations Key Points:

PROHIBITED LOCATIONS:
- Areas with combustible materials
- Near explosives or flammable liquids/gases
- Until all fire/explosion hazards eliminated

CLOSED CONTAINERS:
- Never weld containers with explosives/flammables
- Must first: Clean thoroughly, OR fill with inert gas, OR fill with water

SCREENS (when others nearby):
- Opaque, sturdy, fire-resistant material
- Minimum 2 m (6.5 ft.) height
- Light flat paint preferred

FIRE EXTINGUISHER: Required at location

AUTHORIZATION:
- Large establishments: Safety inspection first
- Written permit required with precautions

PPE FOR WELDERS:
- Goggles/helmets with filter lenses
- Hand shields
- Aprons

PPE FOR ASSISTANTS:
- Gloves
- Goggles
- Other protective clothing

CONFINED SPACES:
- Local exhaust + general ventilation
- Respiratory protection
- Keep contaminants within TLV
  `.trim();
}
