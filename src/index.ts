type ClipboardItem = {
  key?: string; // Optional key or name for the clipboard item
  text?: string; // Text content
  file?: Blob; // Optional file content (images, documents)
  timestamp: number; // When the item was stored
};

type ClipboardEventListener = (data: string | Blob) => void;

type ClipboardOptions = {
  text: string;        // Required: the text to copy
  expiryTime?: number; // Optional: the expiry time for the clipboard item
  key?: string;        // Optional: a key for identifying the clipboard item
};

class Clipify {
  private clipboardHistory: ClipboardItem[] = [];
  private eventListeners: Map<string, ClipboardEventListener[]> = new Map();

  constructor() {}

  /**
   * Copies text to the clipboard and stores it in the clipboard history.
   * @param {ClipboardOptions} options - The options for copy.
   */
  async copy(options: ClipboardOptions): Promise<void> {
    const { text, expiryTime, key } = options;
    if (!text) {
      throw new Error("Text is required to copy to clipboard.");
    }

    if (!navigator.clipboard) {
      throw new Error("Clipboard API not supported in this browser.");
    }

    try {
      await navigator.clipboard.writeText(text);
      this.addToHistory({ text, key }, expiryTime);
      this.notifyListeners("copy", text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }
  

  /**
   * Copies a file (image, document) to the clipboard and stores it in history.
   * @param {Blob} file - The file to copy.
   * @param {string} [key] - Optional key to identify the clipboard item.
   */
  async copyFile(file: Blob, key?: string): Promise<void> {
    try {
      this.addToHistory({ file, key });
      console.log("File added to clipboard history.");
    } catch (err) {
      console.error("Failed to copy file:", err);
    }
  }

  /**
   * Reads the most recent text from the clipboard.
   * @returns {Promise<string>} - The most recent clipboard text.
   */
  async paste(): Promise<string> {
    if (!navigator.clipboard) {
      throw new Error("Clipboard API not supported in this browser.");
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Adds a clipboard item to history.
   * @param {Partial<ClipboardItem>} item - The clipboard item to store.
   * @param {number} [expiryTime] - Expiry time in milliseconds.
   */
  private addToHistory(
    item: Partial<ClipboardItem>,
    expiryTime?: number
  ): void {
    const fullItem: ClipboardItem = {
      key: item.key,
      text: item.text,
      file: item.file,
      timestamp: Date.now(),
    };
    this.clipboardHistory.push(fullItem);

    if (expiryTime) {
      setTimeout(() => {
        this.removeExpiredItem(fullItem);
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
    this.notifyListeners("expire", item.text || "");
    console.log(`Expired clipboard item removed: ${item.text || item.key}`);
  }

  /**
   * Retrieves clipboard history or a specific item by key.
   * @param {string} [key] - Optional key to retrieve a specific item.
   * @returns {ClipboardItem | ClipboardItem[]} - Full history or a specific clipboard item.
   */
  getHistory(key?: string): ClipboardItem | ClipboardItem[] {
    if (key) {
      return this.clipboardHistory.find((item) => item.key === key) || [];
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
   * @param {string | Blob} data - Event data.
   */
  private notifyListeners(event: string, data: string | Blob): void {
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
