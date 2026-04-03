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
      >
        {/* Connection handle on the lifeline — visible as a subtle dot */}
        <Handle
          type="source"
          position={Position.Right}
          id="lifeline-source"
          className="mve-lifeline-handle"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="lifeline-target"
          className="mve-lifeline-handle"
        />
      </div>
    </div>
  );
}
