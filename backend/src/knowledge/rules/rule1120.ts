// Rule 1120 - Hazardous Work Processes
// OSHS Original

export const RULE_1120 = {
  ruleNumber: '1120',
  title: 'Hazardous Work Processes',
  amendments: [],

  // ===========================================
  // SECTION 1121: UNDERGROUND TANK AND SIMILAR CONFINED SPACE WORK
  // ===========================================
  confinedSpaceWork: {
    section: '1121',
    title: 'Underground Tank and Similar Confined Space Work',

    generalProvisions: {
      subsection: '1121.01',
      timing: 'Before worker or group enters any confined/enclosed space and before any work is commenced',

      precautions: [
        {
          number: 1,
          requirement: 'Visual check that water level is below 15 cm (6 in.)',
          ifWaterPresent: 'Dry wooden platform shall be available for use',
        },
        {
          number: 2,
          requirement: 'Air in the area shall be checked for:',
          checks: [
            'Explosive gases, fumes, and vapors',
            'Oxygen content',
            'Carbon monoxide (if burning or products of burning involved)',
          ],
        },
        {
          number: 3,
          requirement: 'If any of above is present over normal levels',
          action: 'Area shall NOT be entered until ventilation by blower is effected',
        },
        {
          number: 4,
          requirement: 'Approved breathing apparatus and PPE shall be provided and made available',
        },
        {
          number: 5,
          requirement: 'WATCHER required',
          watcherRequirements: [
            'Familiar with the job',
            'In contact with men at regular intervals',
            'Equally provided with breathing apparatus for emergency use',
          ],
          prohibition: 'No worker shall enter unless watcher is available',
        },
        {
          number: 6,
          requirement: 'No smoking or open lights, torches, arcs, or flames',
          condition: 'Until inspection ensures fire/explosion possibilities eliminated',
        },
        {
          number: 7,
          requirement: 'No spraying or painting using volatile solvents',
          condition: 'Unless respiratory and other adequate protection provided',
        },
        {
          number: 8,
          requirement: 'Unattended openings shall be protected',
          day: 'Barricades',
          night: 'Barricades and lanterns with appropriate warning signs',
        },
        {
          number: 9,
          requirement: 'Adequate means of ingress and egress shall be provided',
        },
      ],
    },
  },

  // ===========================================
  // QUICK REFERENCE
  // ===========================================
  quickReference: {
    waterLevel: 'Below 15 cm (6 in.) or provide dry wooden platform',
    airChecks: ['Explosive gases', 'Oxygen content', 'Carbon monoxide'],
    abnormalLevels: 'Do NOT enter until blower ventilation effected',
    watcher: 'REQUIRED - with breathing apparatus ready',
    noSmoking: 'Until fire/explosion hazards eliminated',
    unattendedOpenings: 'Barricades (day), Barricades + lanterns + signs (night)',
    ingressEgress: 'Adequate means required',
  },
};

// Helper functions
export function getConfinedSpacePrecautions(): object[] {
  return RULE_1120.confinedSpaceWork.generalProvisions.precautions;
}

export function getAirCheckRequirements(): string[] {
  const precaution2 = RULE_1120.confinedSpaceWork.generalProvisions.precautions.find(p => p.number === 2);
  return precaution2?.checks || [];
}

export function getWatcherRequirements(): string[] {
  const precaution5 = RULE_1120.confinedSpaceWork.generalProvisions.precautions.find(p => p.number === 5);
  return precaution5?.watcherRequirements || [];
}

export function getRule1120Summary(): string {
  return `
Rule 1120 - Hazardous Work Processes (Confined Spaces) Key Points:

BEFORE ENTRY - MANDATORY CHECKS:
1. Water level below 15 cm (6 in.) - if water present, provide dry wooden platform
2. Air testing for:
   - Explosive gases, fumes, vapors
   - Oxygen content
   - Carbon monoxide (if burning involved)
3. If abnormal levels: DO NOT ENTER until blower ventilation effected

REQUIRED PROVISIONS:
- Approved breathing apparatus and PPE available
- WATCHER REQUIRED:
  * Familiar with job
  * In regular contact with workers
  * Has breathing apparatus ready for emergency

PROHIBITIONS (until hazards eliminated):
- No smoking
- No open lights, torches, arcs, flames
- No spraying/painting with volatile solvents (unless protected)

UNATTENDED OPENINGS:
- Day: Barricades
- Night: Barricades + lanterns + warning signs

INGRESS/EGRESS:
- Adequate means required for all confined spaces
  `.trim();
}
