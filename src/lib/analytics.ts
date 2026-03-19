// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ANALYTICS — Assetify Plugin                                             ║
// ║                                                                          ║
// ║  Tracks usage events to PostHog for product insights.                   ║
// ║  • Fire-and-forget: failures are silently swallowed, never crash plugin  ║
// ║  • Anonymous: no PII collected, stable UUID per install                  ║
// ║  • Lightweight: vanilla fetch calls, no SDK bundle needed                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { framer } from "framer-plugin"
import { PLUGIN_VERSION } from "../plugin.config"

// ─── Config ───────────────────────────────────────────────────────────────────
const POSTHOG_KEY = "phc_5smHRX64aQqNO6T33HOFI2Hzr1tyGTcRP1cpfaGxxg8"
const POSTHOG_HOST = "https://us.i.posthog.com"
const POSTHOG_INGEST = `${POSTHOG_HOST}/capture/`

// ─── Event names ──────────────────────────────────────────────────────────────
export const EVENTS = {
  // ── Session ──────────────────────────────────────────────────────────────
  PLUGIN_OPENED: "plugin_opened",
  PLUGIN_CLOSED: "plugin_closed",

  // ── Assets tab ───────────────────────────────────────────────────────────
  ASSETS_TAB_OPENED: "assets_tab_opened",
  ASSETS_LOADED: "assets_loaded",
  SEARCH_USED: "search_used",
  FILTER_SOURCE: "filter_source",
  FILTER_STORAGE: "filter_storage",
  DETAIL_OPENED: "detail_opened",
  ALT_TEXT_SAVED: "alt_text_saved",
  ADD_TO_CANVAS: "add_to_canvas",
  SET_ON_FRAME: "set_on_frame",
  NAVIGATE_USAGE: "navigate_usage",
  REFRESH: "refresh",
  ASSET_DOWNLOADED: "asset_downloaded",

  // ── Bandwidth tab ─────────────────────────────────────────────────────────
  BANDWIDTH_TAB_OPENED: "bandwidth_tab_opened",
  BANDWIDTH_SCAN_START: "bandwidth_scan_start",
  BANDWIDTH_PLAN_CHANGED: "bandwidth_plan_changed",
  BANDWIDTH_UPGRADE_CLICKED: "bandwidth_upgrade_clicked",
  BANDWIDTH_ASSET_OPENED: "bandwidth_asset_opened",

  // ── About tab ─────────────────────────────────────────────────────────────
  ABOUT_TAB_OPENED: "about_tab_opened",
  ABOUT_COFFEE_CLICKED: "about_coffee_clicked",
  ABOUT_FEEDBACK_CLICKED: "about_feedback_clicked",
  ABOUT_DOCS_CLICKED: "about_docs_clicked",

  // ── Misc ──────────────────────────────────────────────────────────────────
  THEME_TOGGLED: "theme_toggled",
} as const

export type EventName = typeof EVENTS[keyof typeof EVENTS]

// ─── Internal state ───────────────────────────────────────────────────────────
let _anonymousId: string | null = null
let _sessionId: string = crypto.randomUUID()
let _ready = false

// ─── Anonymous ID ─────────────────────────────────────────────────────────────
// Stored in Framer's per-plugin key-value store — persists per install.
async function getOrCreateAnonymousId(): Promise<string> {
  try {
    const stored = await framer.getPluginData("analyticsId")
    if (stored) return stored
    const newId = crypto.randomUUID()
    await framer.setPluginData("analyticsId", newId)
    return newId
  } catch {
    return crypto.randomUUID()
  }
}

// ─── PostHog capture ──────────────────────────────────────────────────────────
async function capture(
  event: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!_anonymousId) return
  try {
    await fetch(POSTHOG_INGEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: _anonymousId,
        properties: {
          ...properties,
          session_id: _sessionId,
          plugin_version: PLUGIN_VERSION,
          $lib: "assetify-plugin",
        },
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    // Never crash the plugin for analytics
  }
}

// ─── init() ───────────────────────────────────────────────────────────────────
export async function initAnalytics(opts: {
  theme: "light" | "dark"
  assetsLoaded: number
}): Promise<void> {
  try {
    _anonymousId = await getOrCreateAnonymousId()
    _sessionId = crypto.randomUUID()
    _ready = true

    await capture(EVENTS.PLUGIN_OPENED, {
      theme: opts.theme,
      assets_loaded: opts.assetsLoaded,
    })
  } catch (err) {
    console.debug("[analytics] init failed:", err)
  }
}

// ─── trackEvent() ─────────────────────────────────────────────────────────────
export async function trackEvent(
  event: EventName,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!_ready) return
  await capture(event, properties)
}

// ─── endSession() ─────────────────────────────────────────────────────────────
export async function endSession(): Promise<void> {
  if (!_ready) return
  await capture(EVENTS.PLUGIN_CLOSED)
}