// ─── Domain types ─────────────────────────────────────────────────────────────
// Edit this file to add new asset types, sources, or filter options.
// Everything else in the codebase imports from here — change once, applies everywhere.

export type AssetSource = "canvas" | "cms"
export type AssetType = "image" | "video"
export type StorageSource = "framer" | "external"

export type SourceFilter = "all" | AssetSource
export type StorageFilter = "all" | StorageSource

// ─── Core data model ──────────────────────────────────────────────────────────
export interface AssetEntry {
  /** Stable unique key: "canvas:<imageId>" | "video:<url>" | "cms:<colId>:<itemId>:<fieldId>" */
  key: string
  name: string
  url: string
  altText: string
  source: AssetSource
  assetType: AssetType
  storageSource: StorageSource
  /** Canvas node IDs that use this asset (empty for CMS entries) */
  nodeIds: string[]
  /** Human-readable location: "Home · 3 nodes" or "Blog › my-post" */
  locationLabel: string
  /** Page name resolved from the first canvas node ("Home", "/visit", etc.) */
  pageName: string
  /** First canvas nodeId — used for single-jump navigation */
  navigateId?: string
  /** CMS identifiers — present only for source === "cms" */
  cmsCollectionId?: string
  cmsItemId?: string
}

// ─── Filter state (passed between useFilter hook and UI) ──────────────────────
export interface FilterState {
  sourceFilter: SourceFilter
  storageFilter: StorageFilter
  search: string
}