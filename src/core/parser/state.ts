import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseStateDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];

  // Track [*] usage: as source = start, as target = end
  let hasStart = false;
  let hasEnd = false;

  // First pass: detect [*] roles
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].match(/^(\S+)\s*-->\s*(\S+)/);
    if (m) {
      if (m[1] === "[*]") hasStart = true;
      if (m[2] === "[*]") hasEnd = true;
    }
  }

  const resolveId = (id: string, isSource: boolean): string => {
    if (id !== "[*]") return id;
    // If [*] is used as both start and end, disambiguate
    if (hasStart && hasEnd) {
      return isSource ? "_start_" : "_end_";
    }
    return isSource ? "_start_" : "_end_";
  };

  const ensure = (id: string, originalId: string) => {
    if (elementsMap.has(id)) return;
    const isStart = originalId === "[*]" && id === "_start_";
    const isEnd = originalId === "[*]" && id === "_end_";
    const isTerminal = isStart || isEnd;

    elementsMap.set(id, {
      id,
      label: isTerminal ? "" : originalId,
      shape: isTerminal ? "circle" : "rounded",
      position: { x: 0, y: 0 },
      properties: { isStart, isEnd },
    });
  };

  // Second pass: build nodes and edges
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Parse state declarations with stereotypes: state fork_state <<fork>>
    const stereoMatch = line.match(/^state\s+(\S+)\s+<<(\w+)>>$/);
    if (stereoMatch) {
      const id = stereoMatch[1];
      const stereotype = stereoMatch[2];
      if (stereotype === "fork" || stereotype === "join") {
        elementsMap.set(id, {
          id,
          label: "",
          shape: "forkJoin",
          position: { x: 0, y: 0 },
          properties: { isFork: stereotype === "fork", isJoin: stereotype === "join" },
        });
      } else if (stereotype === "choice") {
        elementsMap.set(id, {
          id,
          label: "",
          shape: "choice",
          position: { x: 0, y: 0 },
          properties: {},
        });
      }
      continue;
    }

    // Parse state with label: state "Label" as id
    const stateAsMatch = line.match(/^state\s+"([^"]+)"\s+as\s+(\S+)$/);
    if (stateAsMatch) {
      const label = stateAsMatch[1];
      const id = stateAsMatch[2];
      if (!elementsMap.has(id)) {
        elementsMap.set(id, {
          id,
          label,
          shape: "rounded",
          position: { x: 0, y: 0 },
          properties: {},
        });
      }
      continue;
    }

    // Parse notes: note right of StateName : text
    const noteMatch = line.match(/^note\s+(right|left)\s+of\s+(\S+)\s*:\s*(.+)$/);
    if (noteMatch) {
      const side = noteMatch[1];
      const targetState = noteMatch[2];
      const noteText = noteMatch[3].trim();
      const noteId = `_note_${elementsMap.size}`;
      elementsMap.set(noteId, {
        id: noteId,
        label: noteText,
        shape: "note",
        position: { x: 0, y: 0 },
        properties: { noteOf: targetState, noteSide: side },
      });
      continue;
    }

    // Parse transitions: src --> tgt : label
    const m = line.match(/^(\S+)\s*-->\s*(\S+)\s*(?::\s*(.+))?$/);
    if (m) {
      const srcId = resolveId(m[1], true);
      const tgtId = resolveId(m[2], false);
      ensure(srcId, m[1]);
      ensure(tgtId, m[2]);
      connections.push({
        id: `e${connections.length}`,
        source: srcId,
        target: tgtId,
        label: m[3] || undefined,
        properties: {},
      });
    }
  }

  return {
    type: "state",
    direction: "TD",
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
