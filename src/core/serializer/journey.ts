import type { DiagramModel } from "../model/types";

export function serializeJourney(model: DiagramModel): string {
  const lines = ["journey", "    title User Journey"];
  let currentSection = "";

  for (const el of model.elements) {
    const section = (el.properties.section as string) || "";
    if (section && section !== currentSection) {
      lines.push(`    section ${section}`);
      currentSection = section;
    }

    const score = (el.properties.score as number) || 3;
    // Strip the (X/5) suffix from label
    const label = el.label.replace(/\s*\(\d+\/5\)$/, "");
    lines.push(`    ${label}: ${score}: User`);
  }

  return lines.join("\n");
}
