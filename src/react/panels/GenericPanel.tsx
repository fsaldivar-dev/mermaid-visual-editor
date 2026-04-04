import type { NodePanelProps } from "./types";
import { ValidationMessage } from "../components/ValidationMessage";

const DEFAULT_SHAPES = [
  { type: "rect", label: "Rectangle", icon: "\u25ad" },
  { type: "rounded", label: "Rounded", icon: "\u25a2" },
  { type: "diamond", label: "Decision", icon: "\u25c7" },
  { type: "circle", label: "Circle", icon: "\u25cb" },
];

export function GenericNodePanel({ node, onLabelChange, onTypeChange, onPropertyChange }: NodePanelProps) {
  const label = (node.data?.label as string) || "";

  return (
    <>
      <h4>Node</h4>
      <label>
        <span>Label</span>
        <input
          value={label}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
        />
        {!label.trim() && <ValidationMessage message="Label cannot be empty" />}
      </label>
      <label>
        <span>Shape</span>
        <select
          value={node.type || "rect"}
          onChange={(e) => onTypeChange(node.id, e.target.value)}
        >
          {DEFAULT_SHAPES.map((s) => (
            <option key={s.type} value={s.type}>
              {s.icon} {s.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Fill Color</span>
        <div className="mve-color-row">
          <input
            type="color"
            className="mve-color-swatch"
            value={(node.data?.fillColor as string) || "#ffffff"}
            onChange={(e) => onPropertyChange(node.id, "fillColor", e.target.value)}
          />
          <input
            value={(node.data?.fillColor as string) || "#ffffff"}
            onChange={(e) => onPropertyChange(node.id, "fillColor", e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </label>
      <label>
        <span>Border Color</span>
        <div className="mve-color-row">
          <input
            type="color"
            className="mve-color-swatch"
            value={(node.data?.borderColor as string) || "#3b82f6"}
            onChange={(e) => onPropertyChange(node.id, "borderColor", e.target.value)}
          />
          <input
            value={(node.data?.borderColor as string) || "#3b82f6"}
            onChange={(e) => onPropertyChange(node.id, "borderColor", e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </label>
      <label>
        <span>Font Color</span>
        <div className="mve-color-row">
          <input
            type="color"
            className="mve-color-swatch"
            value={(node.data?.fontColor as string) || "#1d1d1f"}
            onChange={(e) => onPropertyChange(node.id, "fontColor", e.target.value)}
          />
          <input
            value={(node.data?.fontColor as string) || "#1d1d1f"}
            onChange={(e) => onPropertyChange(node.id, "fontColor", e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </label>
    </>
  );
}
