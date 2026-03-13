import { useCallback, useEffect, useState } from "react"
import type { AssetEntry } from "../types"
import { loadAssets } from "../lib/framerApi"

interface UseAssetsResult {
  assets:    AssetEntry[]
  loading:   boolean
  loadError: string | null
  refresh:   () => void
}

export function useAssets(): UseAssetsResult {
  const [assets,    setAssets]    = useState<AssetEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    loadAssets()
      .then(setAssets)
      .catch((e) => setLoadError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { assets, loading, loadError, refresh }
}
