import type { DiagramModel } from "../model/types";

export function serializeSequenceDiagram(model: DiagramModel): string {
  const lines = ["sequenceDiagram"];

  // Emit participants
  for (const el of model.elements) {
    lines.push(`    participant ${el.id} as ${el.label}`);
  }

  // Emit messages
  for (const conn of model.connections) {
    const msgType = (conn.properties.messageType as string) || "->>";
    lines.push(`    ${conn.source}${msgType}${conn.target}: ${conn.label || ""}`);
  }

  return lines.join("\n");
}
