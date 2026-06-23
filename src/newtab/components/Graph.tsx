import { useCallback, useEffect, useRef, useState } from "react"
import type { Cluster } from "~lib/clustering"
import { ClusterCard } from "./ClusterCard"

const CARD_W = 162
const CARD_H = 86

// Static positions as fractions of container size
// Spread out enough to avoid overlaps at typical viewport sizes
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

// Edges between cluster indices — session proximity
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

  const measure = useCallback(() => {
    if (!containerRef.current) return
    const { offsetWidth, offsetHeight } = containerRef.current
    setSize({ w: offsetWidth, h: offsetHeight })
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

    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches

    // draw edges
    EDGES.forEach(([a, b]) => {
      const ca = clusters[a]
      const cb = clusters[b]
      if (!ca || !cb) return

      const posA = POSITIONS[a] ?? POSITIONS[0]
      const posB = POSITIONS[b] ?? POSITIONS[1]
      const ax = posA.x * size.w + CARD_W / 2
      const ay = posA.y * size.h + CARD_H / 2
      const bx = posB.x * size.w + CARD_W / 2
      const by = posB.y * size.h + CARD_H / 2

      const isHighlighted =
        selectedId !== null &&
        (ca.id === selectedId || cb.id === selectedId)

      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.quadraticCurveTo(
        (ax + bx) / 2,
        (ay + by) / 2 - 28,
        bx, by
      )

      if (isHighlighted) {
        ctx.strokeStyle = dark
          ? "rgba(250,199,117,0.55)"
          : "rgba(133,79,11,0.3)"
        ctx.lineWidth = 1.5
        ctx.setLineDash([])
      } else {
        ctx.strokeStyle = dark
          ? "rgba(180,178,169,0.18)"
          : "rgba(136,135,128,0.28)"
        ctx.lineWidth = 0.75
        ctx.setLineDash([4, 5])
      }

      ctx.stroke()
      ctx.setLineDash([])
    })
  }, [clusters, selectedId, size])

  return (
    <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      />

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
  )
}
