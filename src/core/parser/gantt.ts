import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseGantt(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let section = "";
  let title = "";
  let dateFormat = "YYYY-MM-DD";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    const titleMatch = line.match(/^title\s+(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    const dfMatch = line.match(/^dateFormat\s+(.+)$/i);
    if (dfMatch) {
      dateFormat = dfMatch[1].trim();
      continue;
    }

    // Skip other directives
    if (line.match(/^(excludes|todayMarker|tickInterval|weekday|axisFormat)/i)) continue;

    const secMatch = line.match(/^section\s+(.+)$/i);
    if (secMatch) {
      section = secMatch[1];
      continue;
    }

    // Parse task lines: TaskName :id, startDate, duration
    // or: TaskName :status, id, startDate, duration
    // or: TaskName :id, after otherId, duration
    const taskMatch = line.match(/^(.+?)\s*:\s*(.+)$/);
    if (taskMatch) {
      const taskLabel = taskMatch[1].trim();
      const rest = taskMatch[2].trim();
      const parts = rest.split(",").map((p) => p.trim());

      let taskId = "";
      let startDate = "";
      let duration = "";
      let afterTask = "";
      let status = "";

      // Filter out status keywords
      const statusKeywords = new Set(["done", "active", "crit", "milestone"]);
      const filtered: string[] = [];
      for (const p of parts) {
        if (statusKeywords.has(p.toLowerCase())) {
          status = status ? `${status} ${p}` : p;
        } else {
          filtered.push(p);
        }
      }

      if (filtered.length >= 3) {
        // id, start/after, duration
        taskId = filtered[0];
        if (filtered[1].startsWith("after ")) {
          afterTask = filtered[1].replace(/^after\s+/, "");
        } else {
          startDate = filtered[1];
        }
        duration = filtered[2];
      } else if (filtered.length === 2) {
        // Could be: id, duration  OR  start, duration
        if (filtered[0].match(/^\d{4}-\d{2}-\d{2}/) || filtered[0].startsWith("after ")) {
          if (filtered[0].startsWith("after ")) {
            afterTask = filtered[0].replace(/^after\s+/, "");
          } else {
            startDate = filtered[0];
          }
          duration = filtered[1];
        } else {
          taskId = filtered[0];
          duration = filtered[1];
        }
      } else if (filtered.length === 1) {
        duration = filtered[0];
      }

      const label = section
        ? `${section} / ${taskLabel}`
        : taskLabel;

      elements.push({
        id: taskId || `g${elements.length}`,
        label,
        shape: "rect",
        position: { x: 0, y: 0 },
        properties: {
          section,
          taskId: taskId || `g${elements.length}`,
          taskLabel,
          startDate,
          duration,
          afterTask,
          status,
        },
      });
    }
  }

  for (let i = 1; i < elements.length; i++) {
    connections.push({
      id: `e${i}`,
      source: elements[i - 1].id,
      target: elements[i].id,
      properties: {},
    });
  }

  const metadata: Record<string, string> = {};
  if (title) metadata.title = title;
  metadata.dateFormat = dateFormat;

  return {
    type: "gantt",
    direction: "LR",
    elements,
    connections,
    metadata,
  };
}
