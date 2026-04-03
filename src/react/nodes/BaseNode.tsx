import { Handle, Position } from "@xyflow/react";
import type { ReactNode } from "react";

interface BaseNodeProps {
  data: { label?: string };
  selected?: boolean;
  className: string;
  children?: ReactNode;
}

export function BaseNode({ data, selected, className, children }: BaseNodeProps) {
  return (
    <div className={`mve-node ${className} ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Top} />
      {children || <span>{data?.label || ""}</span>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
