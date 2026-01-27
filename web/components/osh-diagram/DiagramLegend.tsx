'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { POLICY_TYPE_COLORS, POLICY_TYPE_LABELS, PolicyType } from '@/lib/oshPolicyData';

const ALL_TYPES: PolicyType[] = ['republic_act', 'oshs_rule', 'dept_order', 'labor_advisory', 'dept_advisory'];

const RELATIONSHIP_COLORS = [
  { type: 'Implements', color: 'bg-emerald-500', description: 'Provides detailed rules for enforcement' },
  { type: 'Supersedes', color: 'bg-red-500', description: 'Replaces an older policy' },
  { type: 'Amends', color: 'bg-amber-500', description: 'Modifies specific provisions' },
  { type: 'Supplements', color: 'bg-purple-500', description: 'Adds complementary guidelines' },
  { type: 'Updates', color: 'bg-blue-500', description: 'Refreshes existing requirements' },
];

export default function DiagramLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-surface border border-divider rounded-lg shadow-lg overflow-hidden">
        {/* Toggle Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-300 hover:bg-surface-light transition-colors"
        >
          <span>Legend</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Legend Content */}
        {isExpanded && (
          <div className="px-3 pb-3 space-y-3">
            {/* Policy Types */}
            <div>
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Policy Types</h4>
              <div className="space-y-1">
                {ALL_TYPES.map((type) => {
                  const colors = POLICY_TYPE_COLORS[type];
                  const label = POLICY_TYPE_LABELS[type];
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded border-2 ${colors.border} ${colors.bg}`} />
                      <span className="text-[10px] text-gray-400">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Relationship Types */}
            <div>
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Relationships</h4>
              <div className="space-y-1">
                {RELATIONSHIP_COLORS.map((rel) => (
                  <div key={rel.type} className="flex items-center gap-2">
                    <div className={`w-4 h-0.5 ${rel.color}`} />
                    <span className="text-[10px] text-gray-400">{rel.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-gray-400 bg-surface" />
                  <span className="text-[10px] text-gray-400">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-gray-600 bg-surface opacity-60" />
                  <span className="text-[10px] text-gray-400">Superseded</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
