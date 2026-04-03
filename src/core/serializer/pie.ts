import type { DiagramModel } from "../model/types";

export function serializePie(model: DiagramModel): string {
  const lines = ["pie title Chart"];

  for (const el of model.elements) {
    const rawLabel = (el.properties.rawLabel as string) || el.label.replace(/\s*\(\d+\)$/, "");
    const value = (el.properties.value as number) || 0;
    lines.push(`    "${rawLabel}" : ${value}`);
  }

  return lines.join("\n");
}
