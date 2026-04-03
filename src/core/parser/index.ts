import type { DiagramModel, DiagramType } from "../model/types";
import { parseFlowchart } from "./flowchart";
import { parseStateDiagram } from "./state";
import { parseClassDiagram } from "./class-diagram";
import { parseERDiagram } from "./er-diagram";
import { parseMindmap } from "./mindmap";
import { parseSequenceDiagram } from "./sequence";
import { parseGantt } from "./gantt";
import { parsePie } from "./pie";
import { parseJourney } from "./journey";
import { parseTimeline } from "./timeline";
import { parseGitGraph } from "./gitgraph";
import { parseC4Diagram } from "./c4-diagram";
import { parseBlockDiagram } from "./block-diagram";
import { parseRequirementDiagram } from "./requirement-diagram";
import { parseGenericLines } from "./generic";

export function detectDiagramType(text: string): DiagramType {
  const firstLine = text.trim().split("\n")[0]?.toLowerCase() ?? "";
  if (firstLine.startsWith("statediagram")) return "state";
  if (firstLine.startsWith("classdiagram")) return "class";
  if (firstLine.startsWith("erdiagram")) return "er";
  if (firstLine.startsWith("mindmap")) return "mindmap";
  if (firstLine.startsWith("sequencediagram")) return "sequence";
  if (firstLine.startsWith("gantt")) return "gantt";
  if (firstLine.startsWith("pie")) return "pie";
  if (firstLine.startsWith("journey")) return "journey";
  if (firstLine.startsWith("timeline")) return "timeline";
  if (firstLine.startsWith("gitgraph")) return "gitgraph";
  if (firstLine.startsWith("c4")) return "c4";
  if (firstLine.startsWith("block")) return "block";
  if (firstLine.startsWith("requirement")) return "requirement";
  return "flowchart";
}

export function parse(text: string): DiagramModel {
  const type = detectDiagramType(text);

  switch (type) {
    case "flowchart":
      return parseFlowchart(text);
    case "state":
      return parseStateDiagram(text);
    case "class":
      return parseClassDiagram(text);
    case "er":
      return parseERDiagram(text);
    case "mindmap":
      return parseMindmap(text);
    case "sequence":
      return parseSequenceDiagram(text);
    case "gantt":
      return parseGantt(text);
    case "pie":
      return parsePie(text);
    case "journey":
      return parseJourney(text);
    case "timeline":
      return parseTimeline(text);
    case "gitgraph":
      return parseGitGraph(text);
    case "c4":
      return parseC4Diagram(text);
    case "block":
      return parseBlockDiagram(text);
    case "requirement":
      return parseRequirementDiagram(text);
    default:
      return parseFlowchart(text);
  }
}

export {
  parseFlowchart,
  parseStateDiagram,
  parseClassDiagram,
  parseERDiagram,
  parseMindmap,
  parseSequenceDiagram,
  parseGantt,
  parsePie,
  parseJourney,
  parseTimeline,
  parseGitGraph,
  parseC4Diagram,
  parseBlockDiagram,
  parseRequirementDiagram,
  parseGenericLines,
};
