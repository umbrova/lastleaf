const LeafLogo = () => (
  <svg width="44" height="44" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#EF9F27" opacity="0.3" />
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#BA7517" />
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round" />
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#BA7517" strokeWidth="12" strokeLinecap="round" />
    </g>
  </svg>
)

const card: React.CSSProperties = {
  background: "#ffffff", borderRadius: "12px",
  border: "0.5px solid #E8E5DE", padding: "20px 24px", marginBottom: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
}

const step: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: "14px",
  padding: "13px 0", borderBottom: "0.5px solid #F0EDE6"
}

const stepLast: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: "14px", padding: "13px 0"
}

const stepIcon: React.CSSProperties = {
  width: "32px", height: "32px", borderRadius: "8px",
  background: "#FFF8F0", border: "0.5px solid #EFD4A0",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
}

const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 500, color: "#2C2C2A" }
const subStyle: React.CSSProperties = { fontSize: "12px", color: "#888780", marginTop: "2px", lineHeight: 1.6 }
const sectionLabel: React.CSSProperties = { fontSize: "11px", fontWeight: 600, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "12px" }

export default function Welcome() {
  function openSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/options/index.html") })
  }

  return (
    <div style={{ background: "#F9F8F5", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "40px" }}>
          <LeafLogo />
          <div>
            <div style={{ fontSize: "26px", fontWeight: 400, color: "#2C2C2A", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1 }}>lastleaf</div>
            <div style={{ fontSize: "12px", color: "#BA7517", marginTop: "3px", letterSpacing: "0.5px" }}>Remember what you closed.</div>
          </div>
        </div>

        <h1 style={{ fontSize: "21px", fontWeight: 600, color: "#2C2C2A", margin: "0 0 8px" }}>Your tabs now have a second life.</h1>
        <p style={{ fontSize: "14px", color: "#5F5E5A", margin: "0 0 32px", lineHeight: 1.7 }}>
          Every tab you close gets quietly captured. Come back to it anytime — grouped by topic, connected by session.
        </p>

        {/* How it works */}
        <div style={card}>
          <div style={sectionLabel}>HOW IT WORKS</div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "15px" }}>👁</span></div>
            <div>
              <div style={labelStyle}>lastleaf watches your tabs silently</div>
              <div style={subStyle}>Any tab open longer than your minimum time threshold gets captured. Everything stays on your device — nothing is sent to any server.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "15px" }}>🍂</span></div>
            <div>
              <div style={labelStyle}>Closed tabs go to the graveyard</div>
              <div style={subStyle}>Tabs are automatically grouped by topic and session. Your browsing history becomes a personal knowledge map.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><span style={{ fontSize: "15px" }}>🗺</span></div>
            <div>
              <div style={labelStyle}>Click the lastleaf icon to explore</div>
              <div style={subStyle}>Open the dashboard anytime from the toolbar. Click any cluster card to see the tabs inside — reopen or bury them.</div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div style={card}>
          <div style={sectionLabel}>PERMISSIONS — WHY WE NEED THEM</div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "14px" }}>🗂</span></div>
            <div>
              <div style={labelStyle}>Tabs</div>
              <div style={subStyle}>To know when tabs open and close, and how long they were open.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "14px" }}>💾</span></div>
            <div>
              <div style={labelStyle}>Storage</div>
              <div style={subStyle}>To save your tab history locally on your device. Nothing goes to any server.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><span style={{ fontSize: "14px" }}>🔒</span></div>
            <div>
              <div style={labelStyle}>Privacy first</div>
              <div style={subStyle}>All data stays on your machine. lastleaf never reads page content — only tab titles and URLs.</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={card}>
          <div style={sectionLabel}>TIPS</div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "14px" }}>⏱</span></div>
            <div>
              <div style={labelStyle}>Default capture threshold is 1 minute</div>
              <div style={subStyle}>Tabs closed before 1 minute won't be captured. You can change this in settings.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "14px" }}>🚫</span></div>
            <div>
              <div style={labelStyle}>Exclude sensitive sites</div>
              <div style={subStyle}>Add domains like bank.com or mail.google.com to your excluded list in settings — lastleaf will never capture those tabs.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><span style={{ fontSize: "14px" }}>📥</span></div>
            <div>
              <div style={labelStyle}>Export your graveyard</div>
              <div style={subStyle}>Download all your buried tabs as a CSV anytime from the dashboard header.</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <div style={{ fontSize: "14px", color: "#2C2C2A", fontWeight: 500, marginBottom: "8px" }}>You're all set. Start browsing normally.</div>
          <div style={{ fontSize: "13px", color: "#888780", marginBottom: "24px", lineHeight: 1.6 }}>
            lastleaf runs quietly in the background. Click the icon in your toolbar anytime to open your dashboard.
          </div>
          <button
            onClick={openSettings}
            style={{ background: "none", border: "0.5px solid #E8E5DE", borderRadius: "8px", padding: "10px 24px", fontSize: "13px", color: "#854F0B", cursor: "pointer", fontFamily: "inherit" }}
          >
            Go to Settings →
          </button>
        </div>

      </div>
    </div>
  )
}
