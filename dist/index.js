"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Clipify {
    constructor() {
        this.clipboardHistory = [];
        this.eventListeners = new Map();
    }
    /**
     * Copies text to the clipboard and stores it in the clipboard history.
     * @param {ClipboardOptions} options - The options for copy.
     */
    copy(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, expiryTime, key } = options;
            if (!text) {
                throw new Error("Text is required to copy to clipboard.");
            }
            if (!navigator.clipboard) {
                throw new Error("Clipboard API not supported in this browser.");
            }
            try {
                yield navigator.clipboard.writeText(text);
                this.addToHistory({ text, key }, expiryTime);
                this.notifyListeners("copy", text);
            }
            catch (err) {
                console.error("Failed to copy text:", err);
            }
        });
    }
    /**
     * Copies a file (image, document) to the clipboard and stores it in history.
     * @param {Blob} file - The file to copy.
     * @param {string} [key] - Optional key to identify the clipboard item.
     */
    copyFile(file, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.addToHistory({ file, key });
                console.log("File added to clipboard history.");
            }
            catch (err) {
                console.error("Failed to copy file:", err);
            }
        });
    }
    /**
     * Reads the most recent text from the clipboard.
     * @returns {Promise<string>} - The most recent clipboard text.
     */
    paste() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.clipboard) {
                throw new Error("Clipboard API not supported in this browser.");
            }
            try {
                const text = yield navigator.clipboard.readText();
                return text;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Adds a clipboard item to history.
     * @param {Partial<ClipboardItem>} item - The clipboard item to store.
     * @param {number} [expiryTime] - Expiry time in milliseconds.
     */
    addToHistory(item, expiryTime) {
        const fullItem = {
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
    removeExpiredItem(item) {
        this.clipboardHistory = this.clipboardHistory.filter((historyItem) => historyItem !== item);
        this.notifyListeners("expire", item.text || "");
        console.log(`Expired clipboard item removed: ${item.text || item.key}`);
    }
    /**
     * Retrieves clipboard history or a specific item by key.
     * @param {string} [key] - Optional key to retrieve a specific item.
     * @returns {ClipboardItem | ClipboardItem[]} - Full history or a specific clipboard item.
     */
    getHistory(key) {
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
    on(event, callback) {
        var _a;
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        (_a = this.eventListeners.get(event)) === null || _a === void 0 ? void 0 : _a.push(callback);
    }
    /**
     * Notifies event listeners of clipboard changes.
     * @param {string} event - Event type.
     * @param {string | Blob} data - Event data.
     */
    notifyListeners(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach((listener) => listener(data));
        }
    }
    /**
     * Clears the clipboard history.
     */
    clearHistory() {
        this.clipboardHistory = [];
    }
    /**
     * Checks if clipboard access is supported.
     * @returns {boolean} - Whether clipboard access is supported.
     */
    static isClipboardSupported() {
        return !!navigator.clipboard;
    }
}
// Export the library for use in other projects
exports.default = Clipify;
