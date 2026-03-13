# Framer Asset Manager Plugin

> **Who this README is for:**
> - You (the designer) returning to this project after weeks or months
> - Any AI assistant (Claude, ChatGPT, Gemini, etc.) helping you work on this
> - A developer you hire in the future
>
> Every section is labelled so you know which audience it's for.

---

## Table of Contents

1. [What this plugin does](#1-what-this-plugin-does)
2. [Quick start — running the plugin](#2-quick-start--running-the-plugin)
3. [Project structure — the complete map](#3-project-structure--the-complete-map)
4. [The three safety zones](#4-the-three-safety-zones)
5. [How to make common changes (no coding needed)](#5-how-to-make-common-changes-no-coding-needed)
6. [How to add a new feature (step by step)](#6-how-to-add-a-new-feature-step-by-step)
7. [Design system — colours, spacing, layout](#7-design-system--colours-spacing-layout)
8. [Feature flags — turn features on/off](#8-feature-flags--turnfeatures-onoff)
9. [AI assistant prompts — copy and paste these](#9-ai-assistant-prompts--copy-and-paste-these)
10. [How to give this project to another AI (ChatGPT, Gemini, etc.)](#10-how-to-give-this-project-to-another-ai-chatgpt-gemini-etc)
11. [Architecture rules — for developers](#11-architecture-rules--for-developers)
12. [Future plugin system](#12-future-plugin-system)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. What this plugin does

**For:** Everyone

A Framer plugin that lets designers view, search, filter, and manage every image and video asset in their Framer project — from both the canvas and CMS. Key features:

| Feature | What it does |
|---|---|
| Asset grid | Shows all canvas and CMS images/videos as cards |
| Search | Find assets by name, page, location, alt text, type |
| Source filter | Filter by ALL / CANVAS / CMS |
| Storage filter | Filter by FRAMER hosted vs EXTERNAL (CDN, etc.) |
| Usage navigator | Step through every canvas node using the same image (across pages) |
| Alt text editor | Edit and save accessibility text directly from the plugin |
| Canvas actions | Add image to canvas or set on a selected frame |

---

## 2. Quick start — running the plugin

**For:** You and developers

```bash
# Install dependencies
npm install

# Run in development mode (opens plugin in Framer)
npm run dev

# Build for publishing
npm run build
```

In Framer: **Plugins → Development → load from localhost:5173**

---

## 3. Project structure — the complete map

**For:** Everyone — start here when you don't know which file to open

```
framer-asset-manager/
│
├── README.md                   ← you are here
├── GUIDE.md                    ← quick lookup table: "I want to change X → open Y"
├── package.json                ← dependencies (rarely need to touch)
│
└── src/
    │
    ├── plugin.config.ts        ★ MASTER SETTINGS
    │                             Change plugin name, window size, feature flags
    │                             SAFE TO EDIT FREELY
    │
    ├── App.tsx                 ★ WIRING FILE
    │                             Connects features together. No logic here.
    │                             Edit to change which features appear and in what order
    │
    ├── App.css                 ★ ALL STYLES
    │                             Every CSS class used in the plugin
    │                             SAFE TO EDIT FREELY
    │
    ├── types.ts                ⚙ DATA SHAPES
    │                             Defines what an "asset" looks like in code
    │                             Edit only to add new data fields
    │
    ├── design/                 ★ VISUAL DESIGN SYSTEM
    │   ├── tokens.ts           ← Every colour, font size, shadow, spacing value
    │   └── layout.ts           ← Grid columns, card sizes, panel dimensions
    │
    ├── features/               ★ ONE FOLDER PER FEATURE
    │   │                         Each feature is self-contained.
    │   │                         Editing one cannot break another.
    │   │
    │   ├── search/
    │   │   ├── Search.tsx      ← The search bar (visual only)
    │   │   └── useSearch.ts    ← What fields get searched (logic only)
    │   │
    │   ├── filters/
    │   │   ├── Filters.tsx     ← The filter tab rows (visual only)
    │   │   └── useFilters.ts   ← Filter state and count logic
    │   │
    │   ├── altText/
    │   │   ├── AltTextEditor.tsx ← The alt text textarea + button (visual only)
    │   │   └── saveAltText.ts    ← The save function (logic only)
    │   │
    │   ├── navigator/
    │   │   ├── UsageNavigator.tsx ← The ‹ 2/4 › step navigator (visual only)
    │   │   └── useNavigator.ts    ← Step/jump logic and page name state
    │   │
    │   └── assetGrid/
    │       └── AssetGrid.tsx   ← The scrollable card grid with states
    │
    ├── components/             ⚙ SHARED UI BUILDING BLOCKS
    │   ├── AssetCard.tsx       ← One card in the grid
    │   ├── DetailPanel.tsx     ← The full detail overlay panel
    │   ├── EmptyState.tsx      ← "No assets found" screen
    │   └── VideoThumb.tsx      ← Video thumbnail with hover-play
    │
    ├── hooks/
    │   └── useAssets.ts        ⚙ Asset loading and refresh state
    │
    └── lib/                    ⚠ ENGINE ROOM — edit with care
        ├── framerApi.ts        ← ALL Framer API calls (load, save, navigate)
        ├── assetUtils.ts       ← URL helpers, storage detection, label building
        └── pageResolver.ts     ← Resolves which page a canvas node lives on
```

**Legend:**
- ★ = Safe to edit, designed for frequent changes
- ⚙ = Stable internals, edit only when adding new data/features
- ⚠ = Engine room, edit only if Framer's API changes

---

## 4. The three safety zones

**For:** You (the designer)

The project is divided into three zones so changes in one zone can never break another.

### Zone 1 — Design (★ freely editable)
```
src/design/tokens.ts
src/design/layout.ts
src/App.css
```
Pure visual values. No logic. Changing a colour here updates it everywhere automatically. This is where Figma MCP will write to in the future.

### Zone 2 — Features (★ freely editable, isolated)
```
src/features/search/
src/features/filters/
src/features/altText/
src/features/navigator/
src/features/assetGrid/
```
Each folder is a sealed unit. Code inside `navigator/` has zero knowledge of code inside `search/`. You can delete, rewrite, or redesign any feature folder without touching anything else.

### Zone 3 — Engine (⚠ edit carefully)
```
src/lib/framerApi.ts
src/lib/assetUtils.ts
src/lib/pageResolver.ts
src/hooks/useAssets.ts
src/types.ts
```
The plumbing. It works reliably. Only touch this if the Framer API changes or you need to support a new asset type. When asking an AI to help here, always paste the full file content.

---

## 5. How to make common changes (no coding needed)

**For:** You (the designer)

### Change the plugin name or window size
Open `src/plugin.config.ts` and edit:
```ts
export const PLUGIN_NAME = "My Plugin"   // name shown in title bar
export const PLUGIN_UI = {
  width:  320,   // plugin panel width in px
  height: 620,   // plugin panel height in px
}
```

### Change a colour
Open `src/design/tokens.ts` and find the colour role you want:
```ts
export const colors = {
  accent:     "#4f52e0",   // main interactive colour (indigo)
  bgSurface:  "#ffffff",   // card and panel backgrounds
  warning:    "#b45309",   // amber — used for external CDN badge
  // ...
}
```
Change the hex value. It updates everywhere automatically.

### Change grid columns (e.g. 3-column grid)
Open `src/design/layout.ts`:
```ts
export const grid = {
  columns: 3,   // was 2 — change this
  gap:     8,
}
```

### Change search placeholder text
Open `src/features/search/Search.tsx` and find:
```tsx
placeholder="Search name, location, alt text…"
```

### Change filter tab labels
Open `src/features/filters/Filters.tsx` and find:
```ts
const SOURCE_TABS = [
  { label: "ALL",    value: "all"    },
  { label: "CANVAS", value: "canvas" },
  { label: "CMS",    value: "cms"    },
]
```

### Turn a feature off temporarily
Open `src/plugin.config.ts`:
```ts
export const FEATURES = {
  search:         false,  // ← search bar disappears, code still exists
  usageNavigator: true,
}
```

---

## 6. How to add a new feature (step by step)

**For:** You with AI assistance, or a developer

**Example: adding a "Duplicate detector" feature**

### Step 1 — Create the feature folder
```
src/features/duplicateDetector/
```

### Step 2 — Create the logic file
`src/features/duplicateDetector/useDuplicateDetector.ts`
```ts
// Logic only — no JSX
import { useState } from "react"
import type { AssetEntry } from "../../types"

export function useDuplicateDetector(assets: AssetEntry[]) {
  const duplicates = assets.filter(a => a.nodeIds.length > 1)
  return { duplicates, count: duplicates.length }
}
```

### Step 3 — Create the UI file
`src/features/duplicateDetector/DuplicateDetector.tsx`
```tsx
// Visual only — no Framer API calls
import type { AssetEntry } from "../../types"

interface Props {
  count: number
  duplicates: AssetEntry[]
}

export function DuplicateDetector({ count, duplicates }: Props) {
  return (
    <div className="duplicate-banner">
      {count} duplicate assets found
    </div>
  )
}
```

### Step 4 — Add a feature flag
In `src/plugin.config.ts`:
```ts
export const FEATURES = {
  // ... existing flags
  duplicateDetector: true,   // ← add this
}
```

### Step 5 — Mount it in App.tsx
```tsx
// Add import at top
import { DuplicateDetector }    from "./features/duplicateDetector/DuplicateDetector"
import { useDuplicateDetector } from "./features/duplicateDetector/useDuplicateDetector"

// Inside App() function, add hook:
const { duplicates, count } = useDuplicateDetector(assets)

// Inside the JSX return, add component where you want it:
{FEATURES.duplicateDetector && (
  <DuplicateDetector count={count} duplicates={duplicates} />
)}
```

**Nothing else changes. No existing feature is touched.**

---

## 7. Design system — colours, spacing, layout

**For:** You and future Figma MCP connection

### How tokens work
```
src/design/tokens.ts          ← you edit colour values here
       ↓
src/App.css (:root { })       ← CSS variables are set here
       ↓
Every component               ← uses var(--accent), var(--bg-surface), etc.
```

### Colour roles (what each colour is FOR)
| Token name | Current value | Used for |
|---|---|---|
| `bgApp` | `#f5f5f7` | Plugin background |
| `bgSurface` | `#ffffff` | Cards, panels, header |
| `bgInput` | `#ebebed` | Inputs, tags |
| `accent` | `#4f52e0` | Buttons, active states, links |
| `success` | `#16a34a` | Add to canvas confirmation |
| `info` | `#0284c7` | "Set on frame" mode |
| `warning` | `#b45309` | External CDN badge, high usage |
| `video` | `#7c3aed` | Video asset badge, Framer storage |
| `danger` | `#dc2626` | Errors |

### Spacing scale (4px grid)
| Token | Value | Example use |
|---|---|---|
| `spacing["1"]` | 4px | Icon padding |
| `spacing["2"]` | 8px | Card gap |
| `spacing["3"]` | 12px | Section padding |
| `spacing["4"]` | 16px | Large section padding |

### Layout values you can change safely
| Token | Default | What it controls |
|---|---|---|
| `grid.columns` | `2` | Cards per row |
| `grid.gap` | `8` | Gap between cards |
| `panel.previewHeight` | `160` | Detail panel image preview height |
| `panel.altTextRows` | `3` | Lines in the alt text textarea |
| `NAV_DOTS_MAX` | `12` | Max usage dots before hiding them |
| `USAGE_HOT_THRESHOLD` | `5` | When usage count turns amber |

---

## 8. Feature flags — turn features on/off

**For:** You

Open `src/plugin.config.ts` → `FEATURES` object.

| Flag | Default | What it controls |
|---|---|---|
| `search` | `true` | Search bar |
| `sourceFilter` | `true` | ALL/CANVAS/CMS tabs |
| `storageFilter` | `true` | FRAMER/EXTERNAL tabs |
| `usageNavigator` | `true` | Sequential usage navigator |
| `altTextEditor` | `true` | Alt text textarea + save |
| `canvasActions` | `true` | Add to canvas / set on frame |

Set to `false` → the UI disappears, the code stays intact.

---

## 9. AI assistant prompts — copy and paste these

**For:** You, when asking Claude, ChatGPT, Gemini, or any AI for help

These are ready-to-use prompts. Copy the one you need, paste it into any AI chat, then paste the relevant file content when the AI asks for it.

---

### Prompt: Change a colour or visual style
```
I have a Framer plugin with a design token system.
The file src/design/tokens.ts contains all colour values as named exports.
The file src/App.css maps these to CSS variables used throughout the plugin.

I want to change [DESCRIBE WHAT YOU WANT — e.g. "the accent colour from indigo to teal"].

Here is the current tokens.ts:
[PASTE FILE CONTENT]

Here is the relevant section of App.css:
[PASTE CSS SECTION]

Please update tokens.ts and tell me exactly what to change in App.css.
Do not change any logic files, hooks, or feature components.
```

---

### Prompt: Add a new feature
```
I have a Framer plugin with a modular feature architecture.
Each feature lives in src/features/featureName/ as two files:
- FeatureName.tsx (UI only, no API calls)
- useFeatureName.ts (logic only, no JSX)

Features are enabled via flags in src/plugin.config.ts.
Features are mounted in src/App.tsx.

I want to add a new feature: [DESCRIBE THE FEATURE].

Here is the project context you need:
- src/types.ts: [PASTE FILE]
- src/plugin.config.ts: [PASTE FILE]
- src/App.tsx: [PASTE FILE]
- src/lib/framerApi.ts: [PASTE FILE — only if the feature needs Framer API]

Please:
1. Create the two feature files (UI + logic)
2. Add the feature flag to plugin.config.ts
3. Show me exactly what to add to App.tsx
4. Do not modify any existing feature files
```

---

### Prompt: Change how search works
```
I have a Framer plugin. Search logic is in src/features/search/useSearch.ts.
The search matches against a "haystack" array of asset fields.

Here is the current useSearch.ts:
[PASTE FILE]

Here is the AssetEntry type from src/types.ts:
[PASTE FILE]

I want to [DESCRIBE CHANGE — e.g. "also search by the asset URL" or "make search case-sensitive"].

Please only modify useSearch.ts. Do not change any other files.
```

---

### Prompt: Change the layout of the asset card
```
I have a Framer plugin. The asset card UI is in src/components/AssetCard.tsx.
Card visual values (sizes, font sizes) are in src/design/layout.ts.

Here is AssetCard.tsx:
[PASTE FILE]

Here is layout.ts:
[PASTE FILE]

I want to [DESCRIBE CHANGE — e.g. "show the alt text directly on the card" or "make the card taller"].

Please only modify AssetCard.tsx and layout.ts. Do not change any other files.
```

---

### Prompt: Fix a bug
```
I have a Framer plugin. I have a bug: [DESCRIBE BUG EXACTLY — what you clicked, what happened, what you expected].

The most likely relevant files based on the bug are:
- [FILE 1]: [PASTE CONTENT]
- [FILE 2]: [PASTE CONTENT]

Here is the full project structure for context:
[PASTE THE FILE MAP FROM SECTION 3 OF THIS README]

Please identify the cause and provide the minimal fix. Do not rewrite unrelated code.
```

---

### Prompt: Add a new searchable field
```
I have a Framer plugin. I want to add a new field to the asset data model.

Here is src/types.ts (the data model):
[PASTE FILE]

Here is src/lib/framerApi.ts (where assets are loaded from Framer):
[PASTE FILE]

I want to add a field called [FIELD NAME] that contains [DESCRIBE WHAT IT STORES].
The data comes from [WHERE IN THE FRAMER API / WHICH NODE PROPERTY].

Please:
1. Add the field to AssetEntry in types.ts
2. Populate it in framerApi.ts
3. Tell me which other files I need to update (search haystack, card display, etc.)
```

---

### Prompt: Change the detail panel layout
```
I have a Framer plugin. The detail panel (shown when clicking an asset) is in src/components/DetailPanel.tsx.
It receives feature components as children via props.

Here is DetailPanel.tsx:
[PASTE FILE]

I want to [DESCRIBE CHANGE — e.g. "move the navigator above the preview" or "add a copy URL button"].

Please only modify DetailPanel.tsx. If you need a new sub-component, create it in src/features/ following the pattern:
- FeatureName.tsx (UI only)
- useFeatureName.ts (logic only)
```

---

### Prompt: Change the Framer API behaviour
```
I have a Framer plugin. All Framer API calls are isolated in src/lib/framerApi.ts.

Here is framerApi.ts:
[PASTE FILE]

Here is the Framer plugin API reference relevant to my change:
[PASTE RELEVANT FRAMER DOCS OR API DESCRIPTION]

I want to [DESCRIBE CHANGE — e.g. "also load SVG assets" or "fix the CMS save to use updateItem instead of addItems"].

Please only modify framerApi.ts. Do not change feature files, hooks, or components.
```

---

## 10. How to give this project to another AI (ChatGPT, Gemini, etc.)

**For:** You, when switching AI assistants

### Step 1 — Give the AI the project context

Paste this as your first message:

```
I'm working on a Framer plugin called "Asset Manager". 
It has a strict modular architecture I need you to respect.

Architecture rules:
1. Features live in src/features/featureName/ as TWO files:
   - FeatureName.tsx (UI/JSX only, zero API calls)
   - useFeatureName.ts (logic/state only, zero JSX)
2. ALL Framer API calls go in src/lib/framerApi.ts ONLY
3. ALL colours/sizes go in src/design/tokens.ts and src/design/layout.ts ONLY  
4. Feature flags live in src/plugin.config.ts → FEATURES object
5. src/App.tsx only wires features together — no logic
6. src/types.ts is the single source of truth for all TypeScript types

Never:
- Put Framer API calls inside components or feature files
- Put JSX inside logic/hook files
- Change multiple unrelated files at once
- Modify lib/ files unless explicitly asked

I'll paste the relevant files for each task. 
Please confirm you understand the architecture before we start.
```

### Step 2 — For each task, paste only the relevant files

The AI doesn't need to see all 15+ files for every change. Use this table:

| Task | Files to paste |
|---|---|
| Visual/UI change | The specific `.tsx` + `design/tokens.ts` |
| New feature | `types.ts` + `plugin.config.ts` + `App.tsx` |
| Search change | `features/search/useSearch.ts` + `types.ts` |
| Bug fix | The 1-2 files most likely causing the bug |
| Framer API change | `lib/framerApi.ts` + `types.ts` |
| Data model change | `types.ts` + `lib/framerApi.ts` + `hooks/useAssets.ts` |

### Step 3 — Verify the AI's output before using it

Ask the AI: **"Which files did you change, and did you change any files I didn't ask you to?"**

A correct answer only names the files relevant to your task.
If it changed `App.tsx` when you asked for a colour change — something went wrong.

### Differences between AI assistants

| | Claude | ChatGPT | Gemini |
|---|---|---|---|
| Best for | Architecture, refactoring, complex logic | Quick code edits, explanations | Research, documentation |
| Paste files as | Plain text in the message | Plain text or attachments | Plain text in the message |
| Context limit | Large (can see full project) | Medium (paste key files only) | Large |
| Tip | Ask it to explain changes before making them | Give one task at a time | Good for writing docs/comments |

---

## 11. Architecture rules — for developers

**For:** Developers hired to work on this project

### The two-file feature pattern
Every feature must be split into exactly two files:

```ts
// useMyFeature.ts — LOGIC ONLY
// ✅ useState, useCallback, useEffect
// ✅ imports from lib/, hooks/, types.ts
// ❌ NO JSX, NO import React, NO className strings

// MyFeature.tsx — UI ONLY  
// ✅ JSX, className, onClick handlers
// ✅ imports from design/ for constants
// ❌ NO framer-plugin imports
// ❌ NO async Framer API calls
// ❌ NO useState for business logic (use the hook)
```

### Dependency rules (what can import what)
```
plugin.config.ts  ← imports nothing from src/
types.ts          ← imports nothing
design/           ← imports from types.ts only
lib/              ← imports from types.ts, design/
hooks/            ← imports from lib/, types.ts
features/         ← imports from hooks/, lib/, types.ts, design/
components/       ← imports from features/, types.ts, design/
App.tsx           ← imports everything, exports nothing except App
```

**Circular imports are forbidden.**

### Adding a new asset source (e.g. SVGs)
1. Add `AssetType = "image" | "video" | "svg"` to `types.ts`
2. Add `loadCanvasSvgs()` to `lib/framerApi.ts`
3. Call it in `loadAssets()` in `lib/framerApi.ts`
4. Add a feature flag: `FEATURES.svgAssets: true`
5. Update `AssetCard.tsx` to handle `assetType === "svg"` rendering
6. Nothing else changes

### CSS conventions
- Never use raw colour values in CSS — always `var(--token-name)`
- Token names map 1:1 from `design/tokens.ts` to `:root {}` in `App.css`
- Add new CSS variables to both `tokens.ts` (the value) and `App.css :root` (the variable)

---

## 12. Future plugin system

**For:** You, planning ahead

### How your plugins can share code
Each plugin you build should have this structure:
```
my-plugins/
├── shared/              ← copy of lib/, hooks/, types.ts
│   ├── lib/
│   ├── hooks/
│   └── types.ts
│
├── asset-manager/       ← this plugin
│   ├── src/
│   └── plugin.config.ts → PLUGIN_REGISTRY_ID: "com.yourname.asset-manager"
│
└── future-plugin/
    ├── src/
    └── plugin.config.ts → PLUGIN_REGISTRY_ID: "com.yourname.future-plugin"
```

### Connecting plugins via API (future)
The `PLUGIN_REGISTRY_ID` in each `plugin.config.ts` is the foundation. When you're ready:
1. A shared registry reads all `PLUGIN_REGISTRY_ID` values
2. Plugins can call each other's features by registry ID
3. Framer's `getPluginData()` / `setPluginData()` can pass data between plugin sessions

### Figma → plugin via MCP (future)
When you design a new UI in Figma and connect via MCP:
1. Figma variables → `src/design/tokens.ts` (colours map directly)
2. Figma frame sizes → `src/design/layout.ts`
3. No other files change
4. The connection point is already built and waiting

---

## 13. Troubleshooting

**For:** Everyone

### Plugin shows blank / doesn't load
```bash
npm install          # missing dependencies
npm run dev          # check for errors in terminal
```
In Framer: **Plugins → Development → reload**

### A colour change didn't apply everywhere
Check that the CSS variable in `App.css :root {}` matches the token name in `tokens.ts`.
Example: if you added `bgNew: "#fff"` to tokens, you need `--bg-new: #fff;` in CSS.

### TypeScript errors after editing types.ts
TypeScript will highlight every file that uses the changed type. This is intentional — it's showing you everything that needs updating. Fix each highlighted file one by one.

### Feature not showing up after adding it
Checklist:
- [ ] Feature flag set to `true` in `plugin.config.ts`?
- [ ] Import added at top of `App.tsx`?
- [ ] Hook called inside `App()` function?
- [ ] Component rendered inside the JSX return?
- [ ] `npm run dev` restarted?

### "Cannot find module" error
Check that the import path in your new file uses `../../` correctly.
Feature files import from: `../../types`, `../../lib/framerApi`, `../../design/tokens`

### Asset count is wrong
The counts in filter tabs are calculated in `src/features/filters/useFilters.ts` → `buildCountHelpers()`. Each tab's count respects the other active filter. If counts seem off after adding a new filter, update `buildCountHelpers`.

---

*Last updated: v2.0.0*
*Plugin registry ID: com.yourname.asset-manager*
