import type { NodePanelProps } from "./types";

export function GitGraphNodePanel({ node, allNodes, onLabelChange, onPropertyChange }: NodePanelProps) {
  const branch = (node.data?.branch as string) || "main";
  const mergeTarget = node.data?.merge as string | undefined;
  const label = (node.data?.label as string) || "";
  const commitMsg = label.split("\n").pop() || "";

  const branches = [...new Set(
    allNodes
      .filter((n) => n.data?.branch)
      .map((n) => n.data?.branch as string)
  )];

  if (mergeTarget) {
    return (
      <>
        <h4>Merge</h4>
        <p className="mve-panel-hint">Merge from {mergeTarget}</p>
      </>
    );
  }

  return (
    <>
      <h4>Commit</h4>
      <label>
        <span>Message</span>
        <input
          value={commitMsg}
          onChange={(e) => onLabelChange(node.id, `${branch}\n${e.target.value}`)}
        />
      </label>
      <label>
        <span>Branch</span>
        <input
          value={branch}
          onChange={(e) => {
            onPropertyChange(node.id, "branch", e.target.value);
            onLabelChange(node.id, `${e.target.value}\n${commitMsg}`);
          }}
          list="git-branches"
        />
        {branches.length > 0 && (
          <datalist id="git-branches">
            {branches.map((b) => <option key={b} value={b} />)}
          </datalist>
        )}
      </label>
    </>
  );
}
