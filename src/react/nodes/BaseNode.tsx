import { Handle, Position, NodeResizer } from "@xyflow/react";
import type { ReactNode } from "react";

interface BaseNodeProps {
  data: { label?: string; width?: number; height?: number };
  selected?: boolean;
  className: string;
  children?: ReactNode;
  keepAspectRatio?: boolean;
}

export function BaseNode({ data, selected, className, children, keepAspectRatio }: BaseNodeProps) {
  return (
    <div
      className={`mve-node ${className} ${selected ? "mve-selected" : ""}`}
      role="treeitem"
      aria-label={data?.label || "Node"}
      aria-selected={selected}
      style={{
        width: data?.width ? `${data.width}px` : undefined,
        height: data?.height ? `${data.height}px` : undefined,
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={50}
        minHeight={30}
        keepAspectRatio={keepAspectRatio}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      {/* 4-side connection handles */}
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      {children || <span>{data?.label || ""}</span>}
    </div>
  );
}
