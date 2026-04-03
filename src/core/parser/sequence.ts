import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseSequenceDiagram(text: string): DiagramModel {
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
    const part = line.match(/^(?:participant|actor)\s+(\w+)(?:\s+as\s+(.+))?$/i);
    if (part) {
      const id = ensure(part[1]);
      if (part[2]) elementsMap.get(id)!.label = part[2];
      continue;
    }
    const msg = line.match(/^(\S+?)\s*(->>|-->>|->|-->)\+?\s*(\S+?)\s*:\s*(.+)$/);
    if (msg) {
      const src = ensure(msg[1]);
      const tgt = ensure(msg[3]);
      connections.push({
        id: `e${connections.length}`,
        source: src,
        target: tgt,
        label: msg[4],
        properties: { messageType: msg[2] },
      });
    }
  }

  const elements = [...elementsMap.values()];
  elements.forEach((n, i) => {
    n.position = { x: i * 200, y: 0 };
  });

  return {
    type: "sequence",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
