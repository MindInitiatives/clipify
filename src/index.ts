/**
 * Clipify - a clipboard management utility.
 *
 * 1.2.0 builds directly on the existing API. Everything that worked in 1.1.x
 * still works identically; this release only *adds* capability:
 *   - SSR / Node safety: the library no longer assumes `navigator` exists, so
 *     it can be imported on the server without throwing (previously the
 *     constructor path and `copy`/`paste` would crash). When there is no system
 *     clipboard it transparently falls back to managing history only.
 *   - `copyFile` now accepts the optional `expiryTime` argument that the README
 *     already documented but the code didn't implement.
 *   - Smart history: `search()`, `pin()`/`unpin()`, and `tag()` - all new
 *     methods that leave existing behaviour untouched.
 *
 * No existing method changed its signature or return type. See CHANGELOG.md.
 */

/** A single entry in the clipboard history. */
export type ClipboardItem = {
  /** Optional key or name for the clipboard item. */
  key?: string;
  /** Text content. */
  text?: string;
  /** Optional file content (images, documents). */
  file?: Blob;
  /** When the item was stored (epoch ms). */
  timestamp: number;
  /**
   * Whether the item is pinned. Pinned items are never auto-removed by
   * expiry and are skipped by future eviction logic. New in 1.2.0.
   */
  pinned?: boolean;
  /** Optional freeform tags for grouping/filtering. New in 1.2.0. */
  tags?: string[];
};

/** Listener signature for clipboard events. */
export type ClipboardEventListener = (data: string | Blob) => void;

/** Options accepted by {@link Clipify.copy}. */
export type ClipboardOptions = {
  /** Required: the text to copy. */
  text: string;
  /** Optional: time-to-live for the item, in milliseconds. */
  expiryTime?: number;
  /** Optional: a key for identifying the clipboard item. */
  key?: string;
};

/**
 * Detect whether the async system Clipboard API is available. Kept as a
 * module-level helper so every method can guard on it without assuming a
 * browser global exists (which is what makes Node/SSR safe).
 */
function clipboardAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard !== "undefined"
  );
}

class Clipify {
  private clipboardHistory: ClipboardItem[] = [];
  private eventListeners: Map<string, ClipboardEventListener[]> = new Map();

  constructor() {}

