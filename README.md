# lastleaf

> Remember what you closed.

A Chrome extension that captures closed tabs, groups them by topic, and surfaces them as an interactive graph on every new tab.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Vercel analytics URL:

```bash
cp .env.example .env.local
```

### 3. Dev mode

```bash
npm run dev
```

Then open Chrome → `chrome://extensions` → Enable Developer Mode → Load Unpacked → select the `.plasmo/chrome-mv3-dev` folder.

### 4. Build for production

```bash
npm run build
npm run package
```

---

## Project structure

```
src/
├── background/index.ts      # Service worker — tab lifecycle
├── contents/toast.tsx       # Rescue toast content script
├── newtab/                  # Dashboard (new tab override)
│   ├── components/          # Graph, ClusterCard, SidePanel, TabRow
│   └── hooks/               # useClusters, useStorage
├── welcome/index.tsx        # Onboarding page (shown on install)
├── options/index.tsx        # Settings page
└── lib/
    ├── storage.ts           # Dexie IndexedDB layer
    ├── clustering.ts        # NLP keyword extraction + clustering
    ├── domains.ts           # Domain → category lookup
    ├── compression.ts       # 90-day compression to summaries
    └── analytics.ts         # Vercel proxy analytics

vercel-api/
└── api/lastleaf/event.ts    # Vercel edge function → Upstash Redis
```

---

## Vercel analytics setup

1. Deploy `vercel-api/` to your existing Vercel project
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel env vars
3. Set `PLASMO_PUBLIC_ANALYTICS_URL` in `.env.local` to your Vercel endpoint

---

## Build order

1. `src/lib/storage.ts` — get data layer working, test with Dexie
2. `src/background/index.ts` — verify tabs are being captured
3. `src/lib/clustering.ts` — check clusters look right
4. `src/newtab/` — build dashboard against real data
5. `src/contents/toast.tsx` — add toast last
6. `src/options/` + `src/welcome/` — settings and onboarding
7. `vercel-api/` — deploy analytics proxy

---

Made by Sylvora Labs · hello@sylvoralabs.com
