import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseTimeline(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^title/i)) continue;
    const m = line.match(/^(.+?)\s*:\s*(.+)$/);
    if (m) {
      const period = m[1].trim();
      const events = m[2].split(":").map((e) => e.trim()).filter(Boolean);
      elements.push({
        id: `t${elements.length}`,
        label: `${period}\n${events.join(", ")}`,
        shape: "rect",
        position: { x: 0, y: 0 },
        properties: { period, events },
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
    type: "timeline",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
