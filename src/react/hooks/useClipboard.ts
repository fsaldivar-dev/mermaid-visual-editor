import { useCallback, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

let pasteCounter = 0;

export function useClipboard() {
  const clipboardRef = useRef<ClipboardData | null>(null);

  const copy = useCallback((nodes: Node[], edges: Edge[]) => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    // Only copy edges where both source and target are selected
    const selectedEdges = edges.filter(
      (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );

    clipboardRef.current = {
      nodes: selectedNodes.map((n) => ({ ...n })),
      edges: selectedEdges.map((e) => ({ ...e })),
    };
  }, []);

  const paste = useCallback((): ClipboardData | null => {
    if (!clipboardRef.current) return null;

    pasteCounter++;
    const offset = 20 * pasteCounter;

    // Create ID mapping for pasted nodes
    const idMap = new Map<string, string>();
    const now = Date.now().toString(36);

    const pastedNodes = clipboardRef.current.nodes.map((n) => {
      const newId = `${n.id}_copy${pasteCounter}_${now}`;
      idMap.set(n.id, newId);
      return {
        ...n,
        id: newId,
        position: {
          x: n.position.x + offset,
          y: n.position.y + offset,
        },
        selected: true,
      };
    });

    const pastedEdges = clipboardRef.current.edges.map((e) => {
      const newSource = idMap.get(e.source) || e.source;
      const newTarget = idMap.get(e.target) || e.target;
      return {
        ...e,
        id: `${e.id}_copy${pasteCounter}_${now}`,
        source: newSource,
        target: newTarget,
        selected: false,
      };
    });

    return { nodes: pastedNodes, edges: pastedEdges };
  }, []);

  const hasClipboard = useCallback(() => {
    return clipboardRef.current !== null && clipboardRef.current.nodes.length > 0;
  }, []);

  return { copy, paste, hasClipboard };
}
