type ClipboardItem = {
    key?: string;
    text?: string;
    file?: Blob;
    timestamp: number;
};
type ClipboardEventListener = (data: string | Blob) => void;
type ClipboardOptions = {
    text: string;
    expiryTime?: number;
    key?: string;
};
declare class Clipify {
    private clipboardHistory;
    private eventListeners;
    constructor();
    /**
     * Copies text to the clipboard and stores it in the clipboard history.
     * @param {ClipboardOptions} options - The options for copy.
     */
    copy(options: ClipboardOptions): Promise<void>;
    /**
     * Copies a file (image, document) to the clipboard and stores it in history.
     * @param {Blob} file - The file to copy.
     * @param {string} [key] - Optional key to identify the clipboard item.
     */
    copyFile(file: Blob, key?: string): Promise<void>;
    /**
     * Reads the most recent text from the clipboard.
     * @returns {Promise<string>} - The most recent clipboard text.
     */
    paste(): Promise<string>;
    /**
     * Adds a clipboard item to history.
     * @param {Partial<ClipboardItem>} item - The clipboard item to store.
     * @param {number} [expiryTime] - Expiry time in milliseconds.
     */
    private addToHistory;
    /**
     * Removes expired clipboard items.
     * @param {ClipboardItem} item - The item to remove.
     */
    private removeExpiredItem;
    /**
     * Retrieves clipboard history or a specific item by key.
     * @param {string} [key] - Optional key to retrieve a specific item.
     * @returns {ClipboardItem | ClipboardItem[]} - Full history or a specific clipboard item.
     */
    getHistory(key?: string): ClipboardItem | ClipboardItem[];
    /**
     * Adds an event listener for clipboard events.
     * @param {string} event - Event type ('copy', 'expire').
     * @param {ClipboardEventListener} callback - Callback function.
     */
    on(event: string, callback: ClipboardEventListener): void;
    /**
     * Notifies event listeners of clipboard changes.
     * @param {string} event - Event type.
     * @param {string | Blob} data - Event data.
     */
    private notifyListeners;
    /**
     * Clears the clipboard history.
     */
    clearHistory(): void;
    /**
     * Checks if clipboard access is supported.
     * @returns {boolean} - Whether clipboard access is supported.
     */
    static isClipboardSupported(): boolean;
}
export default Clipify;
