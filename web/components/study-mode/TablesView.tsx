'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Table2 } from 'lucide-react';

interface TableData {
  id: string;
  title: string;
  description: string;
  citation: string;
  headers: string[];
  rows: string[][];
  notes?: string[];
}

const OSH_TABLES: TableData[] = [
  // ==========================================
  // SAFETY OFFICER REQUIREMENTS
  // ==========================================
  {
    id: 'so-requirements',
    title: 'Safety Officer Requirements by Workplace Type',
    description: 'Minimum SO level required based on hazard classification and number of workers',
    citation: 'Rule 1033, OSHS',
    headers: ['Workers', 'Non-Hazardous', 'Hazardous', 'Highly Hazardous'],
    rows: [
      ['1-9', 'Part-time SO1', 'Part-time SO1', 'Part-time SO2'],
      ['10-50', 'Part-time SO1', 'Part-time SO2', 'Full-time SO2'],
      ['51-200', 'Part-time SO2', 'Full-time SO2', 'Full-time SO3'],
      ['201-250', 'Full-time SO2', 'Full-time SO3', 'Full-time SO4'],
      ['251-500', 'Full-time SO2', 'Full-time SO3', 'Full-time SO4 + 1 SO'],
      ['501-750', 'Full-time SO2 + 1 SO', 'Full-time SO3 + 1 SO', 'Full-time SO4 + 2 SO'],
      ['751-1000', 'Full-time SO2 + 1 SO', 'Full-time SO3 + 2 SO', 'Full-time SO4 + 3 SO'],
      ['1000+', '+1 SO per 400 excess', '+1 SO per 300 excess', '+1 SO per 250 excess'],
    ],
    notes: [
      'SO1 = 8 hours training',
      'SO2 = 40 hours BOSH training',
      'SO3 = 80 hours (40 BOSH + 40 COSH)',
      'SO4 = 120 hours (BOSH + COSH + specialized)',
      'Refresher training required every 2 years',
    ],
  },

  // ==========================================
  // SAFETY OFFICER TRAINING HOURS
  // ==========================================
  {
    id: 'so-training',
    title: 'Safety Officer Training Requirements',
    description: 'Training hours and courses required for each SO level',
    citation: 'Rule 1030, OSHS',
    headers: ['SO Level', 'Total Hours', 'Required Courses', 'Refresher'],
    rows: [
      ['SO1', '8 hours', 'Basic OSH for Workers', '8 hours / 2 years'],
      ['SO2', '40 hours', 'BOSH (Basic Occupational Safety & Health)', '16 hours / 2 years'],
      ['SO3', '80 hours', 'BOSH (40 hrs) + COSH (40 hrs)', '16 hours / 2 years'],
      ['SO4', '120 hours', 'BOSH + COSH + Specialized Modules (40 hrs)', '16 hours / 2 years'],
    ],
    notes: [
      'BOSH = Basic Occupational Safety and Health',
      'COSH = Construction Occupational Safety and Health',
      'Training must be from DOLE-accredited providers',
    ],
  },

  // ==========================================
  // HEALTH & SAFETY COMMITTEE TYPES
  // ==========================================
  {
    id: 'hsc-types',
    title: 'Health & Safety Committee Composition',
    description: 'Committee type and member composition by workplace size',
    citation: 'Rule 1040, OSHS',
    headers: ['Type', 'Total Members', 'Management', 'Workers', 'Non-Hazardous', 'Hazardous'],
    rows: [
      ['None', '0', '-', '-', '1-9 workers', '1-9 workers'],
      ['Type A', '2', '1', '1', '10-50 workers', '-'],
      ['Type B', '4', '2', '2', '51-200 workers', '10-50 workers'],
      ['Type C', '6', '3', '3', '201-500 workers', '51-200 workers'],
      ['Type D', '8', '4', '4', '501+ workers', '201-500 workers'],
      ['Type E', '12', '6', '6', '-', '501+ workers'],
    ],
    notes: [
      'Committee must meet at least once a month',
      'Reorganize every January',
      'Management representative serves as Chairman',
      'Worker reps elected by workers or designated by union',
      'Keep meeting minutes for at least 5 years',
    ],
  },

  // ==========================================
  // NOISE EXPOSURE LIMITS
  // ==========================================
  {
    id: 'noise-limits',
    title: 'Permissible Noise Exposure Limits',
    description: 'Maximum allowable exposure time based on noise level (5 dBA halving rate)',
    citation: 'Rule 1070.2, OSHS',
    headers: ['Noise Level (dBA)', 'Max Exposure Time', 'Action Required'],
    rows: [
      ['85', '16 hours', 'Hearing conservation program recommended'],
      ['90', '8 hours', 'PEL - Hearing protection required'],
      ['95', '4 hours', 'Hearing protection mandatory'],
      ['100', '2 hours', 'Hearing protection mandatory'],
      ['105', '1 hour', 'Hearing protection mandatory'],
      ['110', '30 minutes', 'Hearing protection mandatory'],
      ['115', '15 minutes', 'Maximum allowable'],
      ['Above 115', 'Not permitted', 'Engineering controls required'],
    ],
    notes: [
      '90 dBA is the Permissible Exposure Limit (PEL) for 8 hours',
      'Every 5 dBA increase halves the allowable time',
      'Hearing conservation program required at 85 dBA action level',
      'Audiometric testing required for exposed workers',
    ],
  },

  // ==========================================
  // ILLUMINATION STANDARDS
  // ==========================================
  {
    id: 'illumination',
    title: 'Minimum Illumination Requirements',
    description: 'Lux requirements for different work areas and tasks',
    citation: 'Rule 1070.1, OSHS',
    headers: ['Work Area / Task', 'Minimum Lux', 'Examples'],
    rows: [
      ['Emergency lighting', '10 lux', 'Exit routes, evacuation paths'],
      ['Storage areas', '50 lux', 'Warehouses, inactive storage'],
      ['Corridors, stairs', '100 lux', 'Hallways, stairwells, washrooms'],
      ['General work areas', '200 lux', 'Rough assembly, packing'],
      ['Offices, control rooms', '300 lux', 'Desk work, computer work'],
      ['Detailed work', '500 lux', 'Assembly, inspection, sewing'],
      ['Fine detailed work', '750 lux', 'Electronics assembly, drafting'],
      ['Very fine work', '1000+ lux', 'Jewelry, watchmaking, surgery'],
    ],
    notes: [
      'Measurements taken at work surface level',
      'Avoid glare and harsh shadows',
      'Natural lighting preferred where possible',
      'Emergency lighting must be independent power source',
    ],
  },

  // ==========================================
  // ACCIDENT REPORTING DEADLINES
  // ==========================================
  {
    id: 'reporting-deadlines',
    title: 'Accident Reporting Requirements & Deadlines',
    description: 'When and how to report workplace incidents to DOLE',
    citation: 'Rule 1050, OSHS',
    headers: ['Incident Type', 'Deadline', 'Report To', 'Form'],
    rows: [
      ['Fatal accident', '24 hours', 'DOLE Regional Office', 'Initial notification'],
      ['Serious injury (hospitalization)', '24 hours', 'DOLE Regional Office', 'Initial notification'],
      ['Dangerous occurrence', '24 hours', 'DOLE Regional Office', 'Initial notification'],
      ['All work accidents/illness', '20th of following month', 'DOLE-BWC', 'WAIR (Monthly)'],
      ['Zero accident month', '20th of following month', 'DOLE-BWC', 'Nil WAIR report'],
      ['Annual summary', 'January 30', 'DOLE-BWC', 'Annual Report'],
    ],
    notes: [
      'WAIR = Work Accident/Illness Report',
      'Form: DOLE-BWC-HSD-IP-6',
      'Preserve accident scene until DOLE investigation (fatal/serious)',
      'Keep accident records for at least 5 years',
      'Failure to report is a violation under RA 11058',
    ],
  },

  // ==========================================
  // PENALTIES TABLE
  // ==========================================
  {
    id: 'penalties',
    title: 'OSH Violation Penalties (RA 11058)',
    description: 'Administrative and criminal penalties for OSH violations',
    citation: 'RA 11058, Sections 12-13',
    headers: ['Violation', 'Penalty', 'Additional Consequences'],
    rows: [
      ['Non-compliance with OSH standards', 'PHP 100,000/day', 'Cumulative until corrected'],
      ['Failure to report accident', 'PHP 100,000/day', 'Per unreported incident'],
      ['Obstruction of DOLE inspection', 'PHP 100,000/day', 'May lead to WSO'],
      ['Retaliation against workers', 'PHP 50,000-100,000', 'Criminal charges possible'],
      ['Imminent danger situation', 'Work Stoppage Order', 'Operations halted'],
      ['3 violations in 3 years', 'Criminal prosecution', 'Imprisonment possible'],
      ['Death due to willful violation', 'Criminal charges', 'Imprisonment + fines'],
    ],
    notes: [
      'Fines continue daily until violation is corrected',
      'DOLE Regional Directors can impose penalties',
      'Work Stoppage Order (WSO) for imminent danger',
      'Responsible officers may face personal liability',
    ],
  },

  // ==========================================
  // PREMISES REQUIREMENTS
  // ==========================================
  {
    id: 'premises',
    title: 'Workplace Premises Requirements',
    description: 'Minimum standards for workplace facilities',
    citation: 'Rule 1060, OSHS',
    headers: ['Requirement', 'Standard', 'Notes'],
    rows: [
      ['Ceiling height', '2.7 meters', '2.4m if air-conditioned'],
      ['Floor space per worker', '2 square meters', 'Clear, unobstructed'],
      ['Toilet ratio', '1 per 25 workers', 'Separate for male/female if 10+'],
      ['Main aisle width', '1.12 meters (44")', 'Keep clear at all times'],
      ['Secondary aisle', '0.71 meters (28")', 'Minimum passageway'],
      ['Exit door width', '0.71 meters min', 'Swing outward'],
      ['Stair width', '1.12 meters (44")', 'Handrails both sides if wider'],
      ['Stair riser height', '20 cm max (7.5")', 'Uniform throughout'],
      ['Number of exits', '2 minimum', 'If 50+ occupants or 93+ sqm'],
      ['Travel distance to exit', '45m (non-hazardous)', '23m for hazardous areas'],
    ],
    notes: [
      'EXIT signs must be illuminated and visible from 30 meters',
      'Exits must not be locked or obstructed during work hours',
      'Emergency lighting minimum 10 lux',
      'Floors must be slip-resistant in wet/hazardous areas',
    ],
  },

  // ==========================================
  // HEALTH PERSONNEL REQUIREMENTS
  // ==========================================
  {
    id: 'health-personnel',
    title: 'Occupational Health Personnel Requirements',
    description: 'Required health staff based on workplace size and hazard level',
    citation: 'Rule 1960, OSHS',
    headers: ['Workers', 'First-aider', 'Nurse', 'Physician', 'Treatment Room'],
    rows: [
      ['1-50 (non-haz)', '1 per 50', '-', '-', 'First aid kit'],
      ['1-50 (hazardous)', '1 per 25', '-', 'On-call', 'First aid kit'],
      ['51-200', '1 per 50', 'Full-time', 'Part-time', 'Treatment room'],
      ['201-300', '1 per 50', 'Full-time', 'Part-time', 'Emergency room'],
      ['301-500', '1 per 50', '2 Full-time', 'Full-time', 'Emergency room'],
      ['501-1000', '1 per 50', '3 Full-time', 'Full-time', 'Clinic'],
      ['1000+', '1 per 50', '+1 per 500', '+1 per 1000', 'Hospital arrangement'],
    ],
    notes: [
      'First-aider training: minimum 16 hours',
      'Nurse: must be registered (RN)',
      'Physician: must be trained in occupational health',
      'Medical records kept for 30 years after employment',
      'Employer pays for all required medical exams',
    ],
  },

  // ==========================================
  // CONFINED SPACE REQUIREMENTS
  // ==========================================
  {
    id: 'confined-space',
    title: 'Confined Space Entry Requirements',
    description: 'Atmospheric limits and safety requirements for confined spaces',
    citation: 'Rule 1087, OSHS',
    headers: ['Parameter', 'Safe Range', 'Action if Outside Range'],
    rows: [
      ['Oxygen (O2)', '19.5% - 23.5%', 'Do not enter / Use SCBA'],
      ['Oxygen < 19.5%', 'Deficient', 'Ventilate or use supplied air'],
      ['Oxygen > 23.5%', 'Enriched (fire risk)', 'Ventilate, remove ignition sources'],
      ['LEL (flammables)', '< 10% of LEL', 'Do not enter if higher'],
      ['CO (Carbon Monoxide)', '< 35 ppm', 'Ventilate, use respirator'],
      ['H2S (Hydrogen Sulfide)', '< 10 ppm', 'Ventilate, use respirator'],
    ],
    notes: [
      'Test atmosphere in order: O2 → Flammables → Toxics',
      'Standby person (watcher) required outside',
      'Entry permit required for each entry',
      'Continuous monitoring if conditions may change',
      'Rescue equipment and trained personnel must be ready',
      'Lockout/Tagout (LOTO) required before entry',
    ],
  },

  // ==========================================
  // FALL PROTECTION REQUIREMENTS
  // ==========================================
  {
    id: 'fall-protection',
    title: 'Fall Protection Requirements',
    description: 'When and what fall protection is required',
    citation: 'Rule 1412, OSHS',
    headers: ['Height', 'Requirement', 'Acceptable Methods'],
    rows: [
      ['< 6 feet (1.8m)', 'No requirement', 'Good housekeeping'],
      ['6+ feet (1.8m)', 'Fall protection required', 'Guardrails, nets, or harness'],
      ['Leading edge work', 'Fall protection required', 'Personal fall arrest system'],
      ['Holes/openings', 'Cover or guard required', 'Covers, guardrails'],
      ['Scaffolds > 10 feet', 'Guardrails required', 'Top rail, mid rail, toe board'],
      ['Ladders > 24 feet', 'Cage or fall arrest', 'Ladder safety system'],
    ],
    notes: [
      '6 feet = trigger height for fall protection',
      'Guardrails: 42" top rail, 21" mid rail, 4" toe board',
      'Safety nets within 30 feet of work surface',
      'Full body harness with shock-absorbing lanyard',
      'Anchor points must support 5,000 lbs per worker',
    ],
  },

  // ==========================================
  // PPE SELECTION GUIDE
  // ==========================================
  {
    id: 'ppe-guide',
    title: 'PPE Selection by Hazard Type',
    description: 'Required personal protective equipment for common hazards',
    citation: 'Rule 1080, OSHS',
    headers: ['Hazard', 'Head', 'Eyes/Face', 'Hands', 'Feet', 'Body'],
    rows: [
      ['Impact/falling objects', 'Hard hat', 'Safety glasses', 'Work gloves', 'Safety shoes', 'Hi-vis vest'],
      ['Chemical splash', 'Face shield', 'Goggles', 'Chemical gloves', 'Chemical boots', 'Chemical suit'],
      ['Welding', 'Welding hood', 'Shade lens', 'Welding gloves', 'Safety shoes', 'Leather apron'],
      ['Electrical', 'Insulated', 'Safety glasses', 'Insulated gloves', 'Insulated boots', '-'],
      ['Noise > 85 dBA', '-', '-', '-', '-', 'Ear plugs/muffs'],
      ['Dust/particles', '-', 'Safety glasses', '-', '-', 'Dust mask/N95'],
      ['Heights > 6 ft', 'Hard hat', '-', '-', '-', 'Full body harness'],
      ['Hot work', 'Face shield', 'Safety glasses', 'Heat gloves', 'Safety shoes', 'FR clothing'],
    ],
    notes: [
      'Employer provides all PPE free of charge',
      'PPE is LAST resort (after engineering/admin controls)',
      'Workers must be trained on proper use',
      'Employer must maintain and replace damaged PPE',
      'Hierarchy: Elimination → Substitution → Engineering → Admin → PPE',
    ],
  },

  // ==========================================
  // REGISTRATION REQUIREMENTS
  // ==========================================
  {
    id: 'registration',
    title: 'Workplace Registration Requirements',
    description: 'DOLE registration deadlines and forms',
    citation: 'Rule 1020, OSHS',
    headers: ['Action', 'Deadline', 'Form', 'Where to File'],
    rows: [
      ['New establishment', '30 days before operation', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
      ['Construction project', 'Before work starts', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
      ['Change of ownership', '30 days after change', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
      ['Change of location', '30 days after change', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
      ['Change of business name', '30 days after change', 'DOLE-BWC-IP-3', 'DOLE Regional Office'],
      ['Closure/cessation', '30 days before', 'Letter notification', 'DOLE Regional Office'],
    ],
    notes: [
      'Registration is FREE',
      'Certificate of Registration issued upon approval',
      'Each contractor must register separately',
      'Operating without registration is a violation',
    ],
  },

  // ==========================================
  // WORKERS COMPENSATION (EC)
  // ==========================================
  {
    id: 'ec-benefits',
    title: 'Employees Compensation Benefits',
    description: 'Scheduled benefits under the EC program (PD 626)',
    citation: 'PD 626, Employees Compensation',
    headers: ['Contingency', 'Benefit Days', 'Monthly Pension', 'Other Benefits'],
    rows: [
      ['Death', '6,000 days', 'Survivors pension', 'Funeral benefit PHP 30,000'],
      ['Permanent Total Disability', '4,800 days', 'Monthly pension for life', 'Medical services'],
      ['Permanent Partial Disability', 'Based on schedule', 'Lump sum or pension', 'Medical services'],
      ['Temporary Total Disability', '120 days (max 240)', '90% of daily salary', 'Medical services'],
      ['Sickness', '120 days (max 240)', '90% of daily salary', 'Medical services'],
    ],
    notes: [
      'Benefits from SSS (private) or GSIS (government)',
      'Work-related injury/illness must be proven',
      'File claim within 3 years of contingency',
      'Medical services include hospitalization, medicines, rehab',
    ],
  },
];

export default function TablesView() {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['so-requirements', 'hsc-types']));

  const toggleTable = (id: string) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedTables(new Set(OSH_TABLES.map(t => t.id)));
  };

  const collapseAll = () => {
    setExpandedTables(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table2 className="w-5 h-5 text-primary" />
          <span className="text-sm text-gray-400">{OSH_TABLES.length} reference tables</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-primary hover:text-primary-light transition-colors"
          >
            Expand All
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tables */}
      {OSH_TABLES.map((table) => {
        const isExpanded = expandedTables.has(table.id);

        return (
          <div
            key={table.id}
            className="bg-surface border border-divider rounded-xl overflow-hidden"
          >
            {/* Table header */}
            <button
              onClick={() => toggleTable(table.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface-light hover:bg-surface-light/80 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{table.title}</h3>
                <p className="text-xs text-gray-500 truncate">{table.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs text-gray-600 hidden sm:inline">{table.citation}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Table content */}
            {isExpanded && (
              <div className="p-4 animate-fade-in">
                {/* Citation on mobile */}
                <p className="text-xs text-primary mb-3 sm:hidden">{table.citation}</p>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-light">
                        {table.headers.map((header, idx) => (
                          <th
                            key={idx}
                            className="px-3 py-2 text-left text-primary font-semibold border-b border-divider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="border-b border-divider/50 hover:bg-surface-light/30 transition-colors"
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className={`px-3 py-2 ${
                                cellIdx === 0 ? 'font-medium text-white' : 'text-gray-300'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                {table.notes && table.notes.length > 0 && (
                  <div className="mt-4 p-3 bg-surface-light/50 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-400 mb-2">Key Notes:</p>
                    <ul className="space-y-1">
                      {table.notes.map((note, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
