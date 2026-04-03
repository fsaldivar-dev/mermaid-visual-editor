import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

const PARTICIPANT_SPACING = 220;
const MESSAGE_Y_START = 100;
const MESSAGE_Y_STEP = 60;

export function parseSequenceDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const participantOrder: string[] = [];
  const participantLabels = new Map<string, string>();
  const messages: { src: string; tgt: string; label: string; type: string }[] = [];

  // First pass: collect participants and messages
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const part = line.match(/^(?:participant|actor)\s+(\w+)(?:\s+as\s+(.+))?$/i);
    if (part) {
      const id = part[1];
      if (!participantOrder.includes(id)) participantOrder.push(id);
      if (part[2]) participantLabels.set(id, part[2]);
      continue;
    }
    const msg = line.match(/^(\S+?)\s*(->>|-->>|->|-->)\+?\s*(\S+?)\s*:\s*(.+)$/);
    if (msg) {
      const src = msg[1];
      const tgt = msg[3];
      if (!participantOrder.includes(src)) participantOrder.push(src);
      if (!participantOrder.includes(tgt)) participantOrder.push(tgt);
      messages.push({ src, tgt, label: msg[4], type: msg[2] });
    }
  }

  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];

  // Create participant nodes — positioned in a row at top
  const participantIndexMap = new Map<string, number>();
  participantOrder.forEach((id, i) => {
    participantIndexMap.set(id, i);
    const lifelineHeight = MESSAGE_Y_START + messages.length * MESSAGE_Y_STEP + 40;
    elements.push({
      id,
      label: participantLabels.get(id) || id,
      shape: "participant",
      position: { x: i * PARTICIPANT_SPACING, y: 0 },
      properties: {
        isParticipant: true,
        lifelineHeight,
        participantIndex: i,
      },
    });
  });

  // Create message nodes — positioned between participants at staggered Y
  messages.forEach((msg, i) => {
    const srcIdx = participantIndexMap.get(msg.src) ?? 0;
    const tgtIdx = participantIndexMap.get(msg.tgt) ?? 0;
    const leftIdx = Math.min(srcIdx, tgtIdx);
    const rightIdx = Math.max(srcIdx, tgtIdx);
    const msgY = MESSAGE_Y_START + i * MESSAGE_Y_STEP;
    const msgX = leftIdx * PARTICIPANT_SPACING + PARTICIPANT_SPACING / 2;
    const isReply = msg.type.includes("--");
    const isRight = tgtIdx > srcIdx;

    const msgId = `msg_${i}`;
    elements.push({
      id: msgId,
      label: msg.label,
      shape: "message",
      position: { x: msgX, y: msgY },
      properties: {
        isMessage: true,
        messageType: msg.type,
        isReply,
        isRight,
        width: (rightIdx - leftIdx) * PARTICIPANT_SPACING,
        sourceParticipant: msg.src,
        targetParticipant: msg.tgt,
      },
    });
  });

  return {
    type: "sequence",
    direction: "LR",
    elements,
    connections, // empty — messages are rendered as nodes, not edges
    metadata: {},
  };
}
