import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseERDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];

  const ensure = (id: string) => {
    if (elementsMap.has(id)) return;
    elementsMap.set(id, {
      id,
      label: id,
      shape: "rect",
      position: { x: 0, y: 0 },
      properties: {},
    });
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\S+)\s+(\|[|o}{\s\-]+)\s+(\S+)\s*(?::\s*(.+))?$/);
    if (m) {
      ensure(m[1]);
      ensure(m[3]);
      connections.push({
        id: `e${connections.length}`,
        source: m[1],
        target: m[3],
        label: m[4] || undefined,
        properties: { cardinality: m[2] },
      });
      continue;
    }
    const entityMatch = line.match(/^(\w[\w-]*)\s*\{/);
    if (entityMatch) ensure(entityMatch[1]);
  }

  return {
    type: "er",
    direction: "LR",
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
