# Framer Asset Manager Plugin

A plugin that lets you **view, filter, and manage all images** in your Framer project — from both the Canvas and CMS — and edit their alt text directly.

## Features

- 🖼 **View all images** from Canvas nodes (backgroundImage) and CMS image fields
- 🏷 **Filter** by All / Canvas / CMS with live counts
- 🔍 **Search** by asset name
- 🔢 **Usage count** — see how many canvas nodes use the same image
- ✏️ **Edit alt text** and save it back to canvas nodes or CMS items in one click
- ↗ **Navigate to asset** — zoom to the canvas node or open the CMS item

---

## Setup

### 1. Scaffold a new Framer plugin

If you don't have one already:

```bash
npx create-framer-plugin@latest my-asset-manager
cd my-asset-manager
```

### 2. Copy the files

Replace / add the following files in your plugin project:

| File | Destination |
|------|-------------|
| `App.tsx` | `src/App.tsx` |
| `AssetCard.tsx` | `src/AssetCard.tsx` |
| `App.css` | `src/App.css` |
| `main.tsx` | `src/main.tsx` |

### 3. Install dependencies

```bash
npm install
```

### 4. Run in dev mode

```bash
npm run dev
```

Then open Framer, go to **Plugins → Development**, and load your plugin URL (usually `http://localhost:5173`).

### 5. Build for publishing

```bash
npm run build
```

---

## How It Works

### Canvas Images
The plugin calls `framer.getNodesWithAttributeSet("backgroundImage")` to get every canvas node that has a background image. It groups them by `image.id` so duplicate uses of the same image are counted together. Saving alt text calls `node.setAttributes({ backgroundImage: image.cloneWithAttributes({ altText }) })` on all nodes that share that image.

### CMS Images
The plugin iterates `framer.getCollections()` → `collection.getFields()` → `collection.getItems()` and picks out any field of type `"image"`. Saving alt text calls `item.setAttributes({ fieldData: { [fieldId]: image.cloneWithAttributes({ altText }) } })`.

### Navigation
- **Canvas**: `framer.setSelection([nodeId])` + `framer.zoomIntoView([nodeId])`
- **CMS**: `framer.navigateTo(itemId)`

---

## Notes

- The plugin **requires full design permissions** to read and write canvas nodes and CMS data.
- CMS access gracefully falls back if collections are not available in the current mode.
- Images are loaded lazily so the plugin stays fast even in large projects.
