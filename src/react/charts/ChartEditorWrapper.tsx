import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ContextMenu } from "../components/ContextMenu";

interface ChartEditorWrapperProps {
  theme?: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  children: ReactNode;
  onAdd: () => void;
  onDelete: (id: string) => void;
  addLabel: string;
  elementName: string;
}

export function ChartEditorWrapper({
  theme = "light",
  selectedId,
  onSelect,
  children,
  onAdd,
  onDelete,
  addLabel,
  elementName,
}: ChartEditorWrapperProps) {
  const [contextMenu, setContextMenu] = useState<{x: number; y: number} | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if ((e.key === "Delete" || e.key === "Backspace") && !isInput && selectedId) {
        e.preventDefault();
        onDelete(selectedId);
        onSelect(null);
      }
      if (e.key === "Escape") {
        onSelect(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, onDelete, onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const contextItems = [];
  contextItems.push({ label: addLabel, icon: "+", action: () => { onAdd(); setContextMenu(null); } });
  if (selectedId) {
    contextItems.push({ divider: true, label: "", action: () => {} });
    contextItems.push({ label: `Delete ${elementName}`, icon: "\u{1F5D1}\u{FE0F}", action: () => { onDelete(selectedId); onSelect(null); setContextMenu(null); } });
  }

  return (
    <div
      className="mve-chart-editor-wrapper"
      data-theme={theme}
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
      style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}
    >
      <div className="mve-chart-toolbar">
        <button className="mve-chart-btn mve-chart-btn-primary" onClick={onAdd}>
          + {addLabel}
        </button>
        {selectedId && (
          <button className="mve-chart-btn mve-chart-btn-danger" onClick={() => { onDelete(selectedId); onSelect(null); }}>
            Delete
          </button>
        )}
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "auto" }}>
        {children}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={() => setContextMenu(null)}
          theme={theme === "dark" ? "dark" : "light"}
        />
      )}
    </div>
  );
}
