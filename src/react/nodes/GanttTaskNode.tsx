import { Handle, Position } from "@xyflow/react";

interface GanttTaskNodeProps {
  data: { label?: string; section?: string };
  selected?: boolean;
}

export function GanttTaskNode({ data, selected }: GanttTaskNodeProps) {
  return (
    <div className={`mve-node mve-gantt-task ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      {data?.section && <div className="mve-gantt-section">{data.section}</div>}
      <div className="mve-gantt-bar">
        <span>{data?.label || ""}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
