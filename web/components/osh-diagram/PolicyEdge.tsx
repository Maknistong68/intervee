'use client';

import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { formatRelationshipType } from '@/lib/oshDiagramUtils';

interface PolicyEdgeData {
  relationshipType: string;
}

function PolicyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps<PolicyEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationshipLabel = data?.relationshipType ? formatRelationshipType(data.relationshipType) : '';

  // Get label color based on relationship type
  const getLabelColor = () => {
    switch (data?.relationshipType) {
      case 'implements':
        return 'bg-emerald-500/80 text-white';
      case 'supersedes':
        return 'bg-red-500/80 text-white';
      case 'amends':
        return 'bg-amber-500/80 text-white';
      case 'supplements':
        return 'bg-purple-500/80 text-white';
      case 'updates':
        return 'bg-blue-500/80 text-white';
      default:
        return 'bg-gray-500/80 text-white';
    }
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      {relationshipLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getLabelColor()}`}
          >
            {relationshipLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(PolicyEdge);
