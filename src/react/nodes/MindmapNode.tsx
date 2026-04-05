import { Handle, Position, NodeResizer } from "@xyflow/react";

const BRANCH_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

interface MindmapNodeProps {
  data: { label?: string; depth?: number; branchIndex?: number };
  selected?: boolean;
}

export function MindmapNode({ data, selected }: MindmapNodeProps) {
  const depth = (data?.depth as number) || 0;
  const branchIndex = (data?.branchIndex as number) || 0;
  const color = BRANCH_COLORS[branchIndex % BRANCH_COLORS.length];
  const isRoot = depth === 0;

  const nodeClass = isRoot
    ? "mve-mindmap-root"
    : depth === 1
      ? "mve-mindmap-branch"
      : "mve-mindmap-leaf";

  return (
    <div
      className={`mve-node mve-mindmap-node ${nodeClass} ${selected ? "mve-selected" : ""}`}
      style={{
        borderColor: selected ? "#ff9500" : color,
        backgroundColor: isRoot ? color : depth === 1 ? `${color}25` : `${color}12`,
        color: isRoot ? "#fff" : undefined,
        boxShadow: selected
          ? `0 0 0 3px rgba(255,149,0,0.3), 0 4px 12px rgba(0,0,0,0.1)`
          : `0 2px 8px ${color}20`,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={isRoot ? 80 : 60}
        minHeight={isRoot ? 80 : 30}
        keepAspectRatio={isRoot}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <span>{data?.label || ""}</span>
    </div>
  );
}
