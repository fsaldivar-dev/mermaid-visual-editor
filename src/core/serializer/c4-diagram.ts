import type { DiagramModel } from "../model/types";

export function serializeC4Diagram(model: DiagramModel): string {
  const lines = ["C4Context"];

  for (const el of model.elements) {
    const c4Type = (el.properties.c4Type as string) || "System";
    const desc = (el.properties.description as string) || "";
    if (desc) {
      lines.push(`    ${c4Type}(${el.id}, "${el.label}", "${desc}")`);
    } else {
      lines.push(`    ${c4Type}(${el.id}, "${el.label}")`);
    }
  }

  for (const conn of model.connections) {
    const relType = (conn.properties.relType as string) || "Rel";
    const tech = (conn.properties.technology as string) || "";
    if (tech) {
      lines.push(`    ${relType}(${conn.source}, ${conn.target}, "${conn.label || ""}", "${tech}")`);
    } else {
      lines.push(`    ${relType}(${conn.source}, ${conn.target}, "${conn.label || ""}")`);
    }
  }

  return lines.join("\n");
}
