import { Handle, Position } from "@xyflow/react";

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
      <Handle type="target" position={Position.Left} />
      <div className="mve-journey-score" style={{ background: color }}>
        {score}/5
      </div>
      <span>{data?.label || ""}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
