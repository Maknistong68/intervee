export interface Policy {
  id: string;
  ruleNumber: string;
  title: string;
  keywords: string[];
}

export const policies: Policy[] = [
  {
    id: 'rule1020',
    ruleNumber: 'Rule 1020',
    title: 'Registration',
    keywords: ['registration', 'register', 'dole', 'compliance', 'rule 1020']
  },
  {
    id: 'rule1030',
    ruleNumber: 'Rule 1030',
    title: 'Safety Officer',
    keywords: ['safety officer', 'so1', 'so2', 'so3', 'so4', 'bosh', 'rule 1030']
  },
  {
    id: 'rule1040',
    ruleNumber: 'Rule 1040',
    title: 'Health & Safety Committee',
    keywords: ['hsc', 'health and safety committee', 'committee', 'rule 1040']
  },
  {
    id: 'rule1050',
    ruleNumber: 'Rule 1050',
    title: 'Accident/Illness Reporting',
    keywords: ['accident', 'incident', 'illness', 'wair', 'report', 'rule 1050']
  },
  {
    id: 'rule1070',
    ruleNumber: 'Rule 1070',
    title: 'Environmental Control',
    keywords: ['environmental', 'environment', 'ventilation', 'air quality', 'rule 1070']
  },
  {
    id: 'rule1080',
    ruleNumber: 'Rule 1080',
    title: 'PPE',
    keywords: ['ppe', 'personal protective equipment', 'safety equipment', 'rule 1080']
  },
  {
    id: 'rule1090',
    ruleNumber: 'Rule 1090',
    title: 'Hazardous Materials',
    keywords: ['hazardous', 'chemical', 'toxic', 'rule 1090']
  },
  {
    id: 'rule1140',
    ruleNumber: 'Rule 1140',
    title: 'Electrical Safety',
    keywords: ['electrical', 'electric', 'wiring', 'rule 1140']
  },
  {
    id: 'rule1150',
    ruleNumber: 'Rule 1150',
    title: 'Fire Protection',
    keywords: ['fire', 'firefighting', 'extinguisher', 'rule 1150']
  },
  {
    id: 'rule1960',
    ruleNumber: 'Rule 1960',
    title: 'Health Services',
    keywords: ['health services', 'medical', 'first aid', 'clinic', 'nurse', 'physician', 'rule 1960']
  },
  {
    id: 'do198',
    ruleNumber: 'D.O. 198',
    title: 'Safety Officer Accreditation',
    keywords: ['do 198', 'accreditation', 'training', 'certification']
  },
  {
    id: 'do253',
    ruleNumber: 'D.O. 253-24',
    title: 'Revised OSHS',
    keywords: ['do 253', 'revised', 'ra 11058', '2024', 'new rules']
  },
  {
    id: 'ra11058',
    ruleNumber: 'RA 11058',
    title: 'OSH Law',
    keywords: ['ra 11058', 'osh law', 'republic act', 'law']
  }
];

export function detectPolicyFromText(text: string): string | null {
  const lowerText = text.toLowerCase();

  for (const policy of policies) {
    for (const keyword of policy.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return policy.id;
      }
    }
  }

  return null;
}
