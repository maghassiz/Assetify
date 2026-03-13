// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  DESIGN TOKENS                                                           ║
// ║  Every colour, size, shadow, and radius used in the plugin lives here.   ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: any value below                                        ║
// ║  ✅ FIGMA READY: these map 1-to-1 to Figma variable names               ║
// ║  ❌ DO NOT ADD: component logic — this file is purely visual values      ║
// ║                                                                          ║
// ║  HOW IT WORKS                                                            ║
// ║  App.css imports these via :root CSS variables.                          ║
// ║  If you connect Figma via MCP in the future, this file is the bridge.   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ─── Colour palette ──────────────────────────────────────────────────────────
// Raw colours — not used directly in components, only referenced by roles below
const palette = {
  white:      "#ffffff",
  grey50:     "#f5f5f7",
  grey100:    "#ebebed",
  grey150:    "#e0e0e4",
  grey200:    "#d1d1d6",
  grey300:    "#b8b8bf",
  grey500:    "#6e6e78",
  grey600:    "#4a4a52",
  grey700:    "#96969f",
  grey900:    "#1a1a1e",

  indigo400:  "#6366f1",
  indigo500:  "#4f52e0",
  indigoBg:   "rgba(99,102,241,0.10)",
  indigoBorder: "rgba(99,102,241,0.35)",

  green500:   "#16a34a",
  green400:   "#22c55e",
  greenBg:    "rgba(22,163,74,0.10)",
  greenBorder:"rgba(22,163,74,0.40)",

  blue500:    "#0284c7",
  blueBg:     "rgba(2,132,199,0.10)",
  blueBorder: "rgba(2,132,199,0.35)",

  amber700:   "#b45309",
  amberBg:    "rgba(180,83,9,0.09)",
  amberBorder:"rgba(180,83,9,0.30)",

  purple600:  "#7c3aed",
  purpleBg:   "rgba(124,58,237,0.10)",
  purpleBorder:"rgba(124,58,237,0.35)",

  red500:     "#dc2626",
} as const

// ─── Semantic colour roles ────────────────────────────────────────────────────
// These are what components use. Change a role here → updates everywhere.
// Naming: what it's FOR, not what it looks like ("bg-surface" not "white")
export const colors = {
  // Backgrounds
  bgApp:      palette.grey50,     // overall plugin background
  bgSurface:  palette.white,      // panels, header, cards
  bgInput:    palette.grey100,    // inputs, tag backgrounds
  bgHover:    palette.grey150,    // hover state on interactive elements

  // Borders
  border:     palette.grey200,
  borderStrong: palette.grey300,

  // Text
  textPrimary:   palette.grey900,
  textSecondary: palette.grey600,
  textMuted:     palette.grey500,
  textDim:       palette.grey700,  // placeholders, labels

  // Accent — indigo (primary interactive)
  accent:        palette.indigo500,
  accentLight:   palette.indigo400,
  accentBg:      palette.indigoBg,
  accentBorder:  palette.indigoBorder,

  // Green — add / success actions
  success:       palette.green500,
  successLight:  palette.green400,
  successBg:     palette.greenBg,
  successBorder: palette.greenBorder,

  // Blue — "set on frame" mode
  info:          palette.blue500,
  infoBg:        palette.blueBg,
  infoBorder:    palette.blueBorder,

  // Amber — hot/warning (high usage count, external CDN)
  warning:       palette.amber700,
  warningBg:     palette.amberBg,
  warningBorder: palette.amberBorder,

  // Purple — video assets, Framer storage badge
  video:         palette.purple600,
  videoBg:       palette.purpleBg,
  videoBorder:   palette.purpleBorder,

  // Red
  danger:        palette.red500,
} as const

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBase:   "14px",       // root font size — everything else is relative

  sizeXs:   "9px",
  sizeSm:   "10px",
  sizeMd:   "11px",
  sizeBase: "13px",
  sizeLg:   "15px",

  weightNormal:  "400",
  weightMedium:  "500",
  weightSemibold:"600",
  weightBold:    "700",

  trackingTight:  "-0.01em",
  trackingWide:   "0.04em",
  trackingWidest: "0.06em",
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────
// Based on a 4px grid. Use these values in layout.ts and CSS.
export const spacing = {
  "1":  "4px",
  "2":  "8px",
  "2.5":"10px",
  "3":  "12px",
  "3.5":"14px",
  "4":  "16px",
  "5":  "20px",
  "6":  "24px",
} as const

// ─── Radii ────────────────────────────────────────────────────────────────────
export const radii = {
  sm:  "4px",
  md:  "6px",
  lg:  "8px",
  xl:  "10px",
  full:"9999px",
} as const

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
  lg: "0 8px 24px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)",
} as const

// ─── Logo gradient ────────────────────────────────────────────────────────────
// The "A" logo mark in the header. Change these two stops to rebrand.
export const logoGradient = {
  from: palette.indigo400,
  to:   palette.purple600,
} as const
