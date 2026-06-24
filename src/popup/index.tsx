import { useEffect, useState } from "react"
import { getStorageStats } from "~lib/storage"

const LeafLogo = () => (
  <svg width="20" height="20" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#EF9F27" opacity="0.3" />
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#BA7517" />
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round" />
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#BA7517" strokeWidth="12" strokeLinecap="round" />
    </g>
  </svg>
)

function MenuItem({ icon, label, sub, onClick }: { icon: string; label: string; sub?: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", cursor: "pointer", background: hovered ? "#F9F8F5" : "transparent", transition: "background 0.1s" }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: "16px", color: "#BA7517", flexShrink: 0 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#2C2C2A" }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: "#888780", marginTop: "1px" }}>{sub}</div>}
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize: "13px", color: "#D3D1C7", flexShrink: 0 }} aria-hidden="true" />
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
    <div style={{ width: "240px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", background: "#ffffff", overflow: "hidden" }}>

      {/* Header — minimal white */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "0.5px solid #F0EDE6", display: "flex", alignItems: "center", gap: "8px" }}>
        <LeafLogo />
        <span style={{ fontSize: "16px", fontWeight: 400, color: "#2C2C2A", fontFamily: "Georgia, serif", fontStyle: "italic" }}>lastleaf</span>
      </div>

      {/* Stats — subtle amber tint */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "12px 16px", borderBottom: "0.5px solid #F0EDE6", background: "#FDFCFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#2C2C2A" }}>{stats.tabCount}</div>
          <div style={{ fontSize: "10px", color: "#BA7517", letterSpacing: "0.3px", marginTop: "1px" }}>TABS BURIED</div>
        </div>
        <div style={{ width: "0.5px", height: "28px", background: "#E8E5DE" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#2C2C2A" }}>{stats.estimatedMB} MB</div>
          <div style={{ fontSize: "10px", color: "#BA7517", letterSpacing: "0.3px", marginTop: "1px" }}>STORAGE</div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ paddingTop: "4px", paddingBottom: "4px" }}>
        <MenuItem icon="ti-layout-grid" label="Dashboard" sub="View your tab graveyard" onClick={openDashboard} />
        <div style={{ height: "0.5px", background: "#F0EDE6", margin: "0 16px" }} />
        <MenuItem icon="ti-settings" label="Settings" sub="Capture, data & preferences" onClick={openSettings} />
        <div style={{ height: "0.5px", background: "#F0EDE6", margin: "0 16px" }} />
        <MenuItem icon="ti-mail" label="Send feedback" sub="hello@sylvoralabs.com" onClick={openFeedback} />
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 16px", borderTop: "0.5px solid #F0EDE6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: "#B4B2A9" }}>© 2025 Sylvora Labs</span>
        <span style={{ fontSize: "11px", color: "#B4B2A9" }}>v1.0.0</span>
      </div>

    </div>
  )
}
