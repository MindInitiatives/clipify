# Clipify

Clipify is a modern JavaScript library designed to enhance clipboard management. It allows users to store, retrieve, and securely manage clipboard content with advanced features like history tracking, automatic expiry of sensitive data, and event-based notifications for clipboard changes.

## Features

- **Clipboard History**: Store multiple clipboard items and retrieve them later.
- **Sensitive Data Expiry**: Automatically expiring sensitive data for security.
- **Event-based Notifications**: Listen for clipboard changes in real time.
- **Multiple File Support**: Support for storing various file types such as text, images, and documents.
- **Data Access**: Retrieve specific or recent clipboard items easily.

## Installation

You can install Clipify via npm:

```bash
npm install clipify
```

Alternatively, you can use it directly in your browser via a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/clipify/dist/clipify.min.js"></script>
```

## Usage

### Storing and Retrieving Clipboard Items

Clipify allows you to store multiple clipboard items and access them when needed.

```javascript
// Import Clipify
import Clipify from 'clipify';

// Create an instance
const clipify = new Clipify();

// Store a clipboard item
clipify.store('Hello, World!');

// Retrieve the most recent clipboard item
const item = clipify.retrieve();
console.log(item); // "Hello, World!"
```

### Listening to Clipboard Changes

You can listen to clipboard changes and get notified every time the clipboard content changes.

```javascript
clipify.on('change', (newItem) => {
  console.log('Clipboard changed:', newItem);
});
```

### Secure Auto-expiry for Sensitive Data

Set expiration time for sensitive data to automatically delete it after a specified time.

```javascript
clipify.store('Sensitive data', { expireAfter: 5000 }); // Expires after 5 seconds
```

## Example

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
  <button id="store-btn">Store Clipboard</button>
  <button id="retrieve-btn">Retrieve Clipboard</button>
  
  <script src="https://cdn.jsdelivr.net/npm/clipify/dist/clipify.min.js"></script>
  <script>
    const clipify = new Clipify();

    document.getElementById('store-btn').addEventListener('click', () => {
      const textToStore = 'Clipboard Text Example';
      clipify.store(textToStore);
      alert('Clipboard item stored!');
    });

    document.getElementById('retrieve-btn').addEventListener('click', () => {
      const item = clipify.retrieve();
      alert('Retrieved Clipboard: ' + item);
    });
  </script>
</body>
</html>
```

## License

Clipify is open source and available under the [MIT License](LICENSE).

---

Feel free to adjust the content based on your specific implementation or add additional features as needed!