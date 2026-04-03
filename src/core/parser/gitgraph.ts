import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseGitGraph(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let commitCount = 0;
  let currentBranch = "main";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const commitMatch = line.match(/^commit(?:\s+id:\s*"?(.+?)"?)?/i);
    if (commitMatch) {
      const id = `c${commitCount++}`;
      const label = commitMatch[1] || `commit ${commitCount}`;
      elements.push({
        id,
        label: `${currentBranch}\n${label}`,
        shape: "circle",
        position: { x: 0, y: 0 },
        properties: { branch: currentBranch },
      });
      if (elements.length > 1) {
        connections.push({
          id: `e${connections.length}`,
          source: elements[elements.length - 2].id,
          target: id,
          properties: {},
        });
      }
      continue;
    }
    const branchMatch = line.match(/^branch\s+(\S+)/i);
    if (branchMatch) currentBranch = branchMatch[1];
    const mergeMatch = line.match(/^merge\s+(\S+)/i);
    if (mergeMatch) {
      const id = `c${commitCount++}`;
      elements.push({
        id,
        label: `merge ${mergeMatch[1]}`,
        shape: "circle",
        position: { x: 0, y: 0 },
        properties: { branch: currentBranch, merge: mergeMatch[1] },
      });
      if (elements.length > 1) {
        connections.push({
          id: `e${connections.length}`,
          source: elements[elements.length - 2].id,
          target: id,
          properties: {},
        });
      }
    }
  }

  return {
    type: "gitgraph",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
