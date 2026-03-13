# Asset Manager Plugin — Designer's Guide

> **You don't need to understand all the code.**
> This guide tells you exactly which file to open for any change you want to make.
> Every file also has a header comment telling you what's safe to edit.

---

## "I want to change…"

| What you want to change | File to open |
|---|---|
| Plugin name, window size | `src/plugin.config.ts` |
| Turn a feature on or off | `src/plugin.config.ts` → `FEATURES` |
| Colours, gradients | `src/design/tokens.ts` |
| Font, text sizes | `src/design/tokens.ts` → `typography` |
| Spacing, padding | `src/design/tokens.ts` → `spacing` |
| Grid columns, card size | `src/design/layout.ts` |
| Detail panel preview height | `src/design/layout.ts` → `panel` |
| CSS classes, raw styles | `src/App.css` |
| Search bar placeholder text | `src/features/search/Search.tsx` |
| What fields are searched | `src/features/search/useSearch.ts` |
| Filter tab labels / icons | `src/features/filters/Filters.tsx` |
| Navigator button icons | `src/features/navigator/UsageNavigator.tsx` |
| Max navigator dots shown | `src/plugin.config.ts` → `NAV_DOTS_MAX` |
| Alt text placeholder text | `src/features/altText/AltTextEditor.tsx` |
| Loading / error messages | `src/features/assetGrid/AssetGrid.tsx` |
| Asset card layout | `src/components/AssetCard.tsx` |
| Detail panel layout | `src/components/DetailPanel.tsx` |
| How images are loaded | `src/lib/framerApi.ts` → `loadCanvasImages` |
| How CMS is loaded | `src/lib/framerApi.ts` → `loadCmsImages` |
| How storage source is detected | `src/lib/assetUtils.ts` → `detectStorageSource` |
| How page names are resolved | `src/lib/pageResolver.ts` |

---

## File map

```
src/
│
├── plugin.config.ts        ← MASTER SETTINGS: name, size, feature flags
│
├── design/
│   ├── tokens.ts           ← ALL colours, typography, spacing, shadows
│   └── layout.ts           ← grid columns, card/panel sizes, z-index
│
├── features/               ← ONE FOLDER PER FEATURE
│   ├── search/
│   │   ├── Search.tsx      ← visual only (the search bar)
│   │   └── useSearch.ts    ← logic only (predicate, state)
│   │
│   ├── filters/
│   │   ├── Filters.tsx     ← visual only (tab rows)
│   │   └── useFilters.ts   ← logic only (filter state, counts)
│   │
│   ├── altText/
│   │   ├── AltTextEditor.tsx ← visual only (textarea + button)
│   │   └── saveAltText.ts    ← logic only (the save function)
│   │
│   ├── navigator/
│   │   ├── UsageNavigator.tsx ← visual only (‹ 2/4 › dots)
│   │   └── useNavigator.ts    ← logic only (step/jump state)
│   │
│   └── assetGrid/
│       └── AssetGrid.tsx   ← grid + loading/error/empty states
│
├── components/             ← SHARED UI BUILDING BLOCKS
│   ├── AssetCard.tsx       ← one card in the grid
│   ├── DetailPanel.tsx     ← the full detail overlay (assembles features)
│   ├── EmptyState.tsx      ← "no assets found" screen
│   └── VideoThumb.tsx      ← video preview element
│
├── hooks/
│   └── useAssets.ts        ← loads all assets from Framer, manages refresh
│
├── lib/                    ← ⚠️ ENGINE ROOM — edit with care
│   ├── framerApi.ts        ← ALL calls to the Framer API
│   ├── assetUtils.ts       ← pure helpers (URL detect, storage detect)
│   └── pageResolver.ts     ← walks node ancestors to find page name
│
├── types.ts                ← ALL shared TypeScript types
├── App.tsx                 ← wires everything together (no logic here)
└── App.css                 ← all styles
```

---

## How to add a new feature

1. Create a folder: `src/features/myFeature/`
2. Create `MyFeature.tsx` — visual only, no Framer API calls
3. Create `useMyFeature.ts` — logic only, no JSX
4. Add a flag: `src/plugin.config.ts` → `FEATURES.myFeature: true`
5. Mount it in `src/App.tsx` inside `{FEATURES.myFeature && <MyFeature ... />}`

That's it. Nothing else needs to change.

---

## How to turn off a feature temporarily

Open `src/plugin.config.ts` and set the flag to `false`:

```ts
export const FEATURES = {
  search:         false,  // ← search bar hidden, but code still exists
  usageNavigator: true,
  // ...
}
```

The code for that feature is still there. You can turn it back on any time.

---

## Design token → CSS connection

`src/design/tokens.ts` exports named constants.
`src/App.css` maps them to CSS variables in `:root { }`.

When you connect Figma via MCP in the future:
- Your Figma variables → `src/design/tokens.ts`
- Nothing else needs to change

---

## For your future plugins

Each plugin should have its own `plugin.config.ts` with a unique `PLUGIN_REGISTRY_ID`.
The `src/lib/` and `src/hooks/` folders contain reusable code that any plugin can copy.
In the future, a shared npm package could expose `lib/` and `hooks/` so all your plugins
stay in sync from one place.

---

## What NOT to touch if you're unsure

- `src/lib/` — the engine. Works reliably. Only change if Framer's API changes.
- `src/types.ts` — TypeScript will tell you if something breaks after a change here.
- `src/hooks/useAssets.ts` — stable data loading. Don't touch unless Framer breaks.
