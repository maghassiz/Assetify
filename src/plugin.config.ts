// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  PLUGIN CONFIGURATION                                                    ║
// ║  This is the master control file for the entire plugin.                  ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: names, sizes, feature flags                            ║
// ║  ❌ DO NOT EDIT: anything in lib/, hooks/, types.ts                      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ─── Identity ─────────────────────────────────────────────────────────────────
export const PLUGIN_NAME    = "Assetify"
export const PLUGIN_VERSION = "2.0.0"
export const PLUGIN_LABEL   = "Advanced Asset Manager"   // shown below the title

// ─── Window ───────────────────────────────────────────────────────────────────
export const PLUGIN_UI = {
  width:     320,
  height:    620,
  resizable: true,
} as const

// ─── Feature flags ────────────────────────────────────────────────────────────
// Set any flag to `false` to completely disable that feature.
// The code for that feature still exists — it just won't render or run.
// This lets you safely ship an unfinished feature without breaking anything.
export const FEATURES = {
  /** Search bar across name, location, alt text, page */
  search:          true,
  /** ALL / CANVAS / CMS source filter tabs */
  sourceFilter:    true,
  /** FRAMER / EXTERNAL storage filter tabs */
  storageFilter:   true,
  /** Sequential usage navigator in the detail panel */
  usageNavigator:  true,
  /** Alt text editor and save in the detail panel */
  altTextEditor:   true,
  /** Add image / set on frame canvas actions */
  canvasActions:   true,
} as const

// ─── Behaviour ────────────────────────────────────────────────────────────────
/** How long (ms) the ✓ success state shows after adding to canvas */
export const ADD_SUCCESS_DURATION_MS = 1400

/** Max usage dots shown in the navigator before hiding them (too crowded) */
export const NAV_DOTS_MAX = 12

/** Usage count threshold above which the count badge turns amber ("hot") */
export const USAGE_HOT_THRESHOLD = 5

// ─── Future plugin registry ───────────────────────────────────────────────────
// When you build more plugins, each one will have a config like this.
// A shared registry can import all of them to discover available plugins,
// share utilities, or connect via API.
export const PLUGIN_REGISTRY_ID = "com.yourname.asset-manager"
