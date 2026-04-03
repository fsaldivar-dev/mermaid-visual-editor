import type { DiagramModel, DiagramElement, DiagramConnection, NodeShape } from "../model/types";

export function parseMindmap(text: string): DiagramModel {
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  const stack: { id: string; indent: number }[] = [];
  const rawLines = text.split("\n");

  for (let i = 1; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const match = raw.match(/^(\s*)(.*)/);
    if (!match || !match[2]) continue;

    const indent = match[1].length;
    let label = match[2].trim();
    const id = `mm${i}`;

    let shape: NodeShape = "rounded";
    const shapes: { regex: RegExp; shape: NodeShape }[] = [
      { regex: /^\w+\(\((.+)\)\)$/, shape: "circle" },
      { regex: /^\w+\((.+)\)$/, shape: "rounded" },
      { regex: /^\[(.+)\]$/, shape: "rect" },
    ];
    for (const s of shapes) {
      const sm = label.match(s.regex);
      if (sm) {
        label = sm[1];
        shape = s.shape;
        break;
      }
    }

    elements.push({
      id,
      label,
      shape,
      position: { x: 0, y: 0 },
      properties: { depth: stack.length },
    });

    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    if (stack.length) {
      connections.push({
        id: `e${connections.length}`,
        source: stack[stack.length - 1].id,
        target: id,
        properties: {},
      });
    }
    stack.push({ id, indent });
  }

  return {
    type: "mindmap",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
