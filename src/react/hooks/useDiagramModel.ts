import { useState, useCallback, useRef } from "react";
import type { DiagramModel } from "../../core/model/types";
import { parse } from "../../core/parser";
import { serialize } from "../../core/serializer";
import { applyDagreLayout } from "../../core/layout/dagre-layout";

export interface UseDiagramModelReturn {
  model: DiagramModel;
  setModel: (model: DiagramModel) => void;
  updateFromText: (text: string) => void;
  toText: () => string;
  layoutModel: () => void;
}

export function useDiagramModel(initialText: string = ""): UseDiagramModelReturn {
  const [model, setModelState] = useState<DiagramModel>(() => {
    const parsed = parse(initialText);
    return applyDagreLayout(parsed);
  });

  const modelRef = useRef(model);
  modelRef.current = model;

  const setModel = useCallback((newModel: DiagramModel) => {
    setModelState(newModel);
  }, []);

  const updateFromText = useCallback((text: string) => {
    const parsed = parse(text);
    const laid = applyDagreLayout(parsed);
    setModelState(laid);
  }, []);

  const toText = useCallback(() => {
    return serialize(modelRef.current);
  }, []);

  const layoutModel = useCallback(() => {
    setModelState((prev) => applyDagreLayout(prev));
  }, []);

  return { model, setModel, updateFromText, toText, layoutModel };
}
