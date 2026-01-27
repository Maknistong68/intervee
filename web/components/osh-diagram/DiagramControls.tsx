'use client';

import { PolicyType, POLICY_TYPE_COLORS, POLICY_TYPE_LABELS } from '@/lib/oshPolicyData';

interface DiagramControlsProps {
  selectedTypes: PolicyType[];
  onTypeToggle: (type: PolicyType) => void;
  onReset: () => void;
}

const ALL_TYPES: PolicyType[] = ['republic_act', 'oshs_rule', 'dept_order', 'labor_advisory', 'dept_advisory'];

export default function DiagramControls({ selectedTypes, onTypeToggle, onReset }: DiagramControlsProps) {
  const isAllSelected = selectedTypes.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-surface border-b border-divider">
      <span className="text-xs text-gray-500 mr-2">Filter:</span>

      {/* Show All Button */}
      <button
        onClick={onReset}
        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
          isAllSelected
            ? 'bg-primary text-white border-primary'
            : 'bg-surface-light text-gray-400 border-divider hover:border-primary/50'
        }`}
      >
        All
      </button>

      {/* Type Filter Buttons */}
      {ALL_TYPES.map((type) => {
        const colors = POLICY_TYPE_COLORS[type];
        const label = POLICY_TYPE_LABELS[type];
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => onTypeToggle(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              isSelected
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-surface-light text-gray-400 border-divider hover:border-gray-500'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
