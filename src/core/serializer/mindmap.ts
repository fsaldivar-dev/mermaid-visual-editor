import type { DiagramModel } from "../model/types";

export function serializeMindmap(model: DiagramModel): string {
  if (!model.elements.length) return "mindmap";

  // Build parent map from connections
  const parentMap = new Map<string, string>();
  for (const conn of model.connections) {
    parentMap.set(conn.target, conn.source);
  }

  // Build children map
  const childrenMap = new Map<string, string[]>();
  for (const conn of model.connections) {
    if (!childrenMap.has(conn.source)) childrenMap.set(conn.source, []);
    childrenMap.get(conn.source)!.push(conn.target);
  }

  // Find root (no parent)
  const root = model.elements.find((el) => !parentMap.has(el.id));
  if (!root) return "mindmap";

  const lines = ["mindmap"];

  function walk(id: string, depth: number) {
    const el = model.elements.find((e) => e.id === id);
    if (!el) return;

    const indent = "  ".repeat(depth + 1);
    const label = el.label;

    // Root uses (( )), others are plain
    if (depth === 0) {
      lines.push(`${indent}root((${label}))`);
    } else {
      lines.push(`${indent}${label}`);
    }

    const children = childrenMap.get(id) || [];
    for (const child of children) {
      walk(child, depth + 1);
    }
  }

  walk(root.id, 0);
  return lines.join("\n");
}
