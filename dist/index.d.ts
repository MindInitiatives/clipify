type ClipboardItem = {
    text: string;
    timestamp: number;
};
type ClipboardEventListener = (data: string) => void;
declare class Clipify {
    private clipboardHistory;
    private eventListeners;
    constructor();
    /**
     * Copies text to the clipboard and stores it in the clipboard history.
     * @param {string} text - The text to copy.
     * @param {number} [expiryTime] - Optional expiry time in milliseconds.
     */
    copy(text: string, expiryTime?: number): Promise<void>;
    /**
     * Reads the most recent text from the clipboard.
     * @returns {Promise<string>} - The most recent clipboard text.
     */
    paste(): Promise<string>;
    /**
     * Adds text to the clipboard history and sets an expiry if specified.
     * @param {string} text - The text to store.
     * @param {number} [expiryTime] - Expiry time in milliseconds.
     */
    private addToHistory;
    /**
     * Removes expired clipboard items.
     * @param {ClipboardItem} item - The item to remove.
     */
    private removeExpiredItem;
    /**
     * Retrieves clipboard history or a specific item by index.
     * @param {number} [index] - Optional index to retrieve a specific item.
     * @returns {ClipboardItem | ClipboardItem[]} - Full history or a specific clipboard item.
     */
    getHistory(index?: number): ClipboardItem | ClipboardItem[];
    /**
     * Adds an event listener for clipboard events.
     * @param {string} event - Event type ('copy', 'expire').
     * @param {ClipboardEventListener} callback - Callback function.
     */
    on(event: string, callback: ClipboardEventListener): void;
    /**
     * Notifies event listeners of clipboard changes.
     * @param {string} event - Event type.
     * @param {string} data - Event data.
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
