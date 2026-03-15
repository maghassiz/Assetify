import { framer } from "framer-plugin"

type NodeLike = Record<string, unknown> & {
  id: string
  getParent(): Promise<{ id: string } | null>
}

const _cache = new Map<string, string>()

export function clearPageCache(): void {
  _cache.clear()
}

function readNodeName(node: NodeLike): string {
  for (const key of ["name", "pageName", "title", "label"]) {
    const v = (node as Record<string, unknown>)[key]
    if (typeof v === "string" && v.trim() && v !== "undefined") return v.trim()
  }
  return ""
}

export async function resolvePageName(nodeId: string): Promise<string> {
  if (_cache.has(nodeId)) return _cache.get(nodeId)!

  try {
    const chain: NodeLike[] = []
    let currentId: string | null = nodeId

    while (currentId) {
      const node = (await framer.getNode(currentId)) as NodeLike | null
      if (!node) break
      chain.push(node)
      const parent = await node.getParent()
      if (!parent) break
      currentId = parent.id
    }

    if (chain.length >= 2) {
      const pageNode = chain[chain.length - 2]
      const pageName = readNodeName(pageNode) || "Home"
      for (const n of chain) _cache.set(n.id, pageName)
      return pageName
    }
  } catch { /* silently fall back */ }

  return ""
}

export async function resolvePageNames(nodeIds: string[]): Promise<string[]> {
  return Promise.all(nodeIds.map(resolvePageName))
}