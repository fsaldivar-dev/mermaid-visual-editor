import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  SelectionMode,
  ConnectionMode,
  reconnectEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
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
import { useAlignmentGuides } from "./hooks/useAlignmentGuides";
import { SearchOverlay } from "./components/SearchOverlay";
import { AlignmentGuides } from "./components/AlignmentGuides";
import { edgeTypes, EdgeMarkers } from "./edges";
import { useSmartEdges } from "./hooks/useSmartEdges";

const defaultEdgeOptions = {
  type: "editable" as const,
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
  addNodeRef?: React.MutableRefObject<((type: string, label?: string, position?: { x: number; y: number }) => void) | null>;
  exportRef?: React.MutableRefObject<{ exportToPng: () => void; exportToSvg: () => void } | null>;
}

// Wrapper that provides ReactFlowProvider context
export function VisualEditor(props: VisualEditorProps) {
  return (
    <ReactFlowProvider>
      <VisualEditorInner {...props} />
    </ReactFlowProvider>
  );
}

function VisualEditorInner({
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
  const reactFlowInstance = useReactFlow();
  const initial = useMemo(() => toReactFlow(model), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Get node types for current diagram type
  const currentNodeTypes = useMemo(() => getNodeTypes(model.type), [model.type]);

  // Clipboard, export, search, and alignment hooks
  const { copy, paste } = useClipboard();
  const { exportToPng, exportToSvg } = useExport();
  const searchState = useSearch(nodes);
  const { guides, computeGuides, clearGuides } = useAlignmentGuides();
  const { recalculate: recalculateSmartEdges, computeAll: computeAllSmartEdges } = useSmartEdges();

  // Sync from external model changes — clear selection and compute smart edges
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = toReactFlow(model);
    const smartEdges = computeAllSmartEdges(newNodes, newEdges);
    setNodes(newNodes);
    setEdges(smartEdges);
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [model, setNodes, setEdges, computeAllSmartEdges]);

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

  // Intercept node changes to capture resize dimensions
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (readOnly) return;
      onNodesChange(changes);

      // Check for completed resize (dimensions change with resizing=false)
      const dimensionChanges = changes.filter(
        (c) => c.type === "dimensions" && "resizing" in c && c.resizing === false
      );
      if (dimensionChanges.length > 0) {
        setNodes((nds) => {
          let changed = false;
          const updated = nds.map((n) => {
            const dc = dimensionChanges.find((c) => "id" in c && c.id === n.id);
            if (dc && "dimensions" in dc && dc.dimensions) {
              changed = true;
              return {
                ...n,
                data: {
                  ...n.data,
                  width: dc.dimensions.width,
                  height: dc.dimensions.height,
                },
              };
            }
            return n;
          });
          if (changed) {
            setTimeout(() => emitChange(updated, edges), 0);
          }
          return changed ? updated : nds;
        });
      }
    },
    [readOnly, onNodesChange, setNodes, edges, emitChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // Sequence diagram: create a message node instead of an edge
      if (model.type === "sequence" && connection.source && connection.target) {
        const src = connection.source;
        const tgt = connection.target;
        if (src === tgt) return;

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

      // Default: add edge with smart handle routing
      setEdges((eds) => {
        const newEdge = addEdge(
          { ...connection, ...defaultEdgeOptions },
          eds
        );
        // Recalculate handles for the new edge based on node positions
        const updated = computeAllSmartEdges(nodes, newEdge);
        setTimeout(() => emitChange(nodes, updated), 0);
        return updated;
      });
    },
    [setEdges, setNodes, nodes, edges, emitChange, model.type]
  );

  // Reconnect an existing edge to a different node
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((eds) => {
        const updated = reconnectEdge(oldEdge, newConnection, eds);
        setTimeout(() => emitChange(nodes, updated), 0);
        return updated;
      });
    },
    [setEdges, nodes, emitChange]
  );

  const addNode = useCallback(
    (type = "rect", label = "New", position?: { x: number; y: number }) => {
      if (readOnly) return;
      const id = `n${++nodeIdCounter}_${Date.now().toString(36)}`;
      const pos = position || {
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 300,
      };
      setNodes((nds) => {
        const updated = [
          ...nds,
          { id, type, data: { label }, position: pos },
        ];
        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [setNodes, edges, emitChange, readOnly]
  );

  // When user drops a connection on empty canvas, create a new node at that position
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (readOnly) return;
      const target = event.target as HTMLElement;
      if (!target?.classList?.contains("react-flow__pane")) return;

      const clientX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX;
      const clientY = "changedTouches" in event ? event.changedTouches[0].clientY : event.clientY;
      const position = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });
      addNode("rect", "New", position);
    },
    [readOnly, reactFlowInstance, addNode]
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

          if (newData.isMessage && (key === "sourceParticipant" || key === "targetParticipant" || key === "messageType")) {
            const src = newData.sourceParticipant as string;
            const tgt = newData.targetParticipant as string;
            const msgType = (newData.messageType as string) || "->>";
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

      if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
        deleteSelected();
        return;
      }
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); onUndo?.(); return; }
      if ((mod && e.key === "z" && e.shiftKey) || (mod && e.key === "y")) { e.preventDefault(); onRedo?.(); return; }
      if (mod && e.key === "a" && !isInput) {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
        setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
        return;
      }
      if (mod && e.key === "c" && !isInput) { copy(nodes, edges); return; }
      if (mod && e.key === "v" && !isInput) {
        e.preventDefault();
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
      if (mod && e.key === "f") { e.preventDefault(); searchState.open(); return; }
      if (mod && e.key === "d" && e.shiftKey && !isInput) {
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
    setEditingNodeId(null);
  }, []);

  const onNodeDoubleClick = useCallback((_: unknown, node: Node) => {
    if (readOnly) return;
    setEditingNodeId(node.id);
  }, [readOnly]);

  // Alignment guides during drag
  const onNodeDrag = useCallback(
    (_: unknown, node: Node) => {
      computeGuides(node, nodes);
    },
    [computeGuides, nodes]
  );

  // When a node is dragged, recalculate smart edges and handle sequence snapping
  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      clearGuides();

      // Recalculate smart edges for all edges connected to this node
      setEdges((eds) => {
        const updated = recalculateSmartEdges(node.id, nodes, eds);
        if (updated !== eds) {
          setTimeout(() => emitChange(nodes, updated), 0);
        }
        return updated;
      });

      if (model.type !== "sequence" || !node.data?.isMessage) return;

      setNodes((nds) => {
        const participants = nds.filter((n) => n.data?.isParticipant);
        if (participants.length < 2) return nds;

        const SPACING = 250;
        const P_WIDTH = 120;
        const msgX = node.position.x;
        const msgRight = msgX + ((node.data?.width as number) || SPACING);

        let nearestLeft = participants[0];
        let nearestRight = participants[participants.length - 1];
        let minDistLeft = Infinity;
        let minDistRight = Infinity;

        for (const p of participants) {
          const lifelineX = p.position.x + P_WIDTH / 2;
          const distLeft = Math.abs(lifelineX - msgX);
          const distRight = Math.abs(lifelineX - msgRight);
          if (distLeft < minDistLeft) { minDistLeft = distLeft; nearestLeft = p; }
          if (distRight < minDistRight) { minDistRight = distRight; nearestRight = p; }
        }

        if (nearestLeft.id === nearestRight.id) {
          const idx = participants.indexOf(nearestLeft);
          if (idx < participants.length - 1) nearestRight = participants[idx + 1];
          else if (idx > 0) nearestLeft = participants[idx - 1];
        }

        const leftP = participants.indexOf(nearestLeft) <= participants.indexOf(nearestRight) ? nearestLeft : nearestRight;
        const rightP = leftP === nearestLeft ? nearestRight : nearestLeft;
        const oldGoesRight = node.data?.goesRight as boolean;
        const newSrc = oldGoesRight ? leftP.id : rightP.id;
        const newTgt = oldGoesRight ? rightP.id : leftP.id;
        const leftLifelineX = leftP.position.x + P_WIDTH / 2;
        const rightLifelineX = rightP.position.x + P_WIDTH / 2;
        const newWidth = rightLifelineX - leftLifelineX;
        const newGoesRight = participants.indexOf(participants.find((p) => p.id === newTgt)!) > participants.indexOf(participants.find((p) => p.id === newSrc)!);

        const updated = nds.map((n) => {
          if (n.id !== node.id) return n;
          return {
            ...n,
            position: { x: leftLifelineX, y: n.position.y },
            data: { ...n.data, sourceParticipant: newSrc, targetParticipant: newTgt, goesRight: newGoesRight, width: newWidth },
          };
        });

        const updatedNode = updated.find((n) => n.id === node.id);
        if (updatedNode) setSelectedNode(updatedNode);
        setTimeout(() => emitChange(updated, edges), 0);
        return updated;
      });
    },
    [model.type, setNodes, setEdges, nodes, edges, emitChange, setSelectedNode, clearGuides, recalculateSmartEdges]
  );

  // Drag & Drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const shapeData = event.dataTransfer.getData("application/mve-shape");
      if (!shapeData) return;

      const { type, label } = JSON.parse(shapeData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, label || "New", position);
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="mve-visual-editor"
      style={{ height }}
      data-theme={theme}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onConnectEnd={readOnly ? undefined : onConnectEnd}
        onReconnect={readOnly ? undefined : onReconnect}
        onNodeClick={onNodeClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={readOnly ? undefined : onNodeDoubleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={currentNodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        colorMode={theme === "dark" ? "dark" : "light"}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Meta"
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <EdgeMarkers />
        <Background gap={20} size={1} />
        <Controls />
        {minimap && (
          <MiniMap pannable zoomable style={{ height: 80, width: 120 }} />
        )}
        {guides.length > 0 && (
          <Panel position="top-left" style={{ margin: 0, padding: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <AlignmentGuides guides={guides} />
          </Panel>
        )}
      </ReactFlow>

      {editingNodeId && (() => {
        const editNode = reactFlowInstance.getNode(editingNodeId);
        if (!editNode) return null;
        const nodeWidth = editNode.measured?.width ?? editNode.width ?? 150;
        const nodeHeight = editNode.measured?.height ?? editNode.height ?? 40;
        const screenPos = reactFlowInstance.flowToScreenPosition({
          x: editNode.position.x,
          y: editNode.position.y,
        });
        const wrapperRect = reactFlowWrapper.current?.getBoundingClientRect();
        const left = screenPos.x - (wrapperRect?.left ?? 0);
        const top = screenPos.y - (wrapperRect?.top ?? 0);
        const zoom = reactFlowInstance.getZoom();
        return (
          <input
            autoFocus
            defaultValue={String(editNode.data?.label ?? "")}
            style={{
              position: "absolute",
              left: left,
              top: top,
              width: Math.max(nodeWidth * zoom, 80),
              height: nodeHeight * zoom,
              zIndex: 1000,
              border: "2px solid #3b82f6",
              borderRadius: 4,
              padding: "2px 6px",
              fontSize: 14 * zoom,
              background: theme === "dark" ? "#1e1e1e" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
              boxSizing: "border-box",
              outline: "none",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value;
                updateNodeLabel(editingNodeId, value);
                setSelectedNode((prev) =>
                  prev && prev.id === editingNodeId
                    ? { ...prev, data: { ...prev.data, label: value } }
                    : prev
                );
                setEditingNodeId(null);
              } else if (e.key === "Escape") {
                setEditingNodeId(null);
              }
              e.stopPropagation();
            }}
            onBlur={(e) => {
              const value = e.target.value;
              updateNodeLabel(editingNodeId, value);
              setSelectedNode((prev) =>
                prev && prev.id === editingNodeId
                  ? { ...prev, data: { ...prev.data, label: value } }
                  : prev
              );
              setEditingNodeId(null);
            }}
          />
        );
      })()}

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
              prev && prev.id === id ? { ...prev, data: { ...prev.data, label } } : prev
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
              prev && prev.id === id ? { ...prev, data: { ...prev.data, [key]: value } } : prev
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
              prev && prev.id === id ? { ...prev, data: { ...prev.data, [key]: value } } : prev
            );
          }}
          theme={theme}
        />
      )}
    </div>
  );
}
