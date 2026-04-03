import type { Node, Edge } from "@xyflow/react";
import type { DiagramType } from "../../core/model/types";

export interface NodePanelProps {
  node: Node;
  diagramType: DiagramType;
  allNodes: Node[];
  allEdges: Edge[];
  onLabelChange: (id: string, label: string) => void;
  onTypeChange: (id: string, type: string) => void;
  onPropertyChange: (id: string, key: string, value: unknown) => void;
  theme: "light" | "dark";
}

export interface EdgePanelProps {
  edge: Edge;
  diagramType: DiagramType;
  allNodes: Node[];
  onLabelChange: (id: string, label: string) => void;
  onPropertyChange: (id: string, key: string, value: unknown) => void;
  theme: "light" | "dark";
}
