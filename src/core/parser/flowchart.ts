import type {
  DiagramModel,
  DiagramElement,
  DiagramConnection,
  NodeShape,
  Direction,
  SubgraphDef,
} from "../model/types";

const NODE_PATTERNS: { regex: RegExp; shape: NodeShape }[] = [
  { regex: /^(\w+)\(\("([^"]*?)"\)\)/, shape: "circle" },
  { regex: /^(\w+)\(\(([^)]*?)\)\)/, shape: "circle" },
  { regex: /^(\w+)\{"([^"]*?)"\}/, shape: "diamond" },
  { regex: /^(\w+)\{([^}]*?)\}/, shape: "diamond" },
  { regex: /^(\w+)\("([^"]*?)"\)/, shape: "rounded" },
  { regex: /^(\w+)\(([^)]*?)\)/, shape: "rounded" },
  { regex: /^(\w+)\["([^"]*?)"\]/, shape: "rect" },
  { regex: /^(\w+)\[([^\]]*?)\]/, shape: "rect" },
];

function parseNodeSegment(
  segment: string
): { id: string; label: string; shape: NodeShape } | null {
  const trimmed = segment.trim();
  for (const { regex, shape } of NODE_PATTERNS) {
    const match = trimmed.match(regex);
    if (match) return { id: match[1], label: match[2], shape };
  }
  const plainMatch = trimmed.match(/^(\w+)$/);
  if (plainMatch)
    return { id: plainMatch[1], label: plainMatch[1], shape: "rect" };
  return null;
}

export function parseFlowchart(text: string): DiagramModel {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length)
    return {
      type: "flowchart",
      direction: "TD",
      elements: [],
      connections: [],
      metadata: {},
    };

  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];
  const subgraphs: SubgraphDef[] = [];
  let direction: Direction = "TD";
  let col = 0;

  // Stack for tracking nested subgraphs: each entry is the current subgraph id
  const subgraphStack: string[] = [];

  const headerMatch = lines[0]?.match(
    /^(?:flowchart|graph)\s+(TD|TB|LR|RL|BT)/i
  );
  if (headerMatch) direction = headerMatch[1].toUpperCase() as Direction;

  const currentParentId = (): string | undefined => {
    return subgraphStack.length > 0
      ? subgraphStack[subgraphStack.length - 1]
      : undefined;
  };

  const ensureNode = (id: string, label?: string, shape?: NodeShape) => {
    if (elementsMap.has(id)) {
      const existing = elementsMap.get(id)!;
      if (label && label !== id) existing.label = label;
      if (shape && shape !== "rect") existing.shape = shape;
      // Update parentId if we're inside a subgraph and node doesn't have one yet
      if (currentParentId() && !existing.parentId) {
        existing.parentId = currentParentId();
      }
      return;
    }
    elementsMap.set(id, {
      id,
      label: label || id,
      shape: shape || "rect",
      position: { x: (col % 4) * 200, y: Math.floor(col / 4) * 120 },
      properties: {},
      parentId: currentParentId(),
    });
    col++;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Subgraph start: "subgraph ID[Label]" or "subgraph ID" or "subgraph Label"
    const subgraphMatch = line.match(
      /^subgraph\s+(\w+)\s*\["?([^"\]]*)"?\]|^subgraph\s+(\w+)\s*$/i
    );
    if (subgraphMatch) {
      const id = subgraphMatch[1] || subgraphMatch[3];
      const label = subgraphMatch[2] || id;
      subgraphs.push({ id, label, children: [] });
      subgraphStack.push(id);

      // Create a group element for the subgraph
      ensureNode(id, label, "group" as NodeShape);
      // The group node itself should have its parent set to the outer subgraph
      // But it was just added with currentParentId() which would include itself — fix:
      const groupEl = elementsMap.get(id)!;
      // The parent should be the subgraph BEFORE we pushed this one
      groupEl.parentId =
        subgraphStack.length > 1
          ? subgraphStack[subgraphStack.length - 2]
          : undefined;
      continue;
    }

    // Subgraph end
    if (line.match(/^end$/i)) {
      if (subgraphStack.length > 0) {
        const sgId = subgraphStack.pop()!;
        // Collect children: all elements with parentId === sgId (excluding the group itself)
        const sg = subgraphs.find((s) => s.id === sgId);
        if (sg) {
          sg.children = [...elementsMap.values()]
            .filter((el) => el.parentId === sgId && el.id !== sgId)
            .map((el) => el.id);
        }
      }
      continue;
    }

    // Edge with label: A -->|"label"| B or A -->|label| B
    const edgeLabelMatch = line.match(
      /^(\w+)(?:\[.*?\]|\(.*?\)|\{.*?\})?\s*-->\|"?([^"|]*?)"?\|\s*(.+)$/
    );
    if (edgeLabelMatch) {
      const sourceId = edgeLabelMatch[1];
      const label = edgeLabelMatch[2];
      const targetSegment = edgeLabelMatch[3];

      const fullSrc = line.match(/^(\w+(?:\[.*?\]|\(.*?\)|\{.*?\})?)\s*-->/);
      if (fullSrc) {
        const s = parseNodeSegment(fullSrc[1]);
        if (s) ensureNode(s.id, s.label, s.shape);
      }

      const targetNode = parseNodeSegment(targetSegment);
      if (targetNode) {
        ensureNode(sourceId);
        ensureNode(targetNode.id, targetNode.label, targetNode.shape);
        connections.push({
          id: `e${connections.length}`,
          source: sourceId,
          target: targetNode.id,
          label,
          properties: {},
        });
      }
      continue;
    }

    // Simple edge: A --> B[text] or A --> B
    const edgeMatch = line.match(
      /^(\w+)(?:\[.*?\]|\(.*?\)|\{.*?\})?\s*-->\s*(.+)$/
    );
    if (edgeMatch) {
      const fullSource = line.match(
        /^(\w+(?:\[.*?\]|\(.*?\)|\{.*?\})?)\s*-->/
      );
      if (fullSource) {
        const srcNode = parseNodeSegment(fullSource[1]);
        if (srcNode) ensureNode(srcNode.id, srcNode.label, srcNode.shape);
      }
      const sourceId = edgeMatch[1];
      const targetSegment = edgeMatch[2].trim();
      const targetNode = parseNodeSegment(targetSegment);
      if (targetNode) {
        ensureNode(sourceId);
        ensureNode(targetNode.id, targetNode.label, targetNode.shape);
        connections.push({
          id: `e${connections.length}`,
          source: sourceId,
          target: targetNode.id,
          properties: {},
        });
      }
      continue;
    }

    // Standalone node definition
    const node = parseNodeSegment(line);
    if (node) {
      ensureNode(node.id, node.label, node.shape);
    }
  }

  return {
    type: "flowchart",
    direction,
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
    subgraphs: subgraphs.length > 0 ? subgraphs : undefined,
  };
}
