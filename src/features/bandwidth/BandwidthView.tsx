import { useState } from "react"
import type { UseBandwidthResult } from "../../hooks/useBandwidth"
import type { AssetEntry } from "../../types"
import { trackEvent, EVENTS } from "../../lib/analytics"

// Framer site plans — bandwidth limits in bytes
// Source: framer.com/pricing (Basic $10 / Pro $30 / Scale $100)
const PLANS = [
  { label: "Basic", price: "$10", bytes: 10 * 1024 * 1024 * 1024 },
  { label: "Pro", price: "$30", bytes: 100 * 1024 * 1024 * 1024 },
  { label: "Scale", price: "$100", bytes: 200 * 1024 * 1024 * 1024 },
]

const VISITOR_MIN = 100
const VISITOR_MAX = 500_000
const VISITOR_DEFAULT = 1_000
const FRAMER_PRICING_URL = "https://framer.link/Joc8MzB"

function fmt(b: number): string {
  if (b <= 0) return "—"
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function fmtVisitors(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function logToLinear(value: number): number {
  const minLog = Math.log10(VISITOR_MIN)
  const maxLog = Math.log10(VISITOR_MAX)
  return ((Math.log10(Math.max(value, VISITOR_MIN)) - minLog) / (maxLog - minLog)) * 100
}

function linearToLog(pct: number): number {
  const minLog = Math.log10(VISITOR_MIN)
  const maxLog = Math.log10(VISITOR_MAX)
  return Math.round(Math.pow(10, minLog + (pct / 100) * (maxLog - minLog)))
}

function displayName(asset: { name: string; url: string }): string {
  if (asset.name && asset.name !== "Untitled") return asset.name
  return asset.url.split("/").pop()?.split("?")[0]
    ?.replace(/[-_]/g, " ")?.replace(/\.\w+$/, "") || "Untitled"
}

interface Props extends Omit<UseBandwidthResult, "startScan"> {
  assetCount: number
  startScan: () => void
  onOpenAsset?: (asset: AssetEntry) => void
}

export function BandwidthView({
  status, progress, results, totalSize, totalBw,
  startScan, cancelScan, assetCount, onOpenAsset,
}: Props) {
  const [planIdx, setPlanIdx] = useState(0)
  const [visitors, setVisitors] = useState(VISITOR_DEFAULT)
  const [inputValue, setInputValue] = useState(String(VISITOR_DEFAULT))
  const [inputFocused, setInputFocused] = useState(false)

  const plan = PLANS[planIdx]
  const scanning = status === "scanning"
  const done = status === "done"

  const estimatedBw = results.reduce((s, r) => s + r.fileSize, 0) * visitors
  const usedPct = plan.bytes > 0 ? Math.min((estimatedBw / plan.bytes) * 100, 100) : 0
  const rawPct = plan.bytes > 0 ? (estimatedBw / plan.bytes) * 100 : 0
  const isOverLimit = plan.bytes > 0 && estimatedBw > plan.bytes

  const barColor = isOverLimit ? "rgb(207, 7, 7)"
    : usedPct > 60 ? "var(--amber)"
      : "var(--framer-color-tint)"

  const sliderPct = logToLinear(visitors)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = linearToLog(Number(e.target.value))
    setVisitors(v)
    if (!inputFocused) setInputValue(String(v))
  }

  const commitInput = () => {
    const parsed = parseInt(inputValue.replace(/[^0-9]/g, ""), 10)
    if (!isNaN(parsed)) {
      const clamped = Math.max(VISITOR_MIN, Math.min(VISITOR_MAX, parsed))
      setVisitors(clamped)
      setInputValue(String(clamped))
    } else {
      setInputValue(String(visitors))
    }
  }

  return (
    <div className="bw-view">

      {/* Header */}
      <div className="bw-header">
        <div>
          <div className="bw-title">Bandwidth</div>
          <div className="bw-sub">
            {done
              ? `${assetCount} assets scanned`
              : scanning
                ? "Scanning in background…"
                : "Analyse your project's asset sizes"}
          </div>
        </div>
        {!scanning
          ? <button className="bw-scan-btn" onClick={startScan} disabled={assetCount === 0}>
            {done ? "Re-scan" : "Scan now"}
          </button>
          : <button className="bw-scan-btn bw-cancel-btn" onClick={cancelScan}>Cancel</button>
        }
      </div>

      {/* Estimation disclaimer banner */}
      <div className="bw-disclaimer">
        <div className="bw-disclaimer-text">
          <span>Numbers are <strong>estimates</strong> based on asset file sizes × visitor count. For real usage data, check your Framer dashboard.</span>
          <a
            className="bw-disclaimer-link"
            href="https://framer.link/Vn8nA1U"
            target="_blank"
            rel="noreferrer"
          >
            See real usage in Framer ↗
          </a>
        </div>
      </div>

      {/* Progress bar */}
      {scanning && (
        <div className="bw-progress-wrap">
          <div className="bw-progress-bar">
            <div className="bw-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="bw-progress-label">{progress}% — you can browse other tabs</div>
        </div>
      )}

      {/* Plan card */}
      {(done || scanning) && (
        <div className="bw-plan-card">

          <div className="bw-plan-top">
            <div className="bw-plan-labels">
              <span className="bw-plan-used">{fmt(estimatedBw)}</span>
              <span className="bw-plan-sep"> / </span>
              <span className="bw-plan-limit">{fmt(plan.bytes)}</span>
            </div>
            <select
              className="bw-plan-select"
              value={planIdx}
              onChange={(e) => {
                const idx = Number(e.target.value)
                setPlanIdx(idx)
                trackEvent(EVENTS.BANDWIDTH_PLAN_CHANGED, { plan: PLANS[idx].label })
              }}
            >
              {PLANS.map((p, i) => (
                <option key={p.label} value={i}>{p.label} — {p.price}/mo</option>
              ))}
            </select>
          </div>

          <div className="bw-plan-bar">
            <div className="bw-plan-fill" style={{ width: `${usedPct}%`, background: barColor }} />
          </div>

          <div className={`bw-plan-pct${isOverLimit ? " bw-plan-pct-over" : ""}`}>
            {isOverLimit
              ? `⚠ ${rawPct.toFixed(1)}% — exceeds ${plan.label} plan limit`
              : `${usedPct.toFixed(1)}% of ${plan.label} plan limit used`}
          </div>

          {isOverLimit && (
            <a className="bw-upgrade-btn" href={FRAMER_PRICING_URL} target="_blank" rel="noreferrer"
              onClick={() => trackEvent(EVENTS.BANDWIDTH_UPGRADE_CLICKED, { plan: plan.label })}
            >
              <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor">
                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
              </svg>
              Upgrade plan on Framer
            </a>
          )}

          {/* Visitor slider */}
          <div className="bw-visitor-section">
            <div className="bw-visitor-label-row">
              <span className="bw-visitor-label">Monthly visitors</span>
              <input
                className="bw-visitor-input"
                type="text"
                inputMode="numeric"
                value={inputFocused ? inputValue : fmtVisitors(visitors)}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => { setInputFocused(true); setInputValue(String(visitors)) }}
                onBlur={() => { setInputFocused(false); commitInput() }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
              />
            </div>
            <input
              className="bw-visitor-slider"
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={sliderPct}
              onChange={handleSliderChange}
              style={{
                background: `linear-gradient(to right, var(--framer-color-tint) ${sliderPct}%, var(--framer-color-divider) ${sliderPct}%)`,
              }}
            />
            <div className="bw-visitor-range-labels">
              <span>{fmtVisitors(VISITOR_MIN)}</span>
              <span>{fmtVisitors(VISITOR_MAX)}</span>
            </div>
          </div>

        </div>
      )}

      {/* Summary cards */}
      {done && (
        <div className="bw-summary-row">
          <div className="bw-summary-card">
            <div className="bw-summary-label">Total file size</div>
            <div className="bw-summary-value">{fmt(totalSize)}</div>
          </div>
          <div className="bw-summary-card">
            <div className="bw-summary-label">Est. monthly BW</div>
            <div className={`bw-summary-value${isOverLimit ? " bw-summary-over" : " bw-summary-accent"}`}>
              {fmt(estimatedBw)}
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {status === "idle" && assetCount === 0 && (
        <div className="bw-empty">No assets found in this project</div>
      )}

      {/* Ranked asset list — click to open detail panel */}
      {done && results.length > 0 && (
        <div className="bw-list">
          {results.map((item, idx) => (
            <div
              key={item.asset.key}
              className="bw-item"
              onClick={() => onOpenAsset?.(item.asset)}
            >
              {/* Thumbnail */}
              <div className="bw-thumb">
                {item.asset.assetType === "video"
                  ? <div className="bw-thumb-video">▶</div>
                  : <img
                    src={item.asset.url}
                    alt={item.asset.altText}
                    className="bw-thumb-img"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = ".2" }}
                  />
                }
              </div>

              <div className="bw-item-left">
                <div className="bw-rank">#{idx + 1}</div>
                <div className="bw-info">
                  <div className="bw-name">{displayName(item.asset)}</div>
                </div>
              </div>

              <div className="bw-item-right">
                <div className={`bw-total${idx === 0 ? " bw-top" : ""}`}>
                  {fmt(item.fileSize)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}