import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseClassDiagram(text: string): DiagramModel {
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

    // Inheritance: A <|-- B, A *-- B, A o-- B, A --> B
    const rel = line.match(
      /^(\w+)\s*(<\|--|<\.\.|\*--|o--|-->|-->\s)\s*(\w+)(?:\s*:\s*(.+))?$/
    );
    if (rel) {
      ensure(rel[1]);
      ensure(rel[3]);
      connections.push({
        id: `e${connections.length}`,
        source: rel[1],
        target: rel[3],
        label: rel[4] || undefined,
        properties: {},
      });
      continue;
    }

    // Class attribute: ClassName : +method()
    const attr = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (attr) {
      ensure(attr[1]);
      const node = elementsMap.get(attr[1])!;
      node.label = `${attr[1]}\n${attr[2]}`;
      continue;
    }

    // class ClassName { ... }
    const cls = line.match(/^class\s+(\w+)/);
    if (cls) ensure(cls[1]);
  }

  return {
    type: "class",
    direction: "TD",
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
