import type { Node, Edge } from "@xyflow/react";
import type { DiagramModel, DiagramElement, DiagramConnection, NodeShape, DiagramType, Direction, SubgraphDef } from "../model/types";

export function fromReactFlow(
  nodes: Node[],
  edges: Edge[],
  type: DiagramType = "flowchart",
  direction: Direction = "TD"
): DiagramModel {
  const subgraphs: SubgraphDef[] = [];

  const elements: DiagramElement[] = nodes.map((node) => {
    // Extract properties from data (everything except 'label')
    const { label, ...properties } = (node.data || {}) as Record<string, unknown>;
    const element: DiagramElement = {
      id: node.id,
      label: (label as string) || node.id,
      shape: (node.type as NodeShape) || "rect",
      position: node.position,
      properties,
    };

    if (node.parentId) {
      element.parentId = node.parentId;
    }

    return element;
  });

  // Reconstruct subgraphs from group-type nodes
  const groupNodes = nodes.filter((n) => n.type === "group");
  for (const group of groupNodes) {
    const children = elements
      .filter((el) => el.parentId === group.id && el.id !== group.id)
      .map((el) => el.id);
    subgraphs.push({
      id: group.id,
      label: (group.data?.label as string) || group.id,
      children,
    });
  }

  const connections: DiagramConnection[] = edges.map((edge) => {
    const props = (edge.data as Record<string, unknown>) || {};
    // Persist handle IDs for multi-side connections
    if (edge.sourceHandle) props.sourceHandle = edge.sourceHandle;
    if (edge.targetHandle) props.targetHandle = edge.targetHandle;
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label as string | undefined,
      properties: props,
    };
  });

  return {
    type,
    direction,
    elements,
    connections,
    metadata: {},
    subgraphs: subgraphs.length > 0 ? subgraphs : undefined,
  };
}
