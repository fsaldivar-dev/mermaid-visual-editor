import { describe, it, expect } from "vitest";
import { parse, detectDiagramType } from "../../src/core/parser";
import { serialize } from "../../src/core/serializer";

describe("detectDiagramType", () => {
  it("detects flowchart", () => {
    expect(detectDiagramType("flowchart TD\n  A --> B")).toBe("flowchart");
  });

  it("detects graph as flowchart", () => {
    expect(detectDiagramType("graph LR\n  A --> B")).toBe("flowchart");
  });

  it("detects stateDiagram", () => {
    expect(detectDiagramType("stateDiagram-v2\n  [*] --> Idle")).toBe("state");
  });

  it("detects classDiagram", () => {
    expect(detectDiagramType("classDiagram\n  A <|-- B")).toBe("class");
  });

  it("detects erDiagram", () => {
    expect(detectDiagramType("erDiagram\n  USER ||--o{ ORDER : places")).toBe("er");
  });

  it("detects mindmap", () => {
    expect(detectDiagramType("mindmap\n  root((Central))")).toBe("mindmap");
  });

  it("detects sequenceDiagram", () => {
    expect(detectDiagramType("sequenceDiagram\n  Alice->>Bob: Hello")).toBe("sequence");
  });

  it("detects gantt", () => {
    expect(detectDiagramType("gantt\n  title Project")).toBe("gantt");
  });

  it("detects pie", () => {
    expect(detectDiagramType('pie title Pets\n  "Dogs": 40')).toBe("pie");
  });

  it("detects journey", () => {
    expect(detectDiagramType("journey\n  title My day")).toBe("journey");
  });

  it("detects timeline", () => {
    expect(detectDiagramType("timeline\n  title History")).toBe("timeline");
  });

  it("detects gitGraph", () => {
    expect(detectDiagramType("gitGraph\n  commit")).toBe("gitgraph");
  });
});

describe("parseFlowchart", () => {
  it("parses simple flowchart", () => {
    const model = parse('flowchart TD\n    A["Start"] --> B["End"]');
    expect(model.type).toBe("flowchart");
    expect(model.direction).toBe("TD");
    expect(model.elements).toHaveLength(2);
    expect(model.connections).toHaveLength(1);
  });

  it("parses node shapes", () => {
    const model = parse(
      'flowchart TD\n    A["Rect"]\n    B("Rounded")\n    C{"Diamond"}\n    D(("Circle"))'
    );
    expect(model.elements[0].shape).toBe("rect");
    expect(model.elements[1].shape).toBe("rounded");
    expect(model.elements[2].shape).toBe("diamond");
    expect(model.elements[3].shape).toBe("circle");
  });

  it("parses edge labels", () => {
    const model = parse('flowchart TD\n    A -->|"Yes"| B');
    expect(model.connections[0].label).toBe("Yes");
  });

  it("parses LR direction", () => {
    const model = parse("flowchart LR\n    A --> B");
    expect(model.direction).toBe("LR");
  });

  it("handles empty input", () => {
    const model = parse("");
    expect(model.elements).toHaveLength(0);
    expect(model.connections).toHaveLength(0);
  });

  it("parses multiple edges", () => {
    const model = parse(
      'flowchart TD\n    A["Start"] --> B{"Decision"}\n    B -->|"Yes"| C["Result"]\n    B -->|"No"| D["End"]'
    );
    expect(model.elements).toHaveLength(4);
    expect(model.connections).toHaveLength(3);
  });
});

describe("parseStateDiagram", () => {
  it("parses state transitions", () => {
    const model = parse(
      "stateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading : fetch\n    Loading --> Done : complete"
    );
    expect(model.type).toBe("state");
    expect(model.elements.length).toBeGreaterThanOrEqual(4);
    expect(model.connections).toHaveLength(3);
    expect(model.connections[1].label).toBe("fetch");
  });
});

