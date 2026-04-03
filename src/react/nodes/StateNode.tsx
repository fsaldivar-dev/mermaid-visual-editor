import { Handle, Position } from "@xyflow/react";

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
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }

  // End terminal: circle with inner dot (bullseye)
  if (isEnd) {
    return (
      <div className={`mve-node mve-state-terminal mve-state-end ${selected ? "mve-selected" : ""}`}>
        <Handle type="target" position={Position.Top} />
        <div className="mve-state-end-ring">
          <div className="mve-state-end-dot" />
        </div>
      </div>
    );
  }

  // Normal state: rounded rectangle
  return (
    <div className={`mve-node mve-state-node ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Top} />
      <span>{data?.label || ""}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
