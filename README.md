# Accessible - Chrome Extension

A simple Chrome extension that displays a "Hello World" message and reads it aloud via keyboard shortcut. This is the foundation for future accessibility features.

## Current Features

- **Keyboard shortcut** : `Alt+Shift+H` to trigger the action
- **Visual display** : Floating panel with "Hello World" message
- **Text-to-speech** : Automatic text reading in French
- **Accessible interface** : Screen reader compatible
- **Intuitive controls** : Buttons to read and close the panel

## Planned Accessibility Features

This extension is designed to be the foundation for comprehensive web accessibility tools. Future versions will include:

- Page content summarization
- Enhanced screen reader integration
- Focus management assistance
- Color contrast analysis
- Navigation aids for users with disabilities

## Installation

### Manual Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked extension"
5. Select the folder containing the extension files

### File Structure

```
accessible/
├── manifest.json    # Extension configuration
├── content.js       # Content script (user interface)
├── sw.js           # Service Worker (keyboard shortcuts)
└── README.md       # This file
```

## Usage

1. Once the extension is installed, navigate to any web page
2. Press `Alt+Shift+H` to trigger the action
3. A "Hello World" panel will appear in the bottom right of the page
4. The text will be automatically read aloud
5. Use the "Read" or "Close" buttons to control the panel
6. Press `Escape` to close the panel and stop reading

## Development

### Required Permissions

- `activeTab` : Access to the active tab
- `scripting` : Script injection into pages

### Architecture

- **Service Worker** (`sw.js`) : Manages keyboard shortcuts and communication with tabs
- **Content Script** (`content.js`) : Creates user interface and handles text-to-speech
- **Manifest V3** : Modern extension configuration

## Customization

To modify the displayed message, edit line 84 in `content.js` :

```javascript
el.querySelector("#pc-summary").textContent = "Your custom message";
```

To change the keyboard shortcut, modify the `manifest.json` file :

```json
"commands": {
  "show_hello": {
    "suggested_key": { "default": "Ctrl+Shift+H" },
    "description": "Your description"
  }
}
```

## Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)
- Works on all web pages

## Contributing

Contributions are welcome! Feel free to :

1. Report bugs
2. Suggest new features
3. Improve accessibility
4. Optimize performance

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Version

Current version : 0.1.0

---

*Developed as a foundation for comprehensive web accessibility tools.*
