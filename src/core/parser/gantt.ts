import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseGantt(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let section = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const secMatch = line.match(/^section\s+(.+)$/i);
    if (secMatch) {
      section = secMatch[1];
      continue;
    }
    const taskMatch = line.match(/^(.+?)\s*:/);
    if (taskMatch && !line.match(/^title/i) && !line.match(/^dateFormat/i)) {
      const label = section
        ? `${section} / ${taskMatch[1].trim()}`
        : taskMatch[1].trim();
      elements.push({
        id: `g${elements.length}`,
        label,
        shape: "rect",
        position: { x: 0, y: 0 },
        properties: { section },
      });
    }
  }

  for (let i = 1; i < elements.length; i++) {
    connections.push({
      id: `e${i}`,
      source: elements[i - 1].id,
      target: elements[i].id,
      properties: {},
    });
  }

  return {
    type: "gantt",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
