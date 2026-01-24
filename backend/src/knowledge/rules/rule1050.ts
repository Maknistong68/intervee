// Rule 1050 - Notification and Keeping of Records of Accidents and/or Occupational Illnesses
// Original OSHS + Amended by LA 07, s. 2022 and DO 252, s. 2025

export const RULE_1050 = {
  ruleNumber: '1050',
  title: 'Notification and Keeping of Records of Accidents and/or Occupational Illnesses',
  amendments: ['LA 07, s. 2022', 'DO 252, s. 2025'],

  // ===========================================
  // SECTION 1051: DEFINITIONS
  // ===========================================
  definitions: {
    medicalTreatmentInjury: {
      term: 'Medical Treatment Injury',
      definition: 'An injury which does not result in a disabling injury but which requires first aid and medical treatment of any kind.',
    },

    disablingInjury: {
      term: 'Disabling Injury',
      definition: 'A work injury which results in death, permanent total disability, permanent partial disability or temporary total disability.',
      types: ['Death', 'Permanent Total Disability', 'Permanent Partial Disability', 'Temporary Total Disability'],
    },

    death: {
      term: 'Death',
      definition: 'Any fatality resulting from a work injury regardless of the time intervening between injury and death.',
    },

    permanentTotalDisability: {
      term: 'Permanent Total Disability',
      definition: 'Any injury or sickness other than death which permanently and totally incapacitates an employee from engaging in any gainful occupation.',
      includes: [
        'Loss of both eyes',
        'Loss of one eye and one hand, arm, leg, or foot',
        'Loss of any two of the following not in the same limb: hand, arm, foot, leg',
        'Permanent complete paralysis of two limbs',
        'Brain injury resulting in incurable imbecility or insanity',
      ],
    },

    permanentPartialDisability: {
      term: 'Permanent Partial Disability',
      definition: 'Any injury other than death or permanent total disability which results in the loss or loss of use of any member or part of a member of the body, regardless of any pre-existing disability.',
    },

    temporaryTotalDisability: {
      term: 'Temporary Total Disability',
      definition: 'Any injury or illness which does not result in death or permanent disability but which results in disability from work for a day or more.',
    },

    regularlyEstablishedJob: {
      term: 'Regularly Established Job',
      definition: 'The occupation or job description of activities performed by an employee at the time of accident. Does NOT mean one established especially to accommodate an injured employee for therapeutic reasons or to avoid counting as disability.',
    },

    dayOfDisability: {
      term: 'Day of Disability',
      definition: 'Any day in which an employee is unable, because of injury or illness, to perform effectively throughout a full shift the essential functions of a regularly established job which is open and available to him.',
    },

    totalDaysLost: {
      term: 'Total Days Lost',
      definition: 'The combined total for all injuries or illnesses of:',
      components: [
        'All days of disability resulting from temporary total injuries or illnesses',
        'All scheduled charges assigned to fatal, permanent total and permanent partial injuries or illnesses',
      ],
    },

    scheduledCharges: {
      term: 'Scheduled Charges',
      definition: 'The specific charge (in full days) assigned to a permanent partial, permanent total, or fatal injury or illness (See Table 6).',
    },

    employee: {
      term: 'Employee',
      definition: 'As defined in Rule 1002(2), includes working owners and officers.',
    },

    exposure: {
      term: 'Exposure',
      definition: 'The total number of employee-hours worked by all employees of the reporting establishment or unit.',
    },

    disablingInjuryFrequencyRate: {
      term: 'Disabling Injury Frequency Rate',
      definition: 'The number of disabling injuries per 1,000,000 employee-hours of exposure rounded to the nearest two (2) decimal places.',
      formula: '(Number of Disabling Injuries x 1,000,000) / Employee-hours of exposure',
    },

    disablingInjurySeverityRate: {
      term: 'Disabling Injury Severity Rate',
      definition: 'The number of days lost per 1,000,000 employee-hours of exposure rounded to the nearest whole number.',
      formula: '(Total Days Lost x 1,000,000) / Employee-hours of exposure',
    },
  },

  // ===========================================
  // SECTION 1052: SPECIAL PROVISION
  // ===========================================
  specialProvision: {
    '1052.01': {
      purpose: 'Reports are exclusively for Regional Labor Office information for accident/illness prevention duties.',
      distinctFrom: 'Employee\'s Compensation Commission or any other law',
      confidentiality: [
        'Reports shall NOT be admissible as evidence in any action or judicial proceedings',
        'Reports shall NOT be made public or subject to public inspection',
        'Exception: Prosecution for violations under this Rule',
      ],
    },
    '1052.02': {
      content: 'Definitions and standards used here are independent of those established by the Employee\'s Compensation Commission.',
    },
  },

  // ===========================================
  // SECTION 1053: REPORT REQUIREMENTS
  // ===========================================
  reportRequirements: {
    '1053.01': {
      title: 'Disabling Injuries/Illnesses Reporting',

      generalReporting: {
        what: 'All work accidents or occupational illnesses resulting in disabling condition or dangerous occurrence',
        to: 'Regional Labor Office or duly authorized representative',
        copies: 'Duplicate (copy to employee or authorized representative)',
        form: 'DOLE/BWC/HSD-IP-6',
        deadline: 'On or before 20th day of month following occurrence',
        investigationReport: 'Regional Office submits by 30th day of same month',
        temporaryDisability: 'If employee not returned by closing date, estimate probable days and correct after return',
      },

      deathOrPermanentTotal: {
        additional: 'Initial notification within 24 hours using fastest available means of communication',
        investigation: 'Regional Office investigates within 48 hours after receipt of initial report',
        form: 'DOLE/BWC/OHSD-IP-6a (duplicate)',
      },
    },

    '1053.02': {
      title: 'Dangerous Occurrences',
      description: 'Any dangerous occurrence which may or may not cause serious bodily harm or seriously damage premises shall be investigated and reported.',
      form: 'DOLE/BWC/HSD-IP-6',
      reportingDeadline: 'Upon occurrence',

      dangerousOccurrences: [
        'Explosion of boilers used for heating or power',
        'Explosion of receiver or storage container with pressure greater than atmospheric (gas, air, or liquid)',
        'Bursting of revolving wheel, grinder stone, or grinding wheel operated by mechanical power',
        'Collapse of crane, derrick, winch, hoist or other lifting appliance (or any part thereof), overturning of crane (except breakage of chain or rope sling)',
        'Explosion or fire causing damage to structure or machinery, resulting in complete suspension of work or stoppage for not less than 24 hours',
        'Electrical short circuit or failure of electrical machinery causing explosion or fire with structural damage and stoppage for not less than 24 hours',
      ],
    },
  },

  // ===========================================
  // SECTION 1054: KEEPING OF RECORDS
  // ===========================================
  recordKeeping: {
    requirement: 'Employer shall maintain accident/illness record open at all times for inspection',

    minimumData: [
      'Date of accident or illness',
      'Name of injured/ill employee, sex and age',
      'Occupation at time of accident or illness',
      'Assigned causes of accident or illness',
      'Extent and nature of disability',
      'Period of disability (actual and/or charged)',
      'Damage to materials, equipment, machinery (kind, extent, estimated/actual cost)',
      'Record of initial notice and/or report to Regional Labor Office',
    ],

    annualReport: {
      form: 'DOLE/BWC/HSD-IP-6b',
      name: 'Annual Work Accident/Illness Exposure Data Report',
      copies: 'Duplicate',
      submitTo: 'Bureau (copy to Regional Labor Office)',
      deadline: 'On or before 30th day of month following end of calendar year',
    },
  },

  // ===========================================
  // SECTION 1055: EVALUATION OF DISABILITY
  // ===========================================
  evaluationOfDisability: {
    scheduledCharges: {
      death: 6000,
      permanentTotalDisability: 6000,
      permanentPartialDisability: 'As per Table 6 on Time Charges',
      maximumCharge: 6000,
    },

    rules: [
      'Death from accident: 6,000 days charge',
      'Permanent total disability: 6,000 days charge',
      'Permanent partial disability: Use scheduled charges from Table 6 (whether actual days lost is greater or less)',
      'Multiple fingers/toes: Use only highest valued bone per finger/toe, then total separate charges',
      'Permanent impairment of functions: Percentage of scheduled charges based on percentage of permanent reduction',
      'Hearing loss: Considered permanent partial only if from traumatic injury, noise exposure, or occupational illness',
      'Vision impairment: Percentage of scheduled charge based on percentage of permanent impairment',
      'Multiple body parts affected: Sum of scheduled charges (max 6,000 days)',
      'Both permanent partial and temporary total in one accident: Use greater days lost',
      'Other permanent partial disabilities not in schedule: Percentage of 6,000 days as determined by physician',
    ],

    temporaryTotalDisability: {
      charge: 'Total number of calendar days of disability',
      excludes: [
        'Day of injury/illness',
        'Day employee returns to full-time employment',
      ],
      includes: 'All intervening calendar days',
      specialCases: [
        'Time lost due to unavailability of medical attention counts as disability time (unless physician certifies otherwise)',
        'Time for therapeutic treatments may be excused without counting as disability',
        'Transportation problems related to injury may be excused (if not materially reducing work time)',
      ],
      medicalDetermination: 'Physician authorized by employer determines nature of injury and ability to work',
    },
  },

  // ===========================================
  // SECTION 1056: MEASUREMENT OF PERFORMANCE
  // ===========================================
  measurementOfPerformance: {
    '1056.01': {
      title: 'Exposure to Industrial Injuries',
      measure: 'Total number of hours of employment of all employees in each establishment',
      note: 'Central administrative/sales office exposure is not included in individual establishment experience but in overall multi-establishment experience.',
    },

    '1056.02': {
      title: 'Determination of Employee-Hours of Exposure',
      principle: 'Employee-hours should be ACTUAL hours worked. Estimated hours may be used when actual not available.',

      methods: {
        actualHours: {
          source: 'Payroll or time clock records',
          includes: 'Actual straight time hours + actual overtime hours',
        },
        estimatedHours: {
          method: 'Total employee days worked x average hours worked per day',
          note: 'Calculate separately for departments with varying hours, then add totals',
        },
        hoursNotWorked: {
          excludes: ['Vacation', 'Sickness', 'Barangay duty', 'Court duty', 'Holidays', 'Funerals'],
          note: 'Final figure should represent hours ACTUALLY worked',
        },
        undefinedHours: {
          applies: 'Traveling salesmen, executives, others with undefined working hours',
          assumption: 'Average 8-hour day',
        },
        standbyHours: {
          rule: 'All stand-by hours (including seamen aboard vessels) restricted to employer premises shall be counted',
          injuries: 'All work injuries during stand-by hours are counted',
        },
      },
    },

    '1056.03': {
      title: 'Measures of Injury/Illness Experience',

      frequencyRate: {
        name: 'Disabling Injury/Illness Frequency Rate (FR)',
        basedOn: 'Total deaths, permanent total, permanent partial, and temporary total disabilities',
        formula: '(Number of Disabling Injuries/Illnesses x 1,000,000) / Employee-hours of exposure',
        rounding: 'Nearest two decimal places',
      },

      severityRate: {
        name: 'Disabling Injury/Illness Severity Rate (SR)',
        basedOn: 'Total scheduled charges for deaths, permanent disabilities + actual days for temporary disabilities',
        formula: '(Total Days Lost x 1,000,000) / Employee-hours of exposure',
        rounding: 'Nearest whole number',
      },

      averageDaysCharged: {
        name: 'Average Days Charged per Disabling Injury/Illness',
        formula1: 'Total Days Lost / Total Number of Disabling Injuries/Illnesses',
        formula2: 'Severity Rate / Frequency Rate',
      },
    },
  },

  // ===========================================
  // FORMS SUMMARY
  // ===========================================
  forms: {
    'DOLE/BWC/HSD-IP-6': 'Work Accident/Illness Report (disabling injuries and dangerous occurrences)',
    'DOLE/BWC/OHSD-IP-6a': 'Death/Permanent Total Disability Investigation Report',
    'DOLE/BWC/HSD-IP-6b': 'Annual Work Accident/Illness Exposure Data Report',
  },

  // ===========================================
  // REPORTING DEADLINES SUMMARY
  // ===========================================
  deadlines: {
    deathOrPermanentTotal: {
      initial: '24 hours (fastest means)',
      formal: '20th of following month',
      investigation: '48 hours after receipt (by Regional Office)',
    },
    disablingInjury: {
      formal: '20th of following month',
      investigation: '30th of same month',
    },
    dangerousOccurrence: 'Upon occurrence',
    annualReport: '30th of January (following calendar year)',
  },
};

