import type { DiagramModel } from "../model/types";

export function serializeClassDiagram(model: DiagramModel): string {
  const lines = ["classDiagram"];

  for (const conn of model.connections) {
    if (conn.label) {
      lines.push(`    ${conn.source} <|-- ${conn.target} : ${conn.label}`);
    } else {
      lines.push(`    ${conn.source} <|-- ${conn.target}`);
    }
  }

  for (const el of model.elements) {
    // If label has attributes (multiline), emit them
    const parts = el.label.split("\n");
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        lines.push(`    ${el.id} : ${parts[i]}`);
      }
    }
  }

  return lines.join("\n");
}
