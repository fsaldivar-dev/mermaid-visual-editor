import { useState } from "react";
import type { DiagramModel } from "../../core/model/types";
import { PieChartView } from "./PieChartView";
import { GanttChartView } from "./GanttChartView";
import { JourneyMapView } from "./JourneyMapView";
import { TimelineView } from "./TimelineView";
import { MindmapView } from "./MindmapView";
import { ERDiagramView } from "./ERDiagramView";

interface ChartViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
}

export function ChartView({ model, onModelChange, theme = "light" }: ChartViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const commonProps = { model, onModelChange, theme, selectedId, onSelect: setSelectedId };

  switch (model.type) {
    case "pie":
      return <PieChartView {...commonProps} />;
    case "gantt":
      return <GanttChartView {...commonProps} />;
    case "journey":
      return <JourneyMapView {...commonProps} />;
    case "timeline":
      return <TimelineView {...commonProps} />;
    case "mindmap":
      return <MindmapView {...commonProps} />;
    case "er":
      return <ERDiagramView {...commonProps} />;
    default:
      return (
        <div style={{ padding: 24, textAlign: "center", color: "#999" }}>
          Unsupported chart type: {model.type}
        </div>
      );
  }
}
