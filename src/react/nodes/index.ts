import { RectNode } from "./RectNode";
import { RoundedNode } from "./RoundedNode";
import { DiamondNode } from "./DiamondNode";
import { CircleNode } from "./CircleNode";

export const nodeTypes = {
  rect: RectNode,
  rounded: RoundedNode,
  diamond: DiamondNode,
  circle: CircleNode,
  default: RectNode,
};

export { RectNode, RoundedNode, DiamondNode, CircleNode };
