import dagre from "@dagrejs/dagre";
import type { DiagramModel, Direction } from "../model/types";

const NODE_WIDTH = 172;
const NODE_HEIGHT = 60;
const GROUP_PADDING = 40;

// Diagram types that handle their own layout (positions set by parser)
const SELF_LAYOUT_TYPES = new Set(["sequence", "pie"]);

export function applyDagreLayout(model: DiagramModel): DiagramModel {
  if (!model.elements.length) return model;

  // Some diagram types position nodes in their parser — skip dagre
  if (SELF_LAYOUT_TYPES.has(model.type)) return model;

  const subgraphIds = new Set((model.subgraphs || []).map((sg) => sg.id));

  const g = new dagre.graphlib.Graph({ compound: true });

  g.setGraph({
    rankdir: model.direction === "BT" ? "BT" : model.direction,
    nodesep: 50,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const el of model.elements) {
    if (subgraphIds.has(el.id)) {
      // Group nodes get larger dimensions
      g.setNode(el.id, { width: NODE_WIDTH * 2, height: NODE_HEIGHT * 2 });
    } else {
      g.setNode(el.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
  }

  // Set parent relationships for compound graph
  for (const el of model.elements) {
    if (el.parentId && !subgraphIds.has(el.id)) {
      g.setParent(el.id, el.parentId);
    }
  }

  for (const conn of model.connections) {
    g.setEdge(conn.source, conn.target);
  }

  dagre.layout(g);

  // For child nodes, convert to positions relative to their parent
  const parentPositions = new Map<string, { x: number; y: number }>();
  const elements = model.elements.map((el) => {
    const nodeWithPosition = g.node(el.id);
    if (!nodeWithPosition) return el;

    const isGroup = subgraphIds.has(el.id);
    const width = isGroup ? NODE_WIDTH * 2 : NODE_WIDTH;
    const height = isGroup ? NODE_HEIGHT * 2 : NODE_HEIGHT;

    const absX = nodeWithPosition.x - width / 2;
    const absY = nodeWithPosition.y - height / 2;

    if (isGroup) {
      parentPositions.set(el.id, { x: absX, y: absY });
    }

    // If this node has a parent, make position relative
    if (el.parentId && parentPositions.has(el.parentId)) {
      const parent = parentPositions.get(el.parentId)!;
      return {
        ...el,
        position: {
          x: absX - parent.x + GROUP_PADDING,
          y: absY - parent.y + GROUP_PADDING,
        },
      };
    }

    return {
      ...el,
      position: { x: absX, y: absY },
    };
  });

  return { ...model, elements };
}

export function autoLayout(
  model: DiagramModel,
  direction?: Direction
): DiagramModel {
  const directed = direction
    ? { ...model, direction }
    : model;
  return applyDagreLayout(directed);
}
