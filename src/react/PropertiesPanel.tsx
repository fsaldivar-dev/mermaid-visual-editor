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

const MESSAGE_TYPES = [
  { value: "->>", label: "\u2192 Request", description: "Solid arrow right" },
  { value: "-->>", label: "\u2190 Reply", description: "Dashed arrow left" },
  { value: "->", label: "\u2192 Async", description: "Open arrow right" },
  { value: "-->", label: "\u2190 Async reply", description: "Dashed open left" },
];

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  diagramType?: DiagramType;
  participants?: { id: string; label: string }[];
  onNodeLabelChange?: (id: string, label: string) => void;
  onNodeTypeChange?: (id: string, type: string) => void;
  onNodePropertyChange?: (id: string, key: string, value: unknown) => void;
  onEdgeLabelChange?: (id: string, label: string) => void;
  theme?: "light" | "dark";
}

export function PropertiesPanel({
  selectedNode,
  selectedEdge,
  diagramType = "flowchart",
  participants = [],
  onNodeLabelChange,
  onNodeTypeChange,
  onNodePropertyChange,
  onEdgeLabelChange,
  theme = "light",
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  const isMessage = selectedNode?.data?.isMessage as boolean | undefined;
  const isParticipant = selectedNode?.data?.isParticipant as boolean | undefined;
  const shapes = SHAPES_BY_TYPE[diagramType];

  const handleFlip = () => {
    if (!selectedNode || !isMessage) return;
    const src = selectedNode.data?.sourceParticipant as string;
    const tgt = selectedNode.data?.targetParticipant as string;
    onNodePropertyChange?.(selectedNode.id, "sourceParticipant", tgt);
    onNodePropertyChange?.(selectedNode.id, "targetParticipant", src);
  };

  return (
    <div className="mve-properties" data-theme={theme}>
      {selectedNode && isMessage && (
        <>
          <h4>Message</h4>
          <label>
            <span>Text</span>
            <input
              value={(selectedNode.data?.label as string) || ""}
              onChange={(e) =>
                onNodeLabelChange?.(selectedNode.id, e.target.value)
              }
              autoFocus
            />
          </label>
          <label>
            <span>From</span>
            <div style={{ display: "flex", gap: 4 }}>
              <select
                value={(selectedNode.data?.sourceParticipant as string) || ""}
                onChange={(e) =>
                  onNodePropertyChange?.(selectedNode.id, "sourceParticipant", e.target.value)
                }
                style={{ flex: 1 }}
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <button
                className="mve-flip-btn"
                onClick={handleFlip}
                title="Swap From/To"
              >
                ⇄
              </button>
            </div>
          </label>
          <label>
            <span>To</span>
            <select
              value={(selectedNode.data?.targetParticipant as string) || ""}
              onChange={(e) =>
                onNodePropertyChange?.(selectedNode.id, "targetParticipant", e.target.value)
              }
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Type</span>
            <select
              value={(selectedNode.data?.messageType as string) || "->>"}
              onChange={(e) =>
                onNodePropertyChange?.(selectedNode.id, "messageType", e.target.value)
              }
            >
              {MESSAGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        </>
      )}
      {selectedNode && isParticipant && (
        <>
          <h4>Participant</h4>
          <label>
            <span>Name</span>
            <input
              value={(selectedNode.data?.label as string) || ""}
              onChange={(e) =>
                onNodeLabelChange?.(selectedNode.id, e.target.value)
              }
              autoFocus
            />
          </label>
        </>
      )}
      {selectedNode && !isMessage && !isParticipant && (
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
          {shapes && (
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
