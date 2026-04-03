import { useCallback, useRef, useState } from "react";
import { History } from "../../core/history";
import type { DiagramModel } from "../../core/model/types";

export interface UseHistoryReturn {
  model: DiagramModel;
  setModel: (model: DiagramModel) => void;
  setModelDebounced: (model: DiagramModel) => void;
  undo: () => DiagramModel | null;
  redo: () => DiagramModel | null;
  canUndo: boolean;
  canRedo: boolean;
  resetHistory: (model: DiagramModel) => void;
}

export function useHistory(initialModel: DiagramModel): UseHistoryReturn {
  const historyRef = useRef(new History<DiagramModel>(initialModel));
  const [model, setModelState] = useState<DiagramModel>(initialModel);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(historyRef.current.canUndo);
    setCanRedo(historyRef.current.canRedo);
  }, []);

  const setModel = useCallback(
    (newModel: DiagramModel) => {
      historyRef.current.push(newModel);
      setModelState(newModel);
      syncFlags();
    },
    [syncFlags]
  );

  const setModelDebounced = useCallback(
    (newModel: DiagramModel) => {
      historyRef.current.pushDebounced(newModel, 300);
      setModelState(newModel);
      // Sync flags after debounce settles
      setTimeout(() => syncFlags(), 350);
    },
    [syncFlags]
  );

  const undo = useCallback(() => {
    const prev = historyRef.current.undo();
    if (prev) {
      setModelState(prev);
      syncFlags();
    }
    return prev;
  }, [syncFlags]);

  const redo = useCallback(() => {
    const next = historyRef.current.redo();
    if (next) {
      setModelState(next);
      syncFlags();
    }
    return next;
  }, [syncFlags]);

  const resetHistory = useCallback(
    (newModel: DiagramModel) => {
      historyRef.current.reset(newModel);
      setModelState(newModel);
      syncFlags();
    },
    [syncFlags]
  );

  return { model, setModel, setModelDebounced, undo, redo, canUndo, canRedo, resetHistory };
}
