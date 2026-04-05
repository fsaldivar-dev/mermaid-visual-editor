import type { Node, Edge } from "@xyflow/react";
import type { DiagramModel } from "../model/types";

export interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

export function toReactFlow(model: DiagramModel): ReactFlowData {
  const subgraphIds = new Set((model.subgraphs || []).map((sg) => sg.id));

  const nodes: Node[] = model.elements.map((el) => {
    const isGroup = subgraphIds.has(el.id);
    const node: Node = {
      id: el.id,
      type: isGroup ? "group" : el.shape,
      data: {
        label: el.label,
        ...el.properties,
      },
      position: el.position,
    };

    if (isGroup) {
      // ReactFlow group nodes need explicit style for bounds
      node.style = {
        width: 300,
        height: 200,
        backgroundColor: "rgba(208, 208, 255, 0.15)",
        borderRadius: 8,
        border: "1px dashed #999",
        padding: 10,
      };
    }

    if (el.parentId) {
      node.parentId = el.parentId;
      node.extent = "parent";
    }

    return node;
  });

  // Sort: group nodes must come before their children
  nodes.sort((a, b) => {
    if (a.id === b.parentId) return -1;
    if (b.id === a.parentId) return 1;
    return 0;
  });

  const isER = model.type === "er";
  const isMindmap = model.type === "mindmap";

  const edges: Edge[] = model.connections.map((conn) => {
    const relationshipType = conn.properties.relationshipType as string | undefined;
    let markerEndType = (conn.properties.markerEndType as string) || "arrowclosed";
    let markerStartType = (conn.properties.markerStartType as string) || undefined;
    let lineStyle = conn.properties.lineStyle as string | undefined;

    // For ER diagrams, use the cardinality string as the edge label
    // and suppress default arrow markers
    let edgeLabel = conn.label;
    if (isER) {
      const cardinality = conn.properties.cardinality as string | undefined;
      // Show only the relationship verb as label (not the cardinality notation)
      // Cardinality is already conveyed visually; avoid label accumulation on roundtrips
      edgeLabel = conn.label || undefined;
      // ER relationships don't use arrow markers
      markerEndType = "none";
      markerStartType = undefined;
      // Check for dotted line style (identifying relationships use "..")
      if (cardinality && cardinality.includes("..")) {
        lineStyle = "dotted";
      }
    }

    // Map class diagram relationship types to marker types
    if (relationshipType) {
      switch (relationshipType) {
        case "<|--": // Inheritance
          markerEndType = "triangle";
          break;
        case "*--": // Composition
          markerEndType = "diamond-filled";
          break;
        case "o--": // Aggregation
          markerEndType = "diamond-hollow";
          break;
        case "-->": // Association
          markerEndType = "arrowclosed";
          break;
        case "..>": // Dependency
          markerEndType = "arrowclosed";
          lineStyle = "dotted";
          break;
        case "<|..": // Realization
          markerEndType = "triangle";
          lineStyle = "dotted";
          break;
      }
    }

    // Build markerEnd/markerStart based on custom types
    // These are used as defaults; EditableEdge resolves custom markers from data
    let markerEnd: Edge["markerEnd"] = undefined;
    if (markerEndType === "none") {
      markerEnd = undefined;
    } else if (markerEndType === "arrowclosed" || !markerEndType) {
      markerEnd = { type: "arrowclosed" as const };
    }
    let markerStart: Edge["markerStart"] = undefined;
    if (markerStartType === "arrowclosed") {
      markerStart = { type: "arrowclosed" as const };
    }

    // Mindmap edges: no arrows, bezier curves, branch-colored
    if (isMindmap) {
      markerEndType = "none";
      markerEnd = undefined;
      markerStart = undefined;
      const sourceElement = model.elements.find(el => el.id === conn.source);
      if (sourceElement?.properties.branchIndex !== undefined) {
        const branchColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
        const branchColor = branchColors[(sourceElement.properties.branchIndex as number) % branchColors.length];
        conn.properties.strokeColor = branchColor;
      }
    }

    const properties = { ...conn.properties };
    if (markerEndType) properties.markerEndType = markerEndType;
    if (markerStartType) properties.markerStartType = markerStartType;
    if (lineStyle) properties.lineStyle = lineStyle;
    if (isMindmap) properties.edgeStyle = "bezier";

    return {
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: (conn.properties.sourceHandle as string) || undefined,
      targetHandle: (conn.properties.targetHandle as string) || undefined,
      label: isER ? edgeLabel : conn.label,
      type: "editable",
      ...(markerEnd ? { markerEnd } : {}),
      ...(markerStart ? { markerStart } : {}),
      style: { strokeWidth: 2 },
      data: properties,
    };
  });

  return { nodes, edges };
}
