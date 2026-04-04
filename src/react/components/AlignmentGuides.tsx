import type { GuideLine } from "../hooks/useAlignmentGuides";

interface AlignmentGuidesProps {
  guides: GuideLine[];
}

export function AlignmentGuides({ guides }: AlignmentGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <svg
      className="mve-alignment-guides"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {guides.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.orientation === "vertical" ? "#0071e3" : "#ff3b30"}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      ))}
    </svg>
  );
}