  /**
   * Copies text to the system clipboard (when available) and stores it in the
   * clipboard history.
   *
   * Behaviour change in 1.2.0 (non-breaking): instead of throwing when the
   * Clipboard API is missing, `copy` now still records the item in history so
   * the library is usable in Node/SSR and in restricted browser contexts. The
   * `copy` event fires either way.
   */
  async copy(options: ClipboardOptions): Promise<void> {
    const { text, expiryTime, key } = options;
    if (!text) {
      throw new Error("Text is required to copy to clipboard.");
    }

    if (clipboardAvailable()) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        // System write failed (permission, focus, etc.) - keep history intact.
        console.error("Failed to write text to system clipboard:", err);
      }
    }

    this.addToHistory({ text, key }, expiryTime);
    this.notifyListeners("copy", text);
  }

  /**
   * Copies a file (image, document) into the clipboard history.
   *
   * 1.2.0: now accepts the optional `expiryTime` argument that the docs already
   * described. Existing two-argument calls `copyFile(blob, key)` are unaffected.
   *
   * @param file - The file/blob to store.
   * @param key - Optional key to identify the clipboard item.
   * @param expiryTime - Optional expiry in milliseconds.
   */
  async copyFile(file: Blob, key?: string, expiryTime?: number): Promise<void> {
    try {
      this.addToHistory({ file, key }, expiryTime);
    } catch (err) {
      console.error("Failed to copy file:", err);
    }
  }

  /**
   * Reads the most recent text from the system clipboard.
   *
   * 1.2.0 (non-breaking): when no system clipboard is available, instead of
   * throwing, this falls back to the most recent text item in history (or an
   * empty string if there is none). In a browser the behaviour is unchanged.
   */
  async paste(): Promise<string> {
    if (clipboardAvailable()) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        throw err;
      }
    }

    // Fallback for Node/SSR/restricted contexts: most recent text in history.
    for (let i = this.clipboardHistory.length - 1; i >= 0; i--) {
      const item = this.clipboardHistory[i];
      if (typeof item.text === "string") return item.text;
    }
    return "";
  }

  /** Adds a clipboard item to history. */
  private addToHistory(
    item: Partial<ClipboardItem>,
    expiryTime?: number
  ): void {
    const fullItem: ClipboardItem = {
      key: item.key,
      text: item.text,
      file: item.file,
      timestamp: Date.now(),
      pinned: false,
      tags: item.tags ? [...item.tags] : [],
    };
    this.clipboardHistory.push(fullItem);

    if (expiryTime) {
      const timer = setTimeout(() => {
        this.removeExpiredItem(fullItem);
      }, expiryTime);
      // Don't keep a Node process alive solely for an expiry timer.
      (timer as { unref?: () => void }).unref?.();
    }
  }

  /**
   * Removes an expired clipboard item unless it has been pinned, in which
   * case it is preserved (pinning protects items from expiry, new in 1.2.0).
   */
  private removeExpiredItem(item: ClipboardItem): void {
    if (item.pinned) return;
    this.clipboardHistory = this.clipboardHistory.filter(
      (historyItem) => historyItem !== item
    );
    this.notifyListeners("expire", item.text || "");
  }

  /**
   * Retrieves clipboard history or a specific item by key.
   *
   * Unchanged from 1.1.x: returns the full history array when called with no
   * argument, the matching item when called with a key, or `[]` when a key
   * isn't found. (The empty-array-on-miss quirk is preserved for compatibility;
   * it will be cleaned up in 2.0.0.)
   */
  getHistory(key?: string): ClipboardItem | ClipboardItem[] {
    if (key) {
      return this.clipboardHistory.find((item) => item.key === key) || [];
    }
    return [...this.clipboardHistory];
  }

  /**
   * Search the clipboard history. New in 1.2.0.
   *
   * Matches against item text (case-insensitive substring), key, and tags.
   * Returns matching items, most-recent-first. An empty/whitespace query
   * returns the whole history (most-recent-first).
   */
  search(query: string): ClipboardItem[] {
    const q = query.trim().toLowerCase();
    const ordered = [...this.clipboardHistory].reverse();
    if (!q) return ordered;
    return ordered.filter((item) => {
      const inText = item.text?.toLowerCase().includes(q) ?? false;
      const inKey = item.key?.toLowerCase().includes(q) ?? false;
      const inTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      return inText || inKey || inTags;
    });
  }

  /**
   * Pin an item by key so it survives expiry and future eviction. New in 1.2.0.
   * Returns `true` if an item was found and pinned.
   */
  pin(key: string): boolean {
    const item = this.clipboardHistory.find((i) => i.key === key);
    if (!item) return false;
    item.pinned = true;
    return true;
  }

  /**
   * Remove the pin from an item by key. New in 1.2.0.
   * Returns `true` if an item was found and unpinned.
   */
  unpin(key: string): boolean {
    const item = this.clipboardHistory.find((i) => i.key === key);
    if (!item) return false;
    item.pinned = false;
    return true;
  }

  /**
   * Add one or more tags to an item by key. New in 1.2.0. Tags are
   * de-duplicated. Returns `true` if an item was found and tagged.
   */
  tag(key: string, ...tags: string[]): boolean {
    const item = this.clipboardHistory.find((i) => i.key === key);
    if (!item) return false;
    const existing = new Set(item.tags ?? []);
    for (const t of tags) existing.add(t);
    item.tags = [...existing];
    return true;
  }

  /**
   * Return every item carrying the given tag, most-recent-first. New in 1.2.0.
   */
  getByTag(tag: string): ClipboardItem[] {
    return [...this.clipboardHistory]
      .reverse()
      .filter((item) => item.tags?.includes(tag) ?? false);
  }

  /** Adds an event listener for clipboard events ('copy', 'expire'). */
  on(event: string, callback: ClipboardEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /** Notifies event listeners of clipboard changes. */
  private notifyListeners(event: string, data: string | Blob): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Clears the clipboard history.
   *
   * Behaviour is unchanged from 1.1.x: this clears the entire history,
   * including pinned items. Pinning protects items from *expiry*, not from an
   * explicit `clearHistory()` call. (Pin-aware clearing is planned for 2.0.0.)
   */
  clearHistory(): void {
    this.clipboardHistory = [];
  }

  /** Checks if the system clipboard API is supported. */
  static isClipboardSupported(): boolean {
    return clipboardAvailable();
  }
}

export default Clipify;
