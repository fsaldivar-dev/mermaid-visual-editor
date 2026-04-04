import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export interface ERAttribute {
  type: string;
  name: string;
  key?: string; // "PK" | "FK" | "UK" etc.
}

export function parseERDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];

  const ensure = (id: string) => {
    if (elementsMap.has(id)) return;
    elementsMap.set(id, {
      id,
      label: id,
      shape: "entity",
      position: { x: 0, y: 0 },
      properties: { attributes: [] as ERAttribute[] },
    });
  };

  let insideEntity: string | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Closing brace for entity block
    if (insideEntity && line === "}") {
      insideEntity = null;
      continue;
    }

    // Inside entity block: parse attribute lines
    if (insideEntity) {
      const attrMatch = line.match(/^(\S+)\s+(\S+)(?:\s+(PK|FK|UK))?$/);
      if (attrMatch) {
        const entity = elementsMap.get(insideEntity);
        if (entity) {
          const attrs = (entity.properties.attributes as ERAttribute[]) || [];
          attrs.push({
            type: attrMatch[1],
            name: attrMatch[2],
            key: attrMatch[3] || undefined,
          });
          entity.properties.attributes = attrs;
        }
      }
      continue;
    }

    // Relationship line: ENTITY1 ||--o{ ENTITY2 : label
    const m = line.match(/^(\S+)\s+([\|o\}\{]{1,2}(?:--|\.\.)[\|o\}\{]{1,2})\s+(\S+)\s*(?::\s*(.+))?$/);
    if (m) {
      ensure(m[1]);
      ensure(m[3]);
      connections.push({
        id: `e${connections.length}`,
        source: m[1],
        target: m[3],
        label: m[4] || undefined,
        properties: { cardinality: m[2] },
      });
      continue;
    }

    // Entity block opening: ENTITY_NAME {
    const entityMatch = line.match(/^(\w[\w-]*)\s*\{$/);
    if (entityMatch) {
      ensure(entityMatch[1]);
      insideEntity = entityMatch[1];
      continue;
    }

    // Standalone entity name (no braces, no relationship)
    const standaloneEntity = line.match(/^(\w[\w-]*)$/);
    if (standaloneEntity) {
      ensure(standaloneEntity[1]);
    }
  }

  return {
    type: "er",
    direction: "LR",
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
