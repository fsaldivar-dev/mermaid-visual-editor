interface ValidationMessageProps {
  message: string;
  type?: "error" | "warning";
}

export function ValidationMessage({ message, type = "error" }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`mve-validation mve-validation-${type}`}
      style={{
        color: type === "error" ? "#dc3545" : "#ffc107",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 1.3,
      }}
    >
      {type === "error" ? "\u26a0" : "\u24d8"} {message}
    </div>
  );
}
