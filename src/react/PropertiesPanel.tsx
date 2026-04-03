import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { DiagramType } from "../core/model/types";
import { getNodePanel, getEdgePanel } from "./panels";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  diagramType?: DiagramType;
  allNodes?: Node[];
  allEdges?: Edge[];
  onNodeLabelChange?: (id: string, label: string) => void;
  onNodeTypeChange?: (id: string, type: string) => void;
  onNodePropertyChange?: (id: string, key: string, value: unknown) => void;
  onEdgeLabelChange?: (id: string, label: string) => void;
  onEdgePropertyChange?: (id: string, key: string, value: unknown) => void;
  theme?: "light" | "dark";
}

export function PropertiesPanel({
  selectedNode,
  selectedEdge,
  diagramType = "flowchart",
  allNodes = [],
  allEdges = [],
  onNodeLabelChange,
  onNodeTypeChange,
  onNodePropertyChange,
  onEdgeLabelChange,
  onEdgePropertyChange,
  theme = "light",
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  const NodePanel = useMemo(() => getNodePanel(diagramType), [diagramType]);
  const EdgePanel = useMemo(() => getEdgePanel(diagramType), [diagramType]);

  return (
    <div className="mve-properties" data-theme={theme} role="form" aria-label="Properties panel">
      {selectedNode && (
        <NodePanel
          node={selectedNode}
          diagramType={diagramType}
          allNodes={allNodes}
          allEdges={allEdges}
          onLabelChange={onNodeLabelChange || (() => {})}
          onTypeChange={onNodeTypeChange || (() => {})}
          onPropertyChange={onNodePropertyChange || (() => {})}
          theme={theme}
        />
      )}
      {selectedEdge && (
        <EdgePanel
          edge={selectedEdge}
          diagramType={diagramType}
          allNodes={allNodes}
          onLabelChange={onEdgeLabelChange || (() => {})}
          onPropertyChange={onEdgePropertyChange || (() => {})}
          theme={theme}
        />
      )}
    </div>
  );
}
