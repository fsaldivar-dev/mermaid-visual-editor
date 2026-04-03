import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseStateDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];

  const ensure = (id: string) => {
    if (elementsMap.has(id)) return;
    const isStart = id === "[*]";
    elementsMap.set(id, {
      id: id.replace(/[[\]*]/g, "_star_"),
      label: isStart ? "\u25cf" : id,
      shape: isStart ? "circle" : "rounded",
      position: { x: 0, y: 0 },
      properties: {},
    });
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\S+)\s*-->\s*(\S+)\s*(?::\s*(.+))?$/);
    if (m) {
      ensure(m[1]);
      ensure(m[2]);
      const srcId = m[1].replace(/[[\]*]/g, "_star_");
      const tgtId = m[2].replace(/[[\]*]/g, "_star_");
      connections.push({
        id: `e${connections.length}`,
        source: srcId,
        target: tgtId,
        label: m[3] || undefined,
        properties: {},
      });
    }
  }

  return {
    type: "state",
    direction: "TD",
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
