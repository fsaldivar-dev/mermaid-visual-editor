import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number; fillColor?: string; borderColor?: string; fontColor?: string };
  selected?: boolean;
}

export function HexagonNode({ data, selected }: NodeProps) {
  const defaultColor = "#ec4899";
  const color = selected ? "#ff9500" : (data?.borderColor || defaultColor);
  return (
    <div
      className={`mve-node mve-hexagon ${selected ? "mve-selected" : ""}`}
      style={{
        width: data?.width ? `${data.width}px` : undefined,
        height: data?.height ? `${data.height}px` : undefined,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={80}
        minHeight={40}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg className="mve-shape-bg" viewBox="0 0 160 60" preserveAspectRatio="none">
        <defs>
          <filter id="hexagon-shadow" x="-4%" y="-4%" width="108%" height="116%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.08" />
          </filter>
        </defs>
        <polygon
          points="20,2 140,2 158,30 140,58 20,58 2,30"
          fill={data?.fillColor || "var(--mve-bg, #fff)"} stroke={color} strokeWidth="1.5"
          strokeLinejoin="round" filter="url(#hexagon-shadow)"
        />
      </svg>
      <span className="mve-shape-label" style={data?.fontColor ? { color: data.fontColor } : undefined}>{data?.label || ""}</span>
    </div>
  );
}
