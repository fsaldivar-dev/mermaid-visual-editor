import { useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";

const DEFAULT_WIDTH = 172;
const DEFAULT_HEIGHT = 60;

interface NodeBounds {
  cx: number;
  cy: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function getBounds(node: Node): NodeBounds {
  const w = (node.measured?.width ?? node.width) || DEFAULT_WIDTH;
  const h = (node.measured?.height ?? node.height) || DEFAULT_HEIGHT;
  return {
    cx: node.position.x + w / 2,
    cy: node.position.y + h / 2,
    left: node.position.x,
    right: node.position.x + w,
    top: node.position.y,
    bottom: node.position.y + h,
  };
}

/**
 * Compute the optimal source/target handle pair based on relative node positions.
 * Uses the dominant axis (largest distance) to determine direction.
 */
export function computeOptimalHandles(
  sourceNode: Node,
  targetNode: Node
): { sourceHandle: string; targetHandle: string } {
  const src = getBounds(sourceNode);
  const tgt = getBounds(targetNode);

  const dx = tgt.cx - src.cx;
  const dy = tgt.cy - src.cy;

  // Use the axis with the larger absolute distance
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal dominant
    if (dx > 0) {
      return { sourceHandle: "right", targetHandle: "left" };
    } else {
      return { sourceHandle: "left", targetHandle: "right" };
    }
  } else {
    // Vertical dominant
    if (dy > 0) {
      return { sourceHandle: "bottom", targetHandle: "top" };
    } else {
      return { sourceHandle: "top", targetHandle: "bottom" };
    }
  }
}

/**
 * Check if a node uses named handles (BaseNode with 4-side handles: top/bottom/left/right).
 * Only nodes that extend BaseNode or DiamondNode have named handle IDs.
 * All other specialized nodes have unnamed handles and smart routing must skip them.
 */
function nodeHasNamedHandles(node: Node): boolean {
  const namedHandleTypes = new Set([
    "rect", "rounded", "circle", "diamond", "default",
    "stadium", "subroutine", "cylinder", "hexagon",
    "parallelogram", "trapezoid", "asymmetric", "doubleCircle",
    "entity", "classNode", "state", "actor", "forkJoin", "choice", "note",
    "mindmapNode", "timelineEvent", "pieSlice", "journeyStep", "gitCommit", "ganttTask",
  ]);
  // State terminals only have 1 handle
  if (node.data?.isStart || node.data?.isEnd) return true; // they have ID'd handles now
  return namedHandleTypes.has(node.type || "");
}

/**
 * Recalculate optimal handles for all edges connected to a given node.
 * Only updates edges where BOTH source and target have named handles.
 */
export function recalculateEdges(
  movedNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Edge[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return edges.map((edge) => {
    // Only recalculate if this edge connects to the moved node
    if (edge.source !== movedNodeId && edge.target !== movedNodeId) return edge;

    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return edge;

    // Only recalculate for nodes with named handles
    if (!nodeHasNamedHandles(sourceNode) || !nodeHasNamedHandles(targetNode)) return edge;

    const { sourceHandle, targetHandle } = computeOptimalHandles(sourceNode, targetNode);

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });
}

/**
 * Compute optimal handles for ALL edges (used when converting from model).
 */
export function computeAllEdgeHandles(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return edge;

    const srcNamed = nodeHasNamedHandles(sourceNode);
    const tgtNamed = nodeHasNamedHandles(targetNode);

    // If either node doesn't have named handles, clear any stale handle IDs
    if (!srcNamed || !tgtNamed) {
      if (edge.sourceHandle || edge.targetHandle) {
        return { ...edge, sourceHandle: undefined, targetHandle: undefined };
      }
      return edge;
    }

    const { sourceHandle, targetHandle } = computeOptimalHandles(sourceNode, targetNode);
    return { ...edge, sourceHandle, targetHandle };
  });
}

export function useSmartEdges() {
  const recalculate = useCallback(
    (movedNodeId: string, nodes: Node[], edges: Edge[]): Edge[] => {
      return recalculateEdges(movedNodeId, nodes, edges);
    },
    []
  );

  const computeAll = useCallback(
    (nodes: Node[], edges: Edge[]): Edge[] => {
      return computeAllEdgeHandles(nodes, edges);
    },
    []
  );

  return { recalculate, computeAll };
}
