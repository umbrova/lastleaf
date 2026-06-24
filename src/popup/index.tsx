import { useEffect, useState } from "react"
import { getStorageStats } from "~lib/storage"

const LeafLogo = () => (
  <svg width="22" height="22" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#EF9F27" opacity="0.3" />
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#BA7517" />
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round" />
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#BA7517" strokeWidth="12" strokeLinecap="round" />
    </g>
  </svg>
)

const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

function MenuItem({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", cursor: "pointer", background: hovered ? "#FAEEDA" : "transparent", transition: "background 0.1s" }}
    >
      <div style={{ color: "#854F0B", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#2C2C2A" }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: "#888780", marginTop: "1px" }}>{sub}</div>}
      </div>
      <div style={{ color: "#B4B2A9", flexShrink: 0 }}><IconChevron /></div>
    </div>
  )
}

export default function Popup() {
  const [stats, setStats] = useState({ tabCount: 0, estimatedMB: 0 })

  useEffect(() => {
    getStorageStats().then(setStats)
  }, [])

  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/newtab/index.html") })
    window.close()
  }

  function openSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/options/index.html") })
    window.close()
  }

  function openFeedback() {
    chrome.tabs.create({ url: "mailto:hello@sylvoralabs.com" })
    window.close()
  }

  return (
    <div style={{ width: "260px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", background: "#ffffff", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: "#854F0B", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LeafLogo />
          <span style={{ fontSize: "17px", fontWeight: 400, color: "#FAC775", fontFamily: "Georgia, serif", fontStyle: "italic" }}>lastleaf</span>
        </div>
        <span style={{ fontSize: "10px", color: "#EF9F27", letterSpacing: "0.3px" }}>Remember what you closed.</span>
      </div>

      {/* Stats */}
      <div style={{ background: "#FAEEDA", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-around", borderBottom: "0.5px solid #EFD4A0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 500, color: "#854F0B" }}>{stats.tabCount}</div>
          <div style={{ fontSize: "10px", color: "#BA7517", letterSpacing: "0.4px", marginTop: "1px" }}>TABS BURIED</div>
        </div>
        <div style={{ width: "0.5px", height: "30px", background: "#EFD4A0" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 500, color: "#854F0B" }}>{stats.estimatedMB} MB</div>
          <div style={{ fontSize: "10px", color: "#BA7517", letterSpacing: "0.4px", marginTop: "1px" }}>STORAGE</div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ paddingTop: "4px", paddingBottom: "4px" }}>
        <MenuItem icon={<IconDashboard />} label="Dashboard" sub="View your tab graveyard" onClick={openDashboard} />
        <div style={{ height: "0.5px", background: "#F1EFE8", margin: "0 16px" }} />
        <MenuItem icon={<IconSettings />} label="Settings" sub="Capture, data & preferences" onClick={openSettings} />
        <div style={{ height: "0.5px", background: "#F1EFE8", margin: "0 16px" }} />
        <MenuItem icon={<IconMail />} label="Send feedback" sub="hello@sylvoralabs.com" onClick={openFeedback} />
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 16px", borderTop: "0.5px solid #F1EFE8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: "#B4B2A9" }}>© 2025 Sylvora Labs</span>
        <span style={{ fontSize: "11px", color: "#B4B2A9" }}>v1.0.0</span>
      </div>

    </div>
  )
}
