export type EditorMode = "visual" | "split" | "inline";

interface Shape {
  type: string;
  label: string;
  icon: string;
}

const SHAPES: Shape[] = [
  { type: "rect", label: "Rectangle", icon: "\u25ad" },
  { type: "rounded", label: "Rounded", icon: "\u25a2" },
  { type: "diamond", label: "Decision", icon: "\u25c7" },
  { type: "circle", label: "Circle", icon: "\u25cb" },
];

interface EditorToolbarProps {
  mode: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  onAddNode?: (type: string) => void;
  onDelete?: () => void;
  onLayout?: () => void;
  theme?: "light" | "dark";
}

export function EditorToolbar({
  mode,
  onModeChange,
  onAddNode,
  onDelete,
  onLayout,
  theme = "light",
}: EditorToolbarProps) {
  return (
    <div className="mve-toolbar" data-theme={theme}>
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
      </div>

      {mode === "visual" && (
        <div className="mve-toolbar-center">
          {SHAPES.map((s) => (
            <button
              key={s.type}
              className="mve-shape-btn"
              onClick={() => onAddNode?.(s.type)}
              title={s.label}
            >
              <span className="mve-shape-icon">{s.icon}</span>
              <span className="mve-shape-label">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mve-toolbar-right">
        {onLayout && mode === "visual" && (
          <button className="mve-action-btn" onClick={onLayout} title="Auto-layout">
            \u2b4e Layout
          </button>
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
