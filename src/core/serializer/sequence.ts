import type { DiagramModel } from "../model/types";

export function serializeSequenceDiagram(model: DiagramModel): string {
  const lines = ["sequenceDiagram"];

  // Emit participants
  const participants = model.elements.filter((el) => el.properties.isParticipant);
  for (const p of participants) {
    if (p.label !== p.id) {
      lines.push(`    participant ${p.id} as ${p.label}`);
    } else {
      lines.push(`    participant ${p.id}`);
    }
  }

  // Emit messages
  const messages = model.elements.filter((el) => el.properties.isMessage);
  for (const msg of messages) {
    const src = msg.properties.sourceParticipant as string;
    const tgt = msg.properties.targetParticipant as string;
    const msgType = (msg.properties.messageType as string) || "->>";
    lines.push(`    ${src}${msgType}${tgt}: ${msg.label}`);
  }

  return lines.join("\n");
}
