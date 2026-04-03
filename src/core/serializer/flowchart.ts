import type { DiagramModel, DiagramElement } from "../model/types";

const SHAPE_MAP: Record<string, (id: string, label: string) => string> = {
  rect: (id, label) => `${id}["${label}"]`,
  rounded: (id, label) => `${id}("${label}")`,
  diamond: (id, label) => `${id}{"${label}"}`,
  circle: (id, label) => `${id}(("${label}"))`,
};

export function serializeFlowchart(model: DiagramModel): string {
  const lines = [`flowchart ${model.direction}`];
  const subgraphs = model.subgraphs || [];
  const subgraphIds = new Set(subgraphs.map((sg) => sg.id));

  // Collect elements that belong to each subgraph
  const elementsByParent = new Map<string | undefined, DiagramElement[]>();
  for (const el of model.elements) {
    // Skip group/subgraph elements themselves — they are emitted as `subgraph` blocks
    if (subgraphIds.has(el.id)) continue;
    const parent = el.parentId;
    if (!elementsByParent.has(parent)) elementsByParent.set(parent, []);
    elementsByParent.get(parent)!.push(el);
  }

  // Recursive function to emit a subgraph block
  function emitSubgraph(sgId: string, indent: string) {
    const sg = subgraphs.find((s) => s.id === sgId);
    if (!sg) return;

    const label = sg.label !== sg.id ? `${sg.id}["${sg.label}"]` : sg.id;
    lines.push(`${indent}subgraph ${label}`);

    // Emit child elements
    const children = elementsByParent.get(sgId) || [];
    for (const el of children) {
      const shapeFn = SHAPE_MAP[el.shape] || SHAPE_MAP.rect;
      lines.push(`${indent}    ${shapeFn(el.id, el.label)}`);
    }

    // Emit nested subgraphs
    const nestedSgs = subgraphs.filter(
      (s) => model.elements.find((e) => e.id === s.id)?.parentId === sgId
    );
    for (const nested of nestedSgs) {
      emitSubgraph(nested.id, indent + "    ");
    }

    lines.push(`${indent}end`);
  }

  // Emit top-level elements (no parent)
  const topLevel = elementsByParent.get(undefined) || [];
  for (const el of topLevel) {
    const shapeFn = SHAPE_MAP[el.shape] || SHAPE_MAP.rect;
    lines.push(`    ${shapeFn(el.id, el.label)}`);
  }

  // Emit top-level subgraphs (their group element has no parentId)
  const topLevelSgs = subgraphs.filter(
    (sg) => !model.elements.find((e) => e.id === sg.id)?.parentId
  );
  for (const sg of topLevelSgs) {
    emitSubgraph(sg.id, "    ");
  }

  // Emit connections
  for (const conn of model.connections) {
    if (conn.label) {
      lines.push(`    ${conn.source} -->|"${conn.label}"| ${conn.target}`);
    } else {
      lines.push(`    ${conn.source} --> ${conn.target}`);
    }
  }

  return lines.join("\n");
}
