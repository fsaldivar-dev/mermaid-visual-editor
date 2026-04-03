import { Handle, Position } from "@xyflow/react";

interface NodeProps {
  data: { label?: string };
  selected?: boolean;
}

export function DiamondNode({ data, selected }: NodeProps) {
  const color = selected ? "#ff9500" : "#ff9500";
  return (
    <div className={`mve-node mve-diamond ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Top} />
      <svg
        className="mve-diamond-bg"
        viewBox="0 0 120 80"
        preserveAspectRatio="none"
      >
        <polygon
          points="60,2 118,40 60,78 2,40"
          fill="var(--mve-bg, #fff)"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
      <span className="mve-diamond-label">{data?.label || ""}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
