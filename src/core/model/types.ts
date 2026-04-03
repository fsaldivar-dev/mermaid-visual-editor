export type DiagramType =
  | "flowchart"
  | "sequence"
  | "class"
  | "state"
  | "er"
  | "gantt"
  | "pie"
  | "mindmap"
  | "timeline"
  | "journey"
  | "gitgraph"
  | "c4"
  | "block"
  | "requirement"
  | "generic";

export type Direction = "TD" | "TB" | "LR" | "RL" | "BT";

export type NodeShape = "rect" | "rounded" | "diamond" | "circle";

export interface DiagramElement {
  id: string;
  label: string;
  shape: NodeShape;
  position: { x: number; y: number };
  properties: Record<string, unknown>;
}

export interface DiagramConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: string;
  properties: Record<string, unknown>;
}

export interface DiagramModel {
  type: DiagramType;
  direction: Direction;
  elements: DiagramElement[];
  connections: DiagramConnection[];
  metadata: Record<string, string>;
}

export function createEmptyModel(
  type: DiagramType = "flowchart",
  direction: Direction = "TD"
): DiagramModel {
  return { type, direction, elements: [], connections: [], metadata: {} };
}
