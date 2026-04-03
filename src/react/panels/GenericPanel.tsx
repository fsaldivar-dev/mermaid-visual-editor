import type { NodePanelProps } from "./types";
import { ValidationMessage } from "../components/ValidationMessage";

const DEFAULT_SHAPES = [
  { type: "rect", label: "Rectangle", icon: "\u25ad" },
  { type: "rounded", label: "Rounded", icon: "\u25a2" },
  { type: "diamond", label: "Decision", icon: "\u25c7" },
  { type: "circle", label: "Circle", icon: "\u25cb" },
];

export function GenericNodePanel({ node, onLabelChange, onTypeChange }: NodePanelProps) {
  const label = (node.data?.label as string) || "";

  return (
    <>
      <h4>Node</h4>
      <label>
        <span>Label</span>
        <input
          value={label}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
          autoFocus
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
    </>
  );
}
