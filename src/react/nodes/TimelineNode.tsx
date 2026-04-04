import { Handle, Position, NodeResizer } from "@xyflow/react";

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
      <div className="mve-timeline-period">{period}</div>
      {events && <div className="mve-timeline-events">{events}</div>}
    </div>
  );
}
