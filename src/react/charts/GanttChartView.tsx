import { useCallback, useMemo } from "react";
import type { DiagramModel, DiagramElement } from "../../core/model/types";

interface GanttChartViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const SECTION_COLORS = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
  "#59a14f", "#edc949", "#af7aa1", "#ff9da7",
];

/** Parse a duration string like "3d", "1w", "2h" into days. */
function parseDurationDays(dur: string): number {
  const m = dur.match(/^(\d+)(d|w|h|m)?$/i);
  if (!m) return 1;
  const n = Number(m[1]);
  switch ((m[2] || "d").toLowerCase()) {
    case "w": return n * 7;
    case "h": return Math.max(1, Math.ceil(n / 24));
    case "m": return Math.max(1, Math.ceil(n / (24 * 60)));
    default: return n;
  }
}

/** Try to parse a date from YYYY-MM-DD string. Returns null on failure. */
function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface ResolvedTask {
  element: DiagramElement;
  start: Date;
  end: Date;
  durationDays: number;
  section: string;
}

export function GanttChartView({ model, onModelChange, theme: _theme = "light", selectedId, onSelect }: GanttChartViewProps) {
  const title = model.metadata.title || "";

  const updateElement = useCallback(
    (id: string, updates: Partial<DiagramElement>) => {
      const newElements = model.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      onModelChange({ ...model, elements: newElements });
    },
    [model, onModelChange]
  );

  // Resolve tasks with computed dates
  const { tasks, rangeStart, totalDays } = useMemo(() => {
    const resolved: ResolvedTask[] = [];
    const taskById = new Map<string, ResolvedTask>();
    const fallbackStart = new Date();
    fallbackStart.setHours(0, 0, 0, 0);

    for (const el of model.elements) {
      const props = el.properties;
      const durStr = String(props.duration || "1d");
      const durationDays = parseDurationDays(durStr);

      let start: Date | null = null;

      // Try explicit start date
      if (props.startDate) {
        start = parseDate(String(props.startDate));
      }

      // Try "after" dependency
      if (!start && props.afterTask) {
        const dep = taskById.get(String(props.afterTask));
        if (dep) {
          start = new Date(dep.end);
        }
      }

      // Fallback: chain from previous task or use today
      if (!start) {
        if (resolved.length > 0) {
          start = new Date(resolved[resolved.length - 1].end);
        } else {
          start = new Date(fallbackStart);
        }
      }

      const end = addDays(start, durationDays);
      const task: ResolvedTask = {
        element: el,
        start,
        end,
        durationDays,
        section: String(props.section || ""),
      };
      resolved.push(task);
      const tid = String(props.taskId || el.id);
      taskById.set(tid, task);
    }

    if (resolved.length === 0) {
      return { tasks: [], rangeStart: new Date(), rangeEnd: new Date(), totalDays: 1 };
    }

    const rStart = new Date(Math.min(...resolved.map((t) => t.start.getTime())));
    const rEnd = new Date(Math.max(...resolved.map((t) => t.end.getTime())));
    const total = Math.max(1, daysBetween(rStart, rEnd));

    return { tasks: resolved, rangeStart: rStart, rangeEnd: rEnd, totalDays: total };
  }, [model.elements]);

  // Group by section
  const sections = useMemo(() => {
    const map = new Map<string, ResolvedTask[]>();
    for (const t of tasks) {
      const key = t.section || "(default)";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [tasks]);

  // Generate day column headers (show only a subset for readability)
  const dayHeaders = useMemo(() => {
    const headers: { label: string; offset: number }[] = [];
    const step = Math.max(1, Math.floor(totalDays / 10));
    for (let i = 0; i <= totalDays; i += step) {
      const d = addDays(rangeStart, i);
      headers.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        offset: (i / totalDays) * 100,
      });
    }
    return headers;
  }, [rangeStart, totalDays]);

  const selectedElement = selectedId ? model.elements.find((el) => el.id === selectedId) : null;

  let sectionColorIdx = 0;
  const sectionColorMap = new Map<string, string>();

  return (
    <div className="mve-chart-container" style={{ position: "relative" }}>
      {title && <div className="mve-chart-title">{title}</div>}

      <div className="mve-gantt">
        {/* Timeline header */}
        <div className="mve-gantt-header">
          <div className="mve-gantt-label" style={{ fontWeight: 600, fontSize: 11, color: "#999" }}>Task</div>
          <div style={{ flex: 1, position: "relative", height: 20 }}>
            {dayHeaders.map((h, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${h.offset}%`,
                  fontSize: 10,
                  color: "#999",
                  transform: "translateX(-50%)",
                }}
              >
                {h.label}
              </span>
            ))}
          </div>
        </div>

        {sections.map(([sectionName, sectionTasks]) => {
          if (!sectionColorMap.has(sectionName)) {
            sectionColorMap.set(sectionName, SECTION_COLORS[sectionColorIdx % SECTION_COLORS.length]);
            sectionColorIdx++;
          }
          const color = sectionColorMap.get(sectionName)!;

          return (
            <div key={sectionName} className="mve-gantt-section">
              {sectionName !== "(default)" && (
                <div className="mve-gantt-section-title">{sectionName}</div>
              )}
              {sectionTasks.map((task) => {
                const offsetPct = (daysBetween(rangeStart, task.start) / totalDays) * 100;
                const widthPct = Math.max(1, (task.durationDays / totalDays) * 100);
                const taskLabel = String(task.element.properties.taskLabel || task.element.label);

                return (
                  <div key={task.element.id} className="mve-gantt-row">
                    <div className="mve-gantt-label" title={taskLabel}>
                      {taskLabel}
                    </div>
                    <div className="mve-gantt-track">
                      <div
                        className={`mve-gantt-bar${selectedId === task.element.id ? " selected" : ""}`}
                        style={{
                          left: `${offsetPct}%`,
                          width: `${widthPct}%`,
                          background: color,
                        }}
                        onClick={() => onSelect(task.element.id)}
                        title={`${taskLabel}: ${formatDate(task.start)} - ${formatDate(task.end)} (${task.durationDays}d)`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {selectedElement && (
        <div className="mve-chart-edit">
          <h4>Edit Task</h4>
          <label>
            Name
            <input
              type="text"
              value={String(selectedElement.properties.taskLabel || "")}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, taskLabel: e.target.value },
                  label: selectedElement.properties.section
                    ? `${selectedElement.properties.section} / ${e.target.value}`
                    : e.target.value,
                })
              }
            />
          </label>
          <label>
            Section
            <input
              type="text"
              value={String(selectedElement.properties.section || "")}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, section: e.target.value },
                  label: e.target.value
                    ? `${e.target.value} / ${selectedElement.properties.taskLabel}`
                    : String(selectedElement.properties.taskLabel || ""),
                })
              }
            />
          </label>
          <label>
            Start Date
            <input
              type="date"
              value={String(selectedElement.properties.startDate || "")}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, startDate: e.target.value },
                })
              }
            />
          </label>
          <label>
            Duration
            <input
              type="text"
              placeholder="e.g. 3d, 1w"
              value={String(selectedElement.properties.duration || "")}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, duration: e.target.value },
                })
              }
            />
          </label>
          <button
            style={{ marginTop: 8, fontSize: 12, cursor: "pointer" }}
            onClick={() => onSelect(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