// Helper functions
export function calculateFrequencyRate(disablingInjuries: number, employeeHours: number): number {
  if (employeeHours === 0) return 0;
  const rate = (disablingInjuries * 1000000) / employeeHours;
  return Math.round(rate * 100) / 100; // Round to 2 decimal places
}

export function calculateSeverityRate(totalDaysLost: number, employeeHours: number): number {
  if (employeeHours === 0) return 0;
  const rate = (totalDaysLost * 1000000) / employeeHours;
  return Math.round(rate); // Round to nearest whole number
}

export function calculateAverageDaysCharged(totalDaysLost: number, totalDisablingInjuries: number): number {
  if (totalDisablingInjuries === 0) return 0;
  return totalDaysLost / totalDisablingInjuries;
}

export function getScheduledCharge(injuryType: string): number {
  const charges: Record<string, number> = {
    death: 6000,
    permanentTotal: 6000,
    permanentTotalDisability: 6000,
  };
  return charges[injuryType] || 0;
}

export function getReportingDeadline(incidentType: string): string {
  const deadlines = RULE_1050.deadlines;

  switch (incidentType.toLowerCase()) {
    case 'death':
    case 'permanent total':
    case 'fatal':
      return `Initial: ${deadlines.deathOrPermanentTotal.initial}, Formal: ${deadlines.deathOrPermanentTotal.formal}`;
    case 'disabling':
    case 'disabling injury':
      return `Formal report: ${deadlines.disablingInjury.formal}`;
    case 'dangerous occurrence':
      return deadlines.dangerousOccurrence;
    case 'annual':
      return deadlines.annualReport;
    default:
      return 'Check specific incident type';
  }
}

