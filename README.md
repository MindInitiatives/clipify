# Clipify: A Clipboard Management Utility

Clipify is a lightweight JavaScript/TypeScript library designed for enhanced clipboard management. It provides extended functionality for handling clipboard data, including text and files, maintaining a clipboard history, managing item expiry, and supporting event-driven clipboard updates.

---

## Features
- **Copy Text:** Copy text to the system clipboard and store it in a managed history.
- **Copy Files:** Add files (e.g., images, documents) to the clipboard history for reference.
- **Retrieve History:** Access clipboard history or specific items using keys.
- **Expiry Management:** Automatically remove clipboard items after a specified expiry time.
- **Event Handling:** Listen for clipboard events like `copy` or `expire`.
- **Clear History:** Easily clear all stored clipboard history.
- **Browser Compatibility Check:** Detect clipboard API support in the browser.

---

## Installation
### Using NPM
```bash
npm install clipify
```

### Using Yarn
```bash
yarn add clipify
```

Alternatively, you can use it directly in your browser via a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/clipify@1.1.0"></script>
```

---

## Usage
### Importing Clipify
```typescript
import Clipify from 'clipify';
```

### Initialization
```typescript
const clipboard = new Clipify();
```

---

### API Reference

#### **Copy Text**
Copies text to the clipboard and stores it in the history.
```typescript
clipboard.copy({
  text: 'Hello, world!',
  expiryTime: 5000,  // Expires after 5000ms
  key: 'greeting'
});
```

#### **Copy Files**
Stores files in the clipboard history.
```typescript
const fileBlob = new Blob(["File content"], { type: "text/plain" });
clipboard.copyFile(fileBlob, "fileKey", 10000); // Expires after 10000ms
```

#### **Paste Text**
Retrieves the most recent clipboard content.
```typescript
const text = await clipboard.paste();
console.log(text);
```

#### **Retrieve Clipboard History**
Access all stored clipboard items or specific ones by their key.
```typescript
// Get all history
const history = clipboard.getHistory();
console.log(history);

// Get specific item
const item = clipboard.getHistory("greeting");
console.log(item);
```

#### **Clear Clipboard History**
Removes all clipboard history items.
```typescript
clipboard.clearHistory();
```

#### **Add Event Listeners**
Listen to clipboard events (`copy`, `expire`).
```typescript
clipboard.on("copy", (data) => {
  console.log("Copied:", data);
});

clipboard.on("expire", (data) => {
  console.log("Expired:", data);
});
```

#### **Check Clipboard Support**
Verify if the browser supports clipboard APIs.
```typescript
if (Clipify.isClipboardSupported()) {
  console.log("Clipboard API is supported!");
} else {
  console.log("Clipboard API is not supported.");
}
```

---

## Example Use Case

```typescript
import Clipify from 'clipify';

const clipboard = new Clipify();

// Copy text
clipboard.copy({
  text: "Important Note",
  expiryTime: 6000,  // Expires after 6000ms
  key: "note"
});

// Listen for copy events
clipboard.on("copy", (data) => {
  console.log(`Copied to clipboard: ${data}`);
});

// Get specific clipboard history item
const note = clipboard.getHistory("note");
console.log("Retrieved clipboard item:", note);

// Clear all clipboard history
clipboard.clearHistory();
```

Here’s an example demonstrating how to use Clipify in a browser-based project:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>clipify Example</title>
</head>
<body>
  <button id="copy-btn">Store Clipboard</button>
  <button id="history-btn">Retrieve Clipboard</button>
  
  <script src="https://cdn.jsdelivr.net/npm/clipify@1.1.0"></script>
  <script>
    const clipify = new Clipify();

    document.getElementById('copy-btn').addEventListener('click', () => {
      const textToStore = 'Clipboard Text Example';
      clipboard.copy({
        text: textToStore
      });
      clipify.copy(textToCopy);
      alert('Clipboard item stored!');
    });

    document.getElementById('history-btn').addEventListener('click', () => {
      const history = clipboard.getHistory();
      console.log(history);
    });
  </script>
</body>
</html>
```

---

## Browser Support
Clipify uses the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) to manage clipboard actions. Ensure the browser supports `navigator.clipboard` for full functionality.

---

## Contributions
Contributions, issues, and feature requests are welcome! Please submit them via [GitHub Issues](https://github.com/MindInitiatives/clipify/issues).

---

## License
Clipify is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the [`LICENSE`](https://github.com/MindInitiatives/clipify/blob/main/LICENSE) file for details.