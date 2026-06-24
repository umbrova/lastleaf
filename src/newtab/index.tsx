import { useState } from "react"
import { useClusters } from "./hooks/useClusters"
import { Graph } from "./components/Graph"
import { SidePanel } from "./components/SidePanel"
import { OnboardingHint } from "./components/OnboardingHint"
import type { Cluster } from "~lib/clustering"
import { formatTime } from "~lib/clustering"

const LeafLogo = () => (
  <svg width="20" height="20" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#EF9F27" opacity="0.3"/>
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#BA7517"/>
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round"/>
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#BA7517" strokeWidth="12" strokeLinecap="round"/>
    </g>
  </svg>
)

function exportCSV(clusters: any[]) {
  const rows = [["Title", "URL", "Domain", "Cluster", "Time Spent (mins)", "Date Closed"]]
  clusters.forEach(cluster => {
    cluster.tabs.forEach((tab: any) => {
      const mins = Math.round(tab.timeSpent / 60000)
      const date = new Date(tab.closedAt).toLocaleString()
      rows.push([
        `"${(tab.title || tab.url).replace(/"/g, '""')}"`,
        `"${tab.url.replace(/"/g, '""')}"`,
        tab.domain,
        `"${cluster.label.replace(/"/g, '""')}"`,
        String(mins),
        `"${date}"`
      ])
    })
  })
  const csv = rows.map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `lastleaf-export-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const GearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const MailIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

export default function NewTab() {
  const { clusters, loading, totalTabs, totalTime, reload } = useClusters()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scrollToTags, setScrollToTags] = useState(false)

  const selectedCluster: Cluster | null =
    clusters.find(c => c.id === selectedId) ?? null

  function handleSelect(id: string, toTags: boolean) {
    setSelectedId(id)
    setScrollToTags(toTags)
  }

  function handleClose() {
    setSelectedId(null)
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 16px",
        borderBottom: "0.5px solid #E8E5DE",
        background: "#ffffff",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LeafLogo />
          <span style={{
            fontSize: "15px", fontWeight: 400,
            fontFamily: "Georgia, serif", fontStyle: "italic",
            color: "#854F0B"
          }}>
            lastleaf
          </span>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#888780" }}>
            <span style={{ fontWeight: 500, color: "#2C2C2A" }}>{totalTabs}</span> tabs buried
          </span>
          <span style={{ fontSize: "12px", color: "#888780" }}>
            <span style={{ fontWeight: 500, color: "#2C2C2A" }}>{clusters.length}</span> clusters
          </span>
          <span style={{ fontSize: "12px", color: "#888780" }}>
            <span style={{ fontWeight: 500, color: "#2C2C2A" }}>{formatTime(totalTime)}</span> total
          </span>
          <button
            onClick={reload}
            title="Refresh dashboard"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#BA7517", display: "flex", alignItems: "center", padding: 0 }}
          >
            <RefreshIcon />
          </button>
          {clusters.length > 0 && (
            <button
              onClick={() => exportCSV(clusters)}
              title="Export to CSV"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#BA7517", display: "flex", alignItems: "center", padding: 0 }}
            >
              <DownloadIcon />
            </button>
          )}
          <a
            href={chrome.runtime.getURL("src/options/index.html")}
            style={{ color: "#BA7517", display: "flex", alignItems: "center" }}
            title="Settings"
          >
            <GearIcon />
          </a>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#B4B2A9", fontSize: "13px" }}>
            Loading your graveyard...
          </div>
        ) : clusters.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <LeafLogo />
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#2C2C2A", marginTop: "4px" }}>No tabs buried yet</div>
            <div style={{ fontSize: "12px", color: "#888780", lineHeight: 1.6, textAlign: "center", maxWidth: "260px" }}>
              Browse normally — lastleaf will capture tabs you close after 1 minute.
            </div>
          </div>
        ) : (
          <>
            <Graph
              clusters={clusters}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
            <SidePanel
              cluster={selectedCluster}
              onClose={handleClose}
              onAction={reload}
              scrollToTags={scrollToTags}
            />
            {totalTabs > 0 && <OnboardingHint />}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "7px 16px",
        borderTop: "0.5px solid #E8E5DE",
        background: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0
      }}>
        <span style={{ fontSize: "11px", color: "#B4B2A9" }}>© {new Date().getFullYear()} Sylvora Labs</span>
        <a href="mailto:hello@sylvoralabs.com"
          style={{ fontSize: "11px", color: "#BA7517", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
          <MailIcon /> Feedback
        </a>
      </div>
    </div>
  )
}
