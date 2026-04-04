import type { NodePanelProps } from "./types";
import { ValidationMessage } from "../components/ValidationMessage";

export function BlockNodePanel({ node, onLabelChange }: NodePanelProps) {
  const label = (node.data?.label as string) || "";

  return (
    <>
      <h4>Block</h4>
      <label>
        <span>Label</span>
        <input
          value={label}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
        />
        {!label.trim() && <ValidationMessage message="Label is required" />}
      </label>
    </>
  );
}
