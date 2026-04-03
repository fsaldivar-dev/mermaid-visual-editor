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

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

let nodeIdCounter = 0;

export interface VisualEditorProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  minimap?: boolean;
  readOnly?: boolean;
  height?: number | string;
  addNodeRef?: React.MutableRefObject<((type: string) => void) | null>;
}

export function VisualEditor({
  model,
  onModelChange,
  theme = "light",
  minimap = true,
  readOnly = false,
  height = "100%",
  addNodeRef,
}: VisualEditorProps) {
  const initial = useMemo(() => toReactFlow(model), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Get node types for current diagram type
  const currentNodeTypes = useMemo(() => getNodeTypes(model.type), [model.type]);

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
      setEdges((eds) => {
        const updated = addEdge(
          { ...connection, ...defaultEdgeOptions },
          eds
        );
        setTimeout(() => emitChange(nodes, updated), 0);
        return updated;
      });
    },
    [setEdges, nodes, emitChange]
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
      if (e.key === "Delete" || e.key === "Backspace") {
        if ((e.target as HTMLElement)?.tagName === "INPUT") return;
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected]);

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

  return (
    <div className="mve-visual-editor" style={{ height }} data-theme={theme}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={currentNodeTypes}
        fitView
        colorMode={theme === "dark" ? "dark" : "light"}
      >
        <Background gap={20} size={1} />
        <Controls />
        {minimap && (
          <MiniMap pannable zoomable style={{ height: 80, width: 120 }} />
        )}
      </ReactFlow>

      {!readOnly && (
        <PropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          diagramType={model.type}
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
          onEdgeLabelChange={(id, label) => {
            updateEdgeLabel(id, label);
            setSelectedEdge((prev) =>
              prev && prev.id === id ? { ...prev, label } : prev
            );
          }}
          theme={theme}
        />
      )}
    </div>
  );
}

