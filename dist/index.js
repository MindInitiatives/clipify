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
     * @param {string} text - The text to copy.
     * @param {number} [expiryTime] - Optional expiry time in milliseconds.
     */
    copy(text, expiryTime) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.clipboard) {
                throw new Error('Clipboard API not supported in this browser.');
            }
            try {
                yield navigator.clipboard.writeText(text);
                this.addToHistory(text, expiryTime);
                this.notifyListeners('copy', text);
                console.log(`Copied to clipboard: ${text}`);
            }
            catch (err) {
                console.error('Failed to copy text:', err);
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
                throw new Error('Clipboard API not supported in this browser.');
            }
            try {
                const text = yield navigator.clipboard.readText();
                console.log(`Pasted from clipboard: ${text}`);
                return text;
            }
            catch (err) {
                console.error('Failed to paste text:', err);
                throw err;
            }
        });
    }
    /**
     * Adds text to the clipboard history and sets an expiry if specified.
     * @param {string} text - The text to store.
     * @param {number} [expiryTime] - Expiry time in milliseconds.
     */
    addToHistory(text, expiryTime) {
        const item = { text, timestamp: Date.now() };
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
    removeExpiredItem(item) {
        this.clipboardHistory = this.clipboardHistory.filter((historyItem) => historyItem !== item);
        this.notifyListeners('expire', item.text);
        console.log(`Expired clipboard item removed: ${item.text}`);
    }
    /**
     * Retrieves clipboard history or a specific item by index.
     * @param {number} [index] - Optional index to retrieve a specific item.
     * @returns {ClipboardItem | ClipboardItem[]} - Full history or a specific clipboard item.
     */
    getHistory(index) {
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
     * @param {string} data - Event data.
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
        console.log('Clipboard history cleared.');
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