export function getDangerousOccurrences(): string[] {
  return RULE_1050.reportRequirements['1053.02'].dangerousOccurrences;
}

export function getRecordKeepingRequirements(): string[] {
  return RULE_1050.recordKeeping.minimumData;
}

export function getDisabilityDefinition(type: string): string {
  const defs = RULE_1050.definitions;

  switch (type.toLowerCase()) {
    case 'death':
      return defs.death.definition;
    case 'permanent total':
    case 'ptd':
      return `${defs.permanentTotalDisability.definition} Includes: ${defs.permanentTotalDisability.includes.join('; ')}`;
    case 'permanent partial':
    case 'ppd':
      return defs.permanentPartialDisability.definition;
    case 'temporary total':
    case 'ttd':
      return defs.temporaryTotalDisability.definition;
    default:
      return 'Unknown disability type';
  }
}

export function getRule1050Summary(): string {
  return `
Rule 1050 - Notification and Keeping of Records Key Points:

REPORTING DEADLINES:
- Death/Permanent Total: 24 hours initial, 20th of following month formal
- Disabling Injury: 20th of following month
- Dangerous Occurrence: Upon occurrence
- Annual Report: January 30th

FORMS:
- IP-6: Work Accident/Illness Report
- IP-6a: Death/PTD Investigation Report
- IP-6b: Annual Exposure Data Report

SCHEDULED CHARGES:
- Death: 6,000 days
- Permanent Total Disability: 6,000 days
- Permanent Partial: Per Table 6
- Maximum: 6,000 days

RATE FORMULAS:
- Frequency Rate = (Disabling Injuries x 1,000,000) / Employee-hours
- Severity Rate = (Days Lost x 1,000,000) / Employee-hours

DANGEROUS OCCURRENCES (must report):
- Boiler explosions
- Pressure vessel explosions
- Grinding wheel bursting
- Crane collapse/overturning
- Fire/explosion causing 24+ hour stoppage
- Electrical failure with fire/explosion
  `.trim();
}
