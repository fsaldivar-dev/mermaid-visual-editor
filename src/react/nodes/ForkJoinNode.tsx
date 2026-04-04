import { Handle, Position, NodeResizer } from "@xyflow/react";

interface ForkJoinNodeProps {
  data: { label?: string; isFork?: boolean; isJoin?: boolean };
  selected?: boolean;
}

export function ForkJoinNode({ data: _data, selected }: ForkJoinNodeProps) {
  void _data;
  return (
    <div className={`mve-node mve-forkjoin-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={80}
        minHeight={4}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg width="100%" height="100%" viewBox="0 0 200 6" preserveAspectRatio="none">
        <rect x="0" y="0" width="200" height="6" rx="3" ry="3" fill="#1c1c1e" />
      </svg>
    </div>
  );
}
