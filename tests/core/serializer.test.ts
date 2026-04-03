import { describe, it, expect } from "vitest";
import { parse } from "../../src/core/parser";
import { serialize } from "../../src/core/serializer";

describe("Serializer roundtrip", () => {
  it("flowchart: roundtrip preserves structure", () => {
    const input = `flowchart TD\n    A["Start"] --> B{"Decision"}\n    B -->|"Yes"| C["End"]`;
    const model = parse(input);
    const output = serialize(model);
    expect(output).toContain("flowchart TD");
    expect(output).toContain('A["Start"]');
    expect(output).toContain('B{"Decision"}');
    expect(output).toContain('C["End"]');
    expect(output).toContain("A --> B");
    expect(output).toContain('B -->|"Yes"| C');
  });

  it("flowchart: roundtrip with subgraphs", () => {
    const input = `flowchart TD\n    subgraph SG[Group]\n    A["Node1"]\n    B["Node2"]\n    end\n    A --> B`;
    const model = parse(input);
    expect(model.subgraphs).toBeDefined();
    expect(model.subgraphs!.length).toBe(1);
    expect(model.subgraphs![0].id).toBe("SG");

    const output = serialize(model);
    expect(output).toContain("subgraph");
    expect(output).toContain("end");
  });

  it("state: roundtrip preserves states and transitions", () => {
    const input = `stateDiagram-v2\n    [*] --> Active\n    Active --> Inactive\n    Inactive --> [*]`;
    const model = parse(input);
    const output = serialize(model);
    expect(output).toContain("stateDiagram-v2");
    expect(output).toContain("[*]");
    expect(output).toContain("Active");
  });

  it("class: roundtrip preserves classes", () => {
    const input = `classDiagram\n    Animal <|-- Dog\n    Animal : +name`;
    const model = parse(input);
    expect(model.type).toBe("class");
    expect(model.elements.length).toBeGreaterThan(0);
    const output = serialize(model);
    expect(output).toContain("classDiagram");
    expect(output).toContain("Animal");
    expect(output).toContain("Dog");
  });

  it("er: roundtrip preserves entities", () => {
    const input = `erDiagram\n    CUSTOMER ||--o{ ORDER : places`;
    const model = parse(input);
    expect(model.type).toBe("er");
    const output = serialize(model);
    expect(output).toContain("erDiagram");
    expect(output).toContain("CUSTOMER");
    expect(output).toContain("ORDER");
  });

  it("sequence: roundtrip preserves messages", () => {
    const input = `sequenceDiagram\n    Alice->>Bob: Hello\n    Bob-->>Alice: Hi`;
    const model = parse(input);
    expect(model.type).toBe("sequence");
    const output = serialize(model);
    expect(output).toContain("sequenceDiagram");
    expect(output).toContain("Alice");
    expect(output).toContain("Bob");
  });

  it("pie: roundtrip preserves slices", () => {
    const input = `pie\n    "Dogs" : 35\n    "Cats" : 45\n    "Birds" : 20`;
    const model = parse(input);
    expect(model.type).toBe("pie");
    expect(model.elements.length).toBe(3);
    const output = serialize(model);
    expect(output).toContain("pie");
    expect(output).toContain("Dogs");
  });

  it("gantt: roundtrip preserves tasks", () => {
    const input = `gantt\n    title A Plan\n    section Phase 1\n    Task1 :a1, 2024-01-01, 30d`;
    const model = parse(input);
    expect(model.type).toBe("gantt");
    const output = serialize(model);
    expect(output).toContain("gantt");
  });

  it("mindmap: roundtrip preserves topics", () => {
    const input = `mindmap\n  root((Central))\n    Topic1\n    Topic2`;
    const model = parse(input);
    expect(model.type).toBe("mindmap");
    const output = serialize(model);
    expect(output).toContain("mindmap");
    expect(output).toContain("Central");
  });

  it("c4: roundtrip preserves elements", () => {
    const input = `C4Context\n    Person(user, "User", "A user")\n    System(sys, "System", "The system")\n    Rel(user, sys, "Uses")`;
    const model = parse(input);
    expect(model.type).toBe("c4");
    expect(model.elements.length).toBe(2);
    expect(model.connections.length).toBe(1);
    const output = serialize(model);
    expect(output).toContain("C4Context");
    expect(output).toContain("User");
    expect(output).toContain("System");
  });

  it("block: roundtrip preserves blocks", () => {
    const input = `block-beta\n    columns 2\n    A["Block 1"]\n    B["Block 2"]\n    A --> B`;
    const model = parse(input);
    expect(model.type).toBe("block");
    expect(model.elements.length).toBe(2);
    expect(model.connections.length).toBe(1);
    const output = serialize(model);
    expect(output).toContain("block-beta");
    expect(output).toContain("Block 1");
  });

  it("requirement: roundtrip preserves requirements and elements", () => {
    const input = `requirementDiagram\n    requirement "Auth" {\n        id: REQ-1\n        text: Must authenticate\n        risk: High\n        verifymethod: Test\n    }\n    element "Service" {\n        type: Backend\n    }\n    Service - satisfies -> Auth`;
    const model = parse(input);
    expect(model.type).toBe("requirement");
    expect(model.elements.length).toBe(2);
    expect(model.connections.length).toBe(1);
    const output = serialize(model);
    expect(output).toContain("requirementDiagram");
    expect(output).toContain("Auth");
    expect(output).toContain("Service");
    expect(output).toContain("satisfies");
  });
});
