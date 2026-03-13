import type { AssetEntry } from "../types"
import { VideoThumb } from "./VideoThumb"

interface DetailPanelProps {
  selected:      AssetEntry
  editingAlt:    string
  saving:        boolean
  saveSuccess:   boolean
  addingKey:     string | null
  addedKey:      string | null
  addMode:       "set" | "add" | null
  hasSelection:  boolean
  navIndex:      number
  nodePageNames: string[]
  onClose:       () => void
  onAltChange:   (v: string) => void
  onSaveAlt:     () => void
  onAdd:         () => void
  onStepNav:     (delta: 1 | -1) => void
  onNavToIndex:  (i: number) => void
  onNavToCurrent:() => void
}

export function DetailPanel({
  selected, editingAlt, saving, saveSuccess,
  addingKey, addedKey, addMode,
  hasSelection, navIndex, nodePageNames,
  onClose, onAltChange, onSaveAlt, onAdd,
  onStepNav, onNavToIndex, onNavToCurrent,
}: DetailPanelProps) {
  const isVideo    = selected.assetType === "video"
  const isCanvas   = selected.source === "canvas"
  const hasNodes   = selected.nodeIds.length > 0
  const isAdding   = addingKey === selected.key
  const justAdded  = addedKey  === selected.key

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="panel-header">
          <span className="panel-title">
            {selected.name && selected.name !== "Untitled"
              ? selected.name
              : selected.url
                  .split("/").pop()?.split("?")[0]   // filename from URL
                  ?.replace(/[-_]/g, " ")              // dashes → spaces
                  ?.replace(/\.\w+$/, "")              // strip extension
                || "Untitled"}
          </span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Preview */}
        <div className="preview-wrap">
          {isVideo ? (
            <VideoThumb url={selected.url} className="preview-media" />
          ) : (
            <img
              src={selected.url}
              alt={selected.altText}
              className="preview-media"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = ".25"
              }}
            />
          )}
          <span className={`detail-badge source-${selected.source}`}>
            {selected.source}
          </span>
          {isVideo && (
            <span className="detail-badge badge-video-detail">▶ VIDEO</span>
          )}
        </div>

        {/* Meta row */}
        <div className="meta-row">
          <div className="meta-box">
            <div className="meta-label">TYPE</div>
            <div className="meta-value">{selected.assetType.toUpperCase()}</div>
          </div>
          <div className="meta-box">
            <div className="meta-label">STORAGE</div>
            <div className={`meta-value storage-val-${selected.storageSource}`}>
              {selected.storageSource === "framer" ? "⬡ Framer" : "↗ External"}
            </div>
          </div>
          {isCanvas && (
            <div className="meta-box">
              <div className="meta-label">PAGE</div>
              <div className="meta-value meta-page">
                ⊞ {selected.pageName && selected.pageName !== "Unknown page"
                    ? selected.pageName
                    : "Canvas"}
              </div>
            </div>
          )}
          {isCanvas && (
            <div className="meta-box">
              <div className="meta-label">USAGE</div>
              <div className={`meta-value${selected.nodeIds.length > 5 ? " hot" : ""}`}>
                ×{selected.nodeIds.length} used
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="location-row">
          <span className="meta-label">LOCATION</span>
          <span className="location-tag">{selected.locationLabel}</span>
        </div>

        {/* Alt text — images only */}
        {!isVideo && (
          <div className="alt-section">
            <div className="meta-label">ALT TEXT</div>
            <textarea
              className="alt-input"
              rows={3}
              value={editingAlt}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Describe this image for accessibility…"
            />
            {saveSuccess && <div className="feedback-ok">✓ Alt text saved!</div>}
            {justAdded && (
              <div className="feedback-ok">
                {addMode === "set" ? "✓ Set on selected frame!" : "✓ Added to canvas!"}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="actions-col">

          {/* Sequential usage navigator — canvas assets only */}
          {isCanvas && hasNodes && (
            <div className="nav-section">
              <div className="nav-label">
                <span className="meta-label">NAVIGATE USAGES</span>
                <span className={`nav-counter${selected.nodeIds.length > 5 ? " hot" : ""}`}>
                  {navIndex + 1} / {selected.nodeIds.length}
                </span>
              </div>
              <div className="nav-controls">
                <button
                  className="nav-step-btn"
                  onClick={() => onStepNav(-1)}
                  disabled={selected.nodeIds.length <= 1}
                  title="Previous usage"
                >‹</button>

                <button
                  className="nav-go-btn"
                  onClick={onNavToCurrent}
                  title="Jump to this usage on canvas"
                >
                  <span className="nav-go-page">
                    {nodePageNames[navIndex] && nodePageNames[navIndex] !== "…"
                      ? `⊞ ${nodePageNames[navIndex]}`
                      : nodePageNames[navIndex] === "…"
                      ? "…"
                      : "Canvas"}
                  </span>
                  <span className="nav-go-arrow">↗ Go</span>
                </button>

                <button
                  className="nav-step-btn"
                  onClick={() => onStepNav(1)}
                  disabled={selected.nodeIds.length <= 1}
                  title="Next usage"
                >›</button>
              </div>

              {/* Progress dots — shown for 2–12 usages */}
              {selected.nodeIds.length > 1 && selected.nodeIds.length <= 12 && (
                <div className="nav-dots">
                  {selected.nodeIds.map((_, i) => (
                    <button
                      key={i}
                      className={`nav-dot${i === navIndex ? " active" : ""}`}
                      onClick={() => onNavToIndex(i)}
                      title={
                        nodePageNames[i]
                          ? `Usage ${i + 1} — ${nodePageNames[i]}`
                          : `Usage ${i + 1}`
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CMS navigate */}
          {selected.source === "cms" && selected.cmsItemId && (
            <button className="btn-nav-cms" onClick={onNavToCurrent}>
              ↗ Open in CMS
            </button>
          )}

          {/* Save alt + add/set row */}
          <div className="actions-row">
            {!isVideo && (
              <button className="btn-primary" onClick={onSaveAlt} disabled={saving}>
                {saving ? "Saving…" : "Save Alt Text"}
              </button>
            )}
            <button
              className={[
                "btn-add",
                isVideo       ? "video-mode" : "",
                hasSelection  ? "set-mode"   : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={onAdd}
              disabled={isAdding}
              title={
                isVideo
                  ? "Go to video on canvas"
                  : hasSelection
                  ? "Set on selected frame"
                  : "Add to canvas"
              }
            >
              {isAdding
                ? "…"
                : isVideo
                ? "↗ Go to"
                : hasSelection
                ? "↙ Set on frame"
                : "+ Add to canvas"}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
