import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number };
  selected?: boolean;
}

export function CylinderNode({ data, selected }: NodeProps) {
  const color = selected ? "#ff9500" : "#6366f1";
  return (
    <div
      className={`mve-node mve-cylinder ${selected ? "mve-selected" : ""}`}
      style={{
        width: data?.width ? `${data.width}px` : undefined,
        height: data?.height ? `${data.height}px` : undefined,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={60}
        minHeight={50}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg className="mve-shape-bg" viewBox="0 0 120 80" preserveAspectRatio="none">
        <defs>
          <filter id="cylinder-shadow" x="-4%" y="-4%" width="108%" height="116%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
          </filter>
        </defs>
        <path
          d={`M 2,16 Q 2,4 60,4 Q 118,4 118,16 L 118,64 Q 118,76 60,76 Q 2,76 2,64 Z`}
          fill="var(--mve-bg, #fff)" stroke={color} strokeWidth="1.5"
          strokeLinejoin="round" filter="url(#cylinder-shadow)"
        />
        <ellipse
          cx="60" cy="16" rx="58" ry="12"
          fill="var(--mve-bg, #fff)" stroke={color} strokeWidth="1.5"
        />
      </svg>
      <span className="mve-shape-label">{data?.label || ""}</span>
    </div>
  );
}
