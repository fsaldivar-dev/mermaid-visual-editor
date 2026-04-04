import type { NodePanelProps } from "./types";

export function PieNodePanel({ node, onPropertyChange }: NodePanelProps) {
  const rawLabel = (node.data?.rawLabel as string) || "";
  const value = (node.data?.value as number) || 0;

  return (
    <>
      <h4>Slice</h4>
      <label>
        <span>Name</span>
        <input
          value={rawLabel}
          onChange={(e) => {
            onPropertyChange(node.id, "rawLabel", e.target.value);
            onPropertyChange(node.id, "label", `${e.target.value} (${value})`);
          }}
        />
      </label>
      <label>
        <span>Value</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value) || 0;
            onPropertyChange(node.id, "value", v);
            onPropertyChange(node.id, "label", `${rawLabel} (${v})`);
          }}
        />
      </label>
    </>
  );
}
