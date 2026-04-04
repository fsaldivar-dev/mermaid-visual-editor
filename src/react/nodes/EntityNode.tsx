import { Handle, Position } from "@xyflow/react";

interface EntityNodeProps {
  data: { label?: string; attributes?: string[] };
  selected?: boolean;
}

export function EntityNode({ data, selected }: EntityNodeProps) {
  const label = data?.label || "";

  return (
    <div className={`mve-node mve-entity-node ${selected ? "mve-selected" : ""}`}>
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <div className="mve-entity-header">{label}</div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="mve-entity-attrs">
          {data.attributes.map((a, i) => (
            <div key={i} className="mve-entity-attr">{a}</div>
          ))}
        </div>
      )}
    </div>
  );
}
