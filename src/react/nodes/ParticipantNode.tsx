import { Handle, Position } from "@xyflow/react";

interface ParticipantNodeProps {
  data: { label?: string };
  selected?: boolean;
}

export function ParticipantNode({ data, selected }: ParticipantNodeProps) {
  return (
    <div className={`mve-node mve-participant-node ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="mve-participant-header">{data?.label || ""}</div>
      <div className="mve-participant-lifeline" />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
