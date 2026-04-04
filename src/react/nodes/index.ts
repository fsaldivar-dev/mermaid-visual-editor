import type { DiagramType } from "../../core/model/types";
import { RectNode } from "./RectNode";
import { RoundedNode } from "./RoundedNode";
import { DiamondNode } from "./DiamondNode";
import { CircleNode } from "./CircleNode";
import { StadiumNode } from "./StadiumNode";
import { SubroutineNode } from "./SubroutineNode";
import { CylinderNode } from "./CylinderNode";
import { HexagonNode } from "./HexagonNode";
import { ParallelogramNode } from "./ParallelogramNode";
import { TrapezoidNode } from "./TrapezoidNode";
import { AsymmetricNode } from "./AsymmetricNode";
import { DoubleCircleNode } from "./DoubleCircleNode";
import { ClassNode } from "./ClassNode";
import { EntityNode } from "./EntityNode";
import { StateNode } from "./StateNode";
import { ParticipantNode } from "./ParticipantNode";
import { ActorNode } from "./ActorNode";
import { GanttTaskNode } from "./GanttTaskNode";
import { PieSliceNode } from "./PieSliceNode";
import { TimelineNode } from "./TimelineNode";
import { MindmapNode } from "./MindmapNode";
import { GitCommitNode } from "./GitCommitNode";
import { JourneyStepNode } from "./JourneyStepNode";
import { MessageNode } from "./MessageNode";
import { ForkJoinNode } from "./ForkJoinNode";
import { ChoiceNode } from "./ChoiceNode";
import { NoteNode } from "./NoteNode";

// Base node types (used by flowchart)
export const baseNodeTypes = {
  rect: RectNode,
  rounded: RoundedNode,
  diamond: DiamondNode,
  circle: CircleNode,
  stadium: StadiumNode,
  subroutine: SubroutineNode,
  cylinder: CylinderNode,
  hexagon: HexagonNode,
  parallelogram: ParallelogramNode,
  trapezoid: TrapezoidNode,
  asymmetric: AsymmetricNode,
  doubleCircle: DoubleCircleNode,
  default: RectNode,
};

// Specialized node types per diagram type
export const diagramNodeTypes: Record<string, Record<string, React.ComponentType<any>>> = {
  flowchart: baseNodeTypes,
  state: {
    ...baseNodeTypes,
    state: StateNode,
    rounded: StateNode,
    circle: StateNode,
    forkJoin: ForkJoinNode,
    choice: ChoiceNode,
    note: NoteNode,
  },
  class: {
    ...baseNodeTypes,
    rect: ClassNode,
    classNode: ClassNode,
  },
  er: {
    ...baseNodeTypes,
    rect: EntityNode,
    entity: EntityNode,
  },
  sequence: {
    ...baseNodeTypes,
    participant: ParticipantNode,
    actor: ActorNode,
    message: MessageNode,
  },
  gantt: {
    ...baseNodeTypes,
    rect: GanttTaskNode,
    ganttTask: GanttTaskNode,
  },
  pie: {
    ...baseNodeTypes,
    circle: PieSliceNode,
    pieSlice: PieSliceNode,
  },
  timeline: {
    ...baseNodeTypes,
    rect: TimelineNode,
    timelineEvent: TimelineNode,
  },
  mindmap: {
    ...baseNodeTypes,
    rounded: MindmapNode,
    circle: MindmapNode,
    rect: MindmapNode,
    mindmapNode: MindmapNode,
  },
  gitgraph: {
    ...baseNodeTypes,
    circle: GitCommitNode,
    gitCommit: GitCommitNode,
  },
  journey: {
    ...baseNodeTypes,
    rounded: JourneyStepNode,
    journeyStep: JourneyStepNode,
  },
};

export function getNodeTypes(diagramType: DiagramType): Record<string, React.ComponentType<any>> {
  return diagramNodeTypes[diagramType] || baseNodeTypes;
}

// Legacy export for backwards compat
export const nodeTypes = baseNodeTypes;

export {
  RectNode,
  RoundedNode,
  DiamondNode,
  CircleNode,
  StadiumNode,
  SubroutineNode,
  CylinderNode,
  HexagonNode,
  ParallelogramNode,
  TrapezoidNode,
  AsymmetricNode,
  DoubleCircleNode,
  ClassNode,
  EntityNode,
  StateNode,
  ParticipantNode,
  ActorNode,
  GanttTaskNode,
  PieSliceNode,
  TimelineNode,
  MindmapNode,
  GitCommitNode,
  JourneyStepNode,
  MessageNode,
  ForkJoinNode,
  ChoiceNode,
  NoteNode,
};
