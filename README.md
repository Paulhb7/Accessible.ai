# Accessible 🧠🌍

![Accessible AI Preview](https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/003/921/473/datas/medium.png)

**Making the web inclusive and accessible with multimodal GenAI**

A Chrome extension designed to make web content more accessible for people with visual impairments, dyslexia, and ADHD. This extension leverages Chrome's Language Model API to provide intelligent assistance through text-to-speech, speech-to-speech, and AI-powered content analysis.

## 🌟 Features

### For Visually Impaired Users

1. **Page Summary** (`Alt+Shift+H` / `Cmd+Shift+H` on Mac)
   - Automatically generates a structured summary of the current page
   - Reads the summary aloud automatically
   - Perfect for quickly understanding page content without visual reading

2. **Voice Question** (`Alt+Shift+Q` / `Cmd+Shift+Q` on Mac)
   - Ask questions about the page content using voice
   - Displays the transcribed question for confirmation
   - Automatically sends the question and reads the AI response aloud
   - Full hands-free interaction

### For Users with Dyslexia/ADHD

3. **Question Interface** (`Alt+Shift+A` / `Cmd+Shift+A` on Mac)
   - Interactive interface to ask questions about page content
   - Supports both text input and voice input
   - Clear, readable interface with soft blue theme
   - Get answers based only on the current page content

## 🎨 Design

- **Soft blue gradient theme** - Gentle on the eyes, promoting focus
- **Smooth blur effect** - Background blur when interfaces are open
- **Clean typography** - Simple, readable Arial font
- **Accessible UI** - High contrast, clear buttons, keyboard navigation

## 🚀 Installation

### Prerequisites

- **Chrome 138+** (required for Language Model API)
- Desktop version (Mobile Chrome doesn't support the Language Model API)
- Sufficient RAM and disk space for the AI model

### Steps

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the folder containing the extension files
6. The extension is now installed and ready to use!

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|----------|-------------|
| `Alt+Shift+H` (Windows/Linux)<br>`Cmd+Shift+H` (Mac) | Summarize the current page (for visually impaired users) |
| `Alt+Shift+Q` (Windows/Linux)<br>`Cmd+Shift+Q` (Mac) | Ask a voice question about the page (for visually impaired users) |
| `Alt+Shift+A` (Windows/Linux)<br>`Cmd+Shift+A` (Mac) | Open question interface (for users with dyslexia/ADHD) |
| `Esc` | Close any open interface |

## 🎯 How It Works

1. **Content Extraction**: The extension extracts text from the current page (or selected text if available)
2. **AI Processing**: Uses Chrome's built-in Language Model API to analyze and respond
3. **Accessibility Features**:
   - Text-to-speech for responses
   - Speech-to-text for voice questions
   - Visual confirmation of transcribed text
   - Automatic audio feedback

## 📋 Requirements

- **Chrome 138+** - Required for Language Model API support
- **Desktop Chrome** - Mobile versions don't support this API
- **Internet connection** - For initial model download (if needed)
- **Permissions**:
  - `activeTab` - To read page content
  - `scripting` - To inject content scripts
  - `notifications` - For error messages

## 🔒 Privacy & Security

- All processing happens **locally** using Chrome's built-in Language Model API
- **No data is sent to external servers**
- Page content is processed only in your browser
- The extension only accesses pages you explicitly interact with

## 🐛 Troubleshooting

### Extension doesn't work?

1. **Check Chrome version**: Ensure you have Chrome 138 or higher
   - Go to `chrome://version/` to check

2. **Verify installation**: Check that the extension is enabled in `chrome://extensions/`

3. **Check page compatibility**: The extension doesn't work on Chrome system pages (`chrome://`, `about:`, etc.)
   - Navigate to a regular webpage (http:// or https://)

4. **Model availability**: If you see "Model unavailable", try:
   - Restarting Chrome
   - Ensuring sufficient disk space and RAM
   - Waiting a moment and trying again (model may be downloading)

### Speech recognition not working?

- Ensure your microphone permissions are granted
- Check that your browser supports Web Speech API
- Try refreshing the page and trying again

### Text-to-speech not working?

- Check your browser's speech synthesis settings
- Ensure system volume is up
- Try using the "Read" button instead of automatic reading

## 📝 Notes

- The Language Model API is currently **experimental** and may vary in availability
- First use may require downloading the model (progress shown in console)
- The extension works best with text-heavy pages
- Selected text takes priority over full page content

## 🤝 Contributing

This extension is designed with accessibility in mind. If you have suggestions for improvements, especially regarding accessibility features, please feel free to contribute!

## 📄 License

This project is created for accessibility purposes. Use and modify as needed to help make the web more accessible.

## 🙏 Credits

Built with Chrome's Language Model API, Web Speech API, and a focus on inclusive design.

---

**Accessible 🧠🌍 - Making the web inclusive and accessible with AI agents**

