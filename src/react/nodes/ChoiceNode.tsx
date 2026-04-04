import { Handle, Position, NodeResizer } from "@xyflow/react";

interface ChoiceNodeProps {
  data: { label?: string };
  selected?: boolean;
}

export function ChoiceNode({ data: _data, selected }: ChoiceNodeProps) {
  void _data;
  return (
    <div className={`mve-node mve-choice-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={20}
        minHeight={20}
        keepAspectRatio
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <svg width="100%" height="100%" viewBox="0 0 30 30">
        <polygon points="15,0 30,15 15,30 0,15" fill="#1c1c1e" />
      </svg>
    </div>
  );
}
