import { useCallback, useState } from "react";
import type { Node } from "@xyflow/react";

export interface GuideLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: "horizontal" | "vertical";
}

const THRESHOLD = 5;
const NODE_WIDTH = 172;
const NODE_HEIGHT = 60;

function getNodeBounds(node: Node) {
  const w = (node.measured?.width ?? node.width) || NODE_WIDTH;
  const h = (node.measured?.height ?? node.height) || NODE_HEIGHT;
  return {
    left: node.position.x,
    right: node.position.x + w,
    centerX: node.position.x + w / 2,
    top: node.position.y,
    bottom: node.position.y + h,
    centerY: node.position.y + h / 2,
    width: w,
    height: h,
  };
}

export function useAlignmentGuides() {
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const computeGuides = useCallback(
    (draggedNode: Node, allNodes: Node[]) => {
      const lines: GuideLine[] = [];
      const dragged = getNodeBounds(draggedNode);
      const canvasMin = -2000;
      const canvasMax = 4000;

      for (const node of allNodes) {
        if (node.id === draggedNode.id) continue;
        const other = getNodeBounds(node);

        // Vertical guides (matching X positions)
        // left-left
        if (Math.abs(dragged.left - other.left) < THRESHOLD) {
          lines.push({ x1: other.left, y1: canvasMin, x2: other.left, y2: canvasMax, orientation: "vertical" });
        }
        // right-right
        if (Math.abs(dragged.right - other.right) < THRESHOLD) {
          lines.push({ x1: other.right, y1: canvasMin, x2: other.right, y2: canvasMax, orientation: "vertical" });
        }
        // centerX-centerX
        if (Math.abs(dragged.centerX - other.centerX) < THRESHOLD) {
          lines.push({ x1: other.centerX, y1: canvasMin, x2: other.centerX, y2: canvasMax, orientation: "vertical" });
        }
        // left-right
        if (Math.abs(dragged.left - other.right) < THRESHOLD) {
          lines.push({ x1: other.right, y1: canvasMin, x2: other.right, y2: canvasMax, orientation: "vertical" });
        }
        // right-left
        if (Math.abs(dragged.right - other.left) < THRESHOLD) {
          lines.push({ x1: other.left, y1: canvasMin, x2: other.left, y2: canvasMax, orientation: "vertical" });
        }

        // Horizontal guides (matching Y positions)
        // top-top
        if (Math.abs(dragged.top - other.top) < THRESHOLD) {
          lines.push({ x1: canvasMin, y1: other.top, x2: canvasMax, y2: other.top, orientation: "horizontal" });
        }
        // bottom-bottom
        if (Math.abs(dragged.bottom - other.bottom) < THRESHOLD) {
          lines.push({ x1: canvasMin, y1: other.bottom, x2: canvasMax, y2: other.bottom, orientation: "horizontal" });
        }
        // centerY-centerY
        if (Math.abs(dragged.centerY - other.centerY) < THRESHOLD) {
          lines.push({ x1: canvasMin, y1: other.centerY, x2: canvasMax, y2: other.centerY, orientation: "horizontal" });
        }
      }

      // Deduplicate guides by position (within threshold)
      const unique: GuideLine[] = [];
      for (const line of lines) {
        const key = line.orientation === "vertical" ? line.x1 : line.y1;
        const exists = unique.some(
          (u) =>
            u.orientation === line.orientation &&
            Math.abs((u.orientation === "vertical" ? u.x1 : u.y1) - key) < 1
        );
        if (!exists) unique.push(line);
      }

      setGuides(unique);
    },
    []
  );

  const clearGuides = useCallback(() => setGuides([]), []);

  return { guides, computeGuides, clearGuides };
}
