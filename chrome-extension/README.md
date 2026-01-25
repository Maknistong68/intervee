# INTERVEE Chrome Extension

Quick access to the INTERVEE OSH Interview Assistant from your browser.

## Features

- Open INTERVEE in current tab or new tab
- Save language preference (EN/FIL/MIX)
- Configure custom app URL
- Quick tips for using the app

## Installation

### Developer Mode (Local)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder from INTERVEE
5. The extension will appear in your extensions list

### Icons

Before loading the extension, add icon files to the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor to create these icons. A simple green circle with a microphone or "I" logo works well.

### Quick Icon Generation (Optional)

You can generate placeholder icons using this online tool:
1. Go to https://favicon.io/favicon-generator/
2. Enter "I" as text
3. Set background to #4CAF50 (green)
4. Download and extract the icons

## Usage

1. Click the INTERVEE extension icon in your browser toolbar
2. Click "Open INTERVEE" to open in current tab, or "Open in New Tab"
3. Select your preferred language (EN/FIL/MIX)
4. Configure the App URL if running locally or using a custom deployment

## Configuration

- **App URL**: Default is `http://localhost:3000`. Change this if you're using a deployed version.
- **Language**: Preference synced with Chrome storage

## Development

The extension uses:
- Manifest V3
- Chrome Storage Sync API
- Service Worker for background tasks

### Files

- `manifest.json` - Extension configuration
- `popup.html` - Popup UI
- `popup.css` - Popup styles
- `popup.js` - Popup functionality
- `background.js` - Service worker

## Troubleshooting

**Extension not loading?**
- Make sure all icon files exist in the `icons/` folder
- Check Chrome's extension errors page

**Can't connect to app?**
- Verify the App URL is correct
- Ensure INTERVEE is running locally or deployed

**Settings not saving?**
- Check if Chrome sync is enabled
- Try reinstalling the extension
