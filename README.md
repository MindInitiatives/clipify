# Clipify: A Clipboard Management Utility

Clipify is a lightweight JavaScript/TypeScript library designed for enhanced
clipboard management. It provides extended functionality for handling clipboard
data, including text and files, maintaining a clipboard history, managing item
expiry, and supporting event-driven clipboard updates.

As of **1.2.0** it is also **SSR/Node-safe** and adds **search, pinning, and
tags** - without breaking any existing API.

```typescript
import Clipify from "clipify";

const clipboard = new Clipify();
await clipboard.copy({ text: "hello", key: "greeting", expiryTime: 5000 });
clipboard.search("hello");   // find it later
clipboard.pin("greeting");   // protect it from expiry
```

---

## Features

- **Copy Text:** Copy text to the system clipboard and store it in a managed history.
- **Copy Files:** Add files (e.g. images, documents) to the clipboard history, with optional expiry.
- **Retrieve History:** Access clipboard history or specific items using keys.
- **Search History:** Find items by text, key, or tag. *(new in 1.2.0)*
- **Pin Items:** Keep important items from expiring or being cleared. *(new in 1.2.0)*
- **Tag Items:** Group and filter items with freeform tags. *(new in 1.2.0)*
- **Expiry Management:** Automatically remove clipboard items after a specified expiry time.
- **Event Handling:** Listen for clipboard events like `copy` or `expire`.
- **Clear History:** Easily clear all stored clipboard history.
- **SSR / Node Safe:** Import and use on the server without crashing. *(new in 1.2.0)*
- **Browser Compatibility Check:** Detect clipboard API support in the browser.

---

## Installation

```bash
npm install clipify
# or
yarn add clipify
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/clipify@1.2.0"></script>
```

---

## Usage

### Importing and initializing

```ts
import Clipify from "clipify";

const clipboard = new Clipify();
```

### API Reference

#### Copy Text

```ts
clipboard.copy({
  text: "Hello, world!",
  expiryTime: 5000, // optional: expires after 5000ms
  key: "greeting",  // optional
});
```

In a browser this also writes to the system clipboard. In Node/SSR (no system
clipboard) it records to history only, so the same code runs everywhere.

#### Copy Files

```ts
const fileBlob = new Blob(["File content"], { type: "text/plain" });
clipboard.copyFile(fileBlob, "fileKey", 10000); // optional expiry, now supported
```

#### Paste Text

```ts
const text = await clipboard.paste();
```

In a browser this reads the live system clipboard. Without a system clipboard it
returns the most recent text item from history.

#### Retrieve Clipboard History

```ts
const history = clipboard.getHistory();      // all items
const item = clipboard.getHistory("greeting"); // by key
```

#### Search History *(new in 1.2.0)*

Search across text, key, and tags (case-insensitive), most-recent-first:

```ts
const results = clipboard.search("invoice");
```

#### Pin / Unpin *(new in 1.2.0)*

Pinned items survive expiry and are kept when history is cleared:

```ts
clipboard.pin("greeting");
clipboard.unpin("greeting");
```

#### Tag Items *(new in 1.2.0)*

```ts
clipboard.tag("greeting", "work", "important");
const workItems = clipboard.getByTag("work");
```

#### Clear Clipboard History

```ts
clipboard.clearHistory(); // clears everything
```

Note: pinning protects an item from *expiry*, not from an explicit
`clearHistory()` call. Pin-aware clearing is planned for 2.0.0.

#### Add Event Listeners

```ts
clipboard.on("copy", (data) => console.log("Copied:", data));
clipboard.on("expire", (data) => console.log("Expired:", data));
```

#### Check Clipboard Support

```ts
if (Clipify.isClipboardSupported()) {
  console.log("Clipboard API is supported!");
}
```

---

## Example Use Case

```ts
import Clipify from "clipify";

const clipboard = new Clipify();

clipboard.copy({ text: "Important Note", expiryTime: 6000, key: "note" });
clipboard.tag("note", "reminders");
clipboard.pin("note"); // keep it past its expiry

clipboard.on("copy", (data) => console.log(`Copied: ${data}`));

const reminders = clipboard.getByTag("reminders");
console.log(reminders);
```

A browser example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Clipify Example</title>
  </head>
  <body>
    <button id="copy-btn">Store Clipboard</button>
    <button id="history-btn">Retrieve Clipboard</button>

    <script src="https://cdn.jsdelivr.net/npm/clipify@1.2.0"></script>
    <script>
      const clipboard = new Clipify();

      document.getElementById("copy-btn").addEventListener("click", () => {
        clipboard.copy({ text: "Clipboard Text Example" });
        alert("Clipboard item stored!");
      });

      document.getElementById("history-btn").addEventListener("click", () => {
        console.log(clipboard.getHistory());
      });
    </script>
  </body>
</html>
```

---

## Browser Support

Clipify uses the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
to manage system clipboard actions in the browser. Where `navigator.clipboard`
is unavailable (older browsers, Node, SSR), Clipify gracefully manages history
in memory instead of failing.

---

## Contributions

Contributions, issues, and feature requests are welcome via
[GitHub Issues](https://github.com/MindInitiatives/clipify/issues).

---

## License

Clipify is licensed under the [MIT License](https://opensource.org/licenses/MIT).
