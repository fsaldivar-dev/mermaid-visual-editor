import type { DiagramModel } from "../model/types";

export function serializeGitGraph(model: DiagramModel): string {
  const lines = ["gitGraph"];
  let currentBranch = "main";

  for (const el of model.elements) {
    const branch = (el.properties.branch as string) || "main";
    const merge = el.properties.merge as string | undefined;

    if (branch !== currentBranch) {
      lines.push(`    branch ${branch}`);
      currentBranch = branch;
    }

    if (merge) {
      lines.push(`    merge ${merge}`);
    } else {
      const label = el.label.split("\n").pop() || "";
      if (label.startsWith("commit ")) {
        lines.push("    commit");
      } else {
        lines.push(`    commit id: "${label}"`);
      }
    }
  }

  return lines.join("\n");
}
