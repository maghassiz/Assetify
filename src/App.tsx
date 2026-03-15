import { useEffect, useRef, useState } from "react"
import { framer } from "framer-plugin"
import "./App.css"

import { PLUGIN_NAME, PLUGIN_UI, FEATURES, ADD_SUCCESS_DURATION_MS } from "./plugin.config"
import type { AssetEntry } from "./types"
import { useAssets } from "./hooks/useAssets"
import { navigateToNode, smartAdd } from "./lib/framerApi"
import { Search } from "./features/search/Search"
import { useSearch } from "./features/search/useSearch"
import { Filters } from "./features/filters/Filters"
import { useFilters, buildCountHelpers } from "./features/filters/useFilters"
import { AssetGrid } from "./features/assetGrid/AssetGrid"
import type { LayoutMode } from "./features/assetGrid/AssetGrid"
import { saveAltText } from "./features/altText/saveAltText"
import { useNavigator } from "./features/navigator/useNavigator"
import { DetailPanel } from "./components/DetailPanel"
import { initAnalytics, trackEvent, endSession, EVENTS } from "./lib/analytics"

framer.showUI({ title: PLUGIN_NAME, ...PLUGIN_UI })

export function App() {
  // ── Data ────────────────────────────────────────────────────────────────────
  const { assets, loading, loadError, refresh } = useAssets()
  const [hasSelection, setHasSelection] = useState(false)
  useEffect(() => framer.subscribeToSelection((s) => setHasSelection(s.length > 0)), [])

  // ── Layout mode ─────────────────────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutMode>("grid")


  // ── Search + filters ────────────────────────────────────────────────────────
  const { search, setSearch, matches: matchesSearch } = useSearch()
  const { sourceFilter, storageFilter, setSourceFilter, setStorageFilter, matchesSource, matchesStorage } = useFilters()

  const filtered = assets.filter(
    (a) => matchesSource(a, sourceFilter) && matchesStorage(a, storageFilter) && matchesSearch(a)
  )
  const { countFor, storageCountFor } = buildCountHelpers(
    assets, sourceFilter, storageFilter, matchesSearch, matchesSource, matchesStorage,
  )

  // ── Analytics: init once assets are loaded ──────────────────────────────────
  const analyticsInitialised = useRef(false)
  useEffect(() => {
    if (loading || analyticsInitialised.current) return
    analyticsInitialised.current = true
    initAnalytics({ theme: (document.body.dataset.framerTheme as "light" | "dark") ?? "dark", assetsLoaded: assets.length })
    return () => { endSession() }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track assets_loaded on every refresh
  const prevAssetCount = useRef<number | null>(null)
  useEffect(() => {
    if (loading || !analyticsInitialised.current) return
    if (prevAssetCount.current !== assets.length) {
      prevAssetCount.current = assets.length
      trackEvent(EVENTS.ASSETS_LOADED, { count: assets.length })
    }
  }, [assets.length, loading])

  // ── Detail panel ────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<AssetEntry | null>(null)
  const [editingAlt, setEditingAlt] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Remix modal — shown once per session
  const [showRemix, setShowRemix] = useState(true)

  // ── Add to canvas ───────────────────────────────────────────────────────────
  const [addingKey, setAddingKey] = useState<string | null>(null)
  const [addedKey, setAddedKey] = useState<string | null>(null)
  const [addMode, setAddMode] = useState<"set" | "add" | null>(null)

  // ── Usage navigator ─────────────────────────────────────────────────────────
  const { navIndex, nodePageNames, initNav, stepPrev, stepNext, navToIndex, navToCurrentNode } =
    useNavigator(selected)

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openDetail = (a: AssetEntry) => {
    setSelected(a)
    setEditingAlt(a.altText)
    setSaveSuccess(false)
    initNav(a)
    refresh()
    trackEvent(EVENTS.DETAIL_OPENED, {
      asset_type: a.assetType,
      source: a.source,
      storage: a.storageSource,
      has_alt_text: !!a.altText,
      node_count: a.nodeIds.length,
    })
  }

  const handleSaveAlt = async () => {
    if (!selected) return
    setSaving(true)
    setSaveSuccess(false)
    const result = await saveAltText(selected, editingAlt)
    if (result.ok) {
      setSelected((p) => p ? { ...p, altText: editingAlt } : null)
      setSaveSuccess(true)
      refresh()
      trackEvent(EVENTS.ALT_TEXT_SAVED, {
        source: selected.source,
        storage: selected.storageSource,
        alt_text_length: editingAlt.length,
      })
    } else {
      alert(`Save failed: ${result.error}`)
    }
    setSaving(false)
  }

  const doAdd = async (asset: AssetEntry) => {
    if (asset.assetType === "video") {
      if (asset.navigateId) await navigateToNode(asset.navigateId)
      return
    }
    if (!FEATURES.canvasActions) return
    setAddingKey(asset.key)
    try {
      const mode = await smartAdd(asset)
      setAddMode(mode)
      setAddedKey(asset.key)
      trackEvent(mode === "set" ? EVENTS.SET_ON_FRAME : EVENTS.ADD_TO_CANVAS, {
        source: asset.source,
        storage: asset.storageSource,
      })
      setTimeout(() => { setAddedKey(null); setAddMode(null); refresh() }, ADD_SUCCESS_DURATION_MS)
    } catch (err) {
      alert(`Could not add to canvas: ${err}`)
    } finally {
      setAddingKey(null)
    }
  }

  // ── Search debounce tracking ──────────────────────────────────────────────
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = (v: string) => {
    setSearch(v)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    if (v.trim().length > 1) {
      searchDebounce.current = setTimeout(() => {
        trackEvent(EVENTS.SEARCH_USED, { query_length: v.trim().length })
      }, 800)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="plugin-root">

      {/* ── Search row: input + refresh + layout toggle ───────────────────── */}
      {FEATURES.search && (
        <Search
          value={search}
          layout={layout}
          onChange={handleSearch}
          onClear={() => setSearch("")}
          onRefresh={() => { refresh(); trackEvent(EVENTS.REFRESH) }}
          onLayoutChange={setLayout}
        />
      )}

      {/* ── Filter rows: Resource + Storage ──────────────────────────────── */}
      {FEATURES.sourceFilter && FEATURES.storageFilter && (
        <Filters
          sourceFilter={sourceFilter}
          storageFilter={storageFilter}
          onSourceChange={(v) => {
            setSourceFilter(v)
            refresh()
            trackEvent(EVENTS.FILTER_SOURCE, { value: v })
          }}
          onStorageChange={(v) => {
            setStorageFilter(v)
            refresh()
            trackEvent(EVENTS.FILTER_STORAGE, { value: v })
          }}
          countFor={countFor}
          storageCountFor={storageCountFor}
        />
      )}

      {/* ── Asset grid / list ─────────────────────────────────────────────── */}
      <AssetGrid
        assets={filtered}
        loading={loading}
        loadError={loadError}
        sourceFilter={sourceFilter}
        hasSelection={hasSelection}
        addingKey={addingKey}
        addedKey={addedKey}
        layout={layout}
        onOpen={openDetail}
        onAdd={(a, e) => { e.stopPropagation(); doAdd(a) }}
        onRetry={refresh}
      />

      {/* ── Add toast ─────────────────────────────────────────────────────── */}
      {addMode && (
        <div className={`add-toast ${addMode}`}>
          {addMode === "set" ? "✓ Set on selected frame" : "✓ Added to canvas"}
        </div>
      )}

      {/* ── Remix modal — shown once on open ─────────────────────────────── */}
      {showRemix && (
        <div className="remix-backdrop" onClick={() => setShowRemix(false)}>
          <div className="remix-modal" onClick={(e) => e.stopPropagation()}>
            <div className="remix-header">
              <span className="remix-emoji">👋</span>
              <div>
                <div className="remix-title">First time here? Welcome!</div>
                <div className="remix-sub">We made a quick guide so you don't have to figure things out alone — download it and you'll be up and running in minutes. Totally free, no strings attached. 🙌</div>
              </div>
            </div>
            <div className="remix-actions">
              <button className="remix-close" onClick={() => setShowRemix(false)}>✕</button>
              <a
                className="remix-btn"
                href="https://YOUR_DOCS_LINK_HERE"
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowRemix(false)}
              >
                🔗 Copy the Framer File — It's Free
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="footer-bar">
        <a className="footer-link" href="https://buymeacoffee.com/heyaghassi" target="_blank" rel="noreferrer">
          <span className="footer-icon">☕</span>
          <span className="footer-label">Buy me a coffee</span>
        </a>
        <a className="footer-link footer-link-right" href="mailto:maghassiz@gmail.com?subject=Feedback%20%2F%20Request%20Feature%20Assetify%20Plugin" target="_blank" rel="noreferrer">
          <span className="footer-icon">💬</span>
          <span className="footer-label">Feature request/feedback</span>
        </a>
      </footer>

      {/* ── Detail panel ──────────────────────────────────────────────────── */}
      {selected && (
        <DetailPanel
          selected={selected}
          editingAlt={editingAlt}
          saving={saving}
          saveSuccess={saveSuccess}
          addingKey={addingKey}
          addedKey={addedKey}
          addMode={addMode}
          hasSelection={hasSelection}
          navIndex={navIndex}
          nodePageNames={nodePageNames}
          onClose={() => setSelected(null)}
          onAltChange={(v) => { setEditingAlt(v); setSaveSuccess(false) }}
          onSaveAlt={handleSaveAlt}
          onAdd={() => doAdd(selected)}
          onStepNav={(d) => {
            if (d === -1) stepPrev(); else stepNext()
            trackEvent(EVENTS.NAVIGATE_USAGE, { direction: d === -1 ? "prev" : "next" })
          }}
          onNavToIndex={navToIndex}
          onNavToCurrent={navToCurrentNode}
        />
      )}
    </div>
  )
}