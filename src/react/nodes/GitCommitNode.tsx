import { Handle, Position, NodeResizer } from "@xyflow/react";

interface GitCommitNodeProps {
  data: { label?: string; branch?: string };
  selected?: boolean;
}

const BRANCH_COLORS: Record<string, string> = {
  main: "#0071e3",
  master: "#0071e3",
  develop: "#34c759",
  feature: "#ff9500",
  hotfix: "#ff3b30",
  release: "#af52de",
};

export function GitCommitNode({ data, selected }: GitCommitNodeProps) {
  const label = data?.label || "";
  const branch = data?.branch || label.split("\n")[0] || "main";
  const commitMsg = label.split("\n").slice(1).join(" ") || label;
  const color = BRANCH_COLORS[branch] || BRANCH_COLORS[branch.split("/")[0]] || "#5ac8fa";

  return (
    <div className={`mve-node mve-git-commit ${selected ? "mve-selected" : ""}`}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={50}
        minHeight={30}
        handleClassName="mve-resize-handle"
        lineClassName="mve-resize-line"
      />
      <Handle type="source" position={Position.Top} id="top" className="mve-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mve-handle" />
      <Handle type="source" position={Position.Left} id="left" className="mve-handle" />
      <Handle type="source" position={Position.Right} id="right" className="mve-handle" />
      <div className="mve-git-dot" style={{ background: color }} />
      <div className="mve-git-info">
        <div className="mve-git-branch" style={{ color }}>{branch}</div>
        <div className="mve-git-msg">{commitMsg}</div>
      </div>
    </div>
  );
}
