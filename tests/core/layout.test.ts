import { describe, it, expect } from "vitest";
import { parse } from "../../src/core/parser";
import { applyDagreLayout } from "../../src/core/layout/dagre-layout";

describe("dagre layout", () => {
  it("assigns positions to all nodes", () => {
    const model = parse('flowchart TD\n    A["Start"] --> B["End"]');
    const laid = applyDagreLayout(model);

    expect(laid.elements).toHaveLength(2);
    for (const el of laid.elements) {
      expect(el.position.x).toBeDefined();
      expect(el.position.y).toBeDefined();
      expect(typeof el.position.x).toBe("number");
      expect(typeof el.position.y).toBe("number");
    }
  });

  it("respects direction", () => {
    const modelTD = applyDagreLayout(parse("flowchart TD\n    A --> B\n    B --> C"));
    const modelLR = applyDagreLayout(parse("flowchart LR\n    A --> B\n    B --> C"));

    // In TD layout, nodes should be arranged vertically
    const tdYSpread =
      Math.max(...modelTD.elements.map((e) => e.position.y)) -
      Math.min(...modelTD.elements.map((e) => e.position.y));

    // In LR layout, nodes should be arranged horizontally
    const lrXSpread =
      Math.max(...modelLR.elements.map((e) => e.position.x)) -
      Math.min(...modelLR.elements.map((e) => e.position.x));

    expect(tdYSpread).toBeGreaterThan(0);
    expect(lrXSpread).toBeGreaterThan(0);
  });

  it("handles empty model", () => {
    const model = parse("");
    const laid = applyDagreLayout(model);
    expect(laid.elements).toHaveLength(0);
  });
});
