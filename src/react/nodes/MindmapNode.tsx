import { Handle, Position } from "@xyflow/react";

interface MindmapNodeProps {
  data: { label?: string; depth?: number };
  selected?: boolean;
}

const DEPTH_COLORS = [
  "#0071e3", "#34c759", "#ff9500", "#af52de", "#ff3b30", "#5ac8fa",
];

export function MindmapNode({ data, selected }: MindmapNodeProps) {
  const depth = data?.depth ?? 0;
  const color = DEPTH_COLORS[depth % DEPTH_COLORS.length];
  const isRoot = depth === 0;

  return (
    <div
      className={`mve-node mve-mindmap-node ${isRoot ? "mve-mindmap-root" : ""} ${selected ? "mve-selected" : ""}`}
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Left} />
      <span>{data?.label || ""}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
