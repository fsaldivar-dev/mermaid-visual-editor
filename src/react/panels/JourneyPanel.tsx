import type { NodePanelProps } from "./types";

export function JourneyNodePanel({ node, allNodes, onLabelChange, onPropertyChange }: NodePanelProps) {
  const score = (node.data?.score as number) || 3;
  const section = (node.data?.section as string) || "";
  // Strip (X/5) suffix from label for editing
  const rawLabel = ((node.data?.label as string) || "").replace(/\s*\(\d+\/5\)$/, "");

  const sections = [...new Set(
    allNodes
      .filter((n) => n.data?.section)
      .map((n) => n.data?.section as string)
  )];

  const updateLabel = (name: string, sc: number) => {
    onLabelChange(node.id, `${name} (${sc}/5)`);
  };

  return (
    <>
      <h4>Step</h4>
      <label>
        <span>Name</span>
        <input
          value={rawLabel}
          onChange={(e) => updateLabel(e.target.value, score)}
          autoFocus
        />
      </label>
      <label>
        <span>Score ({score}/5)</span>
        <input
          type="range"
          min={1}
          max={5}
          value={score}
          onChange={(e) => {
            const s = Number(e.target.value);
            onPropertyChange(node.id, "score", s);
            updateLabel(rawLabel, s);
          }}
        />
      </label>
      <label>
        <span>Section</span>
        <input
          value={section}
          onChange={(e) => onPropertyChange(node.id, "section", e.target.value)}
          list="journey-sections"
          placeholder="Section name"
        />
        {sections.length > 0 && (
          <datalist id="journey-sections">
            {sections.map((s) => <option key={s} value={s} />)}
          </datalist>
        )}
      </label>
    </>
  );
}
