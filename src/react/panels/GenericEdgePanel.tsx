import type { EdgePanelProps } from "./types";

export function GenericEdgePanel({ edge, onLabelChange }: EdgePanelProps) {
  return (
    <>
      <h4>Connection</h4>
      <label>
        <span>Label</span>
        <input
          value={(edge.label as string) || ""}
          onChange={(e) => onLabelChange(edge.id, e.target.value)}
          placeholder="Edge label"
          autoFocus
        />
      </label>
    </>
  );
}
