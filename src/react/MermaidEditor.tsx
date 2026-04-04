import { useCallback, useEffect, useRef, useState } from "react";
import type { DiagramModel } from "../core/model/types";
import { parse } from "../core/parser";
import { serialize } from "../core/serializer";
import { applyDagreLayout } from "../core/layout/dagre-layout";
import { VisualEditor } from "./VisualEditor";
import { EditorToolbar, type EditorMode } from "./EditorToolbar";
import { ShapeLibrarySidebar } from "./components/ShapeLibrarySidebar";
import { ChartView } from "./charts";
import { useHistory } from "./hooks/useHistory";

const CHART_TYPES = new Set(["pie", "gantt", "journey", "timeline"]);

export interface MermaidEditorProps {
  value?: string;
  onChange?: (text: string) => void;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  theme?: "light" | "dark";
  readOnly?: boolean;
  height?: number | string;
  toolbar?: boolean;
  minimap?: boolean;
  className?: string;
  onDiagramChange?: (model: DiagramModel) => void;
}

export function MermaidEditor({
  value = "flowchart TD\n    A[\"Start\"] --> B{\"Decision\"}\n    B -->|\"Yes\"| C[\"End\"]",
  onChange,
  mode: controlledMode,
  onModeChange,
  theme = "light",
  readOnly = false,
  height = 600,
  toolbar = true,
  minimap = true,
  className = "",
  onDiagramChange,
}: MermaidEditorProps) {
  const [internalMode, setInternalMode] = useState<EditorMode>("visual");
  const mode = controlledMode ?? internalMode;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const initialModel = useRef(() => {
    const parsed = parse(value);
    return applyDagreLayout(parsed);
  }).current;

  const {
    model, setModel, undo, redo, canUndo, canRedo, resetHistory,
  } = useHistory(initialModel());

  const lastValueRef = useRef(value);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      const parsed = parse(value);
      resetHistory(applyDagreLayout(parsed));
    }
  }, [value, resetHistory]);

  const handleModelChange = useCallback(
    (newModel: DiagramModel) => {
      setModel(newModel);
      onDiagramChange?.(newModel);
      const text = serialize(newModel);
      lastValueRef.current = text;
      isInternalChange.current = true;
      onChange?.(text);
    },
    [onChange, onDiagramChange, setModel]
  );

  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev) {
      onDiagramChange?.(prev);
      const text = serialize(prev);
      lastValueRef.current = text;
      isInternalChange.current = true;
      onChange?.(text);
    }
  }, [undo, onChange, onDiagramChange]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next) {
      onDiagramChange?.(next);
      const text = serialize(next);
      lastValueRef.current = text;
      isInternalChange.current = true;
      onChange?.(text);
    }
  }, [redo, onChange, onDiagramChange]);

  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      if (onModeChange) onModeChange(newMode);
      else setInternalMode(newMode);
    },
    [onModeChange]
  );

  const handleLayout = useCallback(() => {
    handleModelChange(applyDagreLayout(model));
  }, [model, handleModelChange]);

  const addNodeRef = useRef<((type: string, label?: string, position?: { x: number; y: number }) => void) | null>(null);
  const exportRef = useRef<{ exportToPng: () => void; exportToSvg: () => void } | null>(null);

  return (
    <div
      className={`mve-editor ${className}`}
      data-theme={theme}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {toolbar && (
        <EditorToolbar
          mode={mode}
          diagramType={model.type}
          onModeChange={handleModeChange}
          onAddNode={(type) => addNodeRef.current?.(type)}
          onDelete={undefined}
          onLayout={handleLayout}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onExportPng={() => exportRef.current?.exportToPng()}
          onExportSvg={() => exportRef.current?.exportToSvg()}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          theme={theme}
        />
      )}

      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {mode === "visual" && !CHART_TYPES.has(model.type) && !readOnly && (
          <ShapeLibrarySidebar
            diagramType={model.type}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
            theme={theme}
          />
        )}

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {mode === "visual" && !CHART_TYPES.has(model.type) && (
            <VisualEditor
              model={model}
              onModelChange={handleModelChange}
              onUndo={handleUndo}
              onRedo={handleRedo}
              theme={theme}
              minimap={minimap}
              readOnly={readOnly}
              height="100%"
              addNodeRef={addNodeRef}
              exportRef={exportRef}
            />
          )}

          {mode === "visual" && CHART_TYPES.has(model.type) && (
            <ChartView model={model} onModelChange={handleModelChange} theme={theme} />
          )}

          {mode === "split" && (
            <div className="mve-split-placeholder" style={{ padding: 20 }}>
              <p>Split mode coming in Phase 2 (Monaco + Preview)</p>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
                {serialize(model)}
              </pre>
            </div>
          )}

          {mode === "inline" && (
            <div className="mve-inline-placeholder" style={{ padding: 20 }}>
              <p>Inline editing mode coming in Phase 4</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
