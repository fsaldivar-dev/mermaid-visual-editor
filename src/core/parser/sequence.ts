import type { DiagramModel, DiagramElement } from "../model/types";

const PARTICIPANT_SPACING = 250;
const PARTICIPANT_BOX_WIDTH = 120;
const MESSAGE_Y_START = 80;
const MESSAGE_Y_STEP = 60;

export function parseSequenceDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const participantOrder: string[] = [];
  const participantLabels = new Map<string, string>();
  const messages: { src: string; tgt: string; label: string; type: string }[] = [];

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
      if (!participantOrder.includes(msg[1])) participantOrder.push(msg[1]);
      if (!participantOrder.includes(msg[3])) participantOrder.push(msg[3]);
      messages.push({ src: msg[1], tgt: msg[3], label: msg[4], type: msg[2] });
    }
  }

  const elements: DiagramElement[] = [];

  // Participant center X positions (lifeline X)
  const participantIndexMap = new Map<string, number>();
  const lifelineHeight = MESSAGE_Y_START + messages.length * MESSAGE_Y_STEP + 40;

  participantOrder.forEach((id, i) => {
    participantIndexMap.set(id, i);
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

  // Messages: position X at the leftmost participant's lifeline center,
  // width spans between the two lifelines
  messages.forEach((msg, i) => {
    const srcIdx = participantIndexMap.get(msg.src) ?? 0;
    const tgtIdx = participantIndexMap.get(msg.tgt) ?? 0;
    const leftIdx = Math.min(srcIdx, tgtIdx);
    const rightIdx = Math.max(srcIdx, tgtIdx);
    const isReply = msg.type.includes("--");
    const goesRight = tgtIdx > srcIdx;

    // Lifeline center X for each participant = participantX + BOX_WIDTH/2
    // Message spans from left lifeline to right lifeline
    const leftLifelineCenterX = leftIdx * PARTICIPANT_SPACING + PARTICIPANT_BOX_WIDTH / 2;
    const rightLifelineCenterX = rightIdx * PARTICIPANT_SPACING + PARTICIPANT_BOX_WIDTH / 2;
    const msgWidth = rightLifelineCenterX - leftLifelineCenterX;
    const msgY = MESSAGE_Y_START + i * MESSAGE_Y_STEP;

    elements.push({
      id: `msg_${i}`,
      label: msg.label,
      shape: "message",
      position: { x: leftLifelineCenterX, y: msgY },
      properties: {
        isMessage: true,
        messageType: msg.type,
        isReply,
        goesRight,
        width: msgWidth,
        sourceParticipant: msg.src,
        targetParticipant: msg.tgt,
      },
    });
  });

  return {
    type: "sequence",
    direction: "LR",
    elements,
    connections: [],
    metadata: {},
  };
}
