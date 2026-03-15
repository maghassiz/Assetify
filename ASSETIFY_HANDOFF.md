# Assetify — Advanced Asset Manager for Framer
## Project Handoff Document

---

## What This Is

**Assetify** is a Framer plugin (v2.0.0) that gives designers a full asset management interface inside Framer. It scans all images and videos across canvas nodes and CMS collections, and lets users search, filter, edit alt text, navigate usages, download assets, and analyse bandwidth.

**Stack:** React + TypeScript + Vite, using `framer-plugin` v3 SDK. No external UI libraries. All styling is custom CSS using Framer's native CSS tokens.

**Window size:** 320×620px, resizable.

---

## File Structure

```
src/
├── App.tsx                          # Root component — tab layout, all state wiring
├── App.css                          # All styles (2500+ lines)
├── main.tsx                         # Entry point — no OS theme detection
├── types.ts                         # ALL shared types (AssetEntry, filters, etc.)
├── plugin.config.ts                 # Names, version, window size, feature flags
│
├── components/
│   ├── AssetCard.tsx                # Grid + list card UI, dots menu, video thumb
│   ├── DetailPanel.tsx              # Slide-up detail overlay
│   ├── VideoThumb.tsx               # Video with play/pause overlay
│   └── EmptyState.tsx               # Empty/error states
│
├── features/
│   ├── assetGrid/AssetGrid.tsx      # Grid/list renderer, loading/error/empty states
│   ├── filters/
│   │   ├── Filters.tsx              # Filter bar UI (source tabs + storage dropdown)
│   │   └── useFilters.ts            # Filter state + count helpers
│   ├── search/
│   │   ├── Search.tsx               # Search input UI
│   │   └── useSearch.ts             # Search predicate
│   ├── navigator/
│   │   ├── useNavigator.ts          # navIndex state, step/jump logic
│   │   └── UsageNavigator.tsx       # (legacy, not used in new DetailPanel)
│   ├── altText/
│   │   ├── AltTextEditor.tsx        # Alt text textarea + save (used in DetailPanel)
│   │   └── saveAltText.ts           # Calls framerApi to save alt text
│   ├── bandwidth/
│   │   └── BandwidthView.tsx        # Bandwidth tab UI
│   └── about/
│       └── AboutView.tsx            # About tab UI
│
├── hooks/
│   ├── useAssets.ts                 # Loads assets, exposes refresh()
│   └── useBandwidth.ts              # Background size scanner, lives in App.tsx
│
└── lib/
    ├── framerApi.ts                 # ALL Framer API calls
    ├── assetUtils.ts                # Pure helpers (readImageData, detectStorage, etc.)
    ├── pageResolver.ts              # Stub — returns "" (page detection not yet reliable)
    ├── analytics.ts                 # Supabase analytics (session tracking)
    └── design/
        ├── tokens.ts
        └── layout.ts
```

---

## Core Data Model

```typescript
// types.ts — single source of truth
interface AssetEntry {
  key:             string      // "canvas:<id>" | "video:<url>" | "cms:<col>:<item>:<field>"
  name:            string
  url:             string
  altText:         string
  source:          "canvas" | "cms"
  assetType:       "image" | "video"
  storageSource:   "framer" | "external"
  nodeIds:         string[]    // canvas nodeIds that use this asset ([] for CMS)
  locationLabel:   string      // "Home · 3 nodes" or "Blog › my-post"
  pageName:        string      // always "" currently (page detection not reliable)
  navigateId?:     string      // first nodeId for single-jump
  cmsCollectionId?: string
  cmsItemId?:       string
}
```

---

## App Layout (App.tsx)

The app has **3 tabs** controlled by `activeTab: "assets" | "bandwidth" | "about"`.

```
plugin-root (flex column, 100vh)
  ├── [assets tab]
  │     ├── Search row (input + refresh + grid/list toggle)
  │     ├── Filter bar (source tabs + storage dropdown)
  │     └── AssetGrid (scrollable, loading/error/empty states)
  ├── [bandwidth tab]
  │     └── BandwidthView (scan button, plan selector, ranked list)
  ├── [about tab]
  │     └── AboutView (version, links)
  ├── Remix modal (one-time welcome, shown on first open)
  ├── Add toast (brief success message)
  ├── Bottom nav (3 tab buttons)
  └── DetailPanel (fixed overlay, shown when asset is selected)
```

**Key state in App.tsx:**
- `assets` — loaded by `useAssets()`
- `bandwidth` — `useBandwidth()` hook, persists across tab switches
- `selected` — currently open AssetEntry (shows DetailPanel)
- `activeTab` — which tab is visible
- `layout` — "grid" | "list"
- `navIndex`, `nodePageNames` — from `useNavigator(selected)`
- `addingKey`, `addedKey`, `addMode` — canvas add/set state

---

## Framer API Calls (framerApi.ts)

All Framer SDK interactions are in one file. Key functions:

| Function | What it does |
|---|---|
| `loadAssets()` | Loads canvas images + videos + CMS images. Calls `clearPageCache()` first |
| `saveCanvasAltText(nodeIds, alt)` | Uses `cloneWithAttributes` to update alt text on all nodes |
| `saveCmsAltText(key, alt)` | Updates CMS field data via `col.addItems()` |
| `smartAdd(asset)` | Set on selected frame OR add to canvas |
| `navigateToNode(nodeId)` | `setSelection` + `zoomIntoView` (+ tries `navigateTo`) |
| `navigateToCmsItem(itemId)` | `framer.navigateTo(itemId)` |

**Never call `framer.*` outside this file.** Everything goes through `framerApi.ts`.

---

## CSS System

All styles in `App.css`. Uses **Framer native tokens** — these adapt to light/dark automatically:

