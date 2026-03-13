import type { SourceFilter } from "../types"

interface EmptyStateProps {
  sourceFilter: SourceFilter
}

export function EmptyState({ sourceFilter }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⊡</div>
      <div className="empty-title">No assets found</div>
      <div className="empty-sub">
        {sourceFilter === "all"
          ? "This project has no assets yet"
          : `No ${sourceFilter} assets found`}
      </div>
    </div>
  )
}
