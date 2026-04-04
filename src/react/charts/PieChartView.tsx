import { useCallback } from "react";
import type { DiagramModel, DiagramElement } from "../../core/model/types";

interface PieChartViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const COLORS = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
  "#59a14f", "#edc949", "#af7aa1", "#ff9da7",
];

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
  const end = { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function PieChartView({ model, onModelChange, theme: _theme = "light", selectedId, onSelect }: PieChartViewProps) {
  const total = model.elements.reduce((sum, el) => sum + (Number(el.properties.value) || 0), 0);
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

  const selectedElement = selectedId ? model.elements.find((el) => el.id === selectedId) : null;

  // Build slices
  const cx = 150;
  const cy = 150;
  const r = 130;
  let currentAngle = -Math.PI / 2;

  const slices = model.elements.map((el, i) => {
    const value = Number(el.properties.value) || 0;
    const sliceAngle = total > 0 ? (value / total) * 2 * Math.PI : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    return {
      element: el,
      path: sliceAngle > 0 ? describeArc(cx, cy, r, startAngle, endAngle) : "",
      color: COLORS[i % COLORS.length],
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
      value,
    };
  });

  return (
    <div className="mve-chart-container" style={{ position: "relative" }}>
      {title && <div className="mve-chart-title">{title}</div>}

      <svg
        className="mve-pie-svg"
        width={300}
        height={300}
        viewBox="0 0 300 300"
      >
        {slices.map((slice) => (
          <path
            key={slice.element.id}
            d={slice.path}
            fill={slice.color}
            className={`mve-pie-slice${selectedId === slice.element.id ? " selected" : ""}`}
            onClick={() => onSelect(slice.element.id)}
          />
        ))}
      </svg>

      <div className="mve-pie-legend">
        {slices.map((slice) => (
          <div
            key={slice.element.id}
            className="mve-pie-legend-item"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(slice.element.id)}
          >
            <span className="mve-pie-legend-dot" style={{ background: slice.color }} />
            <span>
              {String(slice.element.properties.rawLabel || slice.element.label)} &mdash; {slice.value} ({slice.percentage}%)
            </span>
          </div>
        ))}
      </div>

      {selectedElement && (
        <div className="mve-chart-edit">
          <h4>Edit Slice</h4>
          <label>
            Name
            <input
              type="text"
              value={String(selectedElement.properties.rawLabel || "")}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, rawLabel: e.target.value },
                  label: `${e.target.value} (${selectedElement.properties.value})`,
                })
              }
            />
          </label>
          <label>
            Value
            <input
              type="number"
              min={0}
              value={Number(selectedElement.properties.value) || 0}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                updateElement(selectedElement.id, {
                  properties: { ...selectedElement.properties, value: v },
                  label: `${selectedElement.properties.rawLabel} (${v})`,
                });
              }}
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
