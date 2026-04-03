import { Handle, Position } from "@xyflow/react";

interface ParticipantNodeProps {
  data: { label?: string; lifelineHeight?: number };
  selected?: boolean;
}

export function ParticipantNode({ data, selected }: ParticipantNodeProps) {
  const lifelineHeight = data?.lifelineHeight ?? 300;

  return (
    <div className={`mve-node mve-participant-node ${selected ? "mve-selected" : ""}`}>
      <div className="mve-participant-box">
        <span>{data?.label || ""}</span>
      </div>
      <div
        className="mve-participant-lifeline"
        style={{ height: lifelineHeight }}
      />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
