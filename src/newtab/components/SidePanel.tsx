import type { Cluster } from "~lib/clustering"
import { TabRow } from "./TabRow"

interface Props {
  cluster: Cluster | null
  onClose: () => void
  onAction: () => void
  scrollToTags?: boolean
}

export function SidePanel({ cluster, onClose, onAction, scrollToTags }: Props) {
  const visible = !!cluster

  return (
    <div style={{
      width: visible ? "238px" : "0px",
      flexShrink: 0,
      overflow: "hidden",
      borderLeft: visible ? "0.5px solid var(--ll-border, rgba(136,135,128,0.2))" : "none",
      background: "var(--ll-card-bg, #ffffff)",
      transition: "width 0.18s ease",
      display: "flex",
      flexDirection: "column"
    }}>
      {cluster && (
        <div style={{ minWidth: "238px", padding: "14px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cluster.color.dot }} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ll-text-primary, #2C2C2A)" }}>
                {cluster.label}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "2px",
                color: "var(--ll-text-tertiary, #888780)", display: "flex", alignItems: "center"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ fontSize: "11px", color: "var(--ll-text-tertiary, #888780)", marginBottom: "16px" }}>
            {cluster.tabs.length} tabs · {
              (() => {
                const ms = cluster.totalTime
                const h = Math.floor(ms / 3600000)
                const m = Math.floor((ms % 3600000) / 60000)
                return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m` : "<1m"
              })()
            } browsing
          </div>

          <div id="panel-tags-section">
            <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--ll-text-tertiary, #888780)", letterSpacing: "0.5px", marginBottom: "7px" }}>
              TOPICS
            </div>
            <div style={{ marginBottom: "18px", lineHeight: "2.2" }}>
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
          </div>

          <div id="panel-tabs-section">
            <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--ll-text-tertiary, #888780)", letterSpacing: "0.5px", marginBottom: "8px" }}>
              TABS
            </div>
            <div>
              {cluster.tabs.map((tab, i) => (
                <TabRow
                  key={tab.id ?? i}
                  tab={tab}
                  defaultOpen={i === 0}
                  onAction={onAction}
                />
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
