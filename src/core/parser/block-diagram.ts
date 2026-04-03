import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

/**
 * Parse block-beta diagram syntax.
 * Supports: columns, blocks with labels, arrows between blocks.
 */
export function parseBlockDiagram(text: string): DiagramModel {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let col = 0;
  let columns = 3;

  for (const line of lines) {
    if (line.match(/^block-beta/i)) continue;

    // Columns directive
    const colMatch = line.match(/^columns\s+(\d+)/i);
    if (colMatch) {
      columns = parseInt(colMatch[1], 10);
      continue;
    }

    // Block with label: id["label"] or id("label") or id{"label"} or just id
    const blockMatch = line.match(/^(\w+)\["([^"]*)"\]|^(\w+)\("([^"]*)"\)|^(\w+)\{"([^"]*)"\}|^(\w+):(\d+)/);
    if (blockMatch) {
      const id = blockMatch[1] || blockMatch[3] || blockMatch[5] || blockMatch[7];
      const label = blockMatch[2] || blockMatch[4] || blockMatch[6] || id;
      elements.push({
        id,
        label,
        shape: "rect",
        position: {
          x: (col % columns) * 200,
          y: Math.floor(col / columns) * 120,
        },
        properties: { isBlock: true },
      });
      col++;
      continue;
    }

    // Arrow: id1 --> id2 or id1 -- "label" --> id2
    const arrowMatch = line.match(/^(\w+)\s*-->\s*(\w+)/);
    if (arrowMatch) {
      connections.push({
        id: `e${connections.length}`,
        source: arrowMatch[1],
        target: arrowMatch[2],
        properties: {},
      });
      continue;
    }

    // Simple word = block without brackets
    const simpleMatch = line.match(/^(\w+)$/);
    if (simpleMatch && !line.match(/^(block|end|columns|space)/i)) {
      elements.push({
        id: simpleMatch[1],
        label: simpleMatch[1],
        shape: "rect",
        position: {
          x: (col % columns) * 200,
          y: Math.floor(col / columns) * 120,
        },
        properties: { isBlock: true },
      });
      col++;
    }
  }

  return {
    type: "block",
    direction: "TD",
    elements,
    connections,
    metadata: {},
  };
}
