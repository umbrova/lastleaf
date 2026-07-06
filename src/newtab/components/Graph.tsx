import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Cluster } from "~lib/clustering"
import { ClusterCard } from "./ClusterCard"

const CARD_W = 162
const CARD_H = 86
const GAP_X = CARD_W + 90
const GAP_Y = CARD_H + 70

// Fixed-pixel grid layout — cards sit a consistent, comfortable distance
// apart regardless of how large the container is. A handful of clusters
// stay compact near the top-left instead of stretching to fill whatever
// viewport size happens to be available (which was forcing scrolling to
// find pills even when there was plenty of room to keep them close).
function getPositions(count: number): { x: number; y: number }[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)))
  const jitter = (seed: number) => (((seed * 137) % 17) / 17 - 0.5) * 16
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    positions.push({
      x: 24 + col * GAP_X + jitter(i * 2),
      y: 24 + row * GAP_Y + jitter(i * 2 + 1)
    })
  }
  return positions
}

// An edge exists between two clusters only when they actually share
// keywords — the connection (and its thickness) reflects a real
// relationship in the data, not a fixed decorative pattern.
function getEdges(clusters: Cluster[]): { a: number; b: number; strength: number }[] {
  const edges: { a: number; b: number; strength: number }[] = []
  for (let i = 0; i < clusters.length; i++) {
    const kwA = new Set(clusters[i].keywords)
    for (let j = i + 1; j < clusters.length; j++) {
      const kwB = clusters[j].keywords
      let shared = 0
      for (const kw of kwB) if (kwA.has(kw)) shared++
      if (shared > 0) edges.push({ a: i, b: j, strength: shared })
    }
  }
  return edges
}

interface Props {
  clusters: Cluster[]
  selectedId: string | null
  onSelect: (id: string, scrollToTags: boolean) => void
}

export function Graph({ clusters, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1.15)

  const positions = useMemo(() => getPositions(clusters.length), [clusters.length])
  const edges = useMemo(() => getEdges(clusters), [clusters])

  // Content bounds so the container is exactly as big as it needs to be —
  // no bigger — so cards never end up scattered across empty space
  const contentW = useMemo(() => {
    if (!positions.length) return 0
    return Math.max(...positions.map(p => p.x)) + CARD_W + 24
  }, [positions])
  const contentH = useMemo(() => {
    if (!positions.length) return 0
    return Math.max(...positions.map(p => p.y)) + CARD_H + 24
  }, [positions])

  const measure = useCallback(() => {
    if (!containerRef.current) return
    setSize({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight })
  }, [])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measure])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !size.w || !size.h) return
    const dpr = window.devicePixelRatio || 1

    // Canvas covers the full zoomed content area
    const scaledW = Math.max(contentW, size.w) * zoom
    const scaledH = Math.max(contentH, size.h) * zoom
    canvas.width = scaledW * dpr
    canvas.height = scaledH * dpr
    canvas.style.width = scaledW + "px"
    canvas.style.height = scaledH + "px"

    const ctx = canvas.getContext("2d")!
    ctx.scale(dpr, dpr)

    edges.forEach(({ a, b, strength }) => {
      const ca = clusters[a], cb = clusters[b]
      if (!ca || !cb) return

      const posA = positions[a]
      const posB = positions[b]
      if (!posA || !posB) return

      const ax = (posA.x + CARD_W / 2) * zoom
      const ay = (posA.y + CARD_H / 2) * zoom
      const bx = (posB.x + CARD_W / 2) * zoom
      const by = (posB.y + CARD_H / 2) * zoom

      const isHighlighted = selectedId !== null && (ca.id === selectedId || cb.id === selectedId)
      // More shared keywords = a more solid, more visible line
      const baseOpacity = Math.min(0.28 + strength * 0.1, 0.55)

      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.quadraticCurveTo(
        (ax + bx) / 2,
        (ay + by) / 2 - 28 * zoom,
        bx, by
      )
      ctx.strokeStyle = isHighlighted
        ? "rgba(186,117,23,0.55)"
        : `rgba(186,117,23,${baseOpacity})`
      ctx.lineWidth = isHighlighted ? 1.5 : Math.min(1, 0.9 + strength * 0.3)
      ctx.setLineDash(isHighlighted ? [] : [4, 5])
      ctx.stroke()
      ctx.setLineDash([])
    })
  }, [clusters, edges, positions, selectedId, size, zoom, contentW, contentH])


  return (
    // Outer container — clips and allows scrolling when zoomed
    <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "auto", background: "#FDFCFB",
      backgroundImage: "linear-gradient(rgba(186,117,23,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(186,117,23,0.07) 1px, transparent 1px)",
      backgroundSize: "32px 32px"
    }}>

      {/* Inner wrapper — sized to fit the actual content, not the full viewport */}
      <div style={{ position: "relative", width: Math.max(contentW, size.w) * zoom, height: Math.max(contentH, size.h) * zoom, minWidth: "100%", minHeight: "100%" }}>

        {/* Canvas for edges — fills zoomed area */}
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} />

        {/* Cards — positioned at fixed pixel coordinates */}
        {clusters.map((cluster, i) => {
          const pos = positions[i]
          if (!pos) return null
          return (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              selected={cluster.id === selectedId}
              style={{
                left: pos.x * zoom,
                top: pos.y * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: "top left"
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                const isMore = target.dataset.more === "true"
                onSelect(cluster.id, isMore)
              }}
            />
          )
        })}

      </div>

      {/* Legend — only shown when there's at least one real connection to explain */}
      {edges.length > 0 && (
        <div style={{
          position: "sticky", bottom: "16px", left: "16px",
          display: "inline-block", fontSize: "10.5px", color: "#9E9080",
          background: "rgba(255,255,255,0.85)", padding: "4px 9px", borderRadius: "6px",
          border: "0.5px solid #E8E5DE"
        }}>
          Lines connect clusters that share keywords
        </div>
      )}

      {/* Zoom controls — fixed to bottom right of viewport */}
      <div style={{ position: "sticky", bottom: "16px", float: "right", marginRight: "16px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 10 }}>
        <button
          onClick={() => setZoom(z => Math.min(+(z + 0.15).toFixed(2), 2))}
          style={{ width: "28px", height: "28px", borderRadius: "7px", border: "0.5px solid #E8E5DE", background: "#ffffff", color: "#854F0B", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >+</button>
        <button
          onClick={() => setZoom(z => Math.max(+(z - 0.15).toFixed(2), 0.4))}
          style={{ width: "28px", height: "28px", borderRadius: "7px", border: "0.5px solid #E8E5DE", background: "#ffffff", color: "#854F0B", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >−</button>
        {zoom !== 1 && (
          <button
            onClick={() => setZoom(1)}
            style={{ width: "28px", height: "28px", borderRadius: "7px", border: "0.5px solid #E8E5DE", background: "#ffffff", color: "#BA7517", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontWeight: 500 }}
          >1:1</button>
        )}
      </div>

    </div>
  )
}