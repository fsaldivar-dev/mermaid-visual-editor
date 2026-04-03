import type { DiagramModel } from "../model/types";
import { serializeFlowchart } from "./flowchart";
import { serializeStateDiagram } from "./state";
import { serializeClassDiagram } from "./class-diagram";
import { serializeERDiagram } from "./er-diagram";

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
    default:
      // For types without a dedicated serializer, return a basic flowchart representation
      return serializeFlowchart({ ...model, type: "flowchart" });
  }
}

export {
  serializeFlowchart,
  serializeStateDiagram,
  serializeClassDiagram,
  serializeERDiagram,
};
