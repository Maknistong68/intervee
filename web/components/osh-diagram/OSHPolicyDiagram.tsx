'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Maximize2, Minimize2 } from 'lucide-react';

import { OSHPolicy, OSH_POLICIES, PolicyType, getPolicyById, POLICY_TYPE_COLORS } from '@/lib/oshPolicyData';
import { generateNodes, generateEdges, filterPolicies } from '@/lib/oshDiagramUtils';
import PolicyNode from './PolicyNode';
import PolicyEdge from './PolicyEdge';
import PolicyDetailPanel from './PolicyDetailPanel';
import DiagramControls from './DiagramControls';
import DiagramLegend from './DiagramLegend';

interface OSHPolicyDiagramProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom node types
const nodeTypes = {
  policyNode: PolicyNode,
};

// Custom edge types
const edgeTypes = {
  policyEdge: PolicyEdge,
};

function DiagramContent({ onClose }: { onClose: () => void }) {
  const { fitView, setCenter } = useReactFlow();

  // State
  const [selectedPolicy, setSelectedPolicy] = useState<OSHPolicy | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<PolicyType[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter policies based on selected types
  const filteredPolicies = useMemo(() => {
    return filterPolicies(selectedTypes);
  }, [selectedTypes]);

  // Generate nodes and edges
  const initialNodes = useMemo(() => generateNodes(filteredPolicies, { startX: 100, startY: 50 }), [filteredPolicies]);
  const initialEdges = useMemo(() => generateEdges(filteredPolicies), [filteredPolicies]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when filter changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const policy = getPolicyById(node.id);
    if (policy) {
      setSelectedPolicy(policy);
    }
  }, []);

  // Handle type filter toggle
  const handleTypeToggle = useCallback((type: PolicyType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  // Navigate to policy in diagram
  const handleNavigateToPolicy = useCallback((policyId: string) => {
    const node = nodes.find((n) => n.id === policyId);
    if (node) {
      setCenter(node.position.x + 100, node.position.y + 40, { duration: 500, zoom: 1.5 });
      const policy = getPolicyById(policyId);
      if (policy) {
        setSelectedPolicy(policy);
      }
    }
  }, [nodes, setCenter]);

  // Handle close
  const handleClose = useCallback(() => {
    setSelectedPolicy(null);
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPolicy) {
          setSelectedPolicy(null);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPolicy, handleClose]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Mini map node color
  const nodeColor = (node: Node) => {
    const policy = node.data?.policy as OSHPolicy;
    if (!policy) return '#6b7280';
    const colors = POLICY_TYPE_COLORS[policy.type];
    switch (policy.type) {
      case 'republic_act':
        return '#eab308';
      case 'oshs_rule':
        return '#10b981';
      case 'dept_order':
        return '#3b82f6';
      case 'labor_advisory':
        return '#8b5cf6';
      case 'dept_advisory':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-divider bg-surface">
        <div>
          <h1 className="text-lg font-bold text-white">Philippine OSH Policy Framework</h1>
          <p className="text-xs text-gray-500">Interactive diagram showing legal relationships and hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-surface-light text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Close diagram"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Filter Controls */}
      <DiagramControls
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        onReset={handleResetFilters}
      />

      {/* Diagram Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'policyEdge',
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="!bg-surface !border-divider !rounded-lg [&>button]:!bg-surface [&>button]:!border-divider [&>button]:!text-gray-400 [&>button:hover]:!bg-surface-light" />
          <MiniMap
            className="!bg-surface !border-divider !rounded-lg"
            nodeColor={nodeColor}
            maskColor="rgba(0, 0, 0, 0.7)"
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#333"
          />
        </ReactFlow>

        {/* Legend */}
        <DiagramLegend />
      </div>

      {/* Detail Panel */}
      <PolicyDetailPanel
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
        onNavigate={handleNavigateToPolicy}
      />

      {/* Instructions Overlay (shown initially) */}
      {!selectedPolicy && nodes.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10 bg-surface/90 border border-divider rounded-lg p-3 text-xs text-gray-400 max-w-xs">
          <p><strong className="text-primary">Click</strong> a policy node to view details</p>
          <p><strong className="text-primary">Scroll</strong> to zoom • <strong className="text-primary">Drag</strong> to pan</p>
          <p><strong className="text-primary">Filter</strong> by policy type using the buttons above</p>
        </div>
      )}
    </div>
  );
}

export default function OSHPolicyDiagram({ isOpen, onClose }: OSHPolicyDiagramProps) {
  if (!isOpen) return null;

  return (
    <ReactFlowProvider>
      <DiagramContent onClose={onClose} />
    </ReactFlowProvider>
  );
}
