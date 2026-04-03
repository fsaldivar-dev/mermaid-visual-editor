import type { Node, Edge } from "@xyflow/react";
import type { DiagramModel } from "../model/types";

export interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

export function toReactFlow(model: DiagramModel): ReactFlowData {
  const nodes: Node[] = model.elements.map((el) => ({
    id: el.id,
    type: el.shape,
    data: {
      label: el.label,
      ...el.properties,
    },
    position: el.position,
  }));

  const edges: Edge[] = model.connections.map((conn) => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    label: conn.label,
    type: "smoothstep",
    markerEnd: { type: "arrowclosed" as const },
    style: { strokeWidth: 2 },
  }));

  return { nodes, edges };
}
