import type { DiagramType } from "../core/model/types";

export type EditorMode = "visual" | "split" | "inline";

interface Shape {
  type: string;
  label: string;
  icon: string;
}

const SHAPES_BY_TYPE: Record<string, Shape[]> = {
  flowchart: [
    { type: "rect", label: "Rectangle", icon: "\u25ad" },
    { type: "rounded", label: "Rounded", icon: "\u25a2" },
    { type: "diamond", label: "Decision", icon: "\u25c7" },
    { type: "circle", label: "Circle", icon: "\u25cb" },
  ],
  state: [
    { type: "rounded", label: "State", icon: "\u25a2" },
  ],
  class: [
    { type: "rect", label: "Class", icon: "\u25ad" },
  ],
  er: [
    { type: "rect", label: "Entity", icon: "\u25ad" },
  ],
  sequence: [
    { type: "rect", label: "Participant", icon: "\u25ad" },
  ],
  mindmap: [
    { type: "rounded", label: "Topic", icon: "\u25cb" },
  ],
};

const DEFAULT_SHAPES: Shape[] = [
  { type: "rect", label: "Node", icon: "\u25ad" },
];

interface EditorToolbarProps {
  mode: EditorMode;
  diagramType?: DiagramType;
  onModeChange?: (mode: EditorMode) => void;
  onAddNode?: (type: string) => void;
  onDelete?: () => void;
  onLayout?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onExportPng?: () => void;
  onExportSvg?: () => void;
  onToggleSidebar?: () => void;
  theme?: "light" | "dark";
}

export function EditorToolbar({
  mode,
  diagramType = "flowchart",
  onModeChange,
  onAddNode: _onAddNode,
  onDelete,
  onLayout,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onExportPng,
  onExportSvg,
  onToggleSidebar,
  theme = "light",
}: EditorToolbarProps) {
  // Shapes moved to ShapeLibrarySidebar — kept here for backward compat
  const _shapes = SHAPES_BY_TYPE[diagramType] || DEFAULT_SHAPES;
  void _shapes; void _onAddNode;

  return (
    <div className="mve-toolbar" data-theme={theme} role="toolbar" aria-label="Editor toolbar">
      <div className="mve-toolbar-left">
        {onModeChange && (
          <div className="mve-mode-toggle">
            {(["visual", "split", "inline"] as const).map((m) => (
              <button
                key={m}
                className={`mve-mode-btn ${mode === m ? "mve-active" : ""}`}
                onClick={() => onModeChange(m)}
              >
                {m === "visual" ? "\u2b1a" : m === "split" ? "\u2b0c" : "\u270e"}{" "}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        )}

        {mode === "visual" && (
          <div className="mve-history-btns" style={{ display: "flex", gap: 2, marginLeft: 8 }}>
            <button
              className="mve-action-btn"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{ opacity: canUndo ? 1 : 0.4 }}
            >
              &#x21A9;
            </button>
            <button
              className="mve-action-btn"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              style={{ opacity: canRedo ? 1 : 0.4 }}
            >
              &#x21AA;
            </button>
          </div>
        )}
      </div>

      <div className="mve-toolbar-center">
        {mode === "visual" && onToggleSidebar && (
          <button className="mve-action-btn" onClick={onToggleSidebar} title="Toggle shape library">
            &#x2630; Shapes
          </button>
        )}
      </div>

      <div className="mve-toolbar-right">
        {onLayout && mode === "visual" && (
          <button className="mve-action-btn" onClick={onLayout} title="Auto-layout">
            \u2b4e Layout
          </button>
        )}
        {mode === "visual" && (onExportPng || onExportSvg) && (
          <div className="mve-export-btns" style={{ display: "flex", gap: 2 }}>
            {onExportPng && (
              <button className="mve-action-btn" onClick={onExportPng} title="Export PNG">
                &#x1F4F7; PNG
              </button>
            )}
            {onExportSvg && (
              <button className="mve-action-btn" onClick={onExportSvg} title="Export SVG">
                &#x1F5BC; SVG
              </button>
            )}
          </div>
        )}
        {onDelete && mode === "visual" && (
          <button
            className="mve-action-btn mve-danger"
            onClick={onDelete}
            title="Delete selected"
          >
            \u2716
          </button>
        )}
      </div>
    </div>
  );
}
