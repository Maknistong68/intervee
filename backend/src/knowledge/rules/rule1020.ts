// Rule 1020 - Registration
// OSHS (Occupational Safety and Health Standards)

export const RULE_1020 = {
  ruleNumber: '1020',
  title: 'Registration',
  amendments: [],

  sections: {
    '1021': {
      title: 'General Provisions',
      content: `Every employer as defined in Rule 1002(1) shall register his business with the
Regional Labor Office or authorized representative having jurisdiction thereof to form part
of a databank of all covered establishments.`,
      keyPoints: [
        'All employers must register',
        'Register with Regional Labor Office (RO) or authorized representative',
        'Purpose: Create databank of covered establishments',
      ],
    },

    '1022': {
      title: 'Registrable Unit',
      content: `The establishment regardless of size of economic activity, whether small, medium
or large scale in one single location, shall be one registrable unit.`,
      keyPoints: [
        'One location = One registrable unit',
        'Applies regardless of size (small, medium, large)',
        'Each branch/location needs separate registration',
      ],
    },

    '1023': {
      title: 'Period of Registration',
      requirements: {
        existingEstablishments: {
          deadline: '60 days after effectivity of Standards',
          description: 'Existing establishments shall be registered within sixty (60) days after the effectivity of this Standards',
        },
        newEstablishments: {
          deadline: '30 days before operation',
          description: 'New establishments shall register within thirty (30) days before operation',
        },
      },
    },

    '1024': {
      title: 'Registration',
      form: 'DOLE-BWC-IP-3',
      copies: 3,
      submissionTo: 'Regional Labor Office or authorized representatives',

      validity: {
        duration: 'Lifetime of establishment',
        fee: 'Free of charge',
      },

      reRegistrationRequired: [
        'Change in business name',
        'Change in location',
        'Change in ownership',
        'Re-opening after previous closing',
      ],

      layoutPlanRequirements: {
        scale: '1:100 meters',
        format: 'White or blue print',
        coverage: 'Floor by floor',
        mustShow: [
          'All physical features of the workplace',
          'Storage areas',
          'Exits',
          'Aisles',
          'Machinery',
          'Clinic',
          'Emergency devices and location',
        ],
      },

      formNotes: 'Registration form may be reprinted or reproduced. Back page may be used for other information.',
    },
  },

  // Quick reference summary
  summary: {
    who: 'All employers/establishments',
    where: 'Regional Labor Office (DOLE-RO)',
    form: 'DOLE-BWC-IP-3 (3 copies)',
    fee: 'FREE',
    validity: 'Lifetime (unless changes occur)',
    newEstablishment: 'Register 30 days BEFORE operation',
    existingEstablishment: 'Register within 60 days of Standards effectivity',
  },
};

// Helper functions
export function needsReRegistration(reason: string): boolean {
  const reasons = RULE_1020.sections['1024'].reRegistrationRequired.map(r => r.toLowerCase());
  return reasons.some(r => r.includes(reason.toLowerCase()));
}

export function getRegistrationDeadline(isNew: boolean): string {
  if (isNew) {
    return '30 days before operation';
  }
  return '60 days after Standards effectivity';
}

export function getLayoutPlanRequirements(): string[] {
  return RULE_1020.sections['1024'].layoutPlanRequirements.mustShow;
}

export function getRule1020Summary(): string {
  return `
Rule 1020 - Registration Key Points:
- ALL establishments must register with DOLE Regional Office
- Form: DOLE-BWC-IP-3 (3 copies)
- Fee: FREE
- Validity: Lifetime of establishment
- New establishments: Register 30 days BEFORE operation
- Re-registration needed for: name change, location change, ownership change, or reopening
- Must submit layout plan (1:100 scale) showing exits, machinery, clinic, emergency devices
  `.trim();
}
