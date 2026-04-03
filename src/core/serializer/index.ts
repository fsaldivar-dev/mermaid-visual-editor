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
import { serializeC4Diagram } from "./c4-diagram";
import { serializeBlockDiagram } from "./block-diagram";
import { serializeRequirementDiagram } from "./requirement-diagram";

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
    case "c4":
      return serializeC4Diagram(model);
    case "block":
      return serializeBlockDiagram(model);
    case "requirement":
      return serializeRequirementDiagram(model);
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
  serializeC4Diagram,
  serializeBlockDiagram,
  serializeRequirementDiagram,
};
