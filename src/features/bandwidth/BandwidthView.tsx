import { useState } from "react"
import type { UseBandwidthResult } from "../../hooks/useBandwidth"

// Framer plan bandwidth limits in bytes
const PLANS = [
  { label: "Free", bytes: 1 * 1024 * 1024 * 1024 },
  { label: "Mini", bytes: 5 * 1024 * 1024 * 1024 },
  { label: "Basic", bytes: 10 * 1024 * 1024 * 1024 },
  { label: "Pro", bytes: 100 * 1024 * 1024 * 1024 },
  { label: "Business", bytes: 500 * 1024 * 1024 * 1024 },
]

function fmt(b: number): string {
  if (b <= 0) return "—"
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function displayName(asset: { name: string; url: string }): string {
  if (asset.name && asset.name !== "Untitled") return asset.name
  return asset.url.split("/").pop()?.split("?")[0]
    ?.replace(/[-_]/g, " ")?.replace(/\.\w+$/, "") || "Untitled"
}

interface Props extends Omit<UseBandwidthResult, "startScan"> {
  assetCount: number
  startScan: () => void
}

export function BandwidthView({
  status, progress, results, totalSize, totalBw,
  startScan, cancelScan, assetCount,
}: Props) {
  const [planIdx, setPlanIdx] = useState(0)
  const plan = PLANS[planIdx]
  const usedPct = plan.bytes > 0 ? Math.min((totalBw / plan.bytes) * 100, 100) : 0
  const scanning = status === "scanning"
  const done = status === "done"

  const barColor = usedPct > 90 ? "var(--red)"
    : usedPct > 60 ? "var(--amber)"
      : "var(--framer-color-tint)"

  return (
    <div className="bw-view">

      {/* ── Header ── */}
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
          ? <button
            className="bw-scan-btn"
            onClick={startScan}
            disabled={assetCount === 0}
          >
            {done ? "Re-scan" : "Scan now"}
          </button>
          : <button className="bw-scan-btn bw-cancel-btn" onClick={cancelScan}>
            Cancel
          </button>
        }
      </div>

      {/* ── Progress bar (visible while scanning) ── */}
      {scanning && (
        <div className="bw-progress-wrap">
          <div className="bw-progress-bar">
            <div className="bw-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="bw-progress-label">{progress}% — you can browse other tabs</div>
        </div>
      )}

      {/* ── Plan selector + usage ── */}
      {(done || scanning) && (
        <div className="bw-plan-card">
          <div className="bw-plan-top">
            <div className="bw-plan-labels">
              <span className="bw-plan-used">{fmt(totalBw)}</span>
              <span className="bw-plan-sep"> / </span>
              <span className="bw-plan-limit">{fmt(plan.bytes)}</span>
            </div>
            <select
              className="bw-plan-select"
              value={planIdx}
              onChange={(e) => setPlanIdx(Number(e.target.value))}
            >
              {PLANS.map((p, i) => (
                <option key={p.label} value={i}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="bw-plan-bar">
            <div
              className="bw-plan-fill"
              style={{ width: `${usedPct}%`, background: barColor }}
            />
          </div>
          <div className="bw-plan-pct">
            {usedPct.toFixed(1)}% of {plan.label} plan limit used
          </div>
        </div>
      )}

      {/* ── Summary cards ── */}
      {done && (
        <div className="bw-summary-row">
          <div className="bw-summary-card">
            <div className="bw-summary-label">Total file size</div>
            <div className="bw-summary-value">{fmt(totalSize)}</div>
          </div>
          <div className="bw-summary-card">
            <div className="bw-summary-label">Total bandwidth</div>
            <div className="bw-summary-value bw-summary-accent">{fmt(totalBw)}</div>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {status === "idle" && assetCount === 0 && (
        <div className="bw-empty">No assets found in this project</div>
      )}

      {/* ── Ranked list ── */}
      {done && results.length > 0 && (
        <div className="bw-list">
          <div className="bw-list-header">
            <span>Asset</span>
            <span>Size × Used = Bandwidth</span>
          </div>
          {results.map((item, idx) => (
            <div key={item.asset.key} className="bw-item">
              <div className="bw-item-left">
                <div className="bw-rank">#{idx + 1}</div>
                <div className="bw-info">
                  <div className="bw-name">{displayName(item.asset)}</div>
                  <div className="bw-bar-wrap">
                    <div
                      className="bw-bar-fill"
                      style={{
                        width: `${Math.max((item.totalBw / results[0].totalBw) * 100, 2)}%`,
                        background: idx === 0 ? "var(--framer-color-tint)" : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="bw-item-right">
                <div className={`bw-total${idx === 0 ? " bw-top" : ""}`}>{fmt(item.totalBw)}</div>
                <div className="bw-breakdown">
                  {fmt(item.fileSize)} × {item.nodeCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}