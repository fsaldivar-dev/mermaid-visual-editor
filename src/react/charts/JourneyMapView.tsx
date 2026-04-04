import { useCallback } from "react";
import type { DiagramModel, DiagramElement } from "../../core/model/types";

interface JourneyMapViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function scoreColor(score: number): string {
  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
  return colors[Math.max(0, Math.min(4, score - 1))];
}

function extractTaskName(element: DiagramElement): string {
  const raw = String(element.properties.rawLabel || element.label || "");
  return raw.replace(/\s*\(\d+\/5\)$/, "");
}

export function JourneyMapView({
  model,
  onModelChange,
  theme = "light",
  selectedId,
  onSelect,
}: JourneyMapViewProps) {
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

  // Group elements by section
  const sections: { name: string; elements: DiagramElement[] }[] = [];
  const sectionMap = new Map<string, DiagramElement[]>();

  for (const el of model.elements) {
    const section = String(el.properties.section || "Default");
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
      sections.push({ name: section, elements: sectionMap.get(section)! });
    }
    sectionMap.get(section)!.push(el);
  }

  // Collect unique section names for dropdown
  const sectionNames = sections.map((s) => s.name);

  const selectedElement = selectedId
    ? model.elements.find((el) => el.id === selectedId)
    : null;

  return (
    <div className="mve-chart-container" data-theme={theme}>
      {title && <h2 className="mve-chart-title">{title}</h2>}

      {sections.map((section) => (
        <div key={section.name} className="mve-journey-section">
          <div className="mve-journey-section-title">{section.name}</div>
          <div className="mve-journey-cards">
            {section.elements.map((el, idx) => {
              const score = Math.max(1, Math.min(5, Number(el.properties.score) || 3));
              const taskName = extractTaskName(el);
              const isSelected = selectedId === el.id;

              return (
                <div key={el.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {idx > 0 && <span className="mve-journey-arrow">&rarr;</span>}
                  <div
                    className={`mve-journey-card${isSelected ? " selected" : ""}`}
                    onClick={() => onSelect(el.id)}
                  >
                    <div className="mve-journey-name">{taskName}</div>
                    <div className="mve-journey-score">
                      <div className="mve-journey-bar-track">
                        <div
                          className="mve-journey-bar"
                          style={{
                            width: `${(score / 5) * 100}%`,
                            background: scoreColor(score),
                          }}
                        />
                      </div>
                      <span className="mve-journey-score-num">{score}/5</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedElement && (
        <div className="mve-chart-edit">
          <h4>Edit Step</h4>
          <label>
            Task Name
            <input
              type="text"
              value={extractTaskName(selectedElement)}
              onChange={(e) => {
                const name = e.target.value;
                const score = Number(selectedElement.properties.score) || 3;
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, rawLabel: name },
                  label: `${name} (${score}/5)`,
                });
              }}
            />
          </label>
          <label>
            Score (1-5)
            <input
              type="number"
              min={1}
              max={5}
              value={Number(selectedElement.properties.score) || 3}
              onChange={(e) => {
                const score = Math.max(1, Math.min(5, Number(e.target.value) || 1));
                const name = extractTaskName(selectedElement);
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, score },
                  label: `${name} (${score}/5)`,
                });
              }}
            />
          </label>
          <label>
            Section
            <select
              value={String(selectedElement.properties.section || "")}
              onChange={(e) => {
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, section: e.target.value },
                });
              }}
            >
              {sectionNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
