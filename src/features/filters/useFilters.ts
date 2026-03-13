// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Filters — Logic                                                ║
// ║  Filter state and the count functions for each tab.                      ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: nothing really — this is pure filter logic             ║
// ║  → UI lives in: Filters.tsx                                              ║
// ║  → Search predicate comes from: ../search/useSearch.ts                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useState } from "react"
import type { AssetEntry, SourceFilter, StorageFilter } from "../../types"

interface UseFiltersResult {
  sourceFilter:    SourceFilter
  storageFilter:   StorageFilter
  setSourceFilter: (f: SourceFilter)  => void
  setStorageFilter:(f: StorageFilter) => void
  // These predicates are pure functions — pass them into filter() calls
  matchesSource:  (a: AssetEntry, f: SourceFilter)  => boolean
  matchesStorage: (a: AssetEntry, f: StorageFilter) => boolean
}

export function useFilters(): UseFiltersResult {
  const [sourceFilter,  setSourceFilter]  = useState<SourceFilter>("all")
  const [storageFilter, setStorageFilter] = useState<StorageFilter>("all")

  const matchesSource  = (a: AssetEntry, f: SourceFilter)  => f === "all" || a.source        === f
  const matchesStorage = (a: AssetEntry, f: StorageFilter) => f === "all" || a.storageSource  === f

  return {
    sourceFilter, storageFilter,
    setSourceFilter, setStorageFilter,
    matchesSource, matchesStorage,
  }
}

// ─── Derived counts ────────────────────────────────────────────────────────────
// Separated so they can be called with any combination of active filters.
// Each count respects the OTHER active filter + search for accuracy.
export function buildCountHelpers(
  assets: AssetEntry[],
  activeSource:  SourceFilter,
  activeStorage: StorageFilter,
  matchesSearch: (a: AssetEntry) => boolean,
  matchesSource:  (a: AssetEntry, f: SourceFilter)  => boolean,
  matchesStorage: (a: AssetEntry, f: StorageFilter) => boolean,
) {
  const countFor = (f: SourceFilter) =>
    assets.filter((a) => matchesSource(a, f) && matchesStorage(a, activeStorage) && matchesSearch(a)).length

  const storageCountFor = (f: StorageFilter) =>
    assets.filter((a) => matchesStorage(a, f) && matchesSource(a, activeSource) && matchesSearch(a)).length

  return { countFor, storageCountFor }
}
