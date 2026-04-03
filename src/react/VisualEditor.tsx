import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  SelectionMode,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getNodeTypes } from "./nodes";
import { PropertiesPanel } from "./PropertiesPanel";
import type { DiagramModel } from "../core/model/types";
import { toReactFlow } from "../core/converter/to-react-flow";
import { fromReactFlow } from "../core/converter/from-react-flow";
import { useClipboard } from "./hooks/useClipboard";
import { useExport } from "./hooks/useExport";
import { useSearch } from "./hooks/useSearch";
import { SearchOverlay } from "./components/SearchOverlay";

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

let nodeIdCounter = 0;

export interface VisualEditorProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  theme?: "light" | "dark";
  minimap?: boolean;
  readOnly?: boolean;
  height?: number | string;
  addNodeRef?: React.MutableRefObject<((type: string) => void) | null>;
  exportRef?: React.MutableRefObject<{ exportToPng: () => void; exportToSvg: () => void } | null>;
}

export function VisualEditor({
  model,
  onModelChange,
  onUndo,
  onRedo,
  theme = "light",
  minimap = true,
  readOnly = false,
  height = "100%",
  addNodeRef,
  exportRef,
}: VisualEditorProps) {
  const initial = useMemo(() => toReactFlow(model), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Get node types for current diagram type
  const currentNodeTypes = useMemo(() => getNodeTypes(model.type), [model.type]);

  // Clipboard, export, and search hooks
  const { copy, paste } = useClipboard();
  const { exportToPng, exportToSvg } = useExport();
  const searchState = useSearch(nodes);

  // Sync from external model changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = toReactFlow(model);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [model, setNodes, setEdges]);

  // Emit model changes back
  const emitChange = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      const newModel = fromReactFlow(
        currentNodes,
        currentEdges,
        model.type,
        model.direction
      );
      onModelChange(newModel);
    },
    [model.type, model.direction, onModelChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // Sequence diagram: create a message node instead of an edge
      if (model.type === "sequence" && connection.source && connection.target) {
        const src = connection.source;
        const tgt = connection.target;
        if (src === tgt) return; // no self-messages

        setNodes((nds) => {
          const participants = nds.filter((n) => n.data?.isParticipant);
          const messages = nds.filter((n) => n.data?.isMessage);
          const srcIdx = participants.findIndex((p) => p.id === src);
          const tgtIdx = participants.findIndex((p) => p.id === tgt);
          const leftIdx = Math.min(srcIdx, tgtIdx);
          const rightIdx = Math.max(srcIdx, tgtIdx);

          const SPACING = 250;
          const P_WIDTH = 120;
          const MSG_Y_START = 80;
          const MSG_Y_STEP = 60;

          const msgY = MSG_Y_START + messages.length * MSG_Y_STEP;
          const leftLifelineX = leftIdx * SPACING + P_WIDTH / 2;
          const rightLifelineX = rightIdx * SPACING + P_WIDTH / 2;
          const msgWidth = rightLifelineX - leftLifelineX;

          const msgId = `msg_${Date.now().toString(36)}`;
          const newMsg: Node = {
            id: msgId,
            type: "message",
            position: { x: leftLifelineX, y: msgY },
            data: {
              label: "New message",
              isMessage: true,
              messageType: "->>",
              isReply: false,
              goesRight: tgtIdx > srcIdx,
              width: msgWidth,
              sourceParticipant: src,
              targetParticipant: tgt,
            },
          };

          const updated = [...nds, newMsg];
          setTimeout(() => emitChange(updated, edges), 0);
          return updated;
        });
        return;
      }

      // Default: add edge
      setEdges((eds) => {
        const updated = addEdge(
          { ...connection, ...defaultEdgeOptions },
          eds
        );
        setTimeout(() => emitChange(nodes, updated), 0);
        return updated;
      });
    },
    [setEdges, setNodes, nodes, edges, emitChange, model.type]
  );

  const addNode = useCallback(
    (type = "rect") => {
      if (readOnly) return;
      const id = `n${++nodeIdCounter}_${Date.now().toString(36)}`;
      setNodes((nds) => {
        const updated = [
          ...nds,
          {
            id,
            type,
            data: { label: "New" },
            position: {
              x: 200 + Math.random() * 300,
              y: 100 + Math.random() * 300,
            },
          },
        ];
        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [setNodes, edges, emitChange, readOnly]
  );

  // Expose addNode to parent via ref
  useEffect(() => {
    if (addNodeRef) addNodeRef.current = addNode;
    return () => { if (addNodeRef) addNodeRef.current = null; };
  }, [addNode, addNodeRef]);

  // Expose export functions to parent via ref
  useEffect(() => {
    if (exportRef) exportRef.current = { exportToPng, exportToSvg };
    return () => { if (exportRef) exportRef.current = null; };
  }, [exportRef, exportToPng, exportToSvg]);

  const deleteSelected = useCallback(() => {
    if (readOnly) return;
    setNodes((nds) => {
      const filtered = nds.filter((n) => !n.selected);
      setEdges((eds) => {
        const filteredEdges = eds.filter((e) => !e.selected);
        setTimeout(() => emitChange(filtered, filteredEdges), 0);
        return filteredEdges;
      });
      return filtered;
    });
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setNodes, setEdges, emitChange, readOnly]);

  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n
        );
        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [setNodes, edges, emitChange]
  );

  const updateNodeType = useCallback(
    (id: string, type: string) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === id ? { ...n, type } : n
        );
        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [setNodes, edges, emitChange]
  );

  const updateNodeProperty = useCallback(
    (id: string, key: string, value: unknown) => {
      setNodes((nds) => {
        const updated = nds.map((n) => {
          if (n.id !== id) return n;
          const newData = { ...n.data, [key]: value };

          // For sequence messages: recalculate derived fields when From/To/Type changes
          if (newData.isMessage && (key === "sourceParticipant" || key === "targetParticipant" || key === "messageType")) {
            const src = newData.sourceParticipant as string;
            const tgt = newData.targetParticipant as string;
            const msgType = (newData.messageType as string) || "->>";

            // Find participant indices from current nodes
            const participants = nds.filter((p) => p.data?.isParticipant);
            const srcIdx = participants.findIndex((p) => p.id === src);
            const tgtIdx = participants.findIndex((p) => p.id === tgt);
            const leftIdx = Math.min(srcIdx, tgtIdx);
            const rightIdx = Math.max(srcIdx, tgtIdx);

            const SPACING = 250;
            const P_WIDTH = 120;

            const leftLifelineX = leftIdx * SPACING + P_WIDTH / 2;
            const rightLifelineX = rightIdx * SPACING + P_WIDTH / 2;

            newData.goesRight = tgtIdx > srcIdx;
            newData.isReply = msgType.includes("--");
            newData.width = Math.max(rightLifelineX - leftLifelineX, SPACING);

            return { ...n, data: newData, position: { ...n.position, x: leftLifelineX } };
          }

          return { ...n, data: newData };
        });
        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [setNodes, edges, emitChange]
  );

  const updateEdgeLabel = useCallback(
    (id: string, label: string) => {
      setEdges((eds) => {
        const updated = eds.map((e) =>
          e.id === id ? { ...e, label: label || undefined } : e
        );
        setTimeout(() => emitChange(nodes, updated), 0);
        return updated;
      });
    },
    [setEdges, nodes, emitChange]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;

      // Delete/Backspace — only when not in input
      if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
        deleteSelected();
        return;
      }

      // Ctrl/Cmd+Z — Undo
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y — Redo
      if ((mod && e.key === "z" && e.shiftKey) || (mod && e.key === "y")) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Ctrl/Cmd+A — Select all (only when not in input)
      if (mod && e.key === "a" && !isInput) {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
        setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
        return;
      }

      // Ctrl/Cmd+C — Copy (only when not in input)
      if (mod && e.key === "c" && !isInput) {
        copy(nodes, edges);
        return;
      }

      // Ctrl/Cmd+V — Paste (only when not in input)
      if (mod && e.key === "v" && !isInput) {
        e.preventDefault();
        const pasted = paste();
        if (pasted) {
          // Deselect existing nodes
          setNodes((nds) => {
            const deselected = nds.map((n) => ({ ...n, selected: false }));
            const updated = [...deselected, ...pasted.nodes];
            setEdges((eds) => {
              const updatedEdges = [...eds, ...pasted.edges];
              setTimeout(() => emitChange(updated, updatedEdges), 0);
              return updatedEdges;
            });
            return updated;
          });
        }
        return;
      }

      // Ctrl/Cmd+F — Search
      if (mod && e.key === "f") {
        e.preventDefault();
        searchState.open();
        return;
      }

      // Ctrl/Cmd+D — Duplicate selected (only when not in input)
      if (mod && e.key === "d" && !isInput) {
        e.preventDefault();
        copy(nodes, edges);
        const pasted = paste();
        if (pasted) {
          setNodes((nds) => {
            const deselected = nds.map((n) => ({ ...n, selected: false }));
            const updated = [...deselected, ...pasted.nodes];
            setEdges((eds) => {
              const updatedEdges = [...eds, ...pasted.edges];
              setTimeout(() => emitChange(updated, updatedEdges), 0);
              return updatedEdges;
            });
            return updated;
          });
        }
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected, onUndo, onRedo, setNodes, setEdges, nodes, edges, copy, paste, emitChange, searchState]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: unknown, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // When a message node is dragged, snap to nearest participant pair and update From/To
  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      if (model.type !== "sequence" || !node.data?.isMessage) return;

      setNodes((nds) => {
        const participants = nds.filter((n) => n.data?.isParticipant);
        if (participants.length < 2) return nds;

        const SPACING = 250;
        const P_WIDTH = 120;

        // Find the closest participant lifeline to the message's left edge
        const msgX = node.position.x;
        const msgRight = msgX + ((node.data?.width as number) || SPACING);

        // Find nearest participant to left edge and right edge
        let nearestLeft = participants[0];
        let nearestRight = participants[participants.length - 1];
        let minDistLeft = Infinity;
        let minDistRight = Infinity;

        for (const p of participants) {
          const lifelineX = p.position.x + P_WIDTH / 2;
          const distLeft = Math.abs(lifelineX - msgX);
          const distRight = Math.abs(lifelineX - msgRight);
          if (distLeft < minDistLeft) {
            minDistLeft = distLeft;
            nearestLeft = p;
          }
          if (distRight < minDistRight) {
            minDistRight = distRight;
            nearestRight = p;
          }
        }

        if (nearestLeft.id === nearestRight.id) {
          // If snapped to same participant, pick the next one
          const idx = participants.indexOf(nearestLeft);
          if (idx < participants.length - 1) {
            nearestRight = participants[idx + 1];
          } else if (idx > 0) {
            nearestLeft = participants[idx - 1];
          }
        }

        const leftP = participants.indexOf(nearestLeft) <= participants.indexOf(nearestRight) ? nearestLeft : nearestRight;
        const rightP = leftP === nearestLeft ? nearestRight : nearestLeft;

        // Determine direction: was the original source on the left or right?
        const oldGoesRight = node.data?.goesRight as boolean;
        const newSrc = oldGoesRight ? leftP.id : rightP.id;
        const newTgt = oldGoesRight ? rightP.id : leftP.id;

        const leftLifelineX = leftP.position.x + P_WIDTH / 2;
        const rightLifelineX = rightP.position.x + P_WIDTH / 2;
        const newWidth = rightLifelineX - leftLifelineX;
        const newGoesRight = participants.indexOf(
          participants.find((p) => p.id === newTgt)!
        ) > participants.indexOf(
          participants.find((p) => p.id === newSrc)!
        );

        const updated = nds.map((n) => {
          if (n.id !== node.id) return n;
          return {
            ...n,
            position: { x: leftLifelineX, y: n.position.y },
            data: {
              ...n.data,
              sourceParticipant: newSrc,
              targetParticipant: newTgt,
              goesRight: newGoesRight,
              width: newWidth,
            },
          };
        });

        // Update selected node state too
        const updatedNode = updated.find((n) => n.id === node.id);
        if (updatedNode) setSelectedNode(updatedNode);

        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [model.type, setNodes, edges, emitChange, setSelectedNode]
  );

  return (
    <div className="mve-visual-editor" style={{ height }} data-theme={theme}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={currentNodeTypes}
        fitView
        colorMode={theme === "dark" ? "dark" : "light"}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Meta"
        deleteKeyCode={null}
      >
        <Background gap={20} size={1} />
        <Controls />
        {minimap && (
          <MiniMap pannable zoomable style={{ height: 80, width: 120 }} />
        )}
      </ReactFlow>

      <SearchOverlay
        isOpen={searchState.isOpen}
        query={searchState.query}
        matchCount={searchState.matchIds.length}
        currentIndex={searchState.currentIndex}
        onSearch={searchState.search}
        onNext={searchState.nextMatch}
        onPrev={searchState.prevMatch}
        onClose={searchState.close}
        theme={theme}
      />

      {!readOnly && (
        <PropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          diagramType={model.type}
          allNodes={nodes}
          allEdges={edges}
          onNodeLabelChange={(id, label) => {
            updateNodeLabel(id, label);
            setSelectedNode((prev) =>
              prev && prev.id === id
                ? { ...prev, data: { ...prev.data, label } }
                : prev
            );
          }}
          onNodeTypeChange={(id, type) => {
            updateNodeType(id, type);
            setSelectedNode((prev) =>
              prev && prev.id === id ? { ...prev, type } : prev
            );
          }}
          onNodePropertyChange={(id, key, value) => {
            updateNodeProperty(id, key, value);
            setSelectedNode((prev) =>
              prev && prev.id === id
                ? { ...prev, data: { ...prev.data, [key]: value } }
                : prev
            );
          }}
          onEdgeLabelChange={(id, label) => {
            updateEdgeLabel(id, label);
            setSelectedEdge((prev) =>
              prev && prev.id === id ? { ...prev, label } : prev
            );
          }}
          onEdgePropertyChange={(id, key, value) => {
            setEdges((eds) => {
              const updated = eds.map((e) =>
                e.id === id ? { ...e, data: { ...e.data, [key]: value } } : e
              );
              setTimeout(() => emitChange(nodes, updated), 0);
              return updated;
            });
            setSelectedEdge((prev) =>
              prev && prev.id === id
                ? { ...prev, data: { ...prev.data, [key]: value } }
                : prev
            );
          }}
          theme={theme}
        />
      )}
    </div>
  );
}
