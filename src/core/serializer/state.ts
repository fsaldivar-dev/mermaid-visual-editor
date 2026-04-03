import type { DiagramModel } from "../model/types";

export function serializeStateDiagram(model: DiagramModel): string {
  const lines = ["stateDiagram-v2"];

  // Reverse the id transformation for [*] states
  const idToOriginal = (id: string) =>
    id === "_star_" ? "[*]" : id.replace(/_star_/g, "*");

  for (const conn of model.connections) {
    const src = idToOriginal(conn.source);
    const tgt = idToOriginal(conn.target);
    if (conn.label) {
      lines.push(`    ${src} --> ${tgt} : ${conn.label}`);
    } else {
      lines.push(`    ${src} --> ${tgt}`);
    }
  }

  return lines.join("\n");
}
