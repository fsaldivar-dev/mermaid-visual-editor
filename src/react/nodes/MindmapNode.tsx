import { Handle, Position, NodeResizer } from "@xyflow/react";

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
      <NodeResizer
        isVisible={!!selected}
        minWidth={50}
        minHeight={30}
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
