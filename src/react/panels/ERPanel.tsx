import type { NodePanelProps, EdgePanelProps } from "./types";

const CARDINALITIES = [
  { value: "||--||", label: "One to One" },
  { value: "||--o{", label: "One to Zero-or-Many" },
  { value: "||--|{", label: "One to One-or-Many" },
  { value: "}o--o{", label: "Many to Many" },
  { value: "}o--||", label: "Zero-or-Many to One" },
  { value: "}|--||", label: "One-or-Many to One" },
];

export function ERNodePanel({ node, onLabelChange }: NodePanelProps) {
  return (
    <>
      <h4>Entity</h4>
      <label>
        <span>Name</span>
        <input
          value={(node.data?.label as string) || ""}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
        />
      </label>
    </>
  );
}

export function EREdgePanel({ edge, onLabelChange, onPropertyChange }: EdgePanelProps) {
  const cardinality = (edge.data?.cardinality as string) || "||--||";

  return (
    <>
      <h4>Relationship</h4>
      <label>
        <span>Cardinality</span>
        <select
          value={cardinality}
          onChange={(e) => onPropertyChange(edge.id, "cardinality", e.target.value)}
        >
          {CARDINALITIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Label</span>
        <input
          value={(edge.label as string) || ""}
          onChange={(e) => onLabelChange(edge.id, e.target.value)}
          placeholder="Relationship verb"
        />
      </label>
    </>
  );
}
