import React, { useCallback, useMemo } from "react";
import type {
  DiagramModel,
  DiagramElement,
  DiagramConnection,
} from "../../core/model/types";

interface ERAttribute {
  type: string;
  name: string;
  key?: string;
}

interface ERDiagramViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                  */
/* ------------------------------------------------------------------ */
const CARDINALITY_OPTIONS = [
  { value: "||--||", label: "One to One" },
  { value: "||--o{", label: "One to Zero-or-Many" },
  { value: "||--|{", label: "One to One-or-Many" },
  { value: "o|--o{", label: "Zero-or-One to Zero-or-Many" },
  { value: "}o--o{", label: "Zero-or-Many to Zero-or-Many" },
  { value: "}|--|{", label: "One-or-Many to One-or-Many" },
  { value: "||..o{", label: "One to Zero-or-Many (identifying)" },
  { value: "||..|{", label: "One to One-or-Many (identifying)" },
];

const ENTITY_WIDTH = 180;
const ATTR_ROW_HEIGHT = 22;
const HEADER_HEIGHT = 32;
const SEP_HEIGHT = 1;
const PADDING_BOTTOM = 8;
const GRID_COLS = 3;
const H_GAP = 300;
const V_GAP = 250;
const GRID_OFFSET_X = 40;
const GRID_OFFSET_Y = 40;

function entityHeight(attrCount: number): number {
  return HEADER_HEIGHT + SEP_HEIGHT + attrCount * ATTR_ROW_HEIGHT + PADDING_BOTTOM;
}

/* ------------------------------------------------------------------ */
/*  Crow's-foot marker drawing helpers                                */
/* ------------------------------------------------------------------ */

/** Parse a cardinality string like "||--o{" into left/right markers and line style. */
function parseCardinality(card: string): {
  left: string;
  right: string;
  dashed: boolean;
} {
  const dashIdx = card.indexOf("--");
  const dotIdx = card.indexOf("..");
  if (dashIdx >= 0) {
    return {
      left: card.slice(0, dashIdx),
      right: card.slice(dashIdx + 2),
      dashed: false,
    };
  }
  if (dotIdx >= 0) {
    return {
      left: card.slice(0, dotIdx),
      right: card.slice(dotIdx + 2),
      dashed: true,
    };
  }
  return { left: "||", right: "||", dashed: false };
}

/**
 * Draw a crow's-foot marker group at a given point.
 * `angle` is the direction the line is arriving FROM (in radians).
 * The marker draws "outward" from the endpoint.
 */
function crowFootMarker(
  x: number,
  y: number,
  angle: number,
  marker: string,
  key: string,
  dark: boolean
): React.JSX.Element {
  const stroke = dark ? "#a5b4fc" : "#6366f1";
  const fill = dark ? "#1e1b4b" : "#fff";
  const len = 12;
  const spread = 8;

  // Unit vectors along and perpendicular to the arriving line direction
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const px = -dy;
  const py = dx;

  const elements: React.JSX.Element[] = [];

  // normalise: remove direction-flip chars
  const m = marker.replace(/\}/g, "{").replace(/\|/g, "|");

  const hasCircle = m.includes("o");
  const hasCrowFoot = m.includes("{");
  const barCount = (marker.match(/\|/g) || []).length;

  // Circle (zero)
  if (hasCircle) {
    const cr = 5;
    const cx = x + dx * (cr + 1);
    const cy = y + dy * (cr + 1);
    elements.push(
      <circle
        key={`${key}-circle`}
        cx={cx}
        cy={cy}
        r={cr}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
    );
    // Shift inward so subsequent marks don't overlap the circle
    x += dx * (cr * 2 + 2);
    y += dy * (cr * 2 + 2);
  }

  // Bar(s) (exactly one / mandatory)
  if (barCount >= 1) {
    const bx = x + dx * 2;
    const by = y + dy * 2;
    elements.push(
      <line
        key={`${key}-bar1`}
        x1={bx - px * spread}
        y1={by - py * spread}
        x2={bx + px * spread}
        y2={by + py * spread}
        stroke={stroke}
        strokeWidth={1.5}
      />
    );
  }
  if (barCount >= 2) {
    const bx = x + dx * 6;
    const by = y + dy * 6;
    elements.push(
      <line
        key={`${key}-bar2`}
        x1={bx - px * spread}
        y1={by - py * spread}
        x2={bx + px * spread}
        y2={by + py * spread}
        stroke={stroke}
        strokeWidth={1.5}
      />
    );
  }

  // Crow's foot (many)
  if (hasCrowFoot) {
    const tipX = x + dx * 2;
    const tipY = y + dy * 2;
    const baseX = x + dx * len;
    const baseY = y + dy * len;
    // three lines from tip spreading outward
    elements.push(
      <line
        key={`${key}-crow-center`}
        x1={tipX}
        y1={tipY}
        x2={baseX}
        y2={baseY}
        stroke={stroke}
        strokeWidth={1.5}
      />,
      <line
        key={`${key}-crow-up`}
        x1={tipX}
        y1={tipY}
        x2={baseX + px * spread}
        y2={baseY + py * spread}
        stroke={stroke}
        strokeWidth={1.5}
      />,
      <line
        key={`${key}-crow-down`}
        x1={tipX}
        y1={tipY}
        x2={baseX - px * spread}
        y2={baseY - py * spread}
        stroke={stroke}
        strokeWidth={1.5}
      />
    );
  }

  return <g key={key}>{elements}</g>;
}

