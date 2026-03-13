import { framer } from "framer-plugin"
import type { AssetEntry } from "../types"
import {
  readImageData,
  isVideoUrl,
  classifyAssetType,
  detectStorageSource,
  buildLocationLabel,
  normalizeUrl,
} from "./assetUtils"
import { resolvePageName } from "./pageResolver"

// ─── Load: canvas images ──────────────────────────────────────────────────────
async function loadCanvasImages(): Promise<AssetEntry[]> {
  const nodes = await framer.getNodesWithAttributeSet("backgroundImage")
  const grouped = new Map<
    string,
    { nodeIds: string[]; nodeNames: string[]; url: string; name: string; altText: string }
  >()

  for (const node of nodes) {
    const raw  = (node as Record<string, unknown>)["backgroundImage"]
    const data = readImageData(raw)
    if (!data?.url) continue

    // Prefer the node's own name (e.g. "Hero Image") over the backgroundImage name field
    const nodeName = (node as Record<string, unknown>)["name"] as string | undefined

    const rawObj = raw as Record<string, unknown>
    const canonicalKey =
      typeof rawObj["id"] === "string" && rawObj["id"]
        ? (rawObj["id"] as string)
        : normalizeUrl(data.url)

    const existing = grouped.get(canonicalKey)
    if (existing) {
      if (!existing.nodeIds.includes(node.id)) {
        existing.nodeIds.push(node.id)
        if (nodeName) existing.nodeNames.push(nodeName)
      }
      // Upgrade name: prefer any real name over "Untitled" or empty
      if ((!existing.name || existing.name === "Untitled") && (nodeName || data.name)) {
        existing.name = nodeName || data.name || "Untitled"
      }
    } else {
      grouped.set(canonicalKey, {
        nodeIds:   [node.id],
        nodeNames: nodeName ? [nodeName] : [],
        url:       data.url,
        name:      nodeName || data.name || "Untitled",
        altText:   data.altText,
      })
    }
  }

  const entries: AssetEntry[] = []
  for (const [imageId, info] of grouped) {
    const pageName = info.nodeIds.length > 0
      ? await resolvePageName(info.nodeIds[0])
      : ""
    entries.push({
      key:           `canvas:${imageId}`,
      name:          info.name,
      url:           info.url,
      altText:       info.altText,
      source:        "canvas",
      assetType:     classifyAssetType(info.url),
      storageSource: detectStorageSource(info.url),
      nodeIds:       info.nodeIds,
      locationLabel: buildLocationLabel({ pageName, nodeCount: info.nodeIds.length }),
      pageName,
      navigateId:    info.nodeIds[0],
    })
  }
  return entries
}

// ─── Load: canvas videos ──────────────────────────────────────────────────────
// Framer Video components store their file inside `controls`:
//   Pattern A (built-in Video): { srcType: "Upload", srcFile: FileAsset }
//                             | { srcType: "Link",   srcLink: string }
//   Pattern B (custom CodeComponent with ControlType.File): direct URL string
async function loadCanvasVideos(existingUrls: Set<string>): Promise<AssetEntry[]> {
  const compNodes = await framer.getNodesWithAttributeSet("controls")
  const grouped   = new Map<string, { nodeIds: string[]; name: string }>()

  for (const node of compNodes) {
    const controls = (node as Record<string, unknown>)["controls"] as
      | Record<string, unknown>
      | undefined
    if (!controls || typeof controls !== "object") continue

    let videoUrl  = ""
    let videoName = ""

    // Pattern A
    const srcType = controls["srcType"] as string | undefined
    if (srcType === "Upload") {
      const f = controls["srcFile"] as Record<string, unknown> | undefined
      if (f && typeof f["url"] === "string") {
        const mime = (f["mimeType"] as string | undefined) ?? ""
        if (mime.startsWith("video/") || isVideoUrl(f["url"])) {
          videoUrl  = f["url"]
          videoName = (f["name"] as string | undefined) ?? "Video"
        }
      }
    } else if (srcType === "Link") {
      const link = controls["srcLink"] as string | undefined
      if (link && isVideoUrl(link)) {
        videoUrl  = link
        videoName = link.split("/").pop()?.split("?")[0] ?? "Video"
      }
    }

    // Pattern B
    if (!videoUrl) {
      for (const val of Object.values(controls)) {
        if (typeof val === "string" && isVideoUrl(val)) {
          videoUrl  = val
          videoName = val.split("/").pop()?.split("?")[0] ?? "Video"
          break
        }
        if (val && typeof val === "object") {
          const fa   = val as Record<string, unknown>
          const fUrl = fa["url"] as string | undefined
          if (!fUrl) continue
          const mime = (fa["mimeType"] as string | undefined) ?? ""
          if (mime.startsWith("video/") || isVideoUrl(fUrl)) {
            videoUrl  = fUrl
            videoName = (fa["name"] as string | undefined) ?? "Video"
            break
          }
        }
      }
    }

    if (!videoUrl) continue

    const existing = grouped.get(videoUrl)
    if (existing) {
      if (!existing.nodeIds.includes(node.id)) existing.nodeIds.push(node.id)
    } else {
      grouped.set(videoUrl, { nodeIds: [node.id], name: videoName })
    }
  }

  const entries: AssetEntry[] = []
  for (const [url, info] of grouped) {
    if (existingUrls.has(url)) continue // already captured as a canvas image
    const pageName = info.nodeIds.length > 0
      ? await resolvePageName(info.nodeIds[0])
      : ""
    entries.push({
      key:           `video:${url}`,
      name:          info.name,
      url,
      altText:       "",
      source:        "canvas",
      assetType:     "video",
      storageSource: detectStorageSource(url),
      nodeIds:       info.nodeIds,
      locationLabel: buildLocationLabel({ pageName, nodeCount: info.nodeIds.length }),
      pageName,
      navigateId:    info.nodeIds[0],
    })
  }
  return entries
}

