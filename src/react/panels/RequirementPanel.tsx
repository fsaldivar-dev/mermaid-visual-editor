import type { NodePanelProps, EdgePanelProps } from "./types";
import { ValidationMessage } from "../components/ValidationMessage";

const REQ_TYPES = [
  "requirement", "functionalRequirement", "performanceRequirement",
  "interfaceRequirement", "physicalRequirement", "designConstraint",
];

const RISK_LEVELS = ["Low", "Medium", "High"];
const VERIFY_METHODS = ["Analysis", "Inspection", "Test", "Demonstration"];

export function RequirementNodePanel({ node, onLabelChange, onPropertyChange }: NodePanelProps) {
  const label = (node.data?.label as string) || "";
  const isElement = node.data?.isElement as boolean;
  const reqType = (node.data?.reqType as string) || "requirement";
  const risk = (node.data?.risk as string) || "";
  const verifymethod = (node.data?.verifymethod as string) || "";
  const reqText = (node.data?.text as string) || "";

  if (isElement) {
    return (
      <>
        <h4>Element</h4>
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
          <span>Type</span>
          <input
            value={(node.data?.type as string) || ""}
            onChange={(e) => onPropertyChange(node.id, "type", e.target.value)}
            placeholder="e.g., Service, Module"
          />
        </label>
      </>
    );
  }

  return (
    <>
      <h4>Requirement</h4>
      <label>
        <span>Type</span>
        <select
          value={reqType}
          onChange={(e) => onPropertyChange(node.id, "reqType", e.target.value)}
        >
          {REQ_TYPES.map((t) => (
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
          value={reqText}
          onChange={(e) => onPropertyChange(node.id, "text", e.target.value)}
          placeholder="Requirement text"
        />
      </label>
      <label>
        <span>Risk</span>
        <select
          value={risk}
          onChange={(e) => onPropertyChange(node.id, "risk", e.target.value)}
        >
          <option value="">-</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Verify</span>
        <select
          value={verifymethod}
          onChange={(e) => onPropertyChange(node.id, "verifymethod", e.target.value)}
        >
          <option value="">-</option>
          {VERIFY_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
    </>
  );
}

const RELATIONSHIP_TYPES = [
  "traces", "copies", "contains", "derives", "satisfies", "verifies", "refines",
];

export function RequirementEdgePanel({ edge, onPropertyChange }: EdgePanelProps) {
  const relType = (edge.data?.relType as string) || "satisfies";

  return (
    <>
      <h4>Relationship</h4>
      <label>
        <span>Type</span>
        <select
          value={relType}
          onChange={(e) => onPropertyChange(edge.id, "relType", e.target.value)}
        >
          {RELATIONSHIP_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
    </>
  );
}
