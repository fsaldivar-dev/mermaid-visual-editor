import type { Node, Edge } from "@xyflow/react";

const SHAPES = [
  { type: "rect", label: "Rectangle", icon: "\u25ad" },
  { type: "rounded", label: "Rounded", icon: "\u25a2" },
  { type: "diamond", label: "Decision", icon: "\u25c7" },
  { type: "circle", label: "Circle", icon: "\u25cb" },
];

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeLabelChange?: (id: string, label: string) => void;
  onNodeTypeChange?: (id: string, type: string) => void;
  onEdgeLabelChange?: (id: string, label: string) => void;
  theme?: "light" | "dark";
}

export function PropertiesPanel({
  selectedNode,
  selectedEdge,
  onNodeLabelChange,
  onNodeTypeChange,
  onEdgeLabelChange,
  theme = "light",
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="mve-properties" data-theme={theme}>
      {selectedNode && (
        <>
          <h4>Node</h4>
          <label>
            <span>Label</span>
            <input
              value={(selectedNode.data?.label as string) || ""}
              onChange={(e) =>
                onNodeLabelChange?.(selectedNode.id, e.target.value)
              }
              autoFocus
            />
          </label>
          <label>
            <span>Shape</span>
            <select
              value={selectedNode.type || "rect"}
              onChange={(e) =>
                onNodeTypeChange?.(selectedNode.id, e.target.value)
              }
            >
              {SHAPES.map((s) => (
                <option key={s.type} value={s.type}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>
          </label>
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
