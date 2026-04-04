import { Handle, Position, NodeResizer } from "@xyflow/react";

interface GanttTaskNodeProps {
  data: { label?: string; section?: string };
  selected?: boolean;
}

export function GanttTaskNode({ data, selected }: GanttTaskNodeProps) {
  return (
    <div className={`mve-node mve-gantt-task ${selected ? "mve-selected" : ""}`}>
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
      {data?.section && <div className="mve-gantt-section">{data.section}</div>}
      <div className="mve-gantt-bar">
        <span>{data?.label || ""}</span>
      </div>
    </div>
  );
}
