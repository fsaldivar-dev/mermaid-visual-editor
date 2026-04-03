import type { DiagramModel } from "../model/types";

export function serializeERDiagram(model: DiagramModel): string {
  const lines = ["erDiagram"];

  for (const conn of model.connections) {
    const cardinality = (conn.properties.cardinality as string) || "||--||";
    if (conn.label) {
      lines.push(`    ${conn.source} ${cardinality} ${conn.target} : ${conn.label}`);
    } else {
      lines.push(`    ${conn.source} ${cardinality} ${conn.target} : relates`);
    }
  }

  return lines.join("\n");
}
