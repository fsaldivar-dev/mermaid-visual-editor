interface MessageNodeProps {
  data: {
    label?: string;
    isReply?: boolean;
    isRight?: boolean;
    width?: number;
    messageType?: string;
  };
  selected?: boolean;
}

export function MessageNode({ data, selected }: MessageNodeProps) {
  const width = data?.width ?? 200;
  const isReply = data?.isReply ?? false;
  const isRight = data?.isRight ?? true;

  return (
    <div
      className={`mve-message-node ${selected ? "mve-selected" : ""}`}
      style={{ width }}
    >
      <div className={`mve-message-arrow ${isReply ? "mve-reply" : ""} ${isRight ? "" : "mve-left"}`}>
        <div className="mve-message-line" />
        <div className="mve-message-head" />
      </div>
      <div className={`mve-message-label ${isReply ? "mve-reply" : ""}`}>
        {data?.label || ""}
      </div>
    </div>
  );
}
