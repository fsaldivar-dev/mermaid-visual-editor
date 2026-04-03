import type { NodePanelProps, EdgePanelProps } from "./types";
import { ValidationMessage } from "../components/ValidationMessage";

const RELATIONSHIP_TYPES = [
  { value: "<|--", label: "Inheritance" },
  { value: "*--", label: "Composition" },
  { value: "o--", label: "Aggregation" },
  { value: "-->", label: "Association" },
  { value: "..>", label: "Dependency" },
];

export function ClassNodePanel({ node, onLabelChange }: NodePanelProps) {
  const label = (node.data?.label as string) || "";
  const lines = label.split("\n");
  const className = lines[0] || "";
  const members = lines.slice(1);

  return (
    <>
      <h4>Class</h4>
      <label>
        <span>Name</span>
        <input
          value={className}
          onChange={(e) => {
            const newLabel = [e.target.value, ...members].join("\n");
            onLabelChange(node.id, newLabel);
          }}
          autoFocus
        />
        {!className.trim() && <ValidationMessage message="Class name is required" />}
      </label>
      <label>
        <span>Members</span>
        <textarea
          className="mve-textarea"
          value={members.join("\n")}
          onChange={(e) => {
            const newLabel = [className, ...e.target.value.split("\n")].join("\n");
            onLabelChange(node.id, newLabel);
          }}
          placeholder="+name: String&#10;+age: int&#10;+getName()"
          rows={4}
        />
      </label>
    </>
  );
}

export function ClassEdgePanel({ edge, onLabelChange, onPropertyChange }: EdgePanelProps) {
  const relType = (edge.data?.relationshipType as string) || "<|--";

  return (
    <>
      <h4>Relationship</h4>
      <label>
        <span>Type</span>
        <select
          value={relType}
          onChange={(e) => onPropertyChange(edge.id, "relationshipType", e.target.value)}
        >
          {RELATIONSHIP_TYPES.map((r) => (
            <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
          ))}
        </select>
      </label>
      <label>
        <span>Label</span>
        <input
          value={(edge.label as string) || ""}
          onChange={(e) => onLabelChange(edge.id, e.target.value)}
          placeholder="Relationship label"
        />
      </label>
    </>
  );
}
