import { useState } from "react";
import { MermaidEditor } from "@mermaid-visual/editor";

const EXAMPLES: Record<string, string> = {
  flowchart: `flowchart TD
    A["Start"] --> B{"Decision"}
    B -->|"Yes"| C["Process"]
    B -->|"No"| D["End"]
    C --> D`,
  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : fetch
    Loading --> Success : resolve
    Loading --> Error : reject
    Error --> Idle : retry
    Success --> [*]`,
  class: `classDiagram
    Animal <|-- Dog
    Animal <|-- Cat
    Animal : +String name
    Animal : +int age
    Dog : +bark()
    Cat : +meow()`,
  er: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ITEM : contains
    USER ||--o{ REVIEW : writes`,
  sequence: `sequenceDiagram
    Alice->>Bob: Hello Bob
    Bob-->>Alice: Hi Alice
    Alice->>Charlie: How are you?
    Charlie-->>Alice: Great!`,
  mindmap: `mindmap
  root((Project))
    Phase 1
      Research
      Design
    Phase 2
      Development
      Testing
    Phase 3
      Launch`,
  gantt: `gantt
    title Sprint Plan
    section Backend
    API Design : a1, 2024-01-01, 5d
    Database Setup : a2, after a1, 3d
    section Frontend
    UI Mockups : b1, 2024-01-01, 4d
    Components : b2, after b1, 6d`,
  pie: `pie title Browser Share
    "Chrome" : 65
    "Safari" : 19
    "Firefox" : 10
    "Edge" : 6`,
  journey: `journey
    title My Working Day
    section Morning
    Wake up: 2: Me
    Coffee: 5: Me
    Commute: 1: Me
    section Work
    Code: 4: Me
    Meeting: 2: Me`,
  timeline: `timeline
    title Company History
    2020 : Founded : First product
    2021 : Series A : 50 employees
    2022 : IPO : Global expansion
    2023 : Acquisition`,
  gitgraph: `gitGraph
    commit
    commit
    branch develop
    commit
    commit
    branch feature
    commit
    merge develop`,
};

export function App() {
  const [activeExample, setActiveExample] = useState("flowchart");
  const [code, setCode] = useState(EXAMPLES.flowchart);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const switchExample = (key: string) => {
    setActiveExample(key);
    setCode(EXAMPLES[key]);
  };

  return (
    <div>
      <h1>@mermaid-visual/editor Playground</h1>

      <div className="controls">
        {Object.keys(EXAMPLES).map((key) => (
          <button
            key={key}
            className={activeExample === key ? "active" : ""}
            onClick={() => switchExample(key)}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          style={{ marginLeft: "auto" }}
        >
          {theme === "light" ? "\u263D Dark" : "\u2600 Light"}
        </button>
      </div>

      <MermaidEditor
        value={code}
        onChange={setCode}
        theme={theme}
        height={500}
        toolbar={true}
        minimap={true}
      />

      <div className="output">
        <h3>Mermaid Output — {activeExample}</h3>
        <pre>{code}</pre>
      </div>
    </div>
  );
}
