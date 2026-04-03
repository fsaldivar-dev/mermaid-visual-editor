import type { DiagramModel, DiagramElement, DiagramConnection, DiagramType, Direction } from "../model/types";

export function parseGenericLines(
  text: string,
  type: DiagramType,
  dir: Direction = "LR"
): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];

  const ensure = (id: string): string => {
    const clean = id.replace(/[^a-zA-Z0-9_]/g, "_");
    if (elementsMap.has(clean)) return clean;
    elementsMap.set(clean, {
      id: clean,
      label: id,
      shape: "rect",
      position: { x: 0, y: 0 },
      properties: {},
    });
    return clean;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\S+)\s*(?:-->|->|--)\s*(\S+)(?:\s*:\s*(.+))?$/);
    if (m) {
      const src = ensure(m[1]);
      const tgt = ensure(m[2]);
      connections.push({
        id: `e${connections.length}`,
        source: src,
        target: tgt,
        label: m[3] || undefined,
        properties: {},
      });
    }
  }

  return {
    type,
    direction: dir,
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
