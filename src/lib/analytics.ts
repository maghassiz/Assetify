// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  ANALYTICS — Assetify Plugin                                             ║
// ║                                                                          ║
// ║  Tracks usage events to Supabase for marketing/growth insights.          ║
// ║  • Fire-and-forget: failures are silently swallowed, never crash plugin  ║
// ║  • Anonymous: no PII collected, stable UUID per install                  ║
// ║  • Lightweight: zero dependencies beyond the Framer plugin API           ║
// ║                                                                          ║
// ║  SETUP:                                                                  ║
// ║  1. Create a free Supabase project at https://supabase.com               ║
// ║  2. Run supabase_schema.sql in SQL Editor                                ║
// ║  3. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { framer } from "framer-plugin"
import { PLUGIN_VERSION } from "../plugin.config"

// ─── Config ───────────────────────────────────────────────────────────────────
// Replace these with your actual Supabase project values.
// Find them in: Supabase Dashboard → Project Settings → API
const SUPABASE_URL      = "https://itkqcyhngzhzszjokhvi.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a3FjeWhuZ3poenN6am9raHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjkzNDYsImV4cCI6MjA4NzcwNTM0Nn0.OCutEjcRog7N4Q8_BWVvDrNUcQ3_c7It0eoN2QZ1B-g"

// How often to ping the heartbeat (ms) — keeps "live users" count accurate
const HEARTBEAT_INTERVAL_MS = 60_000

// ─── Event names ──────────────────────────────────────────────────────────────
// Centralised so typos are caught at compile time.
export const EVENTS = {
  PLUGIN_OPENED:       "plugin_opened",
  PLUGIN_CLOSED:       "plugin_closed",
  ASSETS_LOADED:       "assets_loaded",
  SEARCH_USED:         "search_used",
  FILTER_SOURCE:       "filter_source",
  FILTER_STORAGE:      "filter_storage",
  DETAIL_OPENED:       "detail_opened",
  ALT_TEXT_SAVED:      "alt_text_saved",
  ADD_TO_CANVAS:       "add_to_canvas",
  SET_ON_FRAME:        "set_on_frame",
  THEME_TOGGLED:       "theme_toggled",
  NAVIGATE_USAGE:      "navigate_usage",
  REFRESH:             "refresh",
} as const

export type EventName = typeof EVENTS[keyof typeof EVENTS]

// ─── Internal state ───────────────────────────────────────────────────────────
let _sessionId:   string | null = null
let _anonymousId: string | null = null
let _projectId:   string | null = null
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null
let _ready = false

// ─── Supabase REST helpers ────────────────────────────────────────────────────
const headers = () => ({
  "Content-Type":  "application/json",
  "apikey":        SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Prefer":        "return=representation",
})

async function dbInsert(table: string, body: Record<string, unknown>) {
  console.debug("[analytics] INSERT", table, body)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify(body),
  })
  const text = await res.text()
  console.debug("[analytics] INSERT response", res.status, text)
  if (!res.ok) throw new Error(`Supabase insert ${table} failed: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

async function dbUpdate(table: string, id: string, body: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:  "PATCH",
    headers: { ...headers(), "Prefer": "return=minimal" },
    body:    JSON.stringify(body),
  })
}

async function rpcCall(fn: string, args: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify(args),
  })
}

// ─── Anonymous ID ─────────────────────────────────────────────────────────────
// Stored in Framer's per-plugin key-value store — survives page reloads,
// persists per Framer installation. Never changes for the same user.
async function getOrCreateAnonymousId(): Promise<string> {
  try {
    const stored = await framer.getPluginData("analyticsId")
    if (stored) return stored
    const newId = crypto.randomUUID()
    await framer.setPluginData("analyticsId", newId)
    return newId
  } catch {
    return crypto.randomUUID() // fallback: ephemeral ID for this session only
  }
}

// ─── Project ID ───────────────────────────────────────────────────────────────
// Framer exposes a project-level ID we can read.
// This tracks "how many projects use Assetify" independently of user count.
async function getProjectId(): Promise<string> {
  try {
    // framer.getProjectInfo() returns { id, name } in newer SDK versions
    const info = await (framer as Record<string, unknown> & {
      getProjectInfo?: () => Promise<{ id: string }>
    }).getProjectInfo?.()
    return info?.id ?? ""
  } catch {
    return ""
  }
}

// ─── init() ───────────────────────────────────────────────────────────────────
// Call once at plugin startup (before any other analytics calls).
// Creates the session row and starts the heartbeat.
export async function initAnalytics(opts: {
  theme:        "light" | "dark"
  assetsLoaded: number
}): Promise<void> {
  console.debug("[analytics] init start", { url: SUPABASE_URL, opts })

  try {
    _anonymousId = await getOrCreateAnonymousId()
    _projectId   = await getProjectId()

    const rows = await dbInsert("sessions", {
      anonymous_id:   _anonymousId,
      project_id:     _projectId,
      theme:          opts.theme,
      assets_loaded:  opts.assetsLoaded,
      plugin_version: PLUGIN_VERSION,
      user_agent:     navigator.userAgent,
    })

    _sessionId = Array.isArray(rows) ? rows[0]?.id : rows?.id
    console.debug("[analytics] session created", _sessionId)
    _ready     = true

    // Fire plugin_opened event
    await trackEvent(EVENTS.PLUGIN_OPENED, {
      theme:         opts.theme,
      assets_loaded: opts.assetsLoaded,
      project_id:    _projectId,
    })

    // Heartbeat — keeps live user count accurate
    _heartbeatTimer = setInterval(() => {
      if (_sessionId) rpcCall("heartbeat", { p_session_id: _sessionId }).catch(() => {})
    }, HEARTBEAT_INTERVAL_MS)

  } catch (err) {
    // Never crash the plugin for analytics
    console.error("[analytics] init failed:", err)
  }
}

// ─── trackEvent() ─────────────────────────────────────────────────────────────
// Fire-and-forget. Safe to call anywhere — always catches errors.
export async function trackEvent(
  event: EventName,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!_ready || !_anonymousId) return

  try {
    await dbInsert("events", {
      session_id:   _sessionId,
      anonymous_id: _anonymousId,
      project_id:   _projectId ?? "",
      event,
      properties,
    })
  } catch (err) {
    console.debug("[analytics] trackEvent failed:", err)
  }
}

// ─── endSession() ─────────────────────────────────────────────────────────────
// Call when the plugin closes (Framer fires an unload-like event).
export async function endSession(): Promise<void> {
  if (_heartbeatTimer) clearInterval(_heartbeatTimer)
  if (!_sessionId || !_ready) return
  try {
    await Promise.all([
      dbUpdate("sessions", _sessionId, { ended_at: new Date().toISOString() }),
      trackEvent(EVENTS.PLUGIN_CLOSED),
    ])
  } catch { /* silently ignore */ }
}
