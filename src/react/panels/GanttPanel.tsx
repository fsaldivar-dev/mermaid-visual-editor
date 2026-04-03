import type { NodePanelProps } from "./types";

export function GanttNodePanel({ node, allNodes, onLabelChange, onPropertyChange }: NodePanelProps) {
  const section = (node.data?.section as string) || "";
  const label = (node.data?.label as string) || "";
  // Strip section prefix from label for editing
  const taskName = label.includes(" / ") ? label.split(" / ").slice(1).join(" / ") : label;

  const sections = [...new Set(
    allNodes
      .filter((n) => n.data?.section)
      .map((n) => n.data?.section as string)
  )];

  return (
    <>
      <h4>Task</h4>
      <label>
        <span>Name</span>
        <input
          value={taskName}
          onChange={(e) => {
            const newLabel = section ? `${section} / ${e.target.value}` : e.target.value;
            onLabelChange(node.id, newLabel);
          }}
          autoFocus
        />
      </label>
      <label>
        <span>Section</span>
        <input
          value={section}
          onChange={(e) => onPropertyChange(node.id, "section", e.target.value)}
          list="gantt-sections"
          placeholder="Section name"
        />
        {sections.length > 0 && (
          <datalist id="gantt-sections">
            {sections.map((s) => <option key={s} value={s} />)}
          </datalist>
        )}
      </label>
    </>
  );
}
