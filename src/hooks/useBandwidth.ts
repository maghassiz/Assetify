import { useCallback, useEffect, useRef, useState } from "react"
import type { AssetEntry } from "../types"

export interface BandwidthResult {
  asset:      AssetEntry
  fileSize:   number   // bytes of the file
  nodeCount:  number   // how many canvas nodes use it
  totalBw:    number   // fileSize × nodeCount
}

export type ScanStatus = "idle" | "scanning" | "done" | "error"

interface UseBandwidthResult {
  status:     ScanStatus
  progress:   number           // 0–100
  results:    BandwidthResult[]
  totalSize:  number           // sum of all fileSizes
  totalBw:    number           // sum of all totalBw
  startScan:  (assets: AssetEntry[]) => void
  cancelScan: () => void
}

async function fetchSize(url: string): Promise<number> {
  try {
    const head = await fetch(url, { method: "HEAD" })
    const cl   = parseInt(head.headers.get("content-length") ?? "0", 10)
    if (cl > 0) return cl
    const res  = await fetch(url)
    const blob = await res.blob()
    return blob.size
  } catch { return 0 }
}

export function useBandwidth(): UseBandwidthResult {
  const [status,   setStatus]   = useState<ScanStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [results,  setResults]  = useState<BandwidthResult[]>([])
  const cancelRef = useRef(false)

  const startScan = useCallback(async (assets: AssetEntry[]) => {
    if (!assets.length) return
    cancelRef.current = false
    setStatus("scanning")
    setProgress(0)
    setResults([])

    // Deduplicate by URL — fetch each unique URL only once
    const urlToAssets = new Map<string, AssetEntry[]>()
    for (const a of assets) {
      if (!urlToAssets.has(a.url)) urlToAssets.set(a.url, [])
      urlToAssets.get(a.url)!.push(a)
    }

    const uniqueUrls = [...urlToAssets.keys()]
    const sizeCache  = new Map<string, number>()
    const BATCH      = 4

    for (let i = 0; i < uniqueUrls.length; i += BATCH) {
      if (cancelRef.current) { setStatus("idle"); return }

      const batch = uniqueUrls.slice(i, i + BATCH)
      const sizes = await Promise.all(batch.map(fetchSize))
      batch.forEach((url, idx) => sizeCache.set(url, sizes[idx]))

      setProgress(Math.round(((i + batch.length) / uniqueUrls.length) * 100))
    }

    if (cancelRef.current) { setStatus("idle"); return }

    // Build results — one entry per asset, totalBw = size × node usage
    const built: BandwidthResult[] = assets.map(a => {
      const fileSize  = sizeCache.get(a.url) ?? 0
      const nodeCount = a.source === "canvas" ? Math.max(a.nodeIds.length, 1) : 1
      return { asset: a, fileSize, nodeCount, totalBw: fileSize * nodeCount }
    })

    built.sort((a, b) => b.totalBw - a.totalBw)
    setResults(built)
    setStatus("done")
    setProgress(100)
  }, [])

  const cancelScan = useCallback(() => {
    cancelRef.current = true
  }, [])

  const totalSize = results.reduce((s, r) => s + r.fileSize,  0)
  const totalBw   = results.reduce((s, r) => s + r.totalBw, 0)

  return { status, progress, results, totalSize, totalBw, startScan, cancelScan }
}
