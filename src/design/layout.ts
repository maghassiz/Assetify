// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  LAYOUT                                                                  ║
// ║  All structural/sizing decisions for the plugin UI.                      ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: any value below                                        ║
// ║  ❌ DO NOT EDIT: tokens.ts (colours) — this file is sizing only          ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ─── Asset grid ───────────────────────────────────────────────────────────────
export const grid = {
  /** Number of columns in the asset grid */
  columns:     2,
  /** Gap between cards in px */
  gap:         8,
  /** Padding around the grid area in px */
  padding:     12,
  /** Aspect ratio of the card thumbnail (width / height) */
  thumbRatio:  1,     // 1 = square. Try 4/3 for landscape thumbnails.
} as const

// ─── Card ─────────────────────────────────────────────────────────────────────
export const card = {
  /** Height of the footer area below the thumbnail in px */
  footerHeight:  52,
  /** Badge font size in px */
  badgeFontSize: 9,
  /**
   * Max characters for the asset display name before CSS truncation kicks in.
   * The actual clipping is done via text-overflow: ellipsis in CSS; this value
   * documents the intent and can be used if you add a JS truncation helper.
   */
  nameMaxChars: 32,
} as const

// ─── Page name sentinel ───────────────────────────────────────────────────────
// The value the asset loader writes when it cannot resolve a page name.
// AssetCard.tsx reads this to decide whether to show the page chip or hide it.
// Change this here if you rename the sentinel in your loader — one place to update.
export const UNKNOWN_PAGE_SENTINEL = "Unknown page" as const

// ─── Detail panel ─────────────────────────────────────────────────────────────
export const panel = {
  /** Height of the image/video preview in the detail panel in px */
  previewHeight: 160,
  /** Number of rows in the alt text textarea */
  altTextRows:   3,
  /** Max characters for nav page-name label before truncation */
  pageNameMaxChars: 20,
} as const

// ─── Z-index scale ────────────────────────────────────────────────────────────
// Higher number = on top. Keep this as the single registry of layers.
export const zIndex = {
  header:  10,
  overlay: 100,
  panel:   110,
  toast:   120,
} as const

// ─── Header ───────────────────────────────────────────────────────────────────
export const header = {
  logoSize:   28,   // px, the "A" mark
  logoRadius: 8,    // px
} as const
