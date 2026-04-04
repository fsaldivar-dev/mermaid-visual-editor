import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number };
  selected?: boolean;
}

export function SubroutineNode({ data, selected }: NodeProps) {
  const color = selected ? "#ff9500" : "#6366f1";
  return (
    <div
      className={`mve-node mve-subroutine ${selected ? "mve-selected" : ""}`}
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
          <filter id="subroutine-shadow" x="-4%" y="-4%" width="108%" height="116%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
          </filter>
        </defs>
        <rect
          x="1.5" y="1.5" width="157" height="45" rx="3" ry="3"
          fill="var(--mve-bg, #fff)" stroke={color} strokeWidth="1.5"
          strokeLinejoin="round" filter="url(#subroutine-shadow)"
        />
        <rect
          x="10" y="1.5" width="140" height="45" rx="2" ry="2"
          fill="none" stroke={color} strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="mve-shape-label">{data?.label || ""}</span>
    </div>
  );
}
