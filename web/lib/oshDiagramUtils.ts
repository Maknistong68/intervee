// Utility functions for OSH Policy Diagram layout and filtering

import { Node, Edge, Position } from 'reactflow';
import { OSHPolicy, PolicyType, OSH_POLICIES, POLICY_TYPE_COLORS, getPolicyById } from './oshPolicyData';

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 100;

// Layout configuration
interface LayoutConfig {
  startX: number;
  startY: number;
}

// Convert policies to React Flow nodes with hierarchical layout
export function generateNodes(
  policies: OSHPolicy[],
  config: LayoutConfig = { startX: 0, startY: 0 }
): Node[] {
  const nodes: Node[] = [];

  // Group policies by type for layout
  const raPolicy = policies.find(p => p.type === 'republic_act');
  const oshsRules = policies.filter(p => p.type === 'oshs_rule');
  const deptOrders = policies.filter(p => p.type === 'dept_order');
  const laborAdvisories = policies.filter(p => p.type === 'labor_advisory');
  const deptAdvisories = policies.filter(p => p.type === 'dept_advisory');

  let currentY = config.startY;

  // Level 0: Republic Act (center top)
  if (raPolicy) {
    const centerX = config.startX + (Math.max(oshsRules.length, deptOrders.length) * (NODE_WIDTH + HORIZONTAL_GAP)) / 2 - NODE_WIDTH / 2;
    nodes.push(createNode(raPolicy, centerX, currentY));
    currentY += NODE_HEIGHT + VERTICAL_GAP;
  }

  // Level 1: IRR (DO 252-25)
  const irrPolicy = deptOrders.find(p => p.id === 'do-252-25');
  if (irrPolicy) {
    const centerX = config.startX + (Math.max(oshsRules.length, deptOrders.length) * (NODE_WIDTH + HORIZONTAL_GAP)) / 2 - NODE_WIDTH / 2;
    nodes.push(createNode(irrPolicy, centerX, currentY));
    currentY += NODE_HEIGHT + VERTICAL_GAP;
  }

  // Level 2: OSHS Rules (spread horizontally)
  if (oshsRules.length > 0) {
    const totalWidth = oshsRules.length * NODE_WIDTH + (oshsRules.length - 1) * HORIZONTAL_GAP;
    const startX = config.startX + (Math.max(oshsRules.length, deptOrders.length) * (NODE_WIDTH + HORIZONTAL_GAP) - totalWidth) / 2;

    oshsRules.forEach((policy, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);
      nodes.push(createNode(policy, x, currentY));
    });
    currentY += NODE_HEIGHT + VERTICAL_GAP;
  }

  // Level 3: Other Department Orders
  const otherDOs = deptOrders.filter(p => p.id !== 'do-252-25' && p.id !== 'do-198-18');
  if (otherDOs.length > 0) {
    const totalWidth = otherDOs.length * NODE_WIDTH + (otherDOs.length - 1) * HORIZONTAL_GAP;
    const startX = config.startX + (Math.max(oshsRules.length, otherDOs.length) * (NODE_WIDTH + HORIZONTAL_GAP) - totalWidth) / 2;

    otherDOs.forEach((policy, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);
      nodes.push(createNode(policy, x, currentY));
    });
    currentY += NODE_HEIGHT + VERTICAL_GAP;
  }

  // Level 4: Labor Advisories
  if (laborAdvisories.length > 0) {
    const totalWidth = laborAdvisories.length * NODE_WIDTH + (laborAdvisories.length - 1) * HORIZONTAL_GAP;
    const startX = config.startX + (Math.max(oshsRules.length, laborAdvisories.length) * (NODE_WIDTH + HORIZONTAL_GAP) - totalWidth) / 2;

    laborAdvisories.forEach((policy, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);
      nodes.push(createNode(policy, x, currentY));
    });
    currentY += NODE_HEIGHT + VERTICAL_GAP;
  }

  // Level 5: Department Advisories
  if (deptAdvisories.length > 0) {
    const totalWidth = deptAdvisories.length * NODE_WIDTH + (deptAdvisories.length - 1) * HORIZONTAL_GAP;
    const startX = config.startX + (Math.max(oshsRules.length, deptAdvisories.length) * (NODE_WIDTH + HORIZONTAL_GAP) - totalWidth) / 2;

    deptAdvisories.forEach((policy, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);
      nodes.push(createNode(policy, x, currentY));
    });
  }

  // Add superseded policy (DO 198-18) off to the side
  const supersededPolicy = deptOrders.find(p => p.id === 'do-198-18');
  if (supersededPolicy) {
    const x = config.startX - NODE_WIDTH - HORIZONTAL_GAP;
    const y = config.startY + NODE_HEIGHT + VERTICAL_GAP;
    nodes.push(createNode(supersededPolicy, x, y));
  }

  return nodes;
}

// Create a single node
function createNode(policy: OSHPolicy, x: number, y: number): Node {
  return {
    id: policy.id,
    type: 'policyNode',
    position: { x, y },
    data: {
      policy,
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  };
}

// Generate edges from policy relationships
export function generateEdges(policies: OSHPolicy[]): Edge[] {
  const edges: Edge[] = [];

  policies.forEach(policy => {
    policy.relationships.forEach(rel => {
      const targetPolicy = getPolicyById(rel.targetId);
      if (targetPolicy && policies.some(p => p.id === rel.targetId)) {
        edges.push({
          id: `${policy.id}-${rel.targetId}-${rel.type}`,
          source: policy.id,
          target: rel.targetId,
          type: 'policyEdge',
          data: {
            relationshipType: rel.type,
          },
          animated: rel.type === 'implements',
          style: getEdgeStyle(rel.type),
        });
      }
    });
  });

  return edges;
}

// Get edge style based on relationship type
function getEdgeStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'implements':
      return { stroke: '#10b981', strokeWidth: 2 };
    case 'supersedes':
      return { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' };
    case 'amends':
      return { stroke: '#f59e0b', strokeWidth: 2 };
    case 'supplements':
      return { stroke: '#8b5cf6', strokeWidth: 1.5 };
    case 'updates':
      return { stroke: '#3b82f6', strokeWidth: 1.5 };
    default:
      return { stroke: '#6b7280', strokeWidth: 1 };
  }
}

// Filter policies by selected types
export function filterPolicies(
  selectedTypes: PolicyType[]
): OSHPolicy[] {
  if (selectedTypes.length === 0) {
    return OSH_POLICIES;
  }
  return OSH_POLICIES.filter(p => selectedTypes.includes(p.type));
}

// Get year from date string
export function getYear(dateStr: string): string {
  return dateStr.split('-')[0];
}

// Format relationship type for display
export function formatRelationshipType(type: string): string {
  switch (type) {
    case 'implements':
      return 'Implements';
    case 'supersedes':
      return 'Supersedes';
    case 'amends':
      return 'Amends';
    case 'supplements':
      return 'Supplements';
    case 'updates':
      return 'Updates';
    default:
      return type;
  }
}

// Calculate diagram bounds for fit view
export function calculateBounds(nodes: Node[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
    maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
  });

  return { minX, minY, maxX, maxY };
}
