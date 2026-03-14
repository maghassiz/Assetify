import type { SourceFilter, StorageFilter } from "../../types"

interface FiltersProps {
  sourceFilter: SourceFilter
  storageFilter: StorageFilter
  onSourceChange: (f: SourceFilter) => void
  onStorageChange: (f: StorageFilter) => void
  countFor: (f: SourceFilter) => number
  storageCountFor: (f: StorageFilter) => number
}

const SOURCE_TABS: { label: string; value: SourceFilter }[] = [
  { label: "All", value: "all" },
  { label: "Canvas", value: "canvas" },
  { label: "CMS", value: "cms" },
]

const STORAGE_OPTIONS: { label: string; value: StorageFilter }[] = [
  { label: "All", value: "all" },
  { label: "Framer", value: "framer" },
  { label: "External", value: "external" },
]

export function Filters({
  sourceFilter, storageFilter,
  onSourceChange, onStorageChange,
  countFor, storageCountFor,
}: FiltersProps) {
  return (
    <div className="filter-bar">

      {/* Scrollable source tabs + fade overlay wrapper */}
      <div className="filter-source-scroll-wrap">
        <div className="filter-source-tabs">
          {SOURCE_TABS.map(({ label, value }) => (
            <button
              key={value}
              className={`filter-source-tab${sourceFilter === value ? " active" : ""}`}
              onClick={() => onSourceChange(value)}
            >
              {label}
              <span className="filter-source-count">{countFor(value)}</span>
            </button>
          ))}
        </div>
        {/* Right fade — fades into bg before the storage divider */}
        <div className="filter-source-fade" />
      </div>

      {/* Storage dropdown — always visible, never scrolls */}
      <div className="filter-storage-wrap">
        <span className="filter-storage-label">Storage :</span>
        <div className="filter-storage-select-wrap">
          <select
            className="filter-storage-select"
            value={storageFilter}
            onChange={(e) => onStorageChange(e.target.value as StorageFilter)}
          >
            {STORAGE_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <svg className="filter-storage-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

    </div>
  )
}