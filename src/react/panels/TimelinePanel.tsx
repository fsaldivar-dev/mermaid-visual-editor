import type { NodePanelProps } from "./types";

export function TimelineNodePanel({ node, onPropertyChange }: NodePanelProps) {
  const period = (node.data?.period as string) || "";
  const events = (node.data?.events as string[]) || [];

  return (
    <>
      <h4>Period</h4>
      <label>
        <span>Time</span>
        <input
          value={period}
          onChange={(e) => {
            onPropertyChange(node.id, "period", e.target.value);
            onPropertyChange(node.id, "label", `${e.target.value}\n${events.join(", ")}`);
          }}
        />
      </label>
      <label>
        <span>Events (one per line)</span>
        <textarea
          className="mve-textarea"
          value={events.join("\n")}
          onChange={(e) => {
            const evts = e.target.value.split("\n").filter(Boolean);
            onPropertyChange(node.id, "events", evts);
            onPropertyChange(node.id, "label", `${period}\n${evts.join(", ")}`);
          }}
          rows={3}
          placeholder="Event A&#10;Event B"
        />
      </label>
    </>
  );
}
