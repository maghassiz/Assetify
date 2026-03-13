// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Search — Logic                                                 ║
// ║  The search predicate and state. Completely decoupled from the UI.       ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: which fields are searched (haystack array)             ║
// ║  → UI lives in: Search.tsx                                               ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useState, useMemo } from "react"
import type { AssetEntry } from "../../types"

export interface SearchState {
  search:    string
  setSearch: (v: string) => void
  matches:   (a: AssetEntry) => boolean
}

/**
 * Extracts the lowercase file extension (with dot) from a URL.
 * Strips query params and fragments before parsing.
 *
 * Examples:
 *   "https://cdn.example.com/clip.mp4?v=3" → ".mp4"
 *   "https://framerusercontent.com/images/abc.webp" → ".webp"
 *   "https://example.com/asset"             → ""
 *
 * This lets users search "mp4", ".mp4", "svg", ".webp" etc.
 * The dot is included so both "mp4" and ".mp4" match:
 *   ".mp4".includes("mp4") → true  ✓
 *   ".mp4".includes(".mp4") → true ✓
 */
function getExtension(url: string): string {
  try {
    const pathname    = url.split("?")[0].split("#")[0]
    const lastSegment = pathname.split("/").pop() ?? ""
    const dotIndex    = lastSegment.lastIndexOf(".")
    if (dotIndex === -1) return ""
    return lastSegment.slice(dotIndex).toLowerCase() // e.g. ".mp4", ".svg"
  } catch {
    return ""
  }
}

export function useSearch(): SearchState {
  const [search, setSearch] = useState("")

  // All fields that are included when a user types in the search bar.
  // To add a new searchable field, just add it to this array.
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return () => true
    return (a: AssetEntry) => {
      const haystack = [
        a.name,           // asset filename / field name
        a.locationLabel,  // "Home · 3 nodes" or "Blog › my-post"
        a.pageName,       // "Home", "/visit", "/society"
        a.altText,        // accessibility description
        a.assetType,      // "image" or "video"
        a.storageSource,  // "framer" or "external"
        a.source,         // "canvas" or "cms"
        // ── Format search ───────────────────────────────────────────────────
        // Includes the dot so both "mp4" and ".mp4" match:
        //   ".mp4".includes("mp4")  → true ✓
        //   ".mp4".includes(".mp4") → true ✓
        getExtension(a.url), // ".mp4", ".svg", ".png", ".jpg", ".webp" …
        // ── URL / external storage search ───────────────────────────────────
        // Lets users search for assets by their storage domain or path,
        // e.g. "s3.amazonaws", "cloudinary", "cdn.mysite.com", or a filename
        a.url,
      ].join(" ").toLowerCase()
      return haystack.includes(q)
    }
  }, [search])

  return { search, setSearch, matches }
}
