import { useState, useCallback } from "react";
import type { DiagramType } from "../../core/model/types";

interface ShapeItem {
  type: string;
  label: string;
  icon: string;
}

interface ShapeCategory {
  name: string;
  shapes: ShapeItem[];
}

const CATEGORIES_BY_TYPE: Record<string, ShapeCategory[]> = {
  flowchart: [
    {
      name: "Basic Shapes",
      shapes: [
        { type: "rect", label: "Rectangle", icon: "\u25ad" },
        { type: "rounded", label: "Rounded", icon: "\u25a2" },
        { type: "diamond", label: "Decision", icon: "\u25c7" },
        { type: "circle", label: "Circle", icon: "\u25cb" },
      ],
    },
    {
      name: "Extended Shapes",
      shapes: [
        { type: "stadium", label: "Stadium", icon: "\u2b2d" },
        { type: "subroutine", label: "Subroutine", icon: "\u229e" },
        { type: "cylinder", label: "Cylinder", icon: "\u232d" },
        { type: "hexagon", label: "Hexagon", icon: "\u2b21" },
        { type: "parallelogram", label: "Parallel", icon: "\u25b1" },
        { type: "trapezoid", label: "Trapezoid", icon: "\u23e2" },
        { type: "asymmetric", label: "Flag", icon: "\u2691" },
        { type: "doubleCircle", label: "Dbl Circle", icon: "\u25ce" },
      ],
    },
  ],
  state: [
    { name: "States", shapes: [
      { type: "rounded", label: "State", icon: "\u25a2" },
      { type: "forkJoin", label: "Fork/Join", icon: "\u2501" },
      { type: "choice", label: "Choice", icon: "\u25c6" },
      { type: "note", label: "Note", icon: "\ud83d\udcdd" },
    ]},
  ],
  class: [
    {
      name: "Classes",
      shapes: [
        { type: "rect", label: "Class", icon: "\u25ad" },
        { type: "rect", label: "Interface", icon: "\u25a1" },
      ],
    },
  ],
  er: [
    { name: "Entities", shapes: [{ type: "rect", label: "Entity", icon: "\u25ad" }] },
  ],
  sequence: [
    { name: "Sequence", shapes: [
      { type: "rect", label: "Participant", icon: "\u25ad" },
      { type: "actor", label: "Actor", icon: "\ud83e\uddcd" },
    ]},
  ],
  mindmap: [
    { name: "Topics", shapes: [{ type: "rounded", label: "Topic", icon: "\u25cb" }] },
  ],
};

const DEFAULT_CATEGORIES: ShapeCategory[] = [
  {
    name: "Shapes",
    shapes: [
      { type: "rect", label: "Rectangle", icon: "\u25ad" },
      { type: "rounded", label: "Rounded", icon: "\u25a2" },
      { type: "diamond", label: "Decision", icon: "\u25c7" },
      { type: "circle", label: "Circle", icon: "\u25cb" },
    ],
  },
];

interface ShapeLibrarySidebarProps {
  diagramType: DiagramType;
  collapsed: boolean;
  onToggle: () => void;
  theme?: "light" | "dark";
}

export function ShapeLibrarySidebar({
  diagramType,
  collapsed,
  onToggle,
  theme = "light",
}: ShapeLibrarySidebarProps) {
  const categories = CATEGORIES_BY_TYPE[diagramType] || DEFAULT_CATEGORIES;
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.name))
  );
  const noShapeTypes = ["pie", "gantt", "timeline", "journey", "gitgraph"];
  const canAddShapes = !noShapeTypes.includes(diagramType);

  const toggleCategory = useCallback((name: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const onDragStart = useCallback(
    (event: React.DragEvent, shape: ShapeItem) => {
      event.dataTransfer.setData(
        "application/mve-shape",
        JSON.stringify({ type: shape.type, label: shape.label })
      );
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  if (!canAddShapes) return null;

  return (
    <div
      className={`mve-sidebar ${collapsed ? "mve-sidebar-collapsed" : ""}`}
      data-theme={theme}
    >
      <button className="mve-sidebar-toggle" onClick={onToggle} title={collapsed ? "Expand" : "Collapse"}>
        {collapsed ? "\u25b6" : "\u25c0"}
      </button>

      {!collapsed && (
        <div className="mve-sidebar-content">
          <div className="mve-sidebar-header">Shapes</div>
          {categories.map((cat) => (
            <div key={cat.name} className="mve-sidebar-category">
              <button
                className="mve-category-toggle"
                onClick={() => toggleCategory(cat.name)}
              >
                <span>{openCategories.has(cat.name) ? "\u25bc" : "\u25b6"}</span>
                <span>{cat.name}</span>
              </button>
              {openCategories.has(cat.name) && (
                <div className="mve-shape-grid">
                  {cat.shapes.map((shape) => (
                    <div
                      key={shape.type}
                      className="mve-sidebar-shape"
                      draggable
                      onDragStart={(e) => onDragStart(e, shape)}
                      title={shape.label}
                    >
                      <span className="mve-sidebar-shape-icon">{shape.icon}</span>
                      <span className="mve-sidebar-shape-label">{shape.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
