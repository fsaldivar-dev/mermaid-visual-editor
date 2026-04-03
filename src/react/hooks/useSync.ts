import { useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { DiagramModel } from "../../core/model/types";
import { toReactFlow } from "../../core/converter/to-react-flow";
import { fromReactFlow } from "../../core/converter/from-react-flow";
import { serialize } from "../../core/serializer";

export interface UseSyncReturn {
  syncFromCanvas: (nodes: Node[], edges: Edge[], model: DiagramModel) => {
    model: DiagramModel;
    text: string;
  };
  syncToCanvas: (model: DiagramModel) => {
    nodes: Node[];
    edges: Edge[];
  };
}

export function useSync(): UseSyncReturn {
  const syncFromCanvas = useCallback(
    (nodes: Node[], edges: Edge[], currentModel: DiagramModel) => {
      const model = fromReactFlow(
        nodes,
        edges,
        currentModel.type,
        currentModel.direction
      );
      const text = serialize(model);
      return { model, text };
    },
    []
  );

  const syncToCanvas = useCallback((model: DiagramModel) => {
    return toReactFlow(model);
  }, []);

  return { syncFromCanvas, syncToCanvas };
}
