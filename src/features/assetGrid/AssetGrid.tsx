// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Asset Grid                                                     ║
// ║  The scrollable card grid, plus loading / error / empty states.          ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: loading text, error text, grid layout class names      ║
// ║  → Card UI: ../../components/AssetCard.tsx                               ║
// ║  → Empty state: ../../components/EmptyState.tsx                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import type { AssetEntry, SourceFilter } from "../../types"
import { AssetCard }  from "../../components/AssetCard"
import { EmptyState } from "../../components/EmptyState"

export type LayoutMode = "grid" | "list"

interface AssetGridProps {
  assets:       AssetEntry[]
  loading:      boolean
  loadError:    string | null
  sourceFilter: SourceFilter
  hasSelection: boolean
  addingKey:    string | null
  addedKey:     string | null
  layout:       LayoutMode
  onOpen:       (a: AssetEntry) => void
  onAdd:        (a: AssetEntry, e: React.MouseEvent) => void
  onRetry:      () => void
}

export function AssetGrid({
  assets, loading, loadError, sourceFilter,
  hasSelection, addingKey, addedKey, layout,
  onOpen, onAdd, onRetry,
}: AssetGridProps) {
  return (
    <div className="grid-area">
      {loading ? (
        <div className="state-msg">
          <div className="spinner" />
          Loading assets…
        </div>
      ) : loadError ? (
        <div className="state-msg error">
          <div>⚠ {loadError}</div>
          <button className="retry-btn" onClick={onRetry}>Retry</button>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState sourceFilter={sourceFilter} />
      ) : (
        <div className={layout === "list" ? "asset-list" : "asset-grid"}>
          {assets.map((asset) => (
            <AssetCard
              key={asset.key}
              asset={asset}
              hasSelection={hasSelection}
              layout={layout}
              onOpen={() => onOpen(asset)}
              onAdd={(e) => onAdd(asset, e)}
              adding={addingKey === asset.key}
              justAdded={addedKey === asset.key}
            />
          ))}
        </div>
      )}
    </div>
  )
}
