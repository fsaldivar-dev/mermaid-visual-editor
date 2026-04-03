import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseJourney(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let section = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^title/i)) continue;
    const secMatch = line.match(/^section\s+(.+)$/i);
    if (secMatch) {
      section = secMatch[1];
      continue;
    }
    const step = line.match(/^(.+?):\s*(\d+)/);
    if (step) {
      elements.push({
        id: `j${elements.length}`,
        label: `${step[1].trim()} (${step[2]}/5)`,
        shape: "rounded",
        position: { x: 0, y: 0 },
        properties: { score: Number(step[2]), section },
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
    type: "journey",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
