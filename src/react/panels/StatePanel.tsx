import type { NodePanelProps, EdgePanelProps } from "./types";

export function StateNodePanel({ node, onLabelChange }: NodePanelProps) {
  const isStart = node.data?.isStart as boolean;
  const isEnd = node.data?.isEnd as boolean;

  if (isStart) {
    return (
      <>
        <h4>Start</h4>
        <p className="mve-panel-hint">Initial state terminal</p>
      </>
    );
  }

  if (isEnd) {
    return (
      <>
        <h4>End</h4>
        <p className="mve-panel-hint">Final state terminal</p>
      </>
    );
  }

  return (
    <>
      <h4>State</h4>
      <label>
        <span>Name</span>
        <input
          value={(node.data?.label as string) || ""}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
          autoFocus
        />
      </label>
    </>
  );
}

export function StateEdgePanel({ edge, onLabelChange }: EdgePanelProps) {
  return (
    <>
      <h4>Transition</h4>
      <label>
        <span>Event</span>
        <input
          value={(edge.label as string) || ""}
          onChange={(e) => onLabelChange(edge.id, e.target.value)}
          placeholder="Event name"
          autoFocus
        />
      </label>
    </>
  );
}
