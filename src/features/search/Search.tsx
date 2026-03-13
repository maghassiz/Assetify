// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Search — UI                                                    ║
// ║  Toolbar row: search input + refresh + grid/list toggle.                 ║
// ║  Theme is now handled automatically by Framer (data-framer-theme).       ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: placeholder text, button labels, icons                 ║
// ║  → Logic lives in: useSearch.ts                                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import type { LayoutMode } from "../assetGrid/AssetGrid"

interface SearchProps {
  value:          string
  layout:         LayoutMode
  onChange:       (v: string) => void
  onClear:        () => void
  onRefresh:      () => void
  onLayoutChange: (l: LayoutMode) => void
}

export function Search({ value, layout, onChange, onClear, onRefresh, onLayoutChange }: SearchProps) {
  return (
    <div className="search-row">
      {/* Search input */}
      <div className="search-wrap">
        <span className="search-icon">⌕</span>
        <input
          className="search-input"
          placeholder="Search name, location, alt text…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && <button className="clear-btn" onClick={onClear}>✕</button>}
      </div>

      {/* Refresh */}
      <button className="refresh-btn" onClick={onRefresh} title="Refresh assets">↺</button>

      {/* Layout toggle */}
      <div className="layout-toggle">
        <button
          className={`layout-icon-btn${layout === "grid" ? " active" : ""}`}
          onClick={() => onLayoutChange("grid")}
          title="Grid view"
        >⊞</button>
        <button
          className={`layout-icon-btn${layout === "list" ? " active" : ""}`}
          onClick={() => onLayoutChange("list")}
          title="List view"
        >☰</button>
      </div>
    </div>
  )
}
