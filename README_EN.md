# 📺 Packt Video Subtitle Real-time Synchronizer

A Chrome browser extension that real-time synchronizes translated video subtitle content from the Packt subscription platform and displays it on the video player.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

🔗 **Chrome Web Store**: [Install Extension](https://chromewebstore.google.com/detail/mjldodlagafglpffckeeihoniblomobl?utm_source=item-share-cb)

## ✨ Features

- 🔄 **Instant Synchronization** - Zero latency, real-time sync of immersive translation results to video display
- ⚡ **No API Required** - Reuses immersive translation extension, no need to configure translation API
- 🎯 **Smart Matching** - Automatically matches the currently playing subtitle line
- 🎨 **Beautiful Display** - Custom styles with prominent subtitle rendering
- 📐 **Customizable Subtitles** - Adjust vertical offset (0~+300px) and font size (10~40px)
- 🎛️ **Flexible Control** - Built-in toggle on video page, enable/disable sync anytime
- 🔒 **Secure & Reliable** - Runs locally only, no data sent to external servers

## 📦 Prerequisites

### Requirements

1. **Install Immersive Translate Extension**
   - Visit Chrome Web Store
   - Search for and install "Immersive Translate" extension
   - Configure extension to translate to Chinese (target language)

2. **Ensure Immersive Translate is Working**
   - Visit [Packt Subscription Platform](https://subscription.packtpub.com/)
   - Open any video and confirm the subtitle area is translated to Chinese
   - Check that subtitles appear in the right sidebar

## 📦 Installation

### Install from Source (Developer Mode)

1. **Download Source Code**
   ```bash
   git clone https://github.com/yourusername/chrome-subtitle-translator.git
   cd chrome-subtitle-translator
   ```

2. **Prepare Icon Files** (Optional)
   - Icon files are included in `icons/` directory
   - Or temporarily comment out icons configuration in `manifest.json`

3. **Load Extension to Chrome**
   - Open Chrome browser
   - Visit `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select `chrome-subtitle-translator` folder

4. **Done!** Extension icon will appear in browser toolbar

## 🚀 5-Minute Quick Start

### Prerequisites Check

Before starting, make sure:
- [ ] Chrome browser installed (version 88+)
- [ ] Have Packt subscription account (or can access Packt video pages)

### Step 1: Install Immersive Translate (2 minutes)

1. Open Chrome Web Store
2. Search "Immersive Translate" and install
3. After installation, click extension icon and ensure:
   - Extension is enabled
   - Target language is set to "Chinese"

**Verification**: Visit any English webpage and check if Chinese translation appears automatically

### Step 2: Download This Extension (30 seconds)

If you don't have the source code yet:
- Download ZIP from GitHub and extract
- Or use Git: `git clone <repo-url>`

### Step 3: Load Extension to Chrome (1 minute)

1. Open `chrome://extensions/`
2. Enable "Developer mode" in top right
3. Click "Load unpacked"
4. Select `chrome-subtitle-translator` folder

**Note**: If prompted about missing icons, you can:
- Ignore the warning (doesn't affect functionality)
- Icon files are already included in `icons/` directory

### Step 4: Test Functionality (1 minute)

1. Visit Packt video page
   For example: https://subscription.packtpub.com/video/...

2. Play the video

3. Check the following:
   - [ ] Right sidebar shows Chinese and English subtitles
   - [ ] **Chinese subtitles** appear below the video
   - [ ] Chinese subtitles update in real-time with video playback

### Success Indicators ✅

If you see:
- **Chinese subtitles** below the video
- Subtitle content synchronized with video
- Subtitle content matches right sidebar translation

**Congratulations! Installation successful! 🎉**

## 📂 Project Structure

```
chrome-subtitle-translator/
├── manifest.json              # Chrome extension configuration
├── popup/                     # Extension popup interface
│   ├── popup.html            # Settings page HTML
│   ├── popup.css             # Settings page styles
│   └── popup.js              # Settings page logic
├── content/                   # Content scripts
│   └── content.js            # Subtitle sync core logic
├── utils/                     # Utility modules
│   ├── storage.js            # Storage management
│   └── translator.js         # Translation utilities
├── icons/                     # Icon resources
│   ├── icon.svg              # SVG source icon
│   ├── icon16.png            # 16x16 icon
│   ├── icon32.png            # 32x32 icon
│   ├── icon48.png            # 48x48 icon
│   └── icon128.png           # 128x128 icon
├── background/                # Background scripts directory
├── debug-console.js          # Debug console script
└── README.md                 # Project documentation
```

## ⚙️ Technical Implementation

### Core Technologies
- **MutationObserver API** - Monitors DOM changes to detect subtitle updates
- **Chrome Extension Manifest V3** - Latest extension specification
- **Chrome Storage API** - Synchronize settings

### DOM Structure Analysis

Packt video page structure:

```html
<!-- Video caption (currently playing) -->
<div class="caption-window">
  <div class="caption-text">Welcome to this lecture.</div>
</div>

<!-- Right sidebar subtitle area (full text) -->
<div class="reader-video-transripts-body">
  <!-- Original English subtitles -->
  <span data-start="6" data-end="7">Welcome to this lecture.</span>
  <span data-start="8" data-end="12">You might wonder who I am...</span>
  ...

  <!-- Chinese translation generated by Immersive Translate -->
  <font class="immersive-translate-target-wrapper">
    <font>
      <font>
        <span data-start="6" data-end="7">欢迎来到本次讲座。</span>
        <span data-start="8" data-end="12">您可能想知道我是谁...</span>
        ...
      </font>
    </font>
  </font>
</div>
```

### DOM Selectors

```javascript
// Video subtitle (currently playing)
.caption-text

// Subtitle display area
.caption-window

// Subtitle text area
.reader-video-transripts-body

// English subtitles
.reader-video-transripts-body > span[data-start]

// Immersive translate results
font.immersive-translate-target-wrapper span[data-start]
```

### Matching Logic

```javascript
// 1. Get current video subtitle
const currentText = document.querySelector('.caption-text').textContent;

// 2. Find match in English subtitle list
const englishSpans = document.querySelectorAll(
  '.reader-video-transripts-body > span[data-start]'
);

// 3. Find index and data-start attribute through text matching
let matchedIndex = -1;
let matchedDataStart = null;
for (let i = 0; i < englishSpans.length; i++) {
  if (englishSpans[i].textContent.trim() === currentText) {
    matchedIndex = i;
    matchedDataStart = englishSpans[i].getAttribute('data-start');
    break;
  }
}

// 4. Find corresponding Chinese in immersive translate results
const translationWrapper = document.querySelector(
  'font.immersive-translate-target-wrapper'
);
const translatedSpans = translationWrapper.querySelectorAll('span[data-start]');

// 5. Precise match through data-start attribute
let translatedText = '';
for (const span of translatedSpans) {
  if (span.getAttribute('data-start') === matchedDataStart) {
    translatedText = span.textContent.trim();
    break;
  }
}

// 6. Display translation
displayTranslatedSubtitle(translatedText);
```

### Synchronization Flow
1. `MutationObserver` monitors `.caption-text` element changes
2. Extract current video subtitle text
3. Find matching text in English subtitle list
4. Get the subtitle's `data-start` attribute
5. Find Chinese subtitle with same `data-start` in immersive translate results
6. Extract Chinese translation and display on video

### Subtitle Matching Strategy
- **Highlight Line Detection**: Detect current highlighted line in Packt subtitle area
- **Time Estimation**: Estimate current subtitle position based on video playback time
- **Index Mapping**: Establish index correspondence between English subtitle lines and translation lines
- **Three-tier Matching Strategy**: data-start matching → index matching → Chinese detection

## 📦 Detailed Installation Guide

### Installation Steps

#### Step 1: Install Immersive Translate Extension

**Method A: Install from Chrome Web Store**

1. Visit Chrome Web Store
2. Search "Immersive Translate" or visit: [Immersive Translate Extension](https://chrome.google.com/webstore/detail/immersive-translate/bpoadfkcbjbfhfodiogcnhhhpibjhbnh)
3. Click "Add to Chrome" to install
4. After installation, click extension icon to enter settings
5. Configure translation target language to Chinese

**Method B: Ensure Immersive Translate is Working**

1. Visit [Packt Subscription Platform](https://subscription.packtpub.com/)
2. Open any video course
3. Check if right sidebar shows Chinese and English
4. Confirm you can see HTML structure like `font > font > font > span`

#### Step 2: Download This Extension Source Code

If you don't have the source code yet, you can get it through:
- Download ZIP from GitHub and extract
- Or use Git clone: `git clone <repo-url>`

#### Step 3: Load Extension to Chrome

1. **Open Extension Management Page**
   - Enter in address bar: `chrome://extensions/`
   - Or click: Menu → More tools → Extensions

2. **Enable Developer Mode**
   - Find "Developer mode" toggle in top right of page
   - Click to enable

3. **Load Extension**
   - Click "Load unpacked" in top left
   - Select `chrome-subtitle-translator` folder
   - Click "Select folder"

4. **Verify Installation**
   - Extension should appear in extension list
   - Name: Packt 视频字幕实时同步器
   - Status: Enabled

#### Step 4: Enable Subtitle Sync Function

1. **Open Extension Settings**
   - Click this extension icon in browser toolbar
   - Or in `chrome://extensions/` click extension's "Details" → "Extension options"

2. **Configure Extension**
   - ✅ Enable subtitle sync: Keep enabled
   - 💾 Click "Save Settings"

3. **Function Description**
   - This extension doesn't require API configuration, reuses immersive translate results
   - Runs locally only, no data sent to external servers

#### Step 5: Test Sync Function

1. **Visit Packt Video Page**
   - Login to https://subscription.packtpub.com/
   - Open any video course
   - For example: https://subscription.packtpub.com/video/...

2. **Play Video**
   - Click play button
   - Ensure subtitles are enabled

3. **Check Sync Effect**
   - Chinese translation subtitles should display below video
   - Subtitle display (styles customizable)
   - Video control bar will have "Subtitle: On" button

4. **Debug (if not working)**
   - Press F12 to open developer tools
   - Switch to Console tab
   - Look for "🎯 Packt 字幕映射插件初始化..." log
   - Check for error messages (red)

## 🔧 FAQ

### Q: Subtitles not syncing?
A: Check the following:
1. Is immersive translate extension working properly
2. Is this extension's function enabled (check toggle button on video page)
3. Open browser console (F12) and check for error messages
4. Refresh video page and retry

### Q: Sync has delay?
A: This extension has no translation delay (because it's extractive sync), if you feel delay it might be:
1. Translation delay from immersive translate extension itself
2. Network connection issues

### Q: Does it support other video websites?
A: Currently only supports Packt subscription platform. To support other websites, you need to:
1. Modify `matches` rules in `manifest.json`
2. Adjust subtitle element selectors in `content.js`
3. Adapt to target website's DOM structure

### Q: How to temporarily disable sync?
A: Click the "Subtitle: On/Off" button on video control bar

**Dependency Requirements**:
- ✅ **New Dependency**: Must first install "Immersive Translate" Chrome extension
- ✅ **Prerequisite**: Immersive translate needs to work properly and translate subtitle area

#### Technical Details

**Modified Files**:
- `content/content.js`: Rewrite subtitle finding and matching logic, adjust subtitle position
- `popup/popup.html`: Simplify settings interface, remove API configuration
- `popup/popup.js`: Remove API related code
- `utils/storage.js`: Simplify storage structure
- `utils/translator.js`: Keep translation utility class
- `manifest.json`: Update description and version number
- `background/`: Add background script support

#### Known Issues

1. **Dependency on Immersive Translate**
   - If immersive translate is not installed or enabled, this extension cannot work
   - Immersive translate DOM structure changes may cause matching failure

2. **Matching Accuracy**
   - Relies on `data-start` attribute for precise matching
   - If immersive translate modifies attributes, code adjustment may be needed

## 🛠️ Development Guide

### Debugging Methods
1. Find extension in `chrome://extensions/` page
2. Press F12 on video page to open developer tools, view console logs
3. Search for `[Packt 字幕映射]` prefix in logs to see extension output

### After Modifying Code
1. Click extension's "Reload" button in `chrome://extensions/` page
2. Refresh video page to test

## 🔄 Update & Uninstall

### Update Extension

When extension code is updated:

1. Modify code files
2. Find extension in `chrome://extensions/` page
3. Click "Reload" icon (circular arrow) in bottom right of extension
4. Refresh video page to test

### Uninstall Extension

1. Visit `chrome://extensions/`
2. Find "Packt 视频字幕实时同步器"
3. Click "Remove"
4. Confirm deletion

**Note**: Uninstall will delete extension settings

## 📄 License

MIT License - Free to use, modify and distribute

## 🙏 Acknowledgments

- Packt for providing quality technical courses
- Immersive Translate extension for excellent translation functionality

---

**Disclaimer**: This extension is for learning and communication only. Please comply with relevant platform's terms of service.
