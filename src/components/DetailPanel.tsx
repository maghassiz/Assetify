import { useEffect, useState } from "react"
import type { AssetEntry } from "../types"
import { VideoThumb } from "./VideoThumb"

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
  </svg>
)
const IconChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M213.66,154.34a8,8,0,0,1-11.32,0L128,80,53.66,154.34A8,8,0,0,1,42.34,143l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,154.34Z" />
  </svg>
)
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
  </svg>
)
const IconPrev = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
  </svg>
)
const IconNext = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
  </svg>
)
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,134.34V40a8,8,0,0,0-16,0v94.34L93.66,106.34a8,8,0,0,0-11.32,11.32Z" />
  </svg>
)
const IconAdd = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
  </svg>
)

function detectFormat(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toUpperCase()
  if (!ext) return "—"
  const map: Record<string, string> = {
    JPG: "JPEG", JPEG: "JPEG", PNG: "PNG", WEBP: "WEBP", GIF: "GIF", SVG: "SVG", AVIF: "AVIF",
    MP4: "MP4", MOV: "MOV", WEBM: "WEBM", OGV: "OGV", M4V: "MP4",
  }
  return map[ext] ?? ext
}

async function downloadAsset(url: string, name: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const ext = url.split("?")[0].split(".").pop() ?? "jpg"
    const href = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = href; a.download = `${name}.${ext}`; a.click()
    setTimeout(() => URL.revokeObjectURL(href), 5000)
  } catch { window.open(url, "_blank") }
}

function resolveTitle(s: AssetEntry): string {
  if (s.name && s.name !== "Untitled") return s.name
  return s.url.split("/").pop()?.split("?")[0]
    ?.replace(/[-_]/g, " ")?.replace(/\.\w+$/, "") || "Untitled"
}

interface DetailPanelProps {
  selected: AssetEntry
  editingAlt: string
  saving: boolean
  saveSuccess: boolean
  addingKey: string | null
  addedKey: string | null
  addMode: "set" | "add" | null
  hasSelection: boolean
  navIndex: number
  nodePageNames: string[]
  onClose: () => void
  onAltChange: (v: string) => void
  onSaveAlt: () => void
  onAdd: () => void
  onStepNav: (delta: 1 | -1) => void
  onNavToIndex: (i: number) => void
  onNavToCurrent: () => void
}

