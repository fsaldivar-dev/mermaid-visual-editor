import { Handle, Position, NodeResizer } from "@xyflow/react";

interface JourneyStepNodeProps {
  data: { label?: string; score?: number; section?: string };
  selected?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 4) return "#34c759";
  if (score >= 3) return "#ffcc00";
  if (score >= 2) return "#ff9500";
  return "#ff3b30";
}

export function JourneyStepNode({ data, selected }: JourneyStepNodeProps) {
  const score = data?.score ?? 3;
  const color = scoreColor(score);

  return (
    <div className={`mve-node mve-journey-step ${selected ? "mve-selected" : ""}`}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={50}
        minHeight={30}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <div className="mve-journey-score" style={{ background: color }}>
        {score}/5
      </div>
      <span>{data?.label || ""}</span>
    </div>
  );
}
