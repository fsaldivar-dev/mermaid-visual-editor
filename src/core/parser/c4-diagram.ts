import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

/**
 * Parse C4 diagram syntax.
 * Supports: C4Context, C4Container, C4Component, C4Dynamic
 * Elements: Person(), System(), Container(), Component(), System_Ext(), etc.
 * Relationships: Rel(), BiRel(), Rel_D(), Rel_U(), etc.
 */
export function parseC4Diagram(text: string): DiagramModel {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const elements: DiagramElement[] = [];
  const connections: DiagramConnection[] = [];
  let col = 0;

  // Element patterns: Person(id, "label", "description") etc.
  const elementPattern = /^(Person|Person_Ext|System|System_Ext|System_Boundary|Container|Container_Ext|Container_Boundary|Component|Component_Ext|Boundary|Enterprise_Boundary|Node|Node_L|Node_R)\s*\(\s*(\w+)\s*,\s*"([^"]*)"\s*(?:,\s*"([^"]*)")?\s*(?:,\s*"([^"]*)")?\s*\)/i;

  // Relationship patterns: Rel(from, to, "label") or BiRel(from, to, "label")
  const relPattern = /^(Rel|BiRel|Rel_D|Rel_U|Rel_L|Rel_R|Rel_Back|Rel_Neighbor)\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*"([^"]*)"\s*(?:,\s*"([^"]*)")?\s*\)/i;

  for (const line of lines) {
    // Skip header and boundary start/end
    if (line.match(/^C4(Context|Container|Component|Dynamic|Deployment)/i)) continue;
    if (line === "{" || line === "}") continue;

    const elMatch = line.match(elementPattern);
    if (elMatch) {
      const [, elType, id, label, description] = elMatch;
      const isBoundary = elType.toLowerCase().includes("boundary");
      elements.push({
        id,
        label,
        shape: isBoundary ? "group" : "rect",
        position: { x: (col % 4) * 220, y: Math.floor(col / 4) * 150 },
        properties: {
          c4Type: elType,
          description: description || "",
          isC4: true,
        },
      });
      col++;
      continue;
    }

    const relMatch = line.match(relPattern);
    if (relMatch) {
      const [, relType, source, target, label, technology] = relMatch;
      connections.push({
        id: `e${connections.length}`,
        source,
        target,
        label: label || undefined,
        properties: {
          relType,
          technology: technology || "",
        },
      });
      continue;
    }
  }

  return {
    type: "c4",
    direction: "TD",
    elements,
    connections,
    metadata: {},
  };
}
