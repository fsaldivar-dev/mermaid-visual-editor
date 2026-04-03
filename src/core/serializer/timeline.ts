import type { DiagramModel } from "../model/types";

export function serializeTimeline(model: DiagramModel): string {
  const lines = ["timeline"];

  for (const el of model.elements) {
    const period = (el.properties.period as string) || el.label.split("\n")[0] || "";
    const events = (el.properties.events as string[]) || el.label.split("\n").slice(1);
    const eventsStr = Array.isArray(events) ? events.join(" : ") : events;
    lines.push(`    ${period} : ${eventsStr}`);
  }

  return lines.join("\n");
}
