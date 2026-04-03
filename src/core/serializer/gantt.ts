import type { DiagramModel } from "../model/types";

export function serializeGantt(model: DiagramModel): string {
  const lines = ["gantt"];
  let currentSection = "";

  for (const el of model.elements) {
    const section = (el.properties.section as string) || "";
    const label = el.label.includes(" / ")
      ? el.label.split(" / ").slice(1).join(" / ")
      : el.label;

    if (section && section !== currentSection) {
      lines.push(`    section ${section}`);
      currentSection = section;
    }

    lines.push(`    ${label} : task${el.id}, 1d`);
  }

  return lines.join("\n");
}
