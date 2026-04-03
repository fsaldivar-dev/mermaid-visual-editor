import type { DiagramModel, NodeShape } from "../model/types";

const SHAPE_MAP: Record<NodeShape, (id: string, label: string) => string> = {
  rect: (id, label) => `${id}["${label}"]`,
  rounded: (id, label) => `${id}("${label}")`,
  diamond: (id, label) => `${id}{"${label}"}`,
  circle: (id, label) => `${id}(("${label}"))`,
};

export function serializeFlowchart(model: DiagramModel): string {
  const lines = [`flowchart ${model.direction}`];

  for (const el of model.elements) {
    const shapeFn = SHAPE_MAP[el.shape] || SHAPE_MAP.rect;
    lines.push(`    ${shapeFn(el.id, el.label)}`);
  }

  for (const conn of model.connections) {
    if (conn.label) {
      lines.push(`    ${conn.source} -->|"${conn.label}"| ${conn.target}`);
    } else {
      lines.push(`    ${conn.source} --> ${conn.target}`);
    }
  }

  return lines.join("\n");
}
