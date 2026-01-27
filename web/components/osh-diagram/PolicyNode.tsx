'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { OSHPolicy, POLICY_TYPE_COLORS, POLICY_TYPE_LABELS } from '@/lib/oshPolicyData';
import { getYear } from '@/lib/oshDiagramUtils';

interface PolicyNodeData {
  policy: OSHPolicy;
}

function PolicyNode({ data, selected }: NodeProps<PolicyNodeData>) {
  const { policy } = data;
  const colors = POLICY_TYPE_COLORS[policy.type];
  const typeLabel = POLICY_TYPE_LABELS[policy.type];
  const year = getYear(policy.effectiveDate);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-500 !w-2 !h-2"
      />
      <div
        className={`
          relative p-3 rounded-lg border-2 bg-surface
          min-w-[180px] max-w-[200px]
          cursor-pointer transition-all duration-200
          hover:shadow-lg hover:shadow-primary/20
          ${colors.border}
          ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
          ${policy.status === 'superseded' ? 'opacity-60' : ''}
        `}
      >
        {/* Type Badge */}
        <div className={`absolute -top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded ${colors.bg} ${colors.text}`}>
          {typeLabel}
        </div>

        {/* Status Badge */}
        {policy.status === 'superseded' && (
          <div className="absolute -top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400">
            Superseded
          </div>
        )}

        {/* Content */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold text-sm ${colors.text}`}>
              {policy.shortName}
            </h3>
            <span className="text-xs text-gray-500">{year}</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 leading-tight">
            {policy.title}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-500 !w-2 !h-2"
      />
    </>
  );
}

export default memo(PolicyNode);
