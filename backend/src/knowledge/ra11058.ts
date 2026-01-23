// RA 11058 - Occupational Safety and Health Standards Act
// Effective: February 2019

export const RA_11058 = {
  title: 'An Act Strengthening Compliance with Occupational Safety and Health Standards',
  shortTitle: 'Occupational Safety and Health Standards Act',
  effectiveDate: '2019-02-16',

  keyProvisions: {
    coverage: `
      RA 11058 covers ALL establishments, projects, sites, including:
      - All branches of economic activity
      - All types of workers (regular, contractual, subcontracted)
      - Including government-owned or controlled corporations
    `,

    employerDuties: [
      'Furnish workers a place of employment free from hazardous conditions',
      'Give complete job safety instructions to all workers',
      'Inform workers of all hazards associated with their work',
      'Use only approved devices and equipment',
      'Comply with occupational safety and health standards',
      'Provide free of charge adequate personal protective equipment',
      'Provide free of charge facilities for workers exposed to occupational hazards',
      'Make arrangements for emergency medical and dental services',
      'Provide for total temporary disability, permanent total disability, or death benefits',
      'Report to DOLE all accidents and occupational diseases in the workplace',
    ],

    workerRights: [
      'Know the hazards in the workplace',
      'Refuse unsafe work without threat of dismissal',
      'Report accidents to employer and DOLE',
      'Receive PPE at no cost',
      'Access personal exposure and medical records',
    ],

    workerDuties: [
      'Make proper use of all safeguards and safety devices',
      'Comply with instructions to prevent accidents',
      'Report unsafe conditions or defects in equipment',
      'Use PPE provided by employer',
      'Undergo training on occupational safety and health',
    ],

    penalties: {
      firstOffense: {
        micro: 'PHP 50,000',
        small: 'PHP 100,000',
        medium: 'PHP 200,000',
        large: 'PHP 300,000',
      },
      secondOffense: {
        micro: 'PHP 100,000',
        small: 'PHP 200,000',
        medium: 'PHP 400,000',
        large: 'PHP 600,000',
      },
      thirdOffense: {
        micro: 'PHP 200,000',
        small: 'PHP 400,000',
        medium: 'PHP 800,000',
        large: 'PHP 1,000,000',
      },
      willfulViolation: 'Criminal liability with imprisonment of 6 months to 6 years plus fine',
      deathOrInjury: 'PHP 1,000,000 to PHP 5,000,000 depending on severity',
    },

    jointLiability: `
      The principal employer, contractor, and subcontractor shall be JOINTLY AND
      SEVERALLY LIABLE for compliance with OSH standards. The principal employer
      shall be solidarily liable with the contractor or subcontractor for any
      violation of the provisions of this Act.
    `,

    workStoppage: `
      The DOLE may issue Work Stoppage Orders when there is imminent danger that
      may result in work-related death or serious physical harm. The employer may
      request for lifting only after correcting the hazardous condition.
    `,
  },

  amendments: [
    { number: 'IRR', year: 2019, description: 'Implementing Rules and Regulations' },
    { number: 'DO 198', year: 2018, description: 'Implementing Rules specific to Construction' },
  ],
};

export function getRA11058Summary(): string {
  return `
RA 11058 Key Points:
- Covers ALL establishments and workers
- Employers must provide safe workplace and free PPE
- Workers have right to refuse unsafe work
- Penalties: PHP 50,000 to PHP 5,000,000
- Joint liability for contractors/subcontractors
- DOLE can issue Work Stoppage Orders
- Criminal liability for willful violations
  `.trim();
}

export function getPenaltyInfo(size: string, offense: number): string {
  const sizeKey = size.toLowerCase() as keyof typeof RA_11058.keyProvisions.penalties.firstOffense;
  const penalties = RA_11058.keyProvisions.penalties;

  switch (offense) {
    case 1:
      return `First Offense (${size}): ${penalties.firstOffense[sizeKey] || 'Not specified'}`;
    case 2:
      return `Second Offense (${size}): ${penalties.secondOffense[sizeKey] || 'Not specified'}`;
    case 3:
      return `Third Offense (${size}): ${penalties.thirdOffense[sizeKey] || 'Not specified'}`;
    default:
      return 'Offense number not recognized. Penalties range from PHP 50,000 to PHP 5,000,000.';
  }
}
