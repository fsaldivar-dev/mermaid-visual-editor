import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number };
  selected?: boolean;
}

export function DoubleCircleNode({ data, selected }: NodeProps) {
  const color = selected ? "#ff9500" : "#8b5cf6";
  return (
    <div
      className={`mve-node mve-doublecircle ${selected ? "mve-selected" : ""}`}
      style={{
        width: data?.width ? `${data.width}px` : undefined,
        height: data?.height ? `${data.height}px` : undefined,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={60}
        minHeight={60}
        keepAspectRatio
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg className="mve-shape-bg" viewBox="0 0 80 80" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="doublecircle-shadow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
          </filter>
        </defs>
        <circle
          cx="40" cy="40" r="38"
          fill="var(--mve-bg, #fff)" stroke={color} strokeWidth="1.5"
          filter="url(#doublecircle-shadow)"
        />
        <circle
          cx="40" cy="40" r="30"
          fill="none" stroke={color} strokeWidth="1.5"
        />
      </svg>
      <span className="mve-shape-label">{data?.label || ""}</span>
    </div>
  );
}
