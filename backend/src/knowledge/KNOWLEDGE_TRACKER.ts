// OSH Knowledge Base Tracker
// Last Updated: 2026-01-24
// Use this file to track which policies have been added to the knowledge base

export const KNOWLEDGE_TRACKER = {
  // ===========================================
  // OSHS RULES
  // ===========================================
  rules: {
    rule1020: {
      title: 'Registration',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1020.ts',
      notes: 'Complete - Sections 1021-1024',
    },
    rule1030: {
      title: 'Training of Personnel in Occupational Safety and Health',
      status: 'DONE',
      amendments: ['DO 252, s. 2025'],
      file: 'rules/rule1030.ts',
      notes: 'Complete with SO levels and requirements',
    },
    rule1040: {
      title: 'Health and Safety Committee',
      status: 'DONE',
      amendments: ['DO 252, s. 2025'],
      file: 'rules/rule1040.ts',
      notes: 'Need to verify if complete',
    },
    rule1050: {
      title: 'Notification and Keeping of Records of Accidents and/or Occupational Illnesses',
      status: 'DONE',
      amendments: ['LA 07, s. 2022', 'DO 252, s. 2025'],
      file: 'rules/rule1050.ts',
      notes: 'Complete - Sections 1051-1056, definitions, formulas, dangerous occurrences',
    },
    rule1060: {
      title: 'Premises of Establishments',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1060.ts',
      notes: 'Complete - Sections 1060-1069, construction, space, stairs, ladders, yards',
    },
    rule1070: {
      title: 'Occupational Health and Environmental Control',
      status: 'DONE',
      amendments: ['DO 136, s. 2014', 'DO 160, s. 2016', 'DO 254, s. 2016', 'DO 224, s. 2021'],
      file: 'rules/rule1070.ts',
      notes: 'Complete - TLVs, noise, illumination, ventilation, working environment measurement',
    },
    rule1080: {
      title: 'Personal Protective Equipment and Devices',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1080.ts',
      notes: 'Complete - Sections 1081-1087, all PPE types, fall protection specs',
    },
    rule1090: {
      title: 'Hazardous Materials',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1090.ts',
      notes: 'Complete - Sections 1091-1096, labeling, storage, lead compounds',
    },
    rule1100: {
      title: 'Gas and Electric Welding and Cutting Operations',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1100.ts',
      notes: 'Complete - General provisions, PPE, confined spaces',
    },
    rule1120: {
      title: 'Hazardous Work Processes',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1120.ts',
      notes: 'Complete - Confined space work, 9 precautions, watcher requirements',
    },
    rule1140: {
      title: 'Explosives',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1140.ts',
      notes: 'Complete - Magazine classes, distances, storage, lightning protection',
    },
    rule1160: {
      title: 'Boiler',
      status: 'DONE',
      amendments: [],
      file: 'rules/rule1160.ts',
      notes: 'Complete - Definitions, general provisions, power boilers, heating boilers, cleaning/repairs, plan requirements',
    },
    rule1960: {
      title: 'Occupational Health Services',
      status: 'DONE',
      amendments: [
        'DO 252, s. 2025',
        'DO 53, s. 2003',
        'DO 73, s. 2005 (amended by LA 21, s. 2023)',
        'DO 102, s. 2010 (amended by LA 22, s. 2023)',
        'DO 178, s. 2017',
        'DO 184, s. 2017',
        'DO 208, s. 2020 (amended by LA 19, s. 2023)',
        'DO 235, s. 2022',
        'DA 05, s. 2010',
        'LA 01, s. 2023',
        'LA 08, s. 2023',
        'LA 19, s. 2023',
        'LA 20, s. 2023',
        'LA 21, s. 2023',
        'LA 22, s. 2023',
        'LA 23, s. 2023',
      ],
      file: 'rules/rule1960.ts',
      notes: 'Complete - General provisions, emergency health services, qualifications, duties, health program, physical examinations',
    },
  },

  // ===========================================
  // DEPARTMENT ORDERS (DO)
  // ===========================================
  departmentOrders: {
    DO_53_2003: { title: 'Productivity Bonus', status: 'PENDING', relatedTo: 'Rule 1960' },
    DO_73_2005: { title: 'Compressed Work Week', status: 'PENDING', relatedTo: 'Rule 1960', amendedBy: 'LA 21, s. 2023' },
    DO_102_2010: { title: 'SEnA (Single Entry Approach)', status: 'PENDING', relatedTo: 'Rule 1960', amendedBy: 'LA 22, s. 2023' },
    DO_136_2014: { title: 'Working Conditions in Commercial Establishments', status: 'PENDING', relatedTo: 'Rule 1070' },
    DO_160_2016: { title: 'Safety in Construction', status: 'PENDING', relatedTo: 'Rule 1070' },
    DO_178_2017: { title: 'Drug-Free Workplace', status: 'PENDING', relatedTo: 'Rule 1960' },
    DO_184_2017: { title: 'Young Workers Protection', status: 'PENDING', relatedTo: 'Rule 1960' },
    DO_208_2020: { title: 'OSH during COVID-19', status: 'PENDING', relatedTo: 'Rule 1960', amendedBy: 'LA 19, s. 2023' },
    DO_224_2021: { title: 'Vaccination Programs', status: 'PENDING', relatedTo: 'Rule 1070' },
    DO_235_2022: { title: 'OSH Digital Systems', status: 'PENDING', relatedTo: 'Rule 1960' },
    DO_252_2025: { title: 'Comprehensive OSH Amendments', status: 'PENDING', relatedTo: 'Rules 1030, 1040, 1050, 1960' },
    DO_254_2016: { title: 'Workplace Air Quality', status: 'PENDING', relatedTo: 'Rule 1070' },
  },

  // ===========================================
  // LABOR ADVISORIES (LA)
  // ===========================================
  laborAdvisories: {
    LA_07_2022: { title: 'Zero Accident Reporting', status: 'PENDING', relatedTo: 'Rule 1050' },
    LA_01_2023: { title: 'Flexible Work Arrangements', status: 'PENDING', relatedTo: 'Rule 1960' },
    LA_08_2023: { title: 'Heat Stress Management', status: 'PENDING', relatedTo: 'Rule 1960' },
    LA_19_2023: { title: 'Mental Health Programs', status: 'PENDING', relatedTo: 'Rule 1960' },
    LA_20_2023: { title: 'Workplace Violence Prevention', status: 'PENDING', relatedTo: 'Rule 1960' },
    LA_21_2023: { title: 'Emergency Preparedness', status: 'PENDING', relatedTo: 'Rule 1960' },
    LA_22_2023: { title: 'Return to Onsite Work', status: 'PENDING', relatedTo: 'Rule 1960' },
    LA_23_2023: { title: 'Hybrid Work Arrangements', status: 'PENDING', relatedTo: 'Rule 1960' },
  },

  // ===========================================
  // DEPARTMENT ADVISORY (DA)
  // ===========================================
  departmentAdvisories: {
    DA_05_2010: { title: 'Related to OHS', status: 'PENDING', relatedTo: 'Rule 1960' },
  },

  // ===========================================
  // LAWS
  // ===========================================
  laws: {
    RA_11058: { title: 'Occupational Safety and Health Standards Act', status: 'DONE', file: 'ra11058.ts' },
  },
};

// Summary function
export function getProgressSummary() {
  const rules = Object.values(KNOWLEDGE_TRACKER.rules);
  const dos = Object.values(KNOWLEDGE_TRACKER.departmentOrders);
  const las = Object.values(KNOWLEDGE_TRACKER.laborAdvisories);
  const das = Object.values(KNOWLEDGE_TRACKER.departmentAdvisories);
  const laws = Object.values(KNOWLEDGE_TRACKER.laws);

  const countStatus = (items: any[]) => ({
    done: items.filter(i => i.status === 'DONE').length,
    pending: items.filter(i => i.status === 'PENDING').length,
    total: items.length,
  });

  return {
    rules: countStatus(rules),
    departmentOrders: countStatus(dos),
    laborAdvisories: countStatus(las),
    departmentAdvisories: countStatus(das),
    laws: countStatus(laws),
  };
}
