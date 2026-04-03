import type { DiagramModel } from "../model/types";

export function serializeStateDiagram(model: DiagramModel): string {
  const lines = ["stateDiagram-v2"];

  const idToMermaid = (id: string) => {
    if (id === "_start_" || id === "_end_") return "[*]";
    return id;
  };

  for (const conn of model.connections) {
    const src = idToMermaid(conn.source);
    const tgt = idToMermaid(conn.target);
    if (conn.label) {
      lines.push(`    ${src} --> ${tgt} : ${conn.label}`);
    } else {
      lines.push(`    ${src} --> ${tgt}`);
    }
  }

  return lines.join("\n");
}
