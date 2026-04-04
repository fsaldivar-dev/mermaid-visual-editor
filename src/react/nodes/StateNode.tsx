import { Handle, Position, NodeResizer } from "@xyflow/react";

interface StateNodeProps {
  data: { label?: string; isStart?: boolean; isEnd?: boolean };
  selected?: boolean;
}

export function StateNode({ data, selected }: StateNodeProps) {
  const isStart = data?.isStart;
  const isEnd = data?.isEnd;

  // Start terminal: filled black circle
  if (isStart) {
    return (
      <div className={`mve-node mve-state-terminal mve-state-start ${selected ? "mve-selected" : ""}`}>
        <div className="mve-state-start-dot" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      </div>
    );
  }

  // End terminal: circle with inner dot (bullseye)
  if (isEnd) {
    return (
      <div className={`mve-node mve-state-terminal mve-state-end ${selected ? "mve-selected" : ""}`}>
        <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
        <div className="mve-state-end-ring">
          <div className="mve-state-end-dot" />
        </div>
      </div>
    );
  }

  // Normal state: rounded rectangle with 4 handles
  return (
    <div className={`mve-node mve-state-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer isVisible={!!selected} minWidth={50} minHeight={30} handleClassName="mve-resize-handle" lineClassName="mve-resize-line" />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <span>{data?.label || ""}</span>
    </div>
  );
}
