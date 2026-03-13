import { framer } from "framer-plugin"

// ─── Page name resolver ───────────────────────────────────────────────────────
// Walks a node's ancestor chain to find the Framer "page" it belongs to.
// A page is a direct child of the canvas root (the node whose parent has no parent).
// We try multiple ways to read the page name since Framer's API can vary.

type NodeLike = Record<string, unknown> & {
  id: string
  getParent(): Promise<{ id: string } | null>
}

const _cache = new Map<string, string>() // nodeId → pageName

export function clearPageCache(): void {
  _cache.clear()
}

/** Read the human-readable name from a Framer node object, trying all known fields. */
function readNodeName(node: NodeLike): string {
  // Framer FrameNode / PageNode expose `name` as a plain string property
  for (const key of ["name", "pageName", "title", "label"]) {
    const v = node[key]
    if (typeof v === "string" && v.trim() && v !== "undefined") return v.trim()
  }
  return ""
}

/**
 * Resolve the page name for a given canvas nodeId.
 * Returns an empty string if traversal fails or the node is on the root canvas.
 */
export async function resolvePageName(nodeId: string): Promise<string> {
  if (_cache.has(nodeId)) return _cache.get(nodeId)!

  try {
    const visited: string[] = []
    let currentId: string | null = nodeId

    while (currentId) {
      const node = (await framer.getNode(currentId)) as NodeLike | null
      if (!node) break

      visited.push(node.id)
      const parent = await node.getParent()
      if (!parent) break // node is the root itself — no page above it

      const parentNode = (await framer.getNode(parent.id)) as NodeLike | null
      if (!parentNode) break

      const grandParent = await parentNode.getParent()

      if (!grandParent) {
        // parentNode is a direct child of root → it IS the page
        const pageName = readNodeName(parentNode) || "Home"
        for (const id of visited) _cache.set(id, pageName)
        _cache.set(parent.id, pageName)
        return pageName
      }

      currentId = parent.id
    }
  } catch { /* silently fall back */ }

  return ""
}

/**
 * Resolve page names for a batch of nodeIds in parallel.
 * Returns results in the same order as the input array.
 */
export async function resolvePageNames(nodeIds: string[]): Promise<string[]> {
  return Promise.all(nodeIds.map(resolvePageName))
}
