import type { NodePanelProps } from "./types";

export function MindmapNodePanel({ node, allNodes, allEdges, onLabelChange }: NodePanelProps) {
  // Find parent
  const parentEdge = allEdges.find((e) => e.target === node.id);
  const parentNode = parentEdge ? allNodes.find((n) => n.id === parentEdge.source) : null;
  const depth = (node.data?.depth as number) ?? 0;

  return (
    <>
      <h4>Topic</h4>
      <label>
        <span>Label</span>
        <input
          value={(node.data?.label as string) || ""}
          onChange={(e) => onLabelChange(node.id, e.target.value)}
        />
      </label>
      {parentNode && (
        <label>
          <span>Parent</span>
          <input
            value={(parentNode.data?.label as string) || parentNode.id}
            readOnly
            className="mve-readonly"
          />
        </label>
      )}
      {depth === 0 && (
        <p className="mve-panel-hint">Root node</p>
      )}
    </>
  );
}
