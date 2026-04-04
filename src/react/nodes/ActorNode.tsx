import { Handle, Position } from "@xyflow/react";

interface ActorNodeProps {
  data: { label?: string; lifelineHeight?: number };
  selected?: boolean;
}

export function ActorNode({ data, selected }: ActorNodeProps) {
  const lifelineHeight = data?.lifelineHeight ?? 300;

  return (
    <div className={`mve-node mve-actor-node ${selected ? "mve-selected" : ""}`}>
      <div className="mve-actor-figure">
        <svg
          width="60"
          height="80"
          viewBox="0 0 60 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="30" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <line x1="30" y1="22" x2="30" y2="50" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="35" x2="50" y2="35" stroke="currentColor" strokeWidth="2" />
          <line x1="30" y1="50" x2="15" y2="70" stroke="currentColor" strokeWidth="2" />
          <line x1="30" y1="50" x2="45" y2="70" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div className="mve-actor-label">
        <span>{data?.label || ""}</span>
      </div>
      <div
        className="mve-actor-lifeline"
        style={{ height: lifelineHeight }}
      >
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
