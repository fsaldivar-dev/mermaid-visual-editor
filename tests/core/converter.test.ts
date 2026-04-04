import { describe, it, expect } from "vitest";
import { parse } from "../../src/core/parser";
import { toReactFlow } from "../../src/core/converter/to-react-flow";
import { fromReactFlow } from "../../src/core/converter/from-react-flow";

describe("toReactFlow", () => {
  it("converts model to ReactFlow format", () => {
    const model = parse('flowchart TD\n    A["Start"] --> B["End"]');
    const { nodes, edges } = toReactFlow(model);

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(nodes[0].id).toBe("A");
    expect(nodes[0].data.label).toBe("Start");
    expect(nodes[0].type).toBe("rect");
    expect(edges[0].source).toBe("A");
    expect(edges[0].target).toBe("B");
  });
});

describe("fromReactFlow", () => {
  it("converts ReactFlow back to model", () => {
    const nodes = [
      { id: "A", type: "rect", data: { label: "Start" }, position: { x: 0, y: 0 } },
      { id: "B", type: "rounded", data: { label: "End" }, position: { x: 200, y: 100 } },
    ];
    const edges = [
      { id: "e0", source: "A", target: "B" },
    ];

    const model = fromReactFlow(nodes, edges, "flowchart", "TD");
    expect(model.elements).toHaveLength(2);
    expect(model.connections).toHaveLength(1);
    expect(model.elements[0].shape).toBe("rect");
    expect(model.elements[1].shape).toBe("rounded");
  });
});

describe("roundtrip: model → ReactFlow → model", () => {
  it("preserves structure", () => {
    const original = parse('flowchart TD\n    A["Start"] --> B{"Decision"}\n    B -->|"Yes"| C["End"]');
    const { nodes, edges } = toReactFlow(original);
    const restored = fromReactFlow(nodes, edges, "flowchart", "TD");

    expect(restored.elements).toHaveLength(original.elements.length);
    expect(restored.connections).toHaveLength(original.connections.length);
  });

  it("ER diagram labels do not accumulate on multiple roundtrips", () => {
    const original = parse('erDiagram\n    USER ||--o{ ORDER : places');

    // First roundtrip
    const rf1 = toReactFlow(original);
    const model1 = fromReactFlow(rf1.nodes, rf1.edges, "er", "LR");

    // Second roundtrip
    const rf2 = toReactFlow(model1);
    const model2 = fromReactFlow(rf2.nodes, rf2.edges, "er", "LR");

    // Third roundtrip
    const rf3 = toReactFlow(model2);

    // Edge label should NOT grow with each roundtrip
    const label1 = rf1.edges[0]?.label as string | undefined;
    const label3 = rf3.edges[0]?.label as string | undefined;
    expect(label3).toBe(label1);
    // Label should be just the relationship verb, not accumulated cardinality
    expect((label3 || "").length).toBeLessThan(30);
  });
});