describe("parseClassDiagram", () => {
  it("parses class relationships", () => {
    const model = parse(
      "classDiagram\n    Animal <|-- Dog\n    Animal <|-- Cat\n    Animal : +String name"
    );
    expect(model.type).toBe("class");
    expect(model.elements.length).toBeGreaterThanOrEqual(2);
    expect(model.connections).toHaveLength(2);
  });
});

describe("parseERDiagram", () => {
  it("parses ER relationships", () => {
    const model = parse(
      "erDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ ITEM : contains"
    );
    expect(model.type).toBe("er");
    expect(model.elements).toHaveLength(3);
    expect(model.connections).toHaveLength(2);
    expect(model.connections[0].label).toBe("places");
  });
});

describe("parseMindmap", () => {
  it("parses mindmap hierarchy", () => {
    const model = parse(
      "mindmap\n  root((Central))\n    Topic A\n      Sub A1\n    Topic B"
    );
    expect(model.type).toBe("mindmap");
    expect(model.elements.length).toBeGreaterThanOrEqual(4);
    expect(model.connections.length).toBeGreaterThanOrEqual(3);
  });
});

describe("parseSequenceDiagram", () => {
  it("parses sequence messages", () => {
    const model = parse(
      "sequenceDiagram\n    Alice->>Bob: Hello\n    Bob-->>Alice: Hi"
    );
    expect(model.type).toBe("sequence");
    // 2 participants + 2 message nodes
    const participants = model.elements.filter((e) => e.properties.isParticipant);
    const messages = model.elements.filter((e) => e.properties.isMessage);
    expect(participants).toHaveLength(2);
    expect(messages).toHaveLength(2);
    expect(messages[0].label).toBe("Hello");
    expect(messages[1].properties.isReply).toBe(true);
  });
});

describe("parseGantt", () => {
  it("parses gantt tasks", () => {
    const model = parse(
      "gantt\n    title Project\n    section Phase 1\n    Task A : a1, 2024-01-01, 30d\n    Task B : a2, after a1, 20d"
    );
    expect(model.type).toBe("gantt");
    expect(model.elements.length).toBeGreaterThanOrEqual(2);
  });
});

describe("parsePie", () => {
  it("parses pie slices", () => {
    const model = parse('pie title Pets\n    "Dogs" : 40\n    "Cats" : 30');
    expect(model.type).toBe("pie");
    expect(model.elements).toHaveLength(2);
    expect(model.connections).toHaveLength(0);
  });
});

describe("parseGitGraph", () => {
  it("parses commits and branches", () => {
    const model = parse(
      "gitGraph\n    commit\n    branch develop\n    commit\n    commit"
    );
    expect(model.type).toBe("gitgraph");
    expect(model.elements.length).toBeGreaterThanOrEqual(3);
  });
});

describe("roundtrip: flowchart parse → serialize → parse", () => {
  it("preserves structure", () => {
    const original = 'flowchart TD\n    A["Start"] --> B{"Decision"}\n    B -->|"Yes"| C["End"]';
    const model = parse(original);
    const text = serialize(model);
    const reparsed = parse(text);

    expect(reparsed.type).toBe(model.type);
    expect(reparsed.direction).toBe(model.direction);
    expect(reparsed.elements).toHaveLength(model.elements.length);
    expect(reparsed.connections).toHaveLength(model.connections.length);
  });

  it("preserves node shapes", () => {
    const original =
      'flowchart TD\n    A["Rect"]\n    B("Rounded")\n    C{"Diamond"}\n    D(("Circle"))';
    const model = parse(original);
    const text = serialize(model);
    const reparsed = parse(text);

    expect(reparsed.elements[0].shape).toBe("rect");
    expect(reparsed.elements[1].shape).toBe("rounded");
    expect(reparsed.elements[2].shape).toBe("diamond");
    expect(reparsed.elements[3].shape).toBe("circle");
  });

  it("preserves edge labels", () => {
    const original = 'flowchart TD\n    A -->|"Yes"| B\n    A -->|"No"| C';
    const model = parse(original);
    const text = serialize(model);
    const reparsed = parse(text);

    expect(reparsed.connections[0].label).toBe("Yes");
    expect(reparsed.connections[1].label).toBe("No");
  });
});
