import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { History } from "../../src/core/history";

describe("History", () => {
  it("initializes with given state", () => {
    const h = new History({ value: 1 });
    expect(h.current).toEqual({ value: 1 });
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
    expect(h.length).toBe(1);
  });

  it("push adds state and moves pointer forward", () => {
    const h = new History("a");
    h.push("b");
    h.push("c");
    expect(h.current).toBe("c");
    expect(h.length).toBe(3);
    expect(h.canUndo).toBe(true);
    expect(h.canRedo).toBe(false);
  });

  it("undo returns previous state", () => {
    const h = new History("a");
    h.push("b");
    h.push("c");

    const result = h.undo();
    expect(result).toBe("b");
    expect(h.current).toBe("b");
    expect(h.canUndo).toBe(true);
    expect(h.canRedo).toBe(true);
  });

  it("redo returns next state", () => {
    const h = new History("a");
    h.push("b");
    h.push("c");
    h.undo();
    h.undo();

    expect(h.current).toBe("a");
    const result = h.redo();
    expect(result).toBe("b");
    expect(h.canRedo).toBe(true);

    h.redo();
    expect(h.current).toBe("c");
    expect(h.canRedo).toBe(false);
  });

  it("undo at beginning returns null", () => {
    const h = new History("a");
    expect(h.undo()).toBeNull();
    expect(h.current).toBe("a");
  });

  it("redo at end returns null", () => {
    const h = new History("a");
    expect(h.redo()).toBeNull();
  });

  it("push after undo discards redo stack", () => {
    const h = new History("a");
    h.push("b");
    h.push("c");
    h.undo(); // back to b
    h.push("d"); // should discard c

    expect(h.current).toBe("d");
    expect(h.canRedo).toBe(false);
    expect(h.length).toBe(3); // a, b, d
  });

  it("respects maxSize by trimming oldest entries", () => {
    const h = new History(0, 3);
    h.push(1);
    h.push(2);
    h.push(3); // should trim 0

    expect(h.length).toBe(3);
    expect(h.current).toBe(3);

    // Undo all the way back
    h.undo();
    h.undo();
    expect(h.current).toBe(1); // 0 was trimmed
    expect(h.canUndo).toBe(false);
  });

  it("clones state to prevent mutation", () => {
    const obj = { x: 1 };
    const h = new History(obj);
    obj.x = 999; // mutate original
    expect(h.current).toEqual({ x: 1 }); // history is isolated
  });

  it("reset clears history and sets new initial state", () => {
    const h = new History("a");
    h.push("b");
    h.push("c");

    h.reset("x");
    expect(h.current).toBe("x");
    expect(h.length).toBe(1);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });

  describe("pushDebounced", () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it("debounces rapid pushes", () => {
      const h = new History("a");
      h.pushDebounced("b", 100);
      h.pushDebounced("c", 100);
      h.pushDebounced("d", 100);

      // Nothing committed yet
      expect(h.length).toBe(1);

      vi.advanceTimersByTime(100);

      // Only the last value should be committed
      expect(h.length).toBe(2);
      expect(h.current).toBe("d");
    });

    it("immediate push cancels pending debounce", () => {
      const h = new History("a");
      h.pushDebounced("b", 100);
      h.push("c"); // cancels debounced b

      vi.advanceTimersByTime(200);
      expect(h.length).toBe(2); // a, c (no b)
      expect(h.current).toBe("c");
    });

    it("undo cancels pending debounce", () => {
      const h = new History("a");
      h.push("b");
      h.pushDebounced("c", 100);
      h.undo(); // cancels debounced c, goes back to a

      vi.advanceTimersByTime(200);
      expect(h.current).toBe("a");
    });
  });
});
