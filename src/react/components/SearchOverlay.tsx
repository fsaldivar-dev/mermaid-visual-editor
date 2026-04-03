import { useEffect, useRef } from "react";

interface SearchOverlayProps {
  isOpen: boolean;
  query: string;
  matchCount: number;
  currentIndex: number;
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  theme?: "light" | "dark";
}

export function SearchOverlay({
  isOpen,
  query,
  matchCount,
  currentIndex,
  onSearch,
  onNext,
  onPrev,
  onClose,
  theme = "light",
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div
      className="mve-search-overlay"
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        borderRadius: 6,
        backgroundColor: isDark ? "#333" : "#fff",
        border: `1px solid ${isDark ? "#555" : "#ddd"}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        color: isDark ? "#eee" : "#333",
        fontSize: 13,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.shiftKey ? onPrev() : onNext();
          }
          if (e.key === "Escape") {
            onClose();
          }
        }}
        placeholder="Search nodes..."
        style={{
          width: 160,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "inherit",
          fontSize: 13,
        }}
      />
      {query && (
        <span style={{ opacity: 0.6, whiteSpace: "nowrap" }}>
          {matchCount > 0 ? `${currentIndex + 1}/${matchCount}` : "0 results"}
        </span>
      )}
      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14 }}
        title="Previous (Shift+Enter)"
      >
        &#x25B2;
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14 }}
        title="Next (Enter)"
      >
        &#x25BC;
      </button>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14 }}
        title="Close (Esc)"
      >
        &#x2715;
      </button>
    </div>
  );
}
