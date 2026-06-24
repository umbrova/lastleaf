import { useState } from "react"
import { setSetting, DEFAULT_SETTINGS } from "~lib/storage"

const LeafLogo = () => (
  <svg width="44" height="44" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#BA7517" opacity="0.22" />
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#854F0B" />
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round" />
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#854F0B" strokeWidth="14" strokeLinecap="round" />
    </g>
  </svg>
)

const dd: React.CSSProperties = {
  fontSize: "13px", padding: "6px 10px", borderRadius: "7px",
  border: "0.5px solid #E0DDD6", background: "#ffffff",
  color: "#2C2C2A", cursor: "pointer", flexShrink: 0,
  outline: "none", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888780' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
  paddingRight: "28px"
}

const row: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "13px 0", borderBottom: "0.5px solid #F0EDE6", gap: "16px"
}

const rowLast: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "13px 0", gap: "16px"
}

const label: React.CSSProperties = { fontSize: "13px", fontWeight: 500, color: "#2C2C2A" }
const sub: React.CSSProperties = { fontSize: "12px", color: "#888780", marginTop: "2px" }

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

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div onClick={onToggle} style={{ width: "36px", height: "20px", borderRadius: "10px", background: on ? "#854F0B" : "#D3D1C7", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: on ? "#FAC775" : "#fff", position: "absolute", top: "3px", left: on ? "18px" : "3px", transition: "left 0.15s" }} />
  </div>
)

export default function Welcome() {
  const [toastEnabled, setToastEnabled] = useState(DEFAULT_SETTINGS.toastEnabled)
  const [toastDuration, setToastDuration] = useState("3")
  const [minTabTime, setMinTabTime] = useState("60")
  const [retention, setRetention] = useState("90")
  const [done, setDone] = useState(false)

  async function handleStart() {
    await setSetting("toastEnabled", toastEnabled)
    await setSetting("toastDuration", parseInt(toastDuration))
    await setSetting("minTabTime", parseInt(minTabTime))
    await setSetting("retentionDays", parseInt(retention) || 0)
    setDone(true)
    window.close()
  }

  if (done) return (
    <div style={{ background: "#F9F8F5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#854F0B", fontFamily: "Georgia, serif", fontSize: "20px", fontStyle: "italic" }}>
        lastleaf is watching.
      </div>
    </div>
  )

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
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "4px" }}>HOW IT WORKS</div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "15px" }}>👁</span></div>
            <div>
              <div style={label}>lastleaf watches your tabs silently</div>
              <div style={sub}>Any tab open longer than your threshold is tracked. Nothing leaves your device.</div>
            </div>
          </div>
          <div style={step}>
            <div style={stepIcon}><span style={{ fontSize: "15px" }}>🍂</span></div>
            <div>
              <div style={label}>Closed tabs go to the graveyard</div>
              <div style={sub}>A brief toast appears. Rescue it or let it rest.</div>
            </div>
          </div>
          <div style={stepLast}>
            <div style={stepIcon}><span style={{ fontSize: "15px" }}>🗺</span></div>
            <div>
              <div style={label}>Open the dashboard to explore</div>
              <div style={sub}>Clusters of related tabs connected by session — click the lastleaf icon anytime.</div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div style={card}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "4px" }}>PERMISSIONS — WHY WE NEED THEM</div>
          {[
            { icon: "🗂", title: "Tabs", desc: "To know when tabs open and close, and how long they were open." },
            { icon: "💾", title: "Storage", desc: "To save your tab history locally on your device. Nothing goes to any server." },
          ].map((p, i, arr) => (
            <div key={p.title} style={i < arr.length - 1 ? step : stepLast}>
              <div style={stepIcon}><span style={{ fontSize: "14px" }}>{p.icon}</span></div>
              <div><div style={label}>{p.title}</div><div style={sub}>{p.desc}</div></div>
            </div>
          ))}
        </div>

        {/* Quick settings */}
        <div style={card}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "2px" }}>QUICK SETTINGS</div>
          <div style={{ fontSize: "12px", color: "#888780", marginBottom: "14px" }}>Sensible defaults set — change anytime from settings.</div>

          <div style={row}>
            <div><div style={label}>Rescue toast</div><div style={sub}>Show a notification when a tab is buried</div></div>
            <Toggle on={toastEnabled} onToggle={() => setToastEnabled(v => !v)} />
          </div>

          <div style={{ ...row, opacity: toastEnabled ? 1 : 0.4, pointerEvents: toastEnabled ? "auto" : "none" }}>
            <div><div style={label}>Toast duration</div><div style={sub}>How long before it auto-dismisses</div></div>
            <select value={toastDuration} onChange={e => setToastDuration(e.target.value)} style={dd}>
              <option value="1">1 second</option>
              <option value="2">2 seconds</option>
              <option value="3">3 seconds</option>
              <option value="5">5 seconds</option>
              <option value="8">8 seconds</option>
              <option value="10">10 seconds</option>
            </select>
          </div>

          <div style={row}>
            <div><div style={label}>Minimum tab time</div><div style={sub}>Only capture tabs open longer than</div></div>
            <select value={minTabTime} onChange={e => setMinTabTime(e.target.value)} style={dd}>
              <option value="0">Off — capture everything</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="120">2 minutes</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </div>

          <div style={rowLast}>
            <div><div style={label}>Keep tabs for</div><div style={sub}>Older records are compressed to summaries</div></div>
            <select value={retention} onChange={e => setRetention(e.target.value)} style={dd}>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="0">Forever</option>
            </select>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={handleStart} style={{ background: "#854F0B", color: "#FAC775", border: "none", borderRadius: "8px", padding: "13px 32px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px" }}>
            Start browsing — lastleaf is watching
          </button>
          <div style={{ fontSize: "12px", color: "#888780", marginTop: "10px" }}>Click the lastleaf icon in your toolbar to open the dashboard.</div>
        </div>

      </div>
    </div>
  )
}
