import type { Node, Edge } from "@xyflow/react";
import type { DiagramType } from "../core/model/types";

const SHAPES_BY_TYPE: Record<string, { type: string; label: string; icon: string }[]> = {
  flowchart: [
    { type: "rect", label: "Rectangle", icon: "\u25ad" },
    { type: "rounded", label: "Rounded", icon: "\u25a2" },
    { type: "diamond", label: "Decision", icon: "\u25c7" },
    { type: "circle", label: "Circle", icon: "\u25cb" },
  ],
  state: [{ type: "rounded", label: "State", icon: "\u25a2" }],
  class: [{ type: "rect", label: "Class", icon: "\u25ad" }],
  er: [{ type: "rect", label: "Entity", icon: "\u25ad" }],
};

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  diagramType?: DiagramType;
  onNodeLabelChange?: (id: string, label: string) => void;
  onNodeTypeChange?: (id: string, type: string) => void;
  onEdgeLabelChange?: (id: string, label: string) => void;
  theme?: "light" | "dark";
}

export function PropertiesPanel({
  selectedNode,
  selectedEdge,
  diagramType = "flowchart",
  onNodeLabelChange,
  onNodeTypeChange,
  onEdgeLabelChange,
  theme = "light",
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  const isMessage = selectedNode?.data?.isMessage;
  const isParticipant = selectedNode?.data?.isParticipant;
  const shapes = SHAPES_BY_TYPE[diagramType];

  return (
    <div className="mve-properties" data-theme={theme}>
      {selectedNode && (
        <>
          <h4>{isMessage ? "Message" : isParticipant ? "Participant" : "Node"}</h4>
          <label>
            <span>{isMessage ? "Text" : "Label"}</span>
            <input
              value={(selectedNode.data?.label as string) || ""}
              onChange={(e) =>
                onNodeLabelChange?.(selectedNode.id, e.target.value)
              }
              autoFocus
            />
          </label>
          {/* Only show shape selector for diagram types that support it */}
          {shapes && !isMessage && !isParticipant && (
            <label>
              <span>Shape</span>
              <select
                value={selectedNode.type || "rect"}
                onChange={(e) =>
                  onNodeTypeChange?.(selectedNode.id, e.target.value)
                }
              >
                {shapes.map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
      {selectedEdge && (
        <>
          <h4>Connection</h4>
          <label>
            <span>Label</span>
            <input
              value={(selectedEdge.label as string) || ""}
              onChange={(e) =>
                onEdgeLabelChange?.(selectedEdge.id, e.target.value)
              }
              placeholder="Edge label"
              autoFocus
            />
          </label>
        </>
      )}
    </div>
  );
}
