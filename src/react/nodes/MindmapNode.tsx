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

  // Progressive sizing: each depth level gets smaller
  const fontSize = isRoot ? 16 : Math.max(10, 14 - depth * 1.5);
  const fontWeight = depth <= 1 ? 700 : depth === 2 ? 600 : 500;
  const borderRadius = isRoot ? "50%" : `${Math.max(10, 24 - depth * 3)}px`;
  const padding = isRoot ? "20px" : `${Math.max(4, 10 - depth)}px ${Math.max(10, 18 - depth * 2)}px`;
  const borderWidth = Math.max(1, 2.5 - depth * 0.4);

  // Progressive background opacity: deeper = more transparent
  const bgOpacity = isRoot ? "ff" : depth === 1 ? "30" : depth === 2 ? "18" : depth === 3 ? "10" : "08";
  const bgColor = isRoot ? color : `${color}${bgOpacity}`;

  return (
    <div
      className={`mve-node mve-mindmap-node ${selected ? "mve-selected" : ""}`}
      style={{
        borderColor: selected ? "#ff9500" : color,
        backgroundColor: bgColor,
        color: isRoot ? "#fff" : undefined,
        borderRadius,
        padding,
        fontSize: `${fontSize}px`,
        fontWeight,
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        boxShadow: selected
          ? `0 0 0 3px rgba(255,149,0,0.3), 0 4px 12px rgba(0,0,0,0.1)`
          : `0 ${Math.max(1, 3 - depth)}px ${Math.max(3, 8 - depth * 2)}px ${color}${isRoot ? "40" : "15"}`,
        minWidth: isRoot ? "100px" : `${Math.max(50, 90 - depth * 10)}px`,
        minHeight: isRoot ? "100px" : `${Math.max(26, 40 - depth * 4)}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={isRoot ? 80 : 50}
        minHeight={isRoot ? 80 : 26}
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
