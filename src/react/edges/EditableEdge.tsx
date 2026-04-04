import { useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
  style = {},
  markerEnd,
  markerStart,
  data,
}: EdgeProps) {
  const edgeStyle = (data?.edgeStyle as string) || "smoothstep";
  const strokeColor = (data?.strokeColor as string) || undefined;
  const strokeWidth = (data?.strokeWidth as number) || 2;
  const animated = (data?.animated as boolean) || false;

  // Compute path based on edge style
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  switch (edgeStyle) {
    case "straight": {
      const [path, lx, ly] = getStraightPath({
        sourceX, sourceY, targetX, targetY,
      });
      edgePath = path;
      labelX = lx;
      labelY = ly;
      break;
    }
    case "bezier": {
      const [path, lx, ly] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
      });
      edgePath = path;
      labelX = lx;
      labelY = ly;
      break;
    }
    default: {
      // smoothstep (default)
      const [path, lx, ly] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
      });
      edgePath = path;
      labelX = lx;
      labelY = ly;
      break;
    }
  }

  const computedStyle = {
    ...style,
    strokeWidth,
    ...(strokeColor ? { stroke: strokeColor } : {}),
    ...(animated ? { strokeDasharray: "5 5", animation: "mve-dash 0.5s linear infinite" } : {}),
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={computedStyle}
        markerEnd={markerEnd}
        markerStart={markerStart}
        interactionWidth={20}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className={`mve-edge-label ${selected ? "mve-edge-label-selected" : ""}`}
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 3,
              background: "rgba(255,255,255,0.9)",
              border: selected ? "1px solid #0071e3" : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
