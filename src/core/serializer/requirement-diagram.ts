import type { DiagramModel } from "../model/types";

export function serializeRequirementDiagram(model: DiagramModel): string {
  const lines = ["requirementDiagram"];

  for (const el of model.elements) {
    const isElement = el.properties.isElement as boolean;
    if (isElement) {
      lines.push(`    element "${el.label}" {`);
      if (el.properties.type) lines.push(`        type: ${el.properties.type}`);
      if (el.properties.docref) lines.push(`        docref: ${el.properties.docref}`);
      lines.push("    }");
    } else {
      const reqType = (el.properties.reqType as string) || "requirement";
      lines.push(`    ${reqType} "${el.label}" {`);
      if (el.properties.id) lines.push(`        id: ${el.properties.id}`);
      if (el.properties.text) lines.push(`        text: ${el.properties.text}`);
      if (el.properties.risk) lines.push(`        risk: ${el.properties.risk}`);
      if (el.properties.verifymethod) lines.push(`        verifymethod: ${el.properties.verifymethod}`);
      lines.push("    }");
    }
  }

  for (const conn of model.connections) {
    const relType = (conn.properties.relType as string) || conn.label || "satisfies";
    lines.push(`    ${conn.source} - ${relType} -> ${conn.target}`);
  }

  return lines.join("\n");
}
