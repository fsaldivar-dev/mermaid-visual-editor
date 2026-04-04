import type { DiagramModel, DiagramElement, DiagramConnection } from "../model/types";

export function parseClassDiagram(text: string): DiagramModel {
  const lines = text.split("\n").map((l) => l.trimEnd()).filter(Boolean);
  const elementsMap = new Map<string, DiagramElement>();
  const connections: DiagramConnection[] = [];

  const ensure = (id: string) => {
    if (elementsMap.has(id)) return;
    elementsMap.set(id, {
      id,
      label: id,
      shape: "rect",
      position: { x: 0, y: 0 },
      properties: { attributes: [], methods: [] },
    });
  };

  const addMember = (id: string, member: string) => {
    const node = elementsMap.get(id)!;
    if (!node.properties.attributes) node.properties.attributes = [];
    if (!node.properties.methods) node.properties.methods = [];
    const trimmed = member.trim();
    if (trimmed.includes("(")) {
      (node.properties.methods as string[]).push(trimmed);
    } else {
      (node.properties.attributes as string[]).push(trimmed);
    }
    // Keep label in sync: className\nattr1\nattr2\nmethod1...
    const attrs = node.properties.attributes as string[];
    const meths = node.properties.methods as string[];
    node.label = [node.id, ...attrs, ...meths].join("\n");
  };

  let i = 1; // skip header line (classDiagram)
  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("%%")) {
      i++;
      continue;
    }

    // Annotation/stereotype: <<interface>> ClassName
    const annotation = line.match(/^<<(\w+)>>\s+(\w+)$/);
    if (annotation) {
      ensure(annotation[2]);
      const node = elementsMap.get(annotation[2])!;
      node.properties.stereotype = annotation[1];
      i++;
      continue;
    }

    // Multi-line class body: class ClassName { ... }
    const classBlock = line.match(/^class\s+(\w+)\s*\{?\s*$/);
    if (classBlock) {
      const classId = classBlock[1];
      ensure(classId);

      // Check if this line has opening brace or next line does
      const hasOpenBrace = line.includes("{");

      if (hasOpenBrace) {
        // Collect members until closing brace
        i++;
        while (i < lines.length) {
          const memberLine = lines[i].trim();
          if (memberLine === "}") {
            i++;
            break;
          }
          if (memberLine) {
            addMember(classId, memberLine);
          }
          i++;
        }
      } else {
        // Check if next line starts a block
        if (i + 1 < lines.length && lines[i + 1].trim() === "{") {
          i += 2; // skip class line and opening brace
          while (i < lines.length) {
            const memberLine = lines[i].trim();
            if (memberLine === "}") {
              i++;
              break;
            }
            if (memberLine) {
              addMember(classId, memberLine);
            }
            i++;
          }
        } else {
          // Simple class declaration without body
          i++;
        }
      }
      continue;
    }

    // Inline class body: class ClassName { +attr; +method() }
    const inlineClass = line.match(/^class\s+(\w+)\s*\{(.+)\}\s*$/);
    if (inlineClass) {
      const classId = inlineClass[1];
      ensure(classId);
      const membersStr = inlineClass[2];
      const membersList = membersStr.split(";").map((m) => m.trim()).filter(Boolean);
      for (const member of membersList) {
        addMember(classId, member);
      }
      i++;
      continue;
    }

    // Inheritance/relationships: A <|-- B, A *-- B, A o-- B, A --> B, A ..> B, A <|.. B
    const rel = line.match(
      /^(\w+)\s*(<\|--|<\.\.|<\|\.\.|\*--|o--|-->|\.\.>|--)\s*(\w+)(?:\s*:\s*(.+))?$/
    );
    if (rel) {
      ensure(rel[1]);
      ensure(rel[3]);
      connections.push({
        id: `e${connections.length}`,
        source: rel[1],
        target: rel[3],
        label: rel[4] || undefined,
        properties: { relationshipType: rel[2] },
      });
      i++;
      continue;
    }

    // Class attribute: ClassName : +method() or ClassName : +String name
    const attr = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (attr) {
      ensure(attr[1]);
      addMember(attr[1], attr[2]);
      i++;
      continue;
    }

    // class ClassName (simple declaration, no body)
    const cls = line.match(/^class\s+(\w+)/);
    if (cls) {
      ensure(cls[1]);
      i++;
      continue;
    }

    i++;
  }

  return {
    type: "class",
    direction: "TD",
    elements: [...elementsMap.values()],
    connections,
    metadata: {},
  };
}
