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
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#BA7517" opacity="0.22"/>
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#854F0B"/>
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round"/>
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#854F0B" strokeWidth="12" strokeLinecap="round"/>
    </g>
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
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--ll-bg, #FAFAF9)",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "0.5px solid var(--ll-border, rgba(136,135,128,0.2))",
        background: "var(--ll-card-bg, #ffffff)",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LeafLogo />
          <span style={{
            fontSize: "15px", fontWeight: 400, fontFamily: "Georgia, serif",
            fontStyle: "italic", color: "var(--ll-text-primary, #2C2C2A)"
          }}>
            lastleaf
          </span>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--ll-text-tertiary, #888780)" }}>
            <span style={{ fontWeight: 500, color: "var(--ll-text-primary, #2C2C2A)" }}>{totalTabs}</span> tabs buried
          </span>
          <span style={{ fontSize: "12px", color: "var(--ll-text-tertiary, #888780)" }}>
            <span style={{ fontWeight: 500, color: "var(--ll-text-primary, #2C2C2A)" }}>{clusters.length}</span> clusters
          </span>
          <span style={{ fontSize: "12px", color: "var(--ll-text-tertiary, #888780)" }}>
            <span style={{ fontWeight: 500, color: "var(--ll-text-primary, #2C2C2A)" }}>{formatTime(totalTime)}</span> total
          </span>
          <a
            href={chrome.runtime.getURL("tabs/options.html")}
            style={{ color: "var(--ll-text-tertiary, #888780)", display: "flex", alignItems: "center" }}
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {loading ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ll-text-tertiary, #888780)", fontSize: "13px"
          }}>
            Loading your graveyard...
          </div>
        ) : clusters.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "10px",
            color: "var(--ll-text-tertiary, #888780)"
          }}>
            <LeafLogo />
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ll-text-primary, #2C2C2A)" }}>
              No tabs buried yet
            </div>
            <div style={{ fontSize: "12px", lineHeight: 1.6, textAlign: "center", maxWidth: "260px" }}>
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
        padding: "8px 16px",
        borderTop: "0.5px solid var(--ll-border, rgba(136,135,128,0.2))",
        background: "var(--ll-card-bg, #ffffff)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0
      }}>
        <span style={{ fontSize: "11px", color: "var(--ll-text-tertiary, #888780)" }}>
          © {new Date().getFullYear()} Sylvora Labs
        </span>
        <a
          href="mailto:hello@sylvoralabs.com"
          style={{ fontSize: "11px", color: "var(--ll-text-tertiary, #888780)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Feedback
        </a>
      </div>
    </div>
  )
}
