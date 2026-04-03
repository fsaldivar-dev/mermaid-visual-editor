import { Handle, Position } from "@xyflow/react";

interface StateNodeProps {
  data: { label?: string; isStart?: boolean; isEnd?: boolean };
  selected?: boolean;
}

export function StateNode({ data, selected }: StateNodeProps) {
  const isTerminal = data?.isStart || data?.isEnd;

  if (isTerminal) {
    return (
      <div className={`mve-node mve-state-terminal ${selected ? "mve-selected" : ""}`}>
        <Handle type="target" position={Position.Top} />
        <div className="mve-state-dot" />
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }

  return (
    <div className={`mve-node mve-state-node ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Top} />
      <span>{data?.label || ""}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
