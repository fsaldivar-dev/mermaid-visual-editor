import type { DiagramModel } from "../model/types";

export function serializeClassDiagram(model: DiagramModel): string {
  const lines = ["classDiagram"];

  for (const el of model.elements) {
    const attrs = (el.properties?.attributes as string[]) || [];
    const methods = (el.properties?.methods as string[]) || [];
    const stereotype = el.properties?.stereotype as string | undefined;

    if (stereotype) {
      lines.push(`    <<${stereotype}>> ${el.id}`);
    }

    if (attrs.length > 0 || methods.length > 0) {
      lines.push(`    class ${el.id} {`);
      for (const a of attrs) {
        lines.push(`        ${a}`);
      }
      for (const m of methods) {
        lines.push(`        ${m}`);
      }
      lines.push(`    }`);
    } else {
      // Fallback: check label for multiline members (legacy format)
      const parts = el.label.split("\n");
      if (parts.length > 1) {
        lines.push(`    class ${el.id} {`);
        for (let i = 1; i < parts.length; i++) {
          lines.push(`        ${parts[i]}`);
        }
        lines.push(`    }`);
      }
    }
  }

  for (const conn of model.connections) {
    const relType = (conn.properties?.relationshipType as string) || "<|--";
    if (conn.label) {
      lines.push(`    ${conn.source} ${relType} ${conn.target} : ${conn.label}`);
    } else {
      lines.push(`    ${conn.source} ${relType} ${conn.target}`);
    }
  }

  return lines.join("\n");
}