export function DetailPanel({
  selected, editingAlt, saving, saveSuccess,
  addingKey, addedKey, addMode,
  hasSelection, navIndex, nodePageNames,
  onClose, onAltChange, onSaveAlt, onAdd,
  onStepNav, onNavToCurrent,
}: DetailPanelProps) {
  const isVideo = selected.assetType === "video"
  const isCanvas = selected.source === "canvas"
  const hasNodes = selected.nodeIds.length > 0
  const isAdding = addingKey === selected.key
  const justAdded = addedKey === selected.key
  const title = resolveTitle(selected)

  const [altOpen, setAltOpen] = useState(true)
  const [fileSize, setFileSize] = useState<string>("—")

  useEffect(() => {
    setFileSize("—")
    let cancelled = false

    const formatBytes = (bytes: number) => {
      if (bytes <= 0) return null
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const fetchSize = async () => {
      try {
        // 1. Try HEAD first — cheap, no download
        const head = await fetch(selected.url, { method: "HEAD" })
        const cl = parseInt(head.headers.get("content-length") ?? "0", 10)
        if (cl > 0) {
          const fmt = formatBytes(cl)
          if (fmt && !cancelled) { setFileSize(fmt); return }
        }

        // 2. Fallback — fetch the actual blob and read its size
        const res = await fetch(selected.url)
        const blob = await res.blob()
        if (!cancelled) {
          const fmt = formatBytes(blob.size)
          setFileSize(fmt ?? "—")
        }
      } catch {
        if (!cancelled) setFileSize("—")
      }
    }

    fetchSize()
    return () => { cancelled = true }
  }, [selected.url])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Fixed header ── */}
        <div className="dp-header">
          <span className="dp-title">{title}</span>
          <button className="dp-close" onClick={onClose}><IconClose /></button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="dp-scroll">

          {/* Navigate Usage — canvas only */}
          {isCanvas && hasNodes && (
            <div className="dp-section">
              <button
                className="dp-nav-body"
                onClick={() => { console.log("[Assetify] nav row clicked"); onNavToCurrent() }}
                title="Jump to this usage on canvas"
              >
                <span className="dp-section-title">Navigate Usage</span>
                <div className="dp-nav-controls" onClick={(e) => e.stopPropagation()}>
                  {selected.nodeIds.length > 1 ? (
                    <>
                      <button
                        className="dp-nav-btn"
                        onClick={(e) => { e.stopPropagation(); onStepNav(-1) }}
                        title="Previous usage"
                      ><IconPrev /></button>
                      <span className="dp-nav-counter">
                        {navIndex + 1} / {selected.nodeIds.length}
                      </span>
                      <button
                        className="dp-nav-btn"
                        onClick={(e) => { e.stopPropagation(); onStepNav(1) }}
                        title="Next usage"
                      ><IconNext /></button>
                    </>
                  ) : (
                    <button
                      className="dp-nav-jump"
                      onClick={(e) => { e.stopPropagation(); onNavToCurrent() }}
                      title="Jump to canvas"
                    >
                      Jump ↗
                    </button>
                  )}
                </div>
              </button>
            </div>
          )}


          {/* CMS — open in CMS */}
          {selected.source === "cms" && selected.cmsItemId && (
            <button className="dp-nav-go" onClick={onNavToCurrent}>
              ↗ Open in CMS
            </button>
          )}

          {/* Preview */}
          <div className="dp-preview">
            {isVideo
              ? <VideoThumb url={selected.url} className="dp-preview-media" />
              : <img
                src={selected.url}
                alt={selected.altText}
                className="dp-preview-media"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = ".25"
                }}
              />
            }
          </div>

          {/* Asset Details */}
          <div className="dp-card">
            <div className="dp-card-title">Asset Details</div>
            <div className="dp-divider" />

            <div className="dp-row">
              <span className="dp-row-label">
                <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H40a16,16,0,0,0-16,16V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,64H216V88H40ZM40,192V104H216v88Z" /></svg>
                Asset Type
              </span>
              <span className="dp-row-value">{isVideo ? "Video" : "Image"}</span>
            </div>

            <div className="dp-row">
              <span className="dp-row-label">
                <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,42.34a8,8,0,0,0-11.32,0L40,164.69V216H91.31L213.66,93.66a8,8,0,0,0,0-11.32Zm-96,160H56V168l96-96,32,32ZM208,85.31,176,117.31,138.69,80,170.69,48,208,85.31Z" /></svg>
                Format
              </span>
              <span className="dp-row-value">{detectFormat(selected.url)}</span>
            </div>

            {fileSize !== undefined && (
              <div className="dp-row">
                <span className="dp-row-label">
                  <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,42.34a8,8,0,0,0-11.32,0L168,76.69,148.69,57.37a8,8,0,0,0-13.69,5.66v80a8,8,0,0,0,8,8h80a8,8,0,0,0,5.66-13.69L209.31,118l34.35-34.34a8,8,0,0,0,0-11.32ZM176,134V97.37L212.69,134Zm-57.37,15a8,8,0,0,0-11.32,0L88,168.69V152a8,8,0,0,0-16,0v80a8,8,0,0,0,8,8h80a8,8,0,0,0,0-16H102.94l32-32a8,8,0,0,0-11.32-11.31Z" /></svg>
                  Size
                </span>
                <span className="dp-row-value">{fileSize}</span>
              </div>
            )}

            <div className="dp-row">
              <span className="dp-row-label">
                <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.19-23.43C94,50,65.57,67.74,51.14,95.85a8,8,0,1,1-14.28-7.2C54.49,55.18,89.44,34,125.87,34A95.43,95.43,0,0,1,193.4,61.14L208,75.31V48a8,8,0,0,1,16,0ZM204.86,167.86C190.43,195.92,162,214,130.13,214A95.52,95.52,0,0,1,62.6,186.78L48,172.57V200a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8H88a8,8,0,0,1,0,16H59.31l14.63,14.49a79.56,79.56,0,0,0,56.19,23.43C162,206,190.43,188.16,204.86,160.05a8,8,0,1,1,14.28,7.2Z" /></svg>
                Source
              </span>
              <span className="dp-row-value">{isCanvas ? "Canvas" : "CMS"}</span>
            </div>

            <div className="dp-row">
              <span className="dp-row-label">
                <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" /></svg>
                Storage
              </span>
              <span className="dp-row-value">
                {selected.storageSource === "framer" ? "Framer" : "External"}
              </span>
            </div>

            {isCanvas && (
              <div className="dp-row">
                <span className="dp-row-label">
                  <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M229.19,167.96l-96-160a13.55,13.55,0,0,0-10.19-8,14,14,0,0,0-12.19,4L26.34,92.06A13.81,13.81,0,0,0,24,104,13.3,13.3,0,0,0,30.62,115l88,80A13.91,13.91,0,0,0,128,198a14.09,14.09,0,0,0,10.38-4.43l88-96A13.29,13.29,0,0,0,229.19,167.96ZM128,181.76,47.55,108,128,36.29,208.45,108Z" /></svg>
                  Usage
                </span>
                <span className={`dp-row-value${selected.nodeIds.length > 5 ? " dp-hot" : ""}`}>
                  {selected.nodeIds.length}x Used
                </span>
              </div>
            )}

            {!isCanvas && (
              <div className="dp-row">
                <span className="dp-row-label">
                  <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" /></svg>
                  Location
                </span>
                <span className="dp-row-value dp-row-value-sm dp-row-truncate">
                  {selected.locationLabel}
                </span>
              </div>
            )}
          </div>

          {/* Alt Text — collapsible, images only */}
          {!isVideo && (
            <div className="dp-section">
              <button
                className={`dp-section-toggle${altOpen ? " open" : ""}`}
                onClick={() => setAltOpen(v => !v)}
              >
                <span className="dp-section-title">Alt Text</span>
                {altOpen ? <IconChevronUp /> : <IconChevronDown />}
              </button>

              {altOpen && (
                <>
                  <div className="dp-section-divider" />
                  <div className="dp-alt-body">
                    <textarea
                      className="dp-alt-input"
                      rows={3}
                      value={editingAlt}
                      onChange={(e) => onAltChange(e.target.value)}
                      placeholder="Describe this image for accessibility..."
                    />
                    <button
                      className={`dp-save-alt${editingAlt.trim() ? " dp-save-alt-active" : ""}`}
                      onClick={onSaveAlt}
                      disabled={saving || !editingAlt.trim()}
                    >
                      {saving ? "Saving…" : "Save Alt Text"}
                    </button>
                    {saveSuccess && (
                      <div className="dp-feedback">✓ Alt text saved!</div>
                    )}
                    {justAdded && (
                      <div className="dp-feedback">
                        {addMode === "set" ? "✓ Set on selected frame!" : "✓ Added to canvas!"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ height: 8 }} />

        </div>{/* end dp-scroll */}

        {/* ── Fixed footer ── */}
        <div className="dp-actions">
          <button
            className="dp-btn-secondary"
            onClick={() => downloadAsset(selected.url, title)}
          >
            <IconDownload />
            Download Asset
          </button>
          <button
            className={[
              "dp-btn-primary",
              isAdding ? "loading" : "",
              justAdded ? "success" : "",
            ].filter(Boolean).join(" ")}
            onClick={onAdd}
            disabled={isAdding}
          >
            <IconAdd />
            {isAdding ? "Adding…"
              : justAdded ? "Done!"
                : isVideo ? "Go to Video"
                  : hasSelection ? "Set on Frame"
                    : "Add to Canvas"}
          </button>
        </div>

      </div>
    </div>
  )
}