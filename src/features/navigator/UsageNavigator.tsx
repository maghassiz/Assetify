// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Usage Navigator — UI                                           ║
// ║  The ‹ 2/4 › sequential navigator shown in the detail panel.            ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: button icons, dot size, labels                         ║
// ║  → Logic lives in: useNavigator.ts                                       ║
// ║  → Max dots config: plugin.config.ts → NAV_DOTS_MAX                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { NAV_DOTS_MAX, USAGE_HOT_THRESHOLD } from "../../plugin.config"

interface UsageNavigatorProps {
  nodeIds:       string[]
  navIndex:      number
  nodePageNames: string[]
  onPrev:        () => void
  onNext:        () => void
  onGoTo:        () => void
  onDotClick:    (i: number) => void
}

export function UsageNavigator({
  nodeIds, navIndex, nodePageNames,
  onPrev, onNext, onGoTo, onDotClick,
}: UsageNavigatorProps) {
  const total    = nodeIds.length
  const isHot    = total > USAGE_HOT_THRESHOLD
  const pageName = nodePageNames[navIndex]
  const showDots = total > 1 && total <= NAV_DOTS_MAX

  return (
    <div className="nav-section">

      {/* Label row */}
      <div className="nav-label">
        <span className="meta-label">NAVIGATE USAGES</span>
        <span className={`nav-counter${isHot ? " hot" : ""}`}>
          {navIndex + 1} / {total}
        </span>
      </div>

      {/* Step controls */}
      <div className="nav-controls">
        <button
          className="nav-step-btn"
          onClick={onPrev}
          disabled={total <= 1}
          title="Previous usage"
        >‹</button>

        <button
          className="nav-go-btn"
          onClick={onGoTo}
          title="Jump to this usage on canvas"
        >
          <span className="nav-go-page">
            {pageName && pageName !== "…"
              ? `⊞ ${pageName}`
              : pageName === "…"
              ? "…"
              : "Canvas"}
          </span>
          <span className="nav-go-arrow">↗ Go</span>
        </button>

        <button
          className="nav-step-btn"
          onClick={onNext}
          disabled={total <= 1}
          title="Next usage"
        >›</button>
      </div>

      {/* Progress dots */}
      {showDots && (
        <div className="nav-dots">
          {nodeIds.map((_, i) => (
            <button
              key={i}
              className={`nav-dot${i === navIndex ? " active" : ""}`}
              onClick={() => onDotClick(i)}
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
  )
}
