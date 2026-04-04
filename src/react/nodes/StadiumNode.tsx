import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number; fillColor?: string; borderColor?: string; fontColor?: string };
  selected?: boolean;
}

export function StadiumNode({ data, selected }: NodeProps) {
  const defaultColor = "#3b82f6";
  const color = selected ? "#ff9500" : (data?.borderColor || defaultColor);
  return (
    <div
      className={`mve-node mve-stadium ${selected ? "mve-selected" : ""}`}
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
          <filter id="stadium-shadow" x="-4%" y="-4%" width="108%" height="116%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
          </filter>
        </defs>
        <rect
          x="1.5" y="1.5" width="157" height="45" rx="22.5" ry="22.5"
          fill={data?.fillColor || "var(--mve-bg, #fff)"} stroke={color} strokeWidth="1.5"
          strokeLinejoin="round" filter="url(#stadium-shadow)"
        />
      </svg>
      <span className="mve-shape-label" style={data?.fontColor ? { color: data.fontColor } : undefined}>{data?.label || ""}</span>
    </div>
  );
}
