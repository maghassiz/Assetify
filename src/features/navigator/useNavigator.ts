// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FEATURE: Usage Navigator — Logic                                        ║
// ║  Manages which node we're currently on and all step/jump actions.        ║
// ║                                                                          ║
// ║  ✅ SAFE TO EDIT: nothing (pure navigation state logic)                  ║
// ║  → UI lives in: UsageNavigator.tsx                                       ║
// ║  → Framer navigate calls: ../../lib/framerApi.ts                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useState, useCallback } from "react"
import type { AssetEntry } from "../../types"
import { resolvePageNames } from "../../lib/pageResolver"
import { navigateToNode, navigateToCmsItem } from "../../lib/framerApi"

export interface NavigatorState {
  navIndex:         number
  nodePageNames:    string[]
  initNav:          (asset: AssetEntry) => void
  stepPrev:         () => Promise<void>
  stepNext:         () => Promise<void>
  navToIndex:       (i: number) => Promise<void>
  navToCurrentNode: () => Promise<void>
}

export function useNavigator(selected: AssetEntry | null): NavigatorState {
  const [navIndex,      setNavIndex]      = useState(0)
  const [nodePageNames, setNodePageNames] = useState<string[]>([])

  const initNav = useCallback((asset: AssetEntry) => {
    setNavIndex(0)
    if (asset.nodeIds.length === 0) { setNodePageNames([]); return }
    setNodePageNames(asset.nodeIds.map(() => "…"))
    resolvePageNames(asset.nodeIds).then(setNodePageNames)
  }, [])

  const stepTo = useCallback(async (delta: 1 | -1) => {
    if (!selected || selected.nodeIds.length === 0) return
    const next = (navIndex + delta + selected.nodeIds.length) % selected.nodeIds.length
    setNavIndex(next)
    await navigateToNode(selected.nodeIds[next])
  }, [selected, navIndex])

  const navToIndex = useCallback(async (i: number) => {
    if (!selected?.nodeIds[i]) return
    setNavIndex(i)
    await navigateToNode(selected.nodeIds[i])
  }, [selected])

  const navToCurrentNode = useCallback(async () => {
    if (!selected) return
    if (selected.source === "cms" && selected.cmsItemId) {
      await navigateToCmsItem(selected.cmsItemId); return
    }
    const nodeId = selected.nodeIds[navIndex] ?? selected.nodeIds[0]
    if (nodeId) await navigateToNode(nodeId)
  }, [selected, navIndex])

  return {
    navIndex, nodePageNames,
    initNav,
    stepPrev: () => stepTo(-1),
    stepNext: () => stepTo(1),
    navToIndex,
    navToCurrentNode,
  }
}
