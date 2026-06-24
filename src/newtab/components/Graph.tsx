import { useCallback, useEffect, useRef, useState } from "react"
import type { Cluster } from "~lib/clustering"
import { ClusterCard } from "./ClusterCard"

const CARD_W = 162
const CARD_H = 86

const POSITIONS = [
  { x: 0.08, y: 0.08 },
  { x: 0.52, y: 0.05 },
  { x: 0.72, y: 0.48 },
  { x: 0.06, y: 0.58 },
  { x: 0.36, y: 0.52 },
  { x: 0.56, y: 0.72 },
  { x: 0.78, y: 0.18 },
  { x: 0.20, y: 0.30 },
]

const EDGES = [
  [0, 1], [0, 3], [1, 2], [1, 4],
  [2, 5], [3, 4], [4, 5], [0, 4],
  [1, 6], [2, 6], [3, 7], [0, 7]
]

interface Props {
  clusters: Cluster[]
  selectedId: string | null
  onSelect: (id: string, scrollToTags: boolean) => void
}

export function Graph({ clusters, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)

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
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    canvas.style.width = size.w + "px"
    canvas.style.height = size.h + "px"
    const ctx = canvas.getContext("2d")!
    ctx.scale(dpr, dpr)

    EDGES.forEach(([a, b]) => {
      const ca = clusters[a], cb = clusters[b]
      if (!ca || !cb) return
      const posA = POSITIONS[a] ?? POSITIONS[0]
      const posB = POSITIONS[b] ?? POSITIONS[1]
      const ax = posA.x * size.w + CARD_W / 2
      const ay = posA.y * size.h + CARD_H / 2
      const bx = posB.x * size.w + CARD_W / 2
      const by = posB.y * size.h + CARD_H / 2
      const isHighlighted = selectedId !== null && (ca.id === selectedId || cb.id === selectedId)

      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - 28, bx, by)
      ctx.strokeStyle = isHighlighted
        ? "rgba(186,117,23,0.45)"
        : "rgba(186,117,23,0.15)"
      ctx.lineWidth = isHighlighted ? 1.5 : 0.75
      ctx.setLineDash(isHighlighted ? [] : [4, 5])
      ctx.stroke()
      ctx.setLineDash([])
    })
  }, [clusters, selectedId, size])

  return (
    <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#FDFCFB" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} />

      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        transition: "transform 0.2s"
      }}>
        {clusters.map((cluster, i) => {
          const pos = POSITIONS[i] ?? { x: 0.1 + (i * 0.15) % 0.8, y: 0.1 + (i * 0.2) % 0.7 }
          return (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              selected={cluster.id === selectedId}
              style={{ left: pos.x * size.w, top: pos.y * size.h }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                const isMore = target.dataset.more === "true"
                onSelect(cluster.id, isMore)
              }}
            />
          )
        })}
      </div>

      {/* Zoom controls */}
      <div style={{ position: "absolute", bottom: "16px", right: "16px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 10 }}>
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 2))}
          style={{ width: "28px", height: "28px", borderRadius: "7px", border: "0.5px solid #E8E5DE", background: "#ffffff", color: "#854F0B", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontWeight: 400 }}
        >+</button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
          style={{ width: "28px", height: "28px", borderRadius: "7px", border: "0.5px solid #E8E5DE", background: "#ffffff", color: "#854F0B", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontWeight: 400 }}
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
