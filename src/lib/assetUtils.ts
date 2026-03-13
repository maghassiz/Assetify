import type { AssetType, StorageSource } from "../types"

// ─── Image data normaliser ────────────────────────────────────────────────────
// Framer's backgroundImage field can arrive in two shapes:
//   • Flat:  { url, altText, name }
//   • Typed: { type: "image", value: { url, altText, name } }
// We normalise both into a single consistent shape.
export function readImageData(
  raw: unknown
): { url: string; altText: string; name: string } | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as Record<string, unknown>
  const img =
    "value" in obj && obj.value && typeof obj.value === "object"
      ? (obj.value as Record<string, unknown>)
      : obj
  const url = (img["url"] ?? img["src"] ?? "") as string
  if (!url) return null
  return {
    url,
    altText: (img["altText"] ?? "") as string,
    name:    (img["name"]    ?? "") as string,
  }
}

// ─── Video URL detector ───────────────────────────────────────────────────────
// Detects common video file extensions in URLs.
// Note: streaming/CDN URLs without extensions (e.g. signed Cloudfront links)
// won't be caught here — those are handled via mimeType in framerApi.ts.
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|ogv|m4v|avi)(\?|$)/i.test(url)
}

// ─── Asset type classifier ────────────────────────────────────────────────────
export function classifyAssetType(url: string): AssetType {
  return isVideoUrl(url) ? "video" : "image"
}

// ─── Storage source detector ──────────────────────────────────────────────────
// Framer hosts its own assets on framerusercontent.com and framer.com.
// Everything else is treated as external (Cloudinary, S3, self-hosted, etc.).
// To add a new "first-party" host in the future, just extend FRAMER_HOSTS.
const FRAMER_HOSTS = ["framerusercontent.com", "framer.com"]

export function detectStorageSource(url: string): StorageSource {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (FRAMER_HOSTS.some((h) => host.endsWith(h))) return "framer"
  } catch { /* invalid URL — fall through */ }
  return "external"
}

// ─── Location label builder ───────────────────────────────────────────────────
// Centralises the "Home · 3 nodes" / "Blog › my-post" label formatting.
// If you want a different format, change it here — cards + detail panel update.
export function buildLocationLabel(opts: {
  pageName?:  string
  nodeCount?: number
  colName?:   string
  slug?:      string
  itemId?:    string
}): string {
  if (opts.colName !== undefined) {
    // CMS asset — show collection › slug
    const slug = opts.slug || opts.itemId || "item"
    return `${opts.colName} › ${slug}`
  }
  // Canvas asset
  const count    = opts.nodeCount ?? 0
  const used    = `${count} used`
  const pagePart = opts.pageName ? opts.pageName : "Canvas"
  return `${pagePart} · ${used}`
}

// ─── URL normaliser ───────────────────────────────────────────────────────────
// Strips query params & hash so the same image used across breakpoints
// (Desktop/Tablet/Phone) with different ?scale= params deduplicates correctly.
export function normalizeUrl(url: string): string {
  return url.split("?")[0].split("#")[0]
}
