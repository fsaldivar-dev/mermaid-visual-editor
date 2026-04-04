import { Handle, Position, NodeResizer } from "@xyflow/react";

interface ClassNodeProps {
  data: {
    label?: string;
    attributes?: string[];
    methods?: string[];
    stereotype?: string;
  };
  selected?: boolean;
}

export function ClassNode({ data, selected }: ClassNodeProps) {
  const label = data?.label || "";
  const lines = label.split("\n");
  const className = lines[0] || "";
  const members = lines.slice(1);

  const attributes = data.attributes || members.filter((m) => !m.includes("("));
  const methods = data.methods || members.filter((m) => m.includes("("));
  const stereotype = data.stereotype || "";

  return (
    <div className={`mve-node mve-class-node ${selected ? "mve-selected" : ""}`}>
      <NodeResizer isVisible={!!selected} minWidth={100} minHeight={40} handleClassName="mve-resize-handle" lineClassName="mve-resize-line" />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />

      <div className="mve-class-header">
        {stereotype && (
          <div className="mve-class-stereotype">&laquo;{stereotype}&raquo;</div>
        )}
        <div className="mve-class-name">{className}</div>
      </div>

      <div className="mve-class-section mve-class-attrs">
        {attributes.length > 0 ? (
          attributes.map((a, i) => (
            <div key={i} className="mve-class-member">
              <span className="mve-class-visibility">{getVisibilityIcon(a)}</span>
              <span>{stripVisibility(a)}</span>
            </div>
          ))
        ) : (
          <div className="mve-class-member mve-class-empty">&nbsp;</div>
        )}
      </div>

      <div className="mve-class-section mve-class-methods">
        {methods.length > 0 ? (
          methods.map((m, i) => (
            <div key={i} className="mve-class-member">
              <span className="mve-class-visibility">{getVisibilityIcon(m)}</span>
              <span>{stripVisibility(m)}</span>
            </div>
          ))
        ) : (
          <div className="mve-class-member mve-class-empty">&nbsp;</div>
        )}
      </div>
    </div>
  );
}

function getVisibilityIcon(member: string): string {
  const trimmed = member.trim();
  if (trimmed.startsWith("+")) return "+";
  if (trimmed.startsWith("-")) return "\u2212";
  if (trimmed.startsWith("#")) return "#";
  if (trimmed.startsWith("~")) return "~";
  return " ";
}

function stripVisibility(member: string): string {
  const trimmed = member.trim();
  if (/^[+\-#~]/.test(trimmed)) return trimmed.slice(1);
  return trimmed;
}
