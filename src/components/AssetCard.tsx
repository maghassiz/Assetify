import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { AssetEntry } from "../types"
import { VideoThumb } from "./VideoThumb"
import type { LayoutMode } from "../features/assetGrid/AssetGrid"

function displayName(asset: AssetEntry): string {
  if (asset.name && asset.name !== "Untitled") return asset.name
  const filename = asset.url.split("/").pop()?.split("?")[0] ?? ""
  return filename.replace(/[-_]/g, " ").replace(/\.\w+$/, "") || "Untitled"
}

// Fetch blob and trigger real download (works cross-origin)
async function downloadAsset(url: string, name: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const ext = url.split("?")[0].split(".").pop() ?? "jpg"
    const href = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = href
    a.download = `${name}.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(href), 5000)
  } catch {
    // fallback: open in new tab
    window.open(url, "_blank")
  }
}

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
  </svg>
)
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z" />
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M221.66,90.34l-72,72a8,8,0,0,1-11.32-11.32L196.69,93H40a8,8,0,0,1,0-16H210a8,8,0,0,1,7.25,4.59A8,8,0,0,1,221.66,90.34Z" />
  </svg>
)
const IconDots = () => (
  <svg width="15" height="15" viewBox="0 0 256 256" fill="currentColor">
    <path d="M112,60a16,16,0,1,1,16,16A16,16,0,0,1,112,60Zm16,52a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm0,68a16,16,0,1,0,16,16A16,16,0,0,0,128,180Z" />
  </svg>
)
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,134.34V40a8,8,0,0,0-16,0v94.34L93.66,106.34a8,8,0,0,0-11.32,11.32Z" />
  </svg>
)


interface AssetCardProps {
  asset: AssetEntry
  hasSelection: boolean
  layout: LayoutMode
  onOpen: () => void
  onAdd: (e: React.MouseEvent) => void
  adding: boolean
  justAdded: boolean
}

export function AssetCard({
  asset, hasSelection, layout, onOpen, onAdd, adding, justAdded,
}: AssetCardProps) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)

  const usageCount = asset.source === "canvas" ? asset.nodeIds.length : null
  const hasNoAlt = asset.assetType === "image" && !asset.altText

  // Close menu on outside click or scroll
  const portalMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      const inWrap = menuRef.current?.contains(e.target as Node)
      const inPortal = portalMenuRef.current?.contains(e.target as Node)
      if (!inWrap && !inPortal) setMenuOpen(false)
    }
    const closeOnScroll = () => setMenuOpen(false)
    document.addEventListener("mousedown", close)
    window.addEventListener("scroll", closeOnScroll, true)
    return () => {
      document.removeEventListener("mousedown", close)
      window.removeEventListener("scroll", closeOnScroll, true)
    }
  }, [menuOpen])

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
            : <img src={asset.url} alt={asset.altText} loading="lazy" className="row-thumb-img"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = ".25" }} />
          }
        </div>

        {/* Info — mirrors grid card */}
        <div className="row-info" onClick={onOpen}>
          <div className="row-name">{displayName(asset)}</div>
          <div className="row-badges">
            {usageCount !== null
              ? <span className="row-usage">{usageCount} Used</span>
              : <span className="row-usage">{asset.locationLabel}</span>
            }
            <span className="card-type-badge row-type-badge">
              {asset.assetType === "video" ? "VIDEO" : "IMAGE"}
            </span>
            {hasNoAlt && <span className="card-noalt-badge">NO ALT</span>}
          </div>
        </div>

        {/* Dots menu */}
        <div
          className="row-dots-wrap"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="row-dots-btn"
            onClick={() => setMenuOpen((v) => !v)}
            title="More options"
          >
            <IconDots />
          </button>
          {menuOpen && (
            <div className="card-dots-menu row-dots-menu">
              <button
                className="card-dots-item"
                onClick={() => {
                  setMenuOpen(false)
                  downloadAsset(asset.url, displayName(asset))
                }}
              >
                <IconDownload />
                Download asset
              </button>

            </div>
          )}
        </div>

        {/* Primary action */}
        <button
          className={["card-btn card-btn-primary", adding ? "loading" : "", justAdded ? "success" : ""].filter(Boolean).join(" ")}
          onClick={onAdd} disabled={adding}
          title={asset.assetType === "video" ? "Go to video" : hasSelection ? "Set on frame" : "Add to canvas"}
        >
          {adding ? <span className="btn-spinner btn-spinner-white" />
            : justAdded ? <IconCheck />
              : asset.assetType === "video" ? <IconArrow />
                : <IconPlus />}
        </button>
      </div>
    )
  }

  // ── Grid layout ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`asset-card${hovered ? " hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="card-img-wrap" onClick={onOpen}>
        {asset.assetType === "video"
          ? <VideoThumb url={asset.url} className="card-img" />
          : <img src={asset.url} alt={asset.altText} loading="lazy" className="card-img"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = ".25" }} />
        }

        {/* Top-left: type + no-alt badges */}
        <div className="card-badges-tl">
          <span className="card-type-badge">
            {asset.assetType === "video" ? "VIDEO" : "IMAGE"}
          </span>
          {hasNoAlt && <span className="card-noalt-badge">NO ALT</span>}
        </div>

        {/* Bottom: frosted info panel */}

        <div className="card-info-panel" onClick={onOpen}>
          <div className="card-panel-left">
            <div className="card-panel-name">{displayName(asset)}</div>
            {usageCount !== null
              ? <div className="card-panel-usage">{usageCount} Used</div>
              : <div className="card-panel-usage card-panel-usage-loc">{asset.locationLabel}</div>
            }
          </div>

          <button
            className={["card-panel-btn", adding ? "loading" : "", justAdded ? "success" : ""].filter(Boolean).join(" ")}
            onClick={(e) => { e.stopPropagation(); onAdd(e) }}
            disabled={adding}
            title={asset.assetType === "video" ? "Go to video" : hasSelection ? "Set on frame" : "Add to canvas"}
          >
            {adding ? <span className="btn-spinner btn-spinner-white" />
              : justAdded ? <IconCheck />
                : asset.assetType === "video" ? <IconArrow />
                  : <IconPlus />}
          </button>
        </div>

      </div>

      {/* Three-dots menu — outside card-img-wrap so it isn't clipped */}
      <div
        className="card-dots-wrap"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="card-dots-btn"
          ref={dotsRef}
          onClick={() => {
            if (!menuOpen && dotsRef.current) {
              const r = dotsRef.current.getBoundingClientRect()
              setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
            }
            setMenuOpen((v) => !v)
          }}
          title="More options"
        >
          <IconDots />
        </button>

        {menuOpen && menuPos && createPortal(
          <div
            ref={portalMenuRef}
            className="card-dots-menu"
            style={{ position: "fixed", top: menuPos.top, right: menuPos.right, left: "auto" }}
          >
            <button
              className="card-dots-item"
              onClick={() => {
                setMenuOpen(false)
                downloadAsset(asset.url, displayName(asset))
              }}
            >
              <IconDownload />
              Download asset
            </button>

          </div>,
          document.body
        )}
      </div>

    </div>
  )
}