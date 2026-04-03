import { Handle, Position } from "@xyflow/react";

interface TimelineNodeProps {
  data: { label?: string; period?: string };
  selected?: boolean;
}

export function TimelineNode({ data, selected }: TimelineNodeProps) {
  const label = data?.label || "";
  const lines = label.split("\n");
  const period = data?.period || lines[0] || "";
  const events = lines.slice(1).join(", ") || "";

  return (
    <div className={`mve-node mve-timeline-node ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="mve-timeline-period">{period}</div>
      {events && <div className="mve-timeline-events">{events}</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