/* ------------------------------------------------------------------ */
/*  Connection-point calculation                                       */
/* ------------------------------------------------------------------ */

interface EntityBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function connectionPoint(
  fromBox: EntityBox,
  toBox: EntityBox
): { x: number; y: number; angle: number } {
  const fcx = fromBox.x + fromBox.w / 2;
  const fcy = fromBox.y + fromBox.h / 2;
  const tcx = toBox.x + toBox.w / 2;
  const tcy = toBox.y + toBox.h / 2;

  const dx = tcx - fcx;
  const dy = tcy - fcy;

  let x: number;
  let y: number;

  if (Math.abs(dx) * fromBox.h > Math.abs(dy) * fromBox.w) {
    // Exit from left or right side
    if (dx > 0) {
      x = fromBox.x + fromBox.w;
      y = fcy + (dy / dx) * (fromBox.w / 2);
    } else {
      x = fromBox.x;
      y = fcy - (dy / dx) * (fromBox.w / 2);
    }
  } else {
    // Exit from top or bottom
    if (dy > 0) {
      y = fromBox.y + fromBox.h;
      x = fcx + (dx / dy) * (fromBox.h / 2);
    } else {
      y = fromBox.y;
      x = fcx - (dx / dy) * (fromBox.h / 2);
    }
  }

  const angle = Math.atan2(tcy - fcy, tcx - fcx);
  return { x, y, angle };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ERDiagramView({
  model,
  onModelChange,
  theme = "light",
  selectedId,
  onSelect,
}: ERDiagramViewProps) {
  const dark = theme === "dark";

  /* ---------- derived layout ---------- */
  const { entityBoxes, svgWidth, svgHeight } = useMemo(() => {
    const boxes = new Map<string, EntityBox>();
    model.elements.forEach((el, idx) => {
      const col = idx % GRID_COLS;
      const row = Math.floor(idx / GRID_COLS);
      const attrs = (el.properties.attributes as ERAttribute[]) || [];
      const h = entityHeight(attrs.length || 1);
      boxes.set(el.id, {
        id: el.id,
        x: GRID_OFFSET_X + col * H_GAP,
        y: GRID_OFFSET_Y + row * V_GAP,
        w: ENTITY_WIDTH,
        h,
      });
    });
    let maxX = 600;
    let maxY = 400;
    boxes.forEach((b) => {
      maxX = Math.max(maxX, b.x + b.w + 60);
      maxY = Math.max(maxY, b.y + b.h + 60);
    });
    return { entityBoxes: boxes, svgWidth: maxX, svgHeight: maxY };
  }, [model.elements]);

  /* ---------- update helpers ---------- */
  const updateElement = useCallback(
    (id: string, updates: Partial<DiagramElement>) => {
      onModelChange({
        ...model,
        elements: model.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      });
    },
    [model, onModelChange]
  );

  const updateConnection = useCallback(
    (id: string, updates: Partial<DiagramConnection>) => {
      onModelChange({
        ...model,
        connections: model.connections.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      });
    },
    [model, onModelChange]
  );

  /* ---------- selected items ---------- */
  const selectedEntity = selectedId
    ? model.elements.find((el) => el.id === selectedId)
    : null;
  const selectedRelation = selectedId
    ? model.connections.find((c) => c.id === selectedId)
    : null;

  /* ---------------------------------------------------------------- */
  /*  SVG shadow filter                                                */
  /* ---------------------------------------------------------------- */
  const shadowFilter = (
    <filter id="er-shadow" x="-4%" y="-4%" width="108%" height="112%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.10" />
    </filter>
  );

  /* ---------------------------------------------------------------- */
  /*  Render entities                                                  */
  /* ---------------------------------------------------------------- */
  const renderEntity = (el: DiagramElement) => {
    const box = entityBoxes.get(el.id);
    if (!box) return null;
    const attrs = (el.properties.attributes as ERAttribute[]) || [];
    const h = entityHeight(attrs.length || 1);
    const isSelected = selectedId === el.id;

    return (
      <g
        key={el.id}
        className={`mve-er-entity${isSelected ? " selected" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(el.id);
        }}
        transform={`translate(${box.x}, ${box.y})`}
      >
        {/* Box */}
        <rect
          width={box.w}
          height={h}
          rx={4}
          fill={dark ? "#1e1b4b" : "#fff"}
          stroke={isSelected ? "#ff9500" : (dark ? "#818cf8" : "#6366f1")}
          strokeWidth={isSelected ? 2 : 1.5}
          filter="url(#er-shadow)"
        />
        {/* Header background */}
        <rect
          className="mve-er-header-bg"
          width={box.w}
          height={HEADER_HEIGHT}
          rx={4}
        />
        {/* Bottom rect to square off header bottom corners */}
        <rect
          className="mve-er-header-bg"
          y={HEADER_HEIGHT - 4}
          width={box.w}
          height={4}
        />
        {/* Entity name */}
        <text
          x={box.w / 2}
          y={HEADER_HEIGHT / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontSize={13}
          fill={dark ? "#e0e7ff" : "#312e81"}
        >
          {el.label}
        </text>
        {/* Separator */}
        <line
          x1={0}
          y1={HEADER_HEIGHT}
          x2={box.w}
          y2={HEADER_HEIGHT}
          stroke={dark ? "#4338ca" : "#c7d2fe"}
          strokeWidth={1}
        />
        {/* Attributes */}
        {attrs.map((attr, ai) => {
          const rowY = HEADER_HEIGHT + SEP_HEIGHT + ai * ATTR_ROW_HEIGHT;
          return (
            <g key={ai} className="mve-er-attr-row">
              <text
                x={8}
                y={rowY + ATTR_ROW_HEIGHT / 2 + 1}
                dominantBaseline="central"
                fontSize={11}
                fill={dark ? "#c7d2fe" : "#4338ca"}
                fontFamily="monospace"
              >
                {attr.type}
              </text>
              <text
                x={70}
                y={rowY + ATTR_ROW_HEIGHT / 2 + 1}
                dominantBaseline="central"
                fontSize={11}
                fill={dark ? "#e2e8f0" : "#1e293b"}
              >
                {attr.name}
              </text>
              {attr.key && (
                <g>
                  <rect
                    x={box.w - 32}
                    y={rowY + 4}
                    width={24}
                    height={14}
                    rx={3}
                    fill={
                      attr.key === "PK"
                        ? (dark ? "#4338ca" : "#e0e7ff")
                        : (dark ? "#065f46" : "#d1fae5")
                    }
                  />
                  <text
                    x={box.w - 20}
                    y={rowY + ATTR_ROW_HEIGHT / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8}
                    fontWeight="bold"
                    fill={
                      attr.key === "PK"
                        ? (dark ? "#c7d2fe" : "#4338ca")
                        : (dark ? "#6ee7b7" : "#065f46")
                    }
                  >
                    {attr.key}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {/* If no attributes, show placeholder */}
        {attrs.length === 0 && (
          <text
            x={box.w / 2}
            y={HEADER_HEIGHT + 14}
            textAnchor="middle"
            fontSize={10}
            fill={dark ? "#64748b" : "#94a3b8"}
            fontStyle="italic"
          >
            no attributes
          </text>
        )}
      </g>
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Render relationships                                             */
  /* ---------------------------------------------------------------- */
  const renderRelationship = (conn: DiagramConnection) => {
    const srcBox = entityBoxes.get(conn.source);
    const tgtBox = entityBoxes.get(conn.target);
    if (!srcBox || !tgtBox) return null;

    const start = connectionPoint(srcBox, tgtBox);
    const end = connectionPoint(tgtBox, srcBox);

    const card = parseCardinality(
      (conn.properties.cardinality as string) || "||--||"
    );

    // Midpoint for label
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;

    // Slight curve control point (offset perpendicular for aesthetics)
    const lineAngle = Math.atan2(end.y - start.y, end.x - start.x);
    const perpX = -Math.sin(lineAngle) * 10;
    const perpY = Math.cos(lineAngle) * 10;
    const cpx = mx + perpX;
    const cpy = my + perpY;

    const isSelected = selectedId === conn.id;

    return (
      <g
        key={conn.id}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(conn.id);
        }}
      >
        {/* Wider invisible hit area */}
        <path
          d={`M ${start.x} ${start.y} Q ${cpx} ${cpy} ${end.x} ${end.y}`}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
        />
        {/* Visible line */}
        <path
          d={`M ${start.x} ${start.y} Q ${cpx} ${cpy} ${end.x} ${end.y}`}
          className="mve-er-relation-line"
          strokeDasharray={card.dashed ? "5,3" : undefined}
          stroke={isSelected ? "#ff9500" : undefined}
          strokeWidth={isSelected ? 2 : undefined}
        />
        {/* Crow's foot markers at each end */}
        {crowFootMarker(start.x, start.y, start.angle, card.left, `${conn.id}-left`, dark)}
        {crowFootMarker(end.x, end.y, end.angle + Math.PI, card.right, `${conn.id}-right`, dark)}
        {/* Label */}
        {conn.label && (
          <text
            x={mx}
            y={my - 8}
            className="mve-er-relation-label"
          >
            {conn.label}
          </text>
        )}
      </g>
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Edit panel                                                       */
  /* ---------------------------------------------------------------- */
  const renderEditPanel = () => {
    if (selectedEntity) {
      const attrs = (selectedEntity.properties.attributes as ERAttribute[]) || [];
      const attrsText = attrs
        .map((a) => `${a.type} ${a.name}${a.key ? ` ${a.key}` : ""}`)
        .join("\n");

      return (
        <div className="mve-chart-edit">
          <h4>Edit Entity</h4>
          <label>
            Name
            <input
              type="text"
              value={selectedEntity.label}
              onChange={(e) => {
                const newId = e.target.value.replace(/\s+/g, "_");
                updateElement(selectedEntity.id, {
                  label: e.target.value,
                  id: newId,
                });
              }}
            />
          </label>
          <label>
            Attributes
            <textarea
              className="mve-textarea"
              rows={Math.max(3, attrs.length + 1)}
              value={attrsText}
              placeholder={"string name PK\nint age\nstring email"}
              onChange={(e) => {
                const newAttrs: ERAttribute[] = e.target.value
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((line) => {
                    const parts = line.trim().split(/\s+/);
                    return {
                      type: parts[0] || "string",
                      name: parts[1] || "field",
                      key: parts[2] || undefined,
                    };
                  });
                updateElement(selectedEntity.id, {
                  properties: {
                    ...selectedEntity.properties,
                    attributes: newAttrs,
                  },
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
      );
    }

    if (selectedRelation) {
      const card = (selectedRelation.properties.cardinality as string) || "||--||";

      return (
        <div className="mve-chart-edit">
          <h4>Edit Relationship</h4>
          <label>
            Label
            <input
              type="text"
              value={selectedRelation.label || ""}
              onChange={(e) =>
                updateConnection(selectedRelation.id, { label: e.target.value })
              }
            />
          </label>
          <label>
            Cardinality
            <select
              value={card}
              onChange={(e) =>
                updateConnection(selectedRelation.id, {
                  properties: {
                    ...selectedRelation.properties,
                    cardinality: e.target.value,
                  },
                })
              }
            >
              {CARDINALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
      );
    }

    return null;
  };

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */
  return (
    <div className="mve-chart-container" style={{ position: "relative" }}>
      <svg
        className="mve-er-diagram"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        onClick={() => onSelect(null)}
      >
        <defs>{shadowFilter}</defs>
        {/* Relationships first (behind entities) */}
        {model.connections.map(renderRelationship)}
        {/* Entities */}
        {model.elements.map(renderEntity)}
      </svg>
      {renderEditPanel()}
    </div>
  );
}
