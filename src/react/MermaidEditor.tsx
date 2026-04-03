import { useCallback, useEffect, useRef, useState } from "react";
import type { DiagramModel } from "../core/model/types";
import { parse } from "../core/parser";
import { serialize } from "../core/serializer";
import { applyDagreLayout } from "../core/layout/dagre-layout";
import { VisualEditor } from "./VisualEditor";
import { EditorToolbar, type EditorMode } from "./EditorToolbar";

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

  const [model, setModel] = useState<DiagramModel>(() => {
    const parsed = parse(value);
    return applyDagreLayout(parsed);
  });

  const lastValueRef = useRef(value);
  const isInternalChange = useRef(false);

  // Sync from external value changes
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      const parsed = parse(value);
      setModel(applyDagreLayout(parsed));
    }
  }, [value]);

  const handleModelChange = useCallback(
    (newModel: DiagramModel) => {
      setModel(newModel);
      onDiagramChange?.(newModel);
      const text = serialize(newModel);
      lastValueRef.current = text;
      isInternalChange.current = true;
      onChange?.(text);
    },
    [onChange, onDiagramChange]
  );

  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      if (onModeChange) {
        onModeChange(newMode);
      } else {
        setInternalMode(newMode);
      }
    },
    [onModeChange]
  );

  const handleLayout = useCallback(() => {
    const laid = applyDagreLayout(model);
    handleModelChange(laid);
  }, [model, handleModelChange]);

  const addNodeRef = useRef<((type: string) => void) | null>(null);

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
          onModeChange={handleModeChange}
          onAddNode={(type) => addNodeRef.current?.(type)}
          onDelete={undefined}
          onLayout={handleLayout}
          theme={theme}
        />
      )}

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {mode === "visual" && (
          <VisualEditor
            model={model}
            onModelChange={handleModelChange}
            theme={theme}
            minimap={minimap}
            readOnly={readOnly}
            height="100%"
            addNodeRef={addNodeRef}
          />
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
  );
}
