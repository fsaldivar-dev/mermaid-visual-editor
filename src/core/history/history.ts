/**
 * Snapshot-based history manager with ring buffer.
 * Framework-agnostic — no React dependency.
 */
export class History<T> {
  private stack: T[] = [];
  private pointer = -1;
  private readonly maxSize: number;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(initial: T, maxSize = 50) {
    this.maxSize = maxSize;
    this.stack = [this.clone(initial)];
    this.pointer = 0;
  }

  get current(): T {
    return this.stack[this.pointer];
  }

  get canUndo(): boolean {
    return this.pointer > 0;
  }

  get canRedo(): boolean {
    return this.pointer < this.stack.length - 1;
  }

  push(state: T): void {
    this.clearDebounce();
    // Discard any redo states beyond current pointer
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push(this.clone(state));

    // Trim from the front if we exceed maxSize
    if (this.stack.length > this.maxSize) {
      this.stack = this.stack.slice(this.stack.length - this.maxSize);
    }
    this.pointer = this.stack.length - 1;
  }

  /**
   * Debounced push — batches rapid changes (e.g., typing in property fields).
   * Only commits after `ms` of inactivity.
   */
  pushDebounced(state: T, ms = 300): void {
    this.clearDebounce();
    this.debounceTimer = setTimeout(() => {
      this.push(state);
      this.debounceTimer = null;
    }, ms);
  }

  undo(): T | null {
    this.clearDebounce();
    if (!this.canUndo) return null;
    this.pointer--;
    return this.clone(this.current);
  }

  redo(): T | null {
    this.clearDebounce();
    if (!this.canRedo) return null;
    this.pointer++;
    return this.clone(this.current);
  }

  /** Reset history with a new initial state */
  reset(state: T): void {
    this.clearDebounce();
    this.stack = [this.clone(state)];
    this.pointer = 0;
  }

  get length(): number {
    return this.stack.length;
  }

  private clone(state: T): T {
    return JSON.parse(JSON.stringify(state));
  }

  private clearDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
