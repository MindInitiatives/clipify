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
declare class Clipify {
    private clipboardHistory;
    private eventListeners;
    constructor();
    /**
     * Copies text to the system clipboard (when available) and stores it in the
     * clipboard history.
     *
     * Behaviour change in 1.2.0 (non-breaking): instead of throwing when the
     * Clipboard API is missing, `copy` now still records the item in history so
     * the library is usable in Node/SSR and in restricted browser contexts. The
     * `copy` event fires either way.
     */
    copy(options: ClipboardOptions): Promise<void>;
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
    copyFile(file: Blob, key?: string, expiryTime?: number): Promise<void>;
    /**
     * Reads the most recent text from the system clipboard.
     *
     * 1.2.0 (non-breaking): when no system clipboard is available, instead of
     * throwing, this falls back to the most recent text item in history (or an
     * empty string if there is none). In a browser the behaviour is unchanged.
     */
    paste(): Promise<string>;
    /** Adds a clipboard item to history. */
    private addToHistory;
    /**
     * Removes an expired clipboard item unless it has been pinned, in which
     * case it is preserved (pinning protects items from expiry, new in 1.2.0).
     */
    private removeExpiredItem;
    /**
     * Retrieves clipboard history or a specific item by key.
     *
     * Unchanged from 1.1.x: returns the full history array when called with no
     * argument, the matching item when called with a key, or `[]` when a key
     * isn't found. (The empty-array-on-miss quirk is preserved for compatibility;
     * it will be cleaned up in 2.0.0.)
     */
    getHistory(key?: string): ClipboardItem | ClipboardItem[];
    /**
     * Search the clipboard history. New in 1.2.0.
     *
     * Matches against item text (case-insensitive substring), key, and tags.
     * Returns matching items, most-recent-first. An empty/whitespace query
     * returns the whole history (most-recent-first).
     */
    search(query: string): ClipboardItem[];
    /**
     * Pin an item by key so it survives expiry and future eviction. New in 1.2.0.
     * Returns `true` if an item was found and pinned.
     */
    pin(key: string): boolean;
    /**
     * Remove the pin from an item by key. New in 1.2.0.
     * Returns `true` if an item was found and unpinned.
     */
    unpin(key: string): boolean;
    /**
     * Add one or more tags to an item by key. New in 1.2.0. Tags are
     * de-duplicated. Returns `true` if an item was found and tagged.
     */
    tag(key: string, ...tags: string[]): boolean;
    /**
     * Return every item carrying the given tag, most-recent-first. New in 1.2.0.
     */
    getByTag(tag: string): ClipboardItem[];
    /** Adds an event listener for clipboard events ('copy', 'expire'). */
    on(event: string, callback: ClipboardEventListener): void;
    /** Notifies event listeners of clipboard changes. */
    private notifyListeners;
    /**
     * Clears the clipboard history.
     *
     * Behaviour is unchanged from 1.1.x: this clears the entire history,
     * including pinned items. Pinning protects items from *expiry*, not from an
     * explicit `clearHistory()` call. (Pin-aware clearing is planned for 2.0.0.)
     */
    clearHistory(): void;
    /** Checks if the system clipboard API is supported. */
    static isClipboardSupported(): boolean;
}
export default Clipify;
