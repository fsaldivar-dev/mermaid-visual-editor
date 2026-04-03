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
};

export function App() {
  const [code, setCode] = useState(EXAMPLES.flowchart);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div>
      <h1>@mermaid-visual/editor Playground</h1>

      <div className="controls">
        {Object.keys(EXAMPLES).map((key) => (
          <button
            key={key}
            className={code === EXAMPLES[key] ? "active" : ""}
            onClick={() => setCode(EXAMPLES[key])}
          >
            {key}
          </button>
        ))}
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? "Dark" : "Light"} theme
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
        <h3>Mermaid Output</h3>
        <pre>{code}</pre>
      </div>
    </div>
  );
}
