import { useCallback, useEffect, useRef, useState } from "react";

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  divider?: boolean;
  shortcut?: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  theme?: "light" | "dark";
}

export function ContextMenu({ x, y, items, onClose, theme = "light" }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [position, setPosition] = useState({ x, y });

  // Adjust position if menu would overflow viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const adjustedX = x + rect.width > window.innerWidth ? x - rect.width : x;
    const adjustedY = y + rect.height > window.innerHeight ? y - rect.height : y;
    setPosition({
      x: Math.max(0, adjustedX),
      y: Math.max(0, adjustedY),
    });
  }, [x, y]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    // Use a timeout so the opening right-click doesn't immediately close it
    const timer = setTimeout(() => {
      window.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  // Close on scroll
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const actionItems = items.filter((item) => !item.divider);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((prev) => {
          const next = prev + 1;
          return next >= actionItems.length ? 0 : next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? actionItems.length - 1 : next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < actionItems.length) {
          actionItems[focusIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [items, focusIndex, onClose]
  );

  // Focus the menu on mount for keyboard navigation
  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  let actionIndex = -1;

  return (
    <div
      ref={menuRef}
      className="mve-context-menu"
      data-theme={theme}
      style={{ left: position.x, top: position.y }}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="menu"
    >
      {items.map((item, i) => {
        if (item.divider) {
          return <div key={`divider-${i}`} className="mve-context-divider" role="separator" />;
        }
        actionIndex++;
        const isActive = actionIndex === focusIndex;
        const currentActionIndex = actionIndex;
        return (
          <div
            key={`${item.label}-${i}`}
            className={`mve-context-item ${isActive ? "mve-context-item-active" : ""}`}
            role="menuitem"
            onClick={() => {
              item.action();
              onClose();
            }}
            onMouseEnter={() => setFocusIndex(currentActionIndex)}
          >
            {item.icon && <span className="mve-context-icon">{item.icon}</span>}
            <span>{item.label}</span>
            {item.shortcut && <span className="mve-context-shortcut">{item.shortcut}</span>}
          </div>
        );
      })}
    </div>
  );
}
