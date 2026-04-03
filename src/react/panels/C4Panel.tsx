import type { NodePanelProps, EdgePanelProps } from "./types";
import { ValidationMessage } from "../components/ValidationMessage";

const C4_TYPES = [
  "Person", "Person_Ext", "System", "System_Ext",
  "Container", "Container_Ext", "Component", "Component_Ext",
  "System_Boundary", "Container_Boundary", "Boundary",
];

export function C4NodePanel({ node, onLabelChange, onPropertyChange }: NodePanelProps) {
  const label = (node.data?.label as string) || "";
  const c4Type = (node.data?.c4Type as string) || "System";
  const description = (node.data?.description as string) || "";

  return (
    <>
      <h4>C4 Element</h4>
      <label>
        <span>Type</span>
        <select
          value={c4Type}
          onChange={(e) => onPropertyChange(node.id, "c4Type", e.target.value)}
        >
          {C4_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Name</span>
        <input
          value={label}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
          autoFocus
        />
        {!label.trim() && <ValidationMessage message="Name is required" />}
      </label>
      <label>
        <span>Description</span>
        <input
          value={description}
          onChange={(e) => onPropertyChange(node.id, "description", e.target.value)}
          placeholder="Description"
        />
      </label>
    </>
  );
}

const REL_TYPES = ["Rel", "BiRel", "Rel_D", "Rel_U", "Rel_L", "Rel_R", "Rel_Back"];

export function C4EdgePanel({ edge, onLabelChange, onPropertyChange }: EdgePanelProps) {
  const relType = (edge.data?.relType as string) || "Rel";
  const technology = (edge.data?.technology as string) || "";

  return (
    <>
      <h4>Relationship</h4>
      <label>
        <span>Type</span>
        <select
          value={relType}
          onChange={(e) => onPropertyChange(edge.id, "relType", e.target.value)}
        >
          {REL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
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
      <label>
        <span>Technology</span>
        <input
          value={technology}
          onChange={(e) => onPropertyChange(edge.id, "technology", e.target.value)}
          placeholder="e.g., HTTPS, JSON"
        />
      </label>
    </>
  );
}
