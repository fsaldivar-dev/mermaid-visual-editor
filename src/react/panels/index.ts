import type { ComponentType } from "react";
import type { DiagramType } from "../../core/model/types";
import type { NodePanelProps, EdgePanelProps } from "./types";
import { GenericNodePanel } from "./GenericPanel";
import { GenericEdgePanel } from "./GenericEdgePanel";
import { SequenceNodePanel } from "./SequencePanel";
import { PieNodePanel } from "./PiePanel";
import { JourneyNodePanel } from "./JourneyPanel";
import { StateNodePanel, StateEdgePanel } from "./StatePanel";
import { ClassNodePanel, ClassEdgePanel } from "./ClassPanel";
import { ERNodePanel, EREdgePanel } from "./ERPanel";
import { MindmapNodePanel } from "./MindmapPanel";
import { GanttNodePanel } from "./GanttPanel";
import { TimelineNodePanel } from "./TimelinePanel";
import { GitGraphNodePanel } from "./GitGraphPanel";

interface PanelRegistry {
  node: ComponentType<NodePanelProps>;
  edge: ComponentType<EdgePanelProps>;
}

const registry: Partial<Record<DiagramType, Partial<PanelRegistry>>> = {
  flowchart: { node: GenericNodePanel },
  sequence: { node: SequenceNodePanel },
  pie: { node: PieNodePanel },
  journey: { node: JourneyNodePanel },
  state: { node: StateNodePanel, edge: StateEdgePanel },
  class: { node: ClassNodePanel, edge: ClassEdgePanel },
  er: { node: ERNodePanel, edge: EREdgePanel },
  mindmap: { node: MindmapNodePanel },
  gantt: { node: GanttNodePanel },
  timeline: { node: TimelineNodePanel },
  gitgraph: { node: GitGraphNodePanel },
};

export function getNodePanel(type: DiagramType): ComponentType<NodePanelProps> {
  return registry[type]?.node || GenericNodePanel;
}

export function getEdgePanel(type: DiagramType): ComponentType<EdgePanelProps> {
  return registry[type]?.edge || GenericEdgePanel;
}

export type { NodePanelProps, EdgePanelProps } from "./types";
