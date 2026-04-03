import { Handle, Position } from "@xyflow/react";

interface PieSliceNodeProps {
  data: { label?: string; value?: number; color?: string };
  selected?: boolean;
}

const COLORS = [
  "#0071e3", "#34c759", "#ff9500", "#af52de",
  "#ff3b30", "#5ac8fa", "#ffcc00", "#ff2d55",
];

export function PieSliceNode({ data, selected }: PieSliceNodeProps) {
  const idx = parseInt(data?.label?.match(/\d+/)?.[0] || "0") % COLORS.length;
  const color = data?.color || COLORS[idx];

  return (
    <div className={`mve-node mve-pie-slice ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Top} />
      <div className="mve-pie-color" style={{ background: color }} />
      <span className="mve-pie-label">{data?.label || ""}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
