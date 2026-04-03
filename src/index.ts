// React components
export {
  MermaidEditor,
  VisualEditor,
  EditorToolbar,
  PropertiesPanel,
  nodeTypes,
  getNodeTypes,
  RectNode,
  RoundedNode,
  DiamondNode,
  CircleNode,
  ClassNode,
  EntityNode,
  StateNode,
  ParticipantNode,
  GanttTaskNode,
  PieSliceNode,
  TimelineNode,
  MindmapNode,
  GitCommitNode,
  JourneyStepNode,
  useDiagramModel,
  useSync,
} from "./react";

export type {
  MermaidEditorProps,
  VisualEditorProps,
  EditorMode,
} from "./react";

// Core (framework-agnostic)
export {
  parse,
  serialize,
  detectDiagramType,
  toReactFlow,
  fromReactFlow,
  applyDagreLayout,
  autoLayout,
  createEmptyModel,
} from "./core";

export type {
  DiagramModel,
  DiagramElement,
  DiagramConnection,
  DiagramType,
  Direction,
  NodeShape,
} from "./core";

// Styles
import "./react/styles/editor.css";
