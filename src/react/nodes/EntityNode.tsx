import { Handle, Position } from "@xyflow/react";

interface EntityNodeProps {
  data: { label?: string; attributes?: string[] };
  selected?: boolean;
}

export function EntityNode({ data, selected }: EntityNodeProps) {
  const label = data?.label || "";

  return (
    <div className={`mve-node mve-entity-node ${selected ? "mve-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="mve-entity-header">{label}</div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="mve-entity-attrs">
          {data.attributes.map((a, i) => (
            <div key={i} className="mve-entity-attr">{a}</div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
