// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Filters — UI                                                   ║
// ║  Two sections: label above buttons, fade indicator when overflowing.     ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: tab labels, row labels, icons                          ║
// ║  → Logic lives in: useFilters.ts                                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useEffect, useRef } from "react"
import type { SourceFilter, StorageFilter } from "../../types"

interface FiltersProps {
  sourceFilter:    SourceFilter
  storageFilter:   StorageFilter
  onSourceChange:  (f: SourceFilter)  => void
  onStorageChange: (f: StorageFilter) => void
  countFor:        (f: SourceFilter)  => number
  storageCountFor: (f: StorageFilter) => number
}

const SOURCE_TABS: { label: string; value: SourceFilter }[] = [
  { label: "ALL",    value: "all"    },
  { label: "CANVAS", value: "canvas" },
  { label: "CMS",    value: "cms"    },
]

const STORAGE_TABS: { label: string; value: StorageFilter }[] = [
  { label: "ALL STORAGE", value: "all"      },
  { label: "⬡ FRAMER",   value: "framer"   },
  { label: "↗ EXTERNAL", value: "external" },
]

function useScrollFade(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      el.parentElement?.classList.toggle("at-end", atEnd)
    }
    check()
    el.addEventListener("scroll", check)
    window.addEventListener("resize", check)
    return () => {
      el.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [ref])
}

export function Filters({
  sourceFilter, storageFilter,
  onSourceChange, onStorageChange,
  countFor, storageCountFor,
}: FiltersProps) {
  const sourceRef = useRef<HTMLDivElement>(null)
  const storageRef = useRef<HTMLDivElement>(null)
  useScrollFade(sourceRef)
  useScrollFade(storageRef)

  return (
    <>
      {/* Resource filter section */}
      <div className="filter-section">
        <span className="filter-row-label">Resource</span>
        <div className="filter-row-scroll">
          <div className="filter-row-buttons" ref={sourceRef}>
            {SOURCE_TABS.map(({ label, value }) => (
              <button
                key={value}
                className={`filter-tab${sourceFilter === value ? " active" : ""}`}
                onClick={() => onSourceChange(value)}
              >
                {label}
                <span className="filter-count">{countFor(value)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Storage filter section */}
      <div className="filter-section">
        <span className="filter-row-label">Storage</span>
        <div className="filter-row-scroll">
          <div className="filter-row-buttons" ref={storageRef}>
            {STORAGE_TABS.map(({ label, value }) => (
              <button
                key={value}
                className={`filter-tab filter-tab-sm${
                  storageFilter === value ? ` active storage-active-${value}` : ""
                }`}
                onClick={() => onStorageChange(value)}
              >
                {label}
                <span className="filter-count">{storageCountFor(value)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
