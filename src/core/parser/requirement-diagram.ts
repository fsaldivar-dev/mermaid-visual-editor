import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

/**
 * Parse requirementDiagram syntax.
 * Supports: requirement, functionalRequirement, performanceRequirement,
 * interfaceRequirement, physicalRequirement, designConstraint, element.
 */
export function parseRequirementDiagram(text: string): DiagramModel {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let col = 0;

  // Track current element being defined
  let currentId: string | null = null;
  // currentType tracked for future extension

  for (const line of lines) {
    if (line.match(/^requirementDiagram/i)) continue;

    // Requirement definition: requirement "name" {
    const reqMatch = line.match(
      /^(requirement|functionalRequirement|performanceRequirement|interfaceRequirement|physicalRequirement|designConstraint)\s+"([^"]+)"\s*\{?/i
    );
    if (reqMatch) {
      const reqType = reqMatch[1];
      const name = reqMatch[2];
      const id = name.replace(/\s+/g, "_");
      elements.push({
        id,
        label: name,
        shape: "rect",
        position: { x: (col % 3) * 250, y: Math.floor(col / 3) * 150 },
        properties: {
          reqType,
          isRequirement: true,
        },
      });
      currentId = id;
      // requirement type
      col++;
      continue;
    }

    // Element definition: element "name" {
    const elemMatch = line.match(/^element\s+"([^"]+)"\s*\{?/i);
    if (elemMatch) {
      const name = elemMatch[1];
      const id = name.replace(/\s+/g, "_");
      elements.push({
        id,
        label: name,
        shape: "rounded",
        position: { x: (col % 3) * 250, y: Math.floor(col / 3) * 150 },
        properties: {
          isElement: true,
        },
      });
      currentId = id;
      // element type
      col++;
      continue;
    }

    // Properties inside blocks: id:, text:, risk:, verifymethod:, type:, docref:
    if (currentId) {
      const propMatch = line.match(/^(id|text|risk|verifymethod|type|docref)\s*:\s*(.+)/i);
      if (propMatch) {
        const el = elements.find((e) => e.id === currentId);
        if (el) {
          el.properties[propMatch[1].toLowerCase()] = propMatch[2].trim();
        }
        continue;
      }
    }

    // Block end
    if (line === "}") {
      currentId = null;
      // end block
      continue;
    }

    // Relationships: element - satisfies -> requirement
    const relMatch = line.match(
      /^(\w+)\s*-\s*(traces|copies|contains|derives|satisfies|verifies|refines)\s*->\s*(\w+)/i
    );
    if (relMatch) {
      connections.push({
        id: `e${connections.length}`,
        source: relMatch[1],
        target: relMatch[3],
        label: relMatch[2],
        properties: {
          relType: relMatch[2],
        },
      });
    }
  }

  return {
    type: "requirement",
    direction: "LR",
    elements,
    connections,
    metadata: {},
  };
}
