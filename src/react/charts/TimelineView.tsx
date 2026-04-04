import { useCallback } from "react";
import type { DiagramModel, DiagramElement, DiagramConnection } from "../../core/model/types";
import { ChartEditorWrapper } from "./ChartEditorWrapper";

interface TimelineViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const DOT_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export function TimelineView({
  model,
  onModelChange,
  theme = "light",
  selectedId,
  onSelect,
}: TimelineViewProps) {
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

  const selectedElement = selectedId
    ? model.elements.find((el) => el.id === selectedId)
    : null;

  // Add period: creates new period with incremental number, adds connection from last element
  const addPeriod = useCallback(() => {
    const nextNum = model.elements.length + 1;
    const id = `period_${Date.now()}`;
    const period = `Period ${nextNum}`;
    const newEl: DiagramElement = {
      id,
      label: period,
      shape: "timelineEvent" as DiagramElement["shape"],
      position: { x: 0, y: 0 },
      properties: { period, events: ["New event"] },
    };
    const newConnections = [...model.connections];
    if (model.elements.length > 0) {
      const lastEl = model.elements[model.elements.length - 1];
      const conn: DiagramConnection = {
        id: `conn_${lastEl.id}_${id}`,
        source: lastEl.id,
        target: id,
        properties: {},
      };
      newConnections.push(conn);
    }
    onModelChange({
      ...model,
      elements: [...model.elements, newEl],
      connections: newConnections,
    });
  }, [model, onModelChange]);

  // Delete period: removes element and its connections
  const deletePeriod = useCallback(
    (id: string) => {
      onModelChange({
        ...model,
        elements: model.elements.filter((el) => el.id !== id),
        connections: model.connections.filter(
          (c) => c.source !== id && c.target !== id
        ),
      });
    },
    [model, onModelChange]
  );

  return (
    <ChartEditorWrapper
      selectedId={selectedId}
      onSelect={onSelect}
      onAdd={addPeriod}
      onDelete={deletePeriod}
      addLabel="Add Period"
      elementName="period"
      theme={theme}
    >
      {title && <h2 className="mve-chart-title">{title}</h2>}

      <div className="mve-timeline">
        <div className="mve-timeline-line" />

        {model.elements.map((el, idx) => {
          const period = String(el.properties.period || "");
          const events = (el.properties.events as string[]) || [];
          const isLeft = idx % 2 === 0;
          const dotColor = DOT_COLORS[idx % DOT_COLORS.length];
          const isSelected = selectedId === el.id;

          return (
            <div
              key={el.id}
              className={`mve-timeline-entry ${isLeft ? "mve-timeline-left" : "mve-timeline-right"}`}
            >
              {isLeft ? (
                <>
                  <div
                    className={`mve-timeline-card${isSelected ? " selected" : ""}`}
                    onClick={() => onSelect(el.id)}
                  >
                    <div className="mve-timeline-period">{period}</div>
                    <div className="mve-timeline-events">
                      {events.map((evt, i) => (
                        <div key={i}>{evt}</div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="mve-timeline-dot"
                    style={{ background: dotColor }}
                  />
                </>
              ) : (
                <>
                  <div
                    className="mve-timeline-dot"
                    style={{ background: dotColor }}
                  />
                  <div
                    className={`mve-timeline-card${isSelected ? " selected" : ""}`}
                    onClick={() => onSelect(el.id)}
                  >
                    <div className="mve-timeline-period">{period}</div>
                    <div className="mve-timeline-events">
                      {events.map((evt, i) => (
                        <div key={i}>{evt}</div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedElement && (
        <div className="mve-chart-edit">
          <h4>Edit Period</h4>
          <label>
            Period
            <input
              type="text"
              value={String(selectedElement.properties.period || "")}
              onChange={(e) => {
                const period = e.target.value;
                const events = (selectedElement.properties.events as string[]) || [];
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, period },
                  label: `${period}\n${events.join(", ")}`,
                });
              }}
            />
          </label>
          <label>
            Events (one per line)
            <textarea
              className="mve-textarea"
              value={((selectedElement.properties.events as string[]) || []).join("\n")}
              onChange={(e) => {
                const events = e.target.value.split("\n").filter(Boolean);
                const period = String(selectedElement.properties.period || "");
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, events },
                  label: `${period}\n${events.join(", ")}`,
                });
              }}
              rows={4}
              placeholder={"Event A\nEvent B"}
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
    </ChartEditorWrapper>
  );
}
