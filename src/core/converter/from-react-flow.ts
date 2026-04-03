import type { Node, Edge } from "@xyflow/react";
import type { DiagramModel, DiagramElement, DiagramConnection, NodeShape, DiagramType, Direction } from "../model/types";

export function fromReactFlow(
  nodes: Node[],
  edges: Edge[],
  type: DiagramType = "flowchart",
  direction: Direction = "TD"
): DiagramModel {
  const elements: DiagramElement[] = nodes.map((node) => ({
    id: node.id,
    label: (node.data?.label as string) || node.id,
    shape: (node.type as NodeShape) || "rect",
    position: node.position,
    properties: {},
  }));

  const connections: DiagramConnection[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label as string | undefined,
    properties: {},
  }));

  return { type, direction, elements, connections, metadata: {} };
}
