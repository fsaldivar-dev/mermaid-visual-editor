import { Handle, Position, NodeResizer } from "@xyflow/react";

interface NoteNodeProps {
  data: { label?: string };
  selected?: boolean;
}

export function NoteNode({ data, selected }: NoteNodeProps) {
  // Dog-ear fold size relative to viewBox
  const W = 120;
  const H = 60;
  const FOLD = 12;

  return (
    <div className={`mve-node mve-note-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={60}
        minHeight={40}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg
        className="mve-note-bg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {/* Main body with dog-ear cutout */}
        <path
          d={`M 0,0 L ${W - FOLD},0 L ${W},${FOLD} L ${W},${H} L 0,${H} Z`}
          fill="#fef3c7"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
        {/* Dog-ear fold triangle */}
        <path
          d={`M ${W - FOLD},0 L ${W - FOLD},${FOLD} L ${W},${FOLD} Z`}
          fill="#fde68a"
          stroke="#f59e0b"
          strokeWidth="1"
        />
      </svg>
      <span className="mve-note-text">{data?.label || ""}</span>
    </div>
  );
}
