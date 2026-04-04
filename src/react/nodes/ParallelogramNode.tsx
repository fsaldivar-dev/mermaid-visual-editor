import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number };
  selected?: boolean;
}

export function ParallelogramNode({ data, selected }: NodeProps) {
  const color = selected ? "#ff9500" : "#f59e0b";
  return (
    <div
      className={`mve-node mve-parallelogram ${selected ? "mve-selected" : ""}`}
      style={{
        width: data?.width ? `${data.width}px` : undefined,
        height: data?.height ? `${data.height}px` : undefined,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={80}
        minHeight={36}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg className="mve-shape-bg" viewBox="0 0 160 48" preserveAspectRatio="none">
        <defs>
          <filter id="parallelogram-shadow" x="-4%" y="-4%" width="108%" height="116%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
          </filter>
        </defs>
        <polygon
          points="20,2 158,2 140,46 2,46"
          fill="var(--mve-bg, #fff)" stroke={color} strokeWidth="1.5"
          strokeLinejoin="round" filter="url(#parallelogram-shadow)"
        />
      </svg>
      <span className="mve-shape-label">{data?.label || ""}</span>
    </div>
  );
}
