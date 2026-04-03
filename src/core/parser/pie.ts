import type { DiagramModel, DiagramElement } from "../model/types";

export function parsePie(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: DiagramElement[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^title/i)) continue;
    const m = line.match(/^\s*"?([^":]+)"?\s*:\s*(\d+)/);
    if (m) {
      elements.push({
        id: `p${elements.length}`,
        label: `${m[1].trim()} (${m[2]})`,
        shape: "circle",
        position: { x: 0, y: 0 },
        properties: { value: Number(m[2]), rawLabel: m[1].trim() },
      });
    }
  }

  // Radial layout
  const cx = 300,
    cy = 200,
    r = 150;
  elements.forEach((n, i) => {
    const angle = (i / elements.length) * 2 * Math.PI - Math.PI / 2;
    n.position = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return {
    type: "pie",
    direction: "TD",
    elements,
    connections: [],
    metadata: {},
  };
}
