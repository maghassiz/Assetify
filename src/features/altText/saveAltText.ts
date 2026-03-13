// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Alt Text — Save Logic                                          ║
// ║  The one function that writes alt text back to Framer.                   ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: nothing (this is stable Framer API logic)              ║
// ║  → UI lives in: AltTextEditor.tsx                                        ║
// ║  → Raw Framer API calls: ../../lib/framerApi.ts                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { framer } from "framer-plugin"
import { saveCanvasAltText, saveCmsAltText } from "../../lib/framerApi"
import type { AssetEntry } from "../../types"

export type SaveAltResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Save the alt text for any asset (canvas or CMS).
 * Checks Framer permissions before attempting the write.
 */
export async function saveAltText(
  asset:  AssetEntry,
  newAlt: string,
): Promise<SaveAltResult> {
  if (!framer.isAllowedTo("setAttributes")) {
    return { ok: false, error: "You don't have permission to edit this project." }
  }

  try {
    if (asset.source === "canvas") {
      await saveCanvasAltText(asset.nodeIds, newAlt)
    } else {
      await saveCmsAltText(asset.key, newAlt)
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
