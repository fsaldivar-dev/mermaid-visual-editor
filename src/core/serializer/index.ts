import type { DiagramModel } from "../model/types";
import { serializeFlowchart } from "./flowchart";
import { serializeStateDiagram } from "./state";
import { serializeClassDiagram } from "./class-diagram";
import { serializeERDiagram } from "./er-diagram";
import { serializeSequenceDiagram } from "./sequence";
import { serializeMindmap } from "./mindmap";
import { serializeGantt } from "./gantt";
import { serializePie } from "./pie";
import { serializeJourney } from "./journey";
import { serializeTimeline } from "./timeline";
import { serializeGitGraph } from "./gitgraph";

export function serialize(model: DiagramModel): string {
  switch (model.type) {
    case "flowchart":
      return serializeFlowchart(model);
    case "state":
      return serializeStateDiagram(model);
    case "class":
      return serializeClassDiagram(model);
    case "er":
      return serializeERDiagram(model);
    case "sequence":
      return serializeSequenceDiagram(model);
    case "mindmap":
      return serializeMindmap(model);
    case "gantt":
      return serializeGantt(model);
    case "pie":
      return serializePie(model);
    case "journey":
      return serializeJourney(model);
    case "timeline":
      return serializeTimeline(model);
    case "gitgraph":
      return serializeGitGraph(model);
    default:
      return serializeFlowchart({ ...model, type: "flowchart" });
  }
}

export {
  serializeFlowchart,
  serializeStateDiagram,
  serializeClassDiagram,
  serializeERDiagram,
  serializeSequenceDiagram,
  serializeMindmap,
  serializeGantt,
  serializePie,
  serializeJourney,
  serializeTimeline,
  serializeGitGraph,
};