```css
/* Backgrounds */
var(--framer-color-bg)              /* main background */
var(--framer-color-bg-secondary)    /* cards, panels */
var(--framer-color-bg-tertiary)     /* inputs, hover fills */

/* Text */
var(--framer-color-text)            /* primary */
var(--framer-color-text-secondary)  /* body */
var(--framer-color-text-tertiary)   /* muted/placeholder */

/* Borders */
var(--framer-color-divider)         /* all borders */

/* Accent */
var(--framer-color-tint)            /* primary blue — buttons, active states */
var(--framer-color-tint-dark)       /* hover on primary buttons */
var(--framer-color-tint-dimmed)     /* subtle tint fills */
```

**CSS rules:**
- One property per line, spaces after colons, blank lines between blocks
- Dark mode: `[data-framer-theme="dark"]` selector (NOT `prefers-color-scheme`)
- Never hardcode colours that should adapt to theme — use tokens above
- Custom colours (red, green, amber) defined in `:root` as `--red`, `--green`, `--amber`

---

## Key Components

### AssetCard.tsx
Two layouts: `grid` and `list`. Grid card has:
- Full-bleed image with `border-radius: 12px`
- Frosted glass info panel (bottom overlay) with title + usage count + add button
- IMAGE/VIDEO + NO ALT badges (top-left)
- Three-dots menu (top-right, outside `card-img-wrap` to avoid `overflow:hidden` clipping)
- Dots menu uses **React portal** (`createPortal`) so it renders in `document.body` — never gets clipped

### DetailPanel.tsx
Slide-up overlay. Structure:
```
.detail-panel (flex column, max-height 90vh, overflow hidden)
  .dp-header        ← fixed top (title + close)
  .dp-scroll        ← flex:1, overflow-y:auto (ALL content scrolls here)
    Navigate Usage section
    Preview image/video
    Asset Details card (Type, Format, Size, Source, Storage, Usage/Location)
    Alt Text section (collapsible)
  .dp-actions       ← fixed bottom (Download Asset + Add to Canvas)
```
- File size fetched lazily via `useEffect` — HEAD first, then blob fallback
- `detectFormat(url)` reads extension from URL

### VideoThumb.tsx
Wraps `<video>` with a play/pause overlay button. Uses `useRef` + `useState(false)`. `preload="metadata"` only — no autoplay, no hover play. Click toggles play/pause.

### BandwidthView.tsx + useBandwidth.ts
- Hook lives in `App.tsx` so scan state persists across tab switches
- Scans in batches of 4, HEAD→blob fallback
- `cancelRef` (useRef) stops scan mid-way
- Per-asset bandwidth = `fileSize × nodeCount`
- Plan limits: Free 1GB / Mini 5GB / Basic 10GB / Pro 100GB / Business 500GB

---

## Things That Don't Work Yet

| Feature | Status | Notes |
|---|---|---|
| Page name resolution | Stub | `pageResolver.ts` returns `""` — Framer plugin API doesn't reliably expose page node types yet. `resolvePageName` is a no-op. |
| Change asset (bulk replace) | Removed | Was built but unreliable — Framer's API doesn't support replacing an existing asset cleanly |
| Navigate to page | Partial | `navigateToNode` calls `setSelection` + `zoomIntoView`. Works within same page, may not switch pages reliably |

---

## Things to Update Before Launch

1. **`App.tsx` line ~220** — Replace `https://YOUR_DOCS_LINK_HERE` with real docs URL
2. **`AboutView.tsx`** — Same URL replacement
3. **`plugin.config.ts`** — Update `PLUGIN_REGISTRY_ID` to your real ID
4. **Supabase** — Run `clear_test_data.sql` to remove test analytics data
5. **Build** — `npm run pack` to create the plugin zip for Framer Marketplace submission

---

## How to Safely Add Features

### Adding a new asset detail row
Edit `DetailPanel.tsx` → find the `dp-card` section → add a `<div className="dp-row">` block.

### Adding a new filter
1. Add type to `types.ts`
2. Add logic to `useFilters.ts`
3. Add UI to `Filters.tsx`

### Adding a new tab
1. Add value to the `Tab` type in `App.tsx`
2. Create `src/features/yourTab/YourView.tsx`
3. Add `{activeTab === "yourTab" && <YourView />}` in `App.tsx`
4. Add a button to `.bottom-nav` in `App.tsx`

### Adding a new Framer API call
Add it to `framerApi.ts` only. Never call `framer.*` directly in components.

### Changing theme colours
Only edit `:root` variables in `App.css`. Never hardcode hex values in component CSS — always use a CSS variable.

---

## CSS Class Naming Conventions

| Prefix | Used for |
|---|---|
| `.dp-` | Detail panel components |
| `.bw-` | Bandwidth view |
| `.card-` | Grid asset card |
| `.row-` | List asset row |
| `.filter-` | Filter bar |
| `.nav-` | Bottom navigation |
| `.about-` | About view |
| `.bottom-nav` | Tab bar at bottom |

---

## Analytics

Uses Supabase. Tracked events: `assets_loaded`, `detail_opened`, `alt_text_saved`, `add_to_canvas`, `navigate_usage`, `filter_source`, `filter_storage`, `refresh`, `session_start`, `session_end`.

Analytics is in `lib/analytics.ts`. To disable, just don't call `initAnalytics()` in `App.tsx`.

---

## Package Info

```json
{
  "dependencies": {
    "framer-plugin": "^3",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "vite-plugin-framer": "^1",
    "typescript": "^5"
  }
}
```

Dev: `npm run dev` → opens at `localhost:5173`, point Framer plugin to this URL.
Build: `npm run pack` → creates plugin zip.
