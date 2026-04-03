import type { DiagramModel } from "../model/types";

export function serializeBlockDiagram(model: DiagramModel): string {
  const lines = ["block-beta"];

  // Infer column count from element positions
  const maxCol = model.elements.reduce(
    (max, el) => Math.max(max, Math.round(el.position.x / 200) + 1),
    3
  );
  lines.push(`    columns ${maxCol}`);

  for (const el of model.elements) {
    lines.push(`    ${el.id}["${el.label}"]`);
  }

  for (const conn of model.connections) {
    if (conn.label) {
      lines.push(`    ${conn.source} -- "${conn.label}" --> ${conn.target}`);
    } else {
      lines.push(`    ${conn.source} --> ${conn.target}`);
    }
  }

  return lines.join("\n");
}
