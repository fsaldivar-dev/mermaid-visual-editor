import type { DiagramModel } from "../model/types";

interface ERAttribute {
  type: string;
  name: string;
  key?: string;
}

export function serializeERDiagram(model: DiagramModel): string {
  const lines = ["erDiagram"];

  // Serialize entity attribute blocks
  for (const el of model.elements) {
    const attrs = el.properties.attributes as ERAttribute[] | undefined;
    if (attrs && attrs.length > 0) {
      lines.push(`    ${el.id} {`);
      for (const attr of attrs) {
        if (attr.key) {
          lines.push(`        ${attr.type} ${attr.name} ${attr.key}`);
        } else {
          lines.push(`        ${attr.type} ${attr.name}`);
        }
      }
      lines.push(`    }`);
    }
  }

  // Serialize relationships
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
