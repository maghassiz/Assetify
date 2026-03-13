import { useState } from "react"
import type { AssetEntry } from "../types"
import { VideoThumb } from "./VideoThumb"
import type { LayoutMode } from "../features/assetGrid/AssetGrid"

/** Derive a human-readable display name — fall back to URL filename if "Untitled" or empty */
function displayName(asset: AssetEntry): string {
  if (asset.name && asset.name !== "Untitled") return asset.name
  const filename = asset.url.split("/").pop()?.split("?")[0] ?? ""
  return filename.replace(/[-_]/g, " ").replace(/\.\w+$/, "") || "Untitled"
}

interface AssetCardProps {
  asset:        AssetEntry
  hasSelection: boolean
  layout:       LayoutMode
  onOpen:       () => void
  onAdd:        (e: React.MouseEvent) => void
  adding:       boolean
  justAdded:    boolean
}

export function AssetCard({
  asset, hasSelection, layout, onOpen, onAdd, adding, justAdded,
}: AssetCardProps) {
  const [hovered, setHovered] = useState(false)

  const actionBtn = (
    <button
      className={[
        "add-btn",
        adding    ? "loading"  : "",
        justAdded ? "success"  : "",
        asset.assetType === "video" ? "video-btn" : hasSelection ? "set-btn" : "",
      ].filter(Boolean).join(" ")}
      onClick={onAdd}
      disabled={adding}
      title={
        asset.assetType === "video"   ? "Go to video on canvas"
          : hasSelection              ? "Set image on selected frame"
          : "Add image to canvas"
      }
    >
      {adding ? <span className="btn-spinner" />
        : justAdded               ? "✓"
        : asset.assetType === "video" ? "↗"
        : hasSelection            ? "↙"
        : "+"}
    </button>
  )

  // ── List layout ─────────────────────────────────────────────────────────────
  if (layout === "list") {
    return (
      <div
        className={`asset-row${hovered ? " hovered" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div className="row-thumb" onClick={onOpen}>
          {asset.assetType === "video"
            ? <VideoThumb url={asset.url} className="row-thumb-img" />
            : <img
                src={asset.url}
                alt={asset.altText}
                loading="lazy"
                className="row-thumb-img"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = ".25" }}
              />
          }
        </div>

        {/* Info */}
        <div className="row-info" onClick={onOpen}>
          <div className="row-name">{displayName(asset)}</div>
          <div className="row-meta">
            <span className={`row-badge source-${asset.source}`}>{asset.source}</span>
            {asset.assetType === "video" && <span className="row-badge badge-video-sm">▶</span>}
            {asset.assetType === "image" && !asset.altText && <span className="row-badge badge-noalt-sm">no alt</span>}
            <span className="row-loc">
              {asset.pageName ? `${asset.pageName} · ` : ""}
              {asset.source === "canvas"
                ? `${asset.nodeIds.length} node${asset.nodeIds.length !== 1 ? "s" : ""}`
                : asset.locationLabel}
            </span>
          </div>
        </div>

        {/* Action */}
        {actionBtn}
      </div>
    )
  }

  // ── Grid layout (default) ───────────────────────────────────────────────────
  return (
    <div
      className={`asset-card${hovered ? " hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="card-img-wrap" onClick={onOpen}>
        {asset.assetType === "video" ? (
          <VideoThumb url={asset.url} className="card-img" />
        ) : (
          <img
            src={asset.url}
            alt={asset.altText}
            loading="lazy"
            className="card-img"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = ".25" }}
          />
        )}
        <span className={`card-badge source-${asset.source}`}>{asset.source}</span>
        <span className={`card-badge badge-storage storage-${asset.storageSource}`}>
          {asset.storageSource === "framer" ? "⬡ framer" : "↗ external"}
        </span>
        {asset.assetType === "video" ? (
          <span className="card-badge badge-tr badge-video">▶ VIDEO</span>
        ) : (
          asset.source === "canvas" && (
            <span className={`card-badge badge-tr badge-count${asset.nodeIds.length > 5 ? " hot" : ""}`}>
              ×{asset.nodeIds.length}
            </span>
          )
        )}
        {asset.assetType === "image" && !asset.altText && (
          <span className="card-badge badge-br badge-noalt">no alt</span>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="card-info" onClick={onOpen}>
          <div className="card-name">{displayName(asset)}</div>
          <div className="card-loc">
            {asset.pageName && <span className="loc-page">⊞ {asset.pageName}</span>}
            {asset.locationLabel}
          </div>
        </div>
        {actionBtn}
      </div>
    </div>
  )
}
