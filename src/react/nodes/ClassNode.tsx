import { Handle, Position, NodeResizer } from "@xyflow/react";

interface ClassNodeProps {
  data: { label?: string; attributes?: string[]; methods?: string[] };
  selected?: boolean;
}

export function ClassNode({ data, selected }: ClassNodeProps) {
  const label = data?.label || "";
  const lines = label.split("\n");
  const className = lines[0] || "";
  const members = lines.slice(1);

  const attributes = data.attributes || members.filter((m) => !m.includes("("));
  const methods = data.methods || members.filter((m) => m.includes("("));

  return (
    <div className={`mve-node mve-class-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer isVisible={!!selected} minWidth={80} minHeight={40} handleClassName="mve-resize-handle" lineClassName="mve-resize-line" />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <div className="mve-class-header">{className}</div>
      {attributes.length > 0 && (
        <div className="mve-class-section">
          {attributes.map((a, i) => (
            <div key={i} className="mve-class-member">{a}</div>
          ))}
        </div>
      )}
      {methods.length > 0 && (
        <div className="mve-class-section">
          {methods.map((m, i) => (
            <div key={i} className="mve-class-member">{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}
