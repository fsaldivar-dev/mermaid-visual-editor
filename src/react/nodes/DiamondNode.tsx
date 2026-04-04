import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NodeProps {
  data: { label?: string; width?: number; height?: number; fillColor?: string; borderColor?: string; fontColor?: string };
  selected?: boolean;
}

export function DiamondNode({ data, selected }: NodeProps) {
  const defaultColor = "#ff9500";
  const strokeColor = data?.borderColor || defaultColor;
  const fillColor = data?.fillColor || "var(--mve-bg, #fff)";
  return (
    <div
      className={`mve-node mve-diamond ${selected ? "mve-selected" : ""}`}
      style={{
        width: data?.width ? `${data.width}px` : undefined,
        height: data?.height ? `${data.height}px` : undefined,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={60}
        minHeight={40}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg
        className="mve-diamond-bg"
        viewBox="0 0 120 80"
        preserveAspectRatio="none"
      >
        <polygon
          points="60,2 118,40 60,78 2,40"
          fill={fillColor}
          stroke={selected ? "#ff9500" : strokeColor}
          strokeWidth="2"
        />
      </svg>
      <span className="mve-diamond-label" style={data?.fontColor ? { color: data.fontColor } : undefined}>{data?.label || ""}</span>
    </div>
  );
}
