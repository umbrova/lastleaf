const LeafLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="translate(50,52) rotate(25)">
      <path d="M0 -44 Q38 -28 28 8 Q0 24 -28 8 Q-38 -18 0 -44 Z" fill="#BA7517"/>
      <path d="M0 -38 Q-1 -14 -2 10" fill="none" stroke="#FAC775" strokeWidth="4" strokeLinecap="round"/>
      <path d="M-1 -22 Q-14 -12 -20 -2" fill="none" stroke="#FAC775" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M-1 -8 Q12 -2 16 6" fill="none" stroke="#FAC775" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M-2 12 Q-4 22 -6 30" fill="none" stroke="#BA7517" strokeWidth="3.5" strokeLinecap="round"/>
    </g>
    <g transform="translate(50,52) rotate(25)" opacity="0.22">
      <path d="M12 -48 Q50 -32 40 4 Q12 20 -16 4 Q-26 -22 12 -48 Z" fill="#EF9F27"/>
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
          <LeafLogo size={52} />
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
            <div style={stepIcon}><i class="ti ti-eye" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
            <div>
              <div style={labelStyle}>lastleaf watches your tabs silently</div>
              <div style={subStyle}>Any tab open longer than your minimum time threshold gets captured. Everything stays on your device — nothing is sent to any server.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><i class="ti ti-leaf" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
            <div>
              <div style={labelStyle}>Closed tabs go to the graveyard</div>
              <div style={subStyle}>Tabs are automatically grouped by topic and session. Your browsing history becomes a personal knowledge map.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><i class="ti ti-layout-grid" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
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
            <div style={stepIcon}><i class="ti ti-folder" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
            <div>
              <div style={labelStyle}>Tabs</div>
              <div style={subStyle}>To know when tabs open and close, and how long they were open.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><i class="ti ti-device-floppy" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
            <div>
              <div style={labelStyle}>Storage</div>
              <div style={subStyle}>To save your tab history locally on your device. Nothing goes to any server.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><i class="ti ti-lock" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
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
            <div style={stepIcon}><i class="ti ti-clock" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
            <div>
              <div style={labelStyle}>Default capture threshold is 1 minute</div>
              <div style={subStyle}>Tabs closed before 1 minute won't be captured. You can change this in settings.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><i class="ti ti-ban" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
            <div>
              <div style={labelStyle}>Exclude sensitive sites</div>
              <div style={subStyle}>Add domains like bank.com or mail.google.com to your excluded list in settings — lastleaf will never capture those tabs.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><i class="ti ti-download" style={{fontSize:"16px",color:"#BA7517"}} aria-hidden="true"/></div>
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
