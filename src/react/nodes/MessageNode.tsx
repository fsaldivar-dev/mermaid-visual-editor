interface MessageNodeProps {
  data: {
    label?: string;
    isReply?: boolean;
    goesRight?: boolean;
    width?: number;
  };
  selected?: boolean;
}

export function MessageNode({ data, selected }: MessageNodeProps) {
  const width = data?.width ?? 200;
  const isReply = data?.isReply ?? false;
  const goesRight = data?.goesRight ?? true;

  return (
    <div
      className={`mve-message-node ${selected ? "mve-selected" : ""}`}
      style={{ width }}
    >
      <div className={`mve-message-arrow ${isReply ? "mve-reply" : ""} ${goesRight ? "mve-right" : "mve-left"}`}>
        {goesRight ? (
          <>
            <div className="mve-message-line" />
            <div className="mve-message-head-right" />
          </>
        ) : (
          <>
            <div className="mve-message-head-left" />
            <div className="mve-message-line" />
          </>
        )}
      </div>
      <div className={`mve-message-label ${isReply ? "mve-reply" : ""}`}>
        {data?.label || ""}
      </div>
    </div>
  );
}
