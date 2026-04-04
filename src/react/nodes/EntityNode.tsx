import { Handle, Position, NodeResizer } from "@xyflow/react";

interface ERAttribute {
  type: string;
  name: string;
  key?: string;
}

interface EntityNodeProps {
  data: { label?: string; attributes?: ERAttribute[] };
  selected?: boolean;
}

export function EntityNode({ data, selected }: EntityNodeProps) {
  const label = data?.label || "";
  const attrs = (data?.attributes as ERAttribute[]) || [];

  return (
    <div className={`mve-node mve-entity-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={120}
        minHeight={40}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />

      <div className="mve-entity-header">{label}</div>
      {attrs.length > 0 ? (
        <div className="mve-entity-attrs">
          {attrs.map((a, i) => (
            <div key={i} className="mve-entity-attr">
              <span className="mve-entity-attr-type">{a.type}</span>
              <span className="mve-entity-attr-name">{a.name}</span>
              {a.key && <span className="mve-entity-attr-key">{a.key}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="mve-entity-attrs">
          <div className="mve-entity-attr mve-entity-no-attrs">no attributes</div>
        </div>
      )}
    </div>
  );
}
