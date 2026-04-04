import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

function resolveMarker(markerType: string | undefined, fallback: string | undefined): string | undefined {
  switch (markerType) {
    case "arrow": return "url(#mve-marker-arrow)";
    case "arrowclosed": return "url(#mve-marker-arrowclosed)";
    case "circle": return "url(#mve-marker-circle)";
    case "cross": return "url(#mve-marker-cross)";
    case "triangle": return "url(#mve-marker-triangle)";
    case "diamond-filled": return "url(#mve-marker-diamond-filled)";
    case "diamond-hollow": return "url(#mve-marker-diamond-hollow)";
    case "none": return undefined;
    default: return fallback;
  }
}

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
  const lineStyle = (data?.lineStyle as string) || "solid";
  const markerEndType = data?.markerEndType as string | undefined;
  const markerStartType = data?.markerStartType as string | undefined;

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

  // Compute effective stroke width and dash based on lineStyle
  let effectiveStrokeWidth = strokeWidth;
  let strokeDasharray: string | undefined;
  if (lineStyle === "dotted") {
    strokeDasharray = "5 3";
  } else if (lineStyle === "thick") {
    effectiveStrokeWidth = strokeWidth * 2.5;
  }

  const computedStyle = {
    ...style,
    strokeWidth: effectiveStrokeWidth,
    ...(strokeColor ? { stroke: strokeColor } : {}),
    ...(strokeDasharray ? { strokeDasharray } : {}),
    ...(animated ? { strokeDasharray: "5 5", animation: "mve-dash 0.5s linear infinite" } : {}),
  };

  // Resolve custom markers
  const resolvedMarkerEnd = resolveMarker(markerEndType, markerEnd as string | undefined);
  const resolvedMarkerStart = resolveMarker(markerStartType, markerStart as string | undefined);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={computedStyle}
        markerEnd={resolvedMarkerEnd}
        markerStart={resolvedMarkerStart}
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
