import { useState } from "react"
import type { Cluster } from "~lib/clustering"
import { TabRow } from "./TabRow"

interface Props {
  cluster: Cluster | null
  onClose: () => void
  onAction: () => void
  scrollToTags?: boolean
}

function CollapsibleSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: open ? "8px" : "0" }}
      >
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#BA7517", letterSpacing: "0.5px" }}>{title}</div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2" strokeLinecap="round"
          style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && children}
    </div>
  )
}

export function SidePanel({ cluster, onClose, onAction, scrollToTags }: Props) {
  const visible = !!cluster

  return (
    <div style={{
      width: visible ? "240px" : "0px",
      flexShrink: 0,
      overflow: "hidden",
      borderLeft: visible ? "0.5px solid #E8E5DE" : "none",
      background: "#FDFAF6",
      transition: "width 0.18s ease",
      display: "flex",
      flexDirection: "column"
    }}>
      {cluster && (
        <div style={{ minWidth: "240px", padding: "14px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cluster.color.dot }} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#2C2C2A" }}>{cluster.label}</span>
            </div>
            <button onClick={onClose} aria-label="Close panel"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#B4B2A9", display: "flex", alignItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Meta */}
          <div style={{ fontSize: "11px", color: "#888780", marginBottom: "16px" }}>
            {cluster.tabs.length} tabs · {
              (() => {
                const ms = cluster.totalTime
                const h = Math.floor(ms / 3600000)
                const m = Math.floor((ms % 3600000) / 60000)
                return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m` : "<1m"
              })()
            } browsing
          </div>

          {/* TABS first */}
          <CollapsibleSection title="TABS" defaultOpen={true}>
            <div>
              {cluster.tabs.map((tab, i) => (
                <TabRow key={tab.id ?? i} tab={tab} defaultOpen={i === 0} onAction={onAction} />
              ))}
            </div>
          </CollapsibleSection>

          {/* TOPICS below — collapsed by default */}
          <CollapsibleSection title="TOPICS" defaultOpen={scrollToTags ?? false}>
            <div style={{ lineHeight: "2.2" }}>
              {cluster.keywords.map(kw => (
                <span key={kw} style={{
                  fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
                  display: "inline-block", margin: "2px 2px 2px 0",
                  background: cluster.color.bg, color: cluster.color.accent,
                  border: `0.5px solid ${cluster.color.bc}`
                }}>
                  {kw}
                </span>
              ))}
            </div>
          </CollapsibleSection>

        </div>
      )}
    </div>
  )
}
