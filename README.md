# lastleaf

> Remember what you closed.

A Chrome/Brave extension that quietly captures tabs you close, groups them by topic, and surfaces them as an interactive graph. Click the lastleaf icon in your toolbar to explore your tab graveyard.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/omdnekdmeoccdhlmfdmfpfmkmoenado)](https://chromewebstore.google.com/detail/lastleaf/omdnekdmeoccdhlmfdmfpfmkmoenadol)
---

## Tech stack

- **Vite** + **CRXJS** — builds the Chrome MV3 extension
- **React** + **TypeScript** — all UI pages
- **Dexie.js** — IndexedDB wrapper for tab history storage
- **compromise.js** — lightweight local NLP for keyword extraction
- **Tabler Icons** — icon webfont used across all pages

---

## Project structure

```
lastleaf/
├── public/
│   └── assets/              # Extension icons (icon16.png, icon32.png, icon48.png, icon128.png)
├── src/
│   ├── background/
│   │   └── index.ts         # Service worker — tab lifecycle, capture, badge count
│   ├── newtab/
│   │   ├── index.html       # Dashboard entry point
│   │   ├── main.tsx         # React mount
│   │   ├── index.tsx        # Dashboard root component
│   │   ├── components/
│   │   │   ├── Graph.tsx         # Canvas edges + cluster card positions + zoom
│   │   │   ├── ClusterCard.tsx   # Individual cluster card
│   │   │   ├── SidePanel.tsx     # Slide-in panel with tabs and topics
│   │   │   ├── TabRow.tsx        # Expandable tab row with actions
│   │   │   └── OnboardingHint.tsx # First-time hint overlay
│   │   └── hooks/
│   │       └── useClusters.ts    # Reads IndexedDB, builds clusters
│   ├── options/
│   │   ├── index.html       # Settings page entry point
│   │   ├── main.tsx
│   │   └── index.tsx        # Settings page
│   ├── welcome/
│   │   ├── index.html       # Onboarding page entry point
│   │   ├── main.tsx
│   │   └── index.tsx        # Welcome/onboarding page (shown on install)
│   ├── popup/
│   │   ├── index.html       # Popup entry point
│   │   ├── main.tsx
│   │   └── index.tsx        # Toolbar popup — stats + menu
│   └── lib/
│       ├── storage.ts        # Dexie IndexedDB schema + chrome.storage.local settings
│       ├── clustering.ts     # Keyword extraction, topic scoring, cluster building
│       ├── domains.ts        # Domain → category lookup table
│       └── compression.ts    # 90-day compression of old tabs to summaries
├── manifest.json             # Chrome MV3 manifest
├── vite.config.ts            # Vite + CRXJS config
├── tsconfig.json
└── package.json
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Generate extension icons

Open your browser console on any tab and paste:

```js
const sizes = [16,32,48,128]
const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='22' fill='#854F0B'/>
  <g transform='translate(50,52) rotate(25)'>
    <path d='M0 -44 Q38 -28 28 8 Q0 24 -28 8 Q-38 -18 0 -44 Z' fill='#FAC775'/>
    <path d='M0 -38 Q-1 -14 -2 10' fill='none' stroke='#854F0B' stroke-width='5' stroke-linecap='round'/>
    <path d='M-2 10 Q-4 22 -6 32' fill='none' stroke='#FAC775' stroke-width='4' stroke-linecap='round'/>
  </g>
</svg>`
sizes.forEach(s => {
  const canvas = document.createElement('canvas')
  canvas.width = s; canvas.height = s
  const ctx = canvas.getContext('2d')
  const img = new Image()
  const blob = new Blob([svg], {type:'image/svg+xml'})
  const url = URL.createObjectURL(blob)
  img.onload = () => {
    ctx.drawImage(img,0,0,s,s)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `icon${s}.png`
    a.click()
    URL.revokeObjectURL(url)
  }
  img.src = url
})
```

Copy the downloaded PNGs to `public/assets/`.

### 3. Build

```bash
npm run build
```

### 4. Load in Chrome/Brave

1. Go to `chrome://extensions` or `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

---

## Development

```bash
npm run dev
```

Watches for file changes and rebuilds automatically. Reload the extension in `chrome://extensions` after each build.

---

## Settings

All settings are stored in `chrome.storage.local` and shared across all extension contexts:

| Setting | Default | Description |
|---|---|---|
| `minTabTime` | 60s | Minimum time a tab must be open to be captured |
| `retentionDays` | 90 | Days to keep full tab records before compressing |
| `excludedDomains` | `[]` | Domains never captured |

---

## Privacy

- All tab data stored locally in IndexedDB on your device
- No page content ever read — only tab titles and URLs
- Excluded domains list lets you block sensitive sites

---

Made by **Umbrova** · hello@umbrova.com
