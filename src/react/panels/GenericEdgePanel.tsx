import type { EdgePanelProps } from "./types";

const EDGE_STYLES = [
  { value: "smoothstep", label: "Smooth Step" },
  { value: "straight", label: "Straight" },
  { value: "bezier", label: "Bezier Curve" },
];

const MARKER_STYLES = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Arrow" },
  { value: "arrowclosed", label: "Closed Arrow" },
];

export function GenericEdgePanel({ edge, onLabelChange, onPropertyChange }: EdgePanelProps) {
  const edgeStyle = (edge.data?.edgeStyle as string) || "smoothstep";
  const strokeWidth = (edge.data?.strokeWidth as number) || 2;
  const strokeColor = (edge.data?.strokeColor as string) || "";
  const animated = (edge.data?.animated as boolean) || false;

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
      <label>
        <span>Style</span>
        <select
          value={edgeStyle}
          onChange={(e) => onPropertyChange(edge.id, "edgeStyle", e.target.value)}
        >
          {EDGE_STYLES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Width</span>
        <input
          type="number"
          min={1}
          max={8}
          value={strokeWidth}
          onChange={(e) => onPropertyChange(edge.id, "strokeWidth", Number(e.target.value))}
          style={{ width: 60 }}
        />
      </label>
      <label>
        <span>Color</span>
        <input
          type="color"
          value={strokeColor || "#555555"}
          onChange={(e) => onPropertyChange(edge.id, "strokeColor", e.target.value)}
          style={{ width: 40, height: 24, padding: 0, border: "none", cursor: "pointer" }}
        />
      </label>
      <label style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={animated}
          onChange={(e) => onPropertyChange(edge.id, "animated", e.target.checked)}
        />
        <span>Animated</span>
      </label>
    </>
  );
}
