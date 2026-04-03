import type { NodePanelProps } from "./types";

const MESSAGE_TYPES = [
  { value: "->>", label: "\u2192 Request" },
  { value: "-->>", label: "\u2190 Reply" },
  { value: "->", label: "\u2192 Async" },
  { value: "-->", label: "\u2190 Async reply" },
];

export function SequenceNodePanel({ node, allNodes, onLabelChange, onPropertyChange }: NodePanelProps) {
  const isMessage = node.data?.isMessage as boolean;
  const isParticipant = node.data?.isParticipant as boolean;
  const participants = allNodes
    .filter((n) => n.data?.isParticipant)
    .map((n) => ({ id: n.id, label: (n.data?.label as string) || n.id }));

  if (isMessage) {
    const handleFlip = () => {
      const src = node.data?.sourceParticipant as string;
      const tgt = node.data?.targetParticipant as string;
      onPropertyChange(node.id, "sourceParticipant", tgt);
      // Need a small delay so the first change propagates
      setTimeout(() => onPropertyChange(node.id, "targetParticipant", src), 0);
    };

    return (
      <>
        <h4>Message</h4>
        <label>
          <span>Text</span>
          <input
            value={(node.data?.label as string) || ""}
            onChange={(e) => onLabelChange(node.id, e.target.value)}
            autoFocus
          />
        </label>
        <label>
          <span>From</span>
          <div style={{ display: "flex", gap: 4 }}>
            <select
              value={(node.data?.sourceParticipant as string) || ""}
              onChange={(e) => onPropertyChange(node.id, "sourceParticipant", e.target.value)}
              style={{ flex: 1 }}
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <button className="mve-flip-btn" onClick={handleFlip} title="Swap From/To">
              ⇄
            </button>
          </div>
        </label>
        <label>
          <span>To</span>
          <select
            value={(node.data?.targetParticipant as string) || ""}
            onChange={(e) => onPropertyChange(node.id, "targetParticipant", e.target.value)}
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Type</span>
          <select
            value={(node.data?.messageType as string) || "->>"}
            onChange={(e) => onPropertyChange(node.id, "messageType", e.target.value)}
          >
            {MESSAGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
      </>
    );
  }

  if (isParticipant) {
    return (
      <>
        <h4>Participant</h4>
        <label>
          <span>Name</span>
          <input
            value={(node.data?.label as string) || ""}
            onChange={(e) => onLabelChange(node.id, e.target.value)}
            autoFocus
          />
        </label>
      </>
    );
  }

  return null;
}
