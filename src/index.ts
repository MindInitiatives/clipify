type ClipboardItem = {
    text: string;
    timestamp: number;
  };
  
  type ClipboardEventListener = (data: string) => void;
  
  class Clipify {
    private clipboardHistory: ClipboardItem[] = [];
    private eventListeners: Map<string, ClipboardEventListener[]> = new Map();
  
    constructor() {}
  
    /**
     * Copies text to the clipboard and stores it in the clipboard history.
     * @param {string} text - The text to copy.
     * @param {number} [expiryTime] - Optional expiry time in milliseconds.
     */
    async copy(text: string, expiryTime?: number): Promise<void> {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported in this browser.');
      }
  
      try {
        await navigator.clipboard.writeText(text);
        this.addToHistory(text, expiryTime);
        this.notifyListeners('copy', text);
        console.log(`Copied to clipboard: ${text}`);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  
    /**
     * Reads the most recent text from the clipboard.
     * @returns {Promise<string>} - The most recent clipboard text.
     */
    async paste(): Promise<string> {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported in this browser.');
      }
  
      try {
        const text = await navigator.clipboard.readText();
        console.log(`Pasted from clipboard: ${text}`);
        return text;
      } catch (err) {
        console.error('Failed to paste text:', err);
        throw err;
      }
    }
  
    /**
     * Adds text to the clipboard history and sets an expiry if specified.
     * @param {string} text - The text to store.
     * @param {number} [expiryTime] - Expiry time in milliseconds.
     */
    private addToHistory(text: string, expiryTime?: number): void {
      const item: ClipboardItem = { text, timestamp: Date.now() };
      this.clipboardHistory.push(item);
  
      if (expiryTime) {
        setTimeout(() => {
          this.removeExpiredItem(item);
        }, expiryTime);
      }
    }
  
    /**
     * Removes expired clipboard items.
     * @param {ClipboardItem} item - The item to remove.
     */
    private removeExpiredItem(item: ClipboardItem): void {
      this.clipboardHistory = this.clipboardHistory.filter(
        (historyItem) => historyItem !== item
      );
      this.notifyListeners('expire', item.text);
      console.log(`Expired clipboard item removed: ${item.text}`);
    }
  
    /**
     * Retrieves clipboard history or a specific item by index.
     * @param {number} [index] - Optional index to retrieve a specific item.
     * @returns {ClipboardItem | ClipboardItem[]} - Full history or a specific clipboard item.
     */
    getHistory(index?: number): ClipboardItem | ClipboardItem[] {
      if (index !== undefined) {
        return this.clipboardHistory[index] || null;
      }
      return [...this.clipboardHistory];
    }
  
    /**
     * Adds an event listener for clipboard events.
     * @param {string} event - Event type ('copy', 'expire').
     * @param {ClipboardEventListener} callback - Callback function.
     */
    on(event: string, callback: ClipboardEventListener): void {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
  
      this.eventListeners.get(event)?.push(callback);
    }
  
    /**
     * Notifies event listeners of clipboard changes.
     * @param {string} event - Event type.
     * @param {string} data - Event data.
     */
    private notifyListeners(event: string, data: string): void {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.forEach((listener) => listener(data));
      }
    }
  
    /**
     * Clears the clipboard history.
     */
    clearHistory(): void {
      this.clipboardHistory = [];
      console.log('Clipboard history cleared.');
    }
  
    /**
     * Checks if clipboard access is supported.
     * @returns {boolean} - Whether clipboard access is supported.
     */
    static isClipboardSupported(): boolean {
      return !!navigator.clipboard;
    }
  }
  
  // Export the library for use in other projects
  export default Clipify;
  