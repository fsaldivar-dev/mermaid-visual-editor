import dagre from "@dagrejs/dagre";
import type { DiagramModel, Direction } from "../model/types";

const NODE_WIDTH = 172;
const NODE_HEIGHT = 60;

export function applyDagreLayout(model: DiagramModel): DiagramModel {
  if (!model.elements.length) return model;

  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: model.direction === "BT" ? "BT" : model.direction,
    nodesep: 50,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const el of model.elements) {
    g.setNode(el.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const conn of model.connections) {
    g.setEdge(conn.source, conn.target);
  }

  dagre.layout(g);

  const elements = model.elements.map((el) => {
    const nodeWithPosition = g.node(el.id);
    return {
      ...el,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
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