// ─── Load: CMS images ─────────────────────────────────────────────────────────
async function loadCmsImages(): Promise<AssetEntry[]> {
  const entries: AssetEntry[] = []
  const collections = await framer.getCollections()

  for (const col of collections) {
    const fields    = await col.getFields()
    const imgFields = fields.filter((f) => f.type === "image")
    if (!imgFields.length) continue

    const items = await col.getItems()
    for (const item of items) {
      for (const field of imgFields) {
        const raw  = (item.fieldData as Record<string, unknown>)[field.id]
        const data = readImageData(raw)
        if (!data?.url) continue

        const slug = (item as Record<string, unknown>)["slug"] as string | undefined
        entries.push({
          key:             `cms:${col.id}:${item.id}:${field.id}`,
          name:            field.name,
          url:             data.url,
          altText:         data.altText,
          source:          "cms",
          assetType:       "image",
          storageSource:   detectStorageSource(data.url),
          nodeIds:         [],
          locationLabel:   buildLocationLabel({ colName: col.name, slug, itemId: item.id }),
          pageName:        "",
          cmsCollectionId: col.id,
          cmsItemId:       item.id,
        })
      }
    }
  }
  return entries
}

// ─── Main loader ──────────────────────────────────────────────────────────────
// Each source is wrapped in its own try/catch so a failure in one doesn't
// prevent the others from loading.
export async function loadAssets(): Promise<AssetEntry[]> {
  const results = await Promise.allSettled([
    loadCanvasImages().catch((e) => { console.warn("[AM] canvas images:", e); return [] }),
    loadCmsImages().catch((e)    => { console.warn("[AM] cms:", e);           return [] }),
  ])

  const canvasImages = results[0].status === "fulfilled" ? results[0].value : []
  const cmsImages    = results[1].status === "fulfilled" ? results[1].value : []

  const existingUrls = new Set(canvasImages.map((e) => e.url))
  const videos = await loadCanvasVideos(existingUrls).catch((e) => {
    console.warn("[AM] videos:", e)
    return []
  })

  return [...canvasImages, ...videos, ...cmsImages]
}

// ─── Save: canvas alt text ────────────────────────────────────────────────────
export async function saveCanvasAltText(nodeIds: string[], newAlt: string): Promise<void> {
  for (const id of nodeIds) {
    const node = await framer.getNode(id)
    if (!node) continue
    const img = (node as Record<string, unknown>)["backgroundImage"] as Record<
      string,
      unknown
    > | null
    if (!img || typeof img["cloneWithAttributes"] !== "function") continue
    const cloned = (img["cloneWithAttributes"] as (a: Record<string, unknown>) => unknown)({
      altText: newAlt,
    })
    await (
      node as { setAttributes(a: Record<string, unknown>): Promise<void> }
    ).setAttributes({ backgroundImage: cloned })
  }
}

// ─── Save: CMS alt text ───────────────────────────────────────────────────────
export async function saveCmsAltText(key: string, newAlt: string): Promise<void> {
  const parts   = key.split(":")
  const colId   = parts[1]
  const itemId  = parts[2]
  const fieldId = parts.slice(3).join(":")

  const cols = await framer.getCollections()
  const col  = cols.find((c) => c.id === colId)
  if (!col) throw new Error("Collection not found")

  const items = await col.getItems()
  const item  = items.find((i) => i.id === itemId)
  if (!item) throw new Error("Item not found")

  const raw = (item.fieldData as Record<string, unknown>)[fieldId]
  if (!raw) throw new Error("Field not found")

  const updated =
    typeof raw === "object" && raw !== null && "value" in raw
      ? {
          ...(raw as object),
          value: { ...((raw as { value: object }).value), altText: newAlt },
        }
      : { ...(raw as object), altText: newAlt }

  const newFD = { ...(item.fieldData as Record<string, unknown>), [fieldId]: updated }
  const slug  = (item as Record<string, unknown>)["slug"] as string | undefined

  await (
    col as unknown as {
      addItems(items: { id: string; slug: string; fieldData: Record<string, unknown> }[]): Promise<void>
    }
  ).addItems([{ id: itemId, slug: slug ?? itemId, fieldData: newFD }])
}

// ─── Add / set image on canvas ────────────────────────────────────────────────
// If something is selected → set it as the background of that frame.
// Otherwise → add a new image node to the canvas.
export async function smartAdd(asset: AssetEntry): Promise<"set" | "add"> {
  const sel = await framer.getSelection()
  if (sel.length > 0 && framer.isAllowedTo("setImage")) {
    await framer.setImage({
      image:   asset.url,
      altText: asset.altText || undefined,
    } as Parameters<typeof framer.setImage>[0])
    return "set"
  }
  if (framer.isAllowedTo("addImage")) {
    await framer.addImage({
      image:   asset.url,
      name:    asset.name,
      altText: asset.altText || undefined,
    } as Parameters<typeof framer.addImage>[0])
  }
  return "add"
}

// ─── Navigate ─────────────────────────────────────────────────────────────────
export async function navigateToNode(nodeId: string): Promise<void> {
  await framer.setSelection([nodeId])
  await framer.zoomIntoView([nodeId])
}

export async function navigateToCmsItem(itemId: string): Promise<void> {
  await framer.navigateTo(itemId)
}
