import type { DiagramModel, DiagramElement, DiagramConnection, NodeShape } from "../model/types";

export function parseMindmap(text: string): DiagramModel {
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  const stack: { id: string; indent: number; branchIndex: number }[] = [];
  let nextBranchIndex = 0;
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

    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();

    const depth = stack.length;
    let branchIndex = 0;

    if (depth === 0) {
      // Root node
      branchIndex = 0;
    } else if (depth === 1) {
      // Direct child of root: assign new branch index
      branchIndex = nextBranchIndex++;
    } else {
      // Deeper nodes inherit parent's branchIndex
      branchIndex = stack[stack.length - 1].branchIndex;
    }

    elements.push({
      id,
      label,
      shape,
      position: { x: 0, y: 0 },
      properties: { depth, branchIndex },
    });

    if (stack.length) {
      connections.push({
        id: `e${connections.length}`,
        source: stack[stack.length - 1].id,
        target: id,
        properties: {},
      });
    }
    stack.push({ id, indent, branchIndex });
  }

  applyRadialLayout(elements, connections);

  return {
    type: "mindmap",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}

function applyRadialLayout(elements: DiagramElement[], connections: DiagramConnection[]) {
  if (elements.length === 0) return;

  // Build adjacency: parent -> children
  const children = new Map<string, string[]>();
  for (const conn of connections) {
    if (!children.has(conn.source)) children.set(conn.source, []);
    children.get(conn.source)!.push(conn.target);
  }

  const root = elements[0]; // first element is root
  const cx = 400, cy = 300;
  const RADIUS_STEP = 200;

  function layout(nodeId: string, centerX: number, centerY: number, startAngle: number, endAngle: number, radius: number) {
    const el = elements.find(e => e.id === nodeId);
    if (!el) return;

    if (radius === 0) {
      // Root node
      el.position = { x: centerX, y: centerY };
    } else {
      const midAngle = (startAngle + endAngle) / 2;
      el.position = {
        x: centerX + radius * Math.cos(midAngle),
        y: centerY + radius * Math.sin(midAngle),
      };
    }

    const kids = children.get(nodeId) || [];
    if (kids.length === 0) return;

    const arcSpread = radius === 0 ? 2 * Math.PI : (endAngle - startAngle);
    const angleStep = arcSpread / kids.length;
    const baseAngle = radius === 0 ? -Math.PI : startAngle;

    kids.forEach((childId, i) => {
      const childStart = baseAngle + i * angleStep;
      const childEnd = childStart + angleStep;
      layout(childId, centerX, centerY, childStart, childEnd, radius + RADIUS_STEP);
    });
  }

  layout(root.id, cx, cy, -Math.PI, Math.PI, 0);
}
