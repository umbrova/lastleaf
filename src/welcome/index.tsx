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

const s = {
  page: { background: "#FAEEDA", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" } as React.CSSProperties,
  inner: { maxWidth: "580px", margin: "0 auto", padding: "48px 24px 64px" } as React.CSSProperties,
  card: { background: "#fff8f0", borderRadius: "12px", border: "0.5px solid #EFD4A0", padding: "20px 24px", marginBottom: "24px" } as React.CSSProperties,
  sectionLabel: { fontSize: "11px", fontWeight: 500, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "14px" } as React.CSSProperties,
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "0.5px solid #F0D9B5", gap: "16px" } as React.CSSProperties,
  rowLast: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", gap: "16px" } as React.CSSProperties,
  label: { fontSize: "13px", fontWeight: 500, color: "#412402" } as React.CSSProperties,
  sub: { fontSize: "12px", color: "#BA7517", marginTop: "1px" } as React.CSSProperties,
  step: { display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 0", borderBottom: "0.5px solid #F0D9B5" } as React.CSSProperties,
  stepLast: { display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 0" } as React.CSSProperties,
  stepIcon: { width: "34px", height: "34px", borderRadius: "50%", background: "#FAEEDA", border: "0.5px solid #BA7517", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as React.CSSProperties,
}

export default function Welcome() {
  const [toastEnabled, setToastEnabled] = useState(DEFAULT_SETTINGS.toastEnabled)
  const [toastDuration, setToastDuration] = useState(DEFAULT_SETTINGS.toastDuration)
  const [minTabTime, setMinTabTime] = useState(DEFAULT_SETTINGS.minTabTime / 60)
  const [retention, setRetention] = useState("90")
  const [done, setDone] = useState(false)

  async function handleStart() {
    await setSetting("toastEnabled", toastEnabled)
    await setSetting("toastDuration", toastDuration)
    await setSetting("minTabTime", minTabTime * 60)
    await setSetting("retentionDays", retention === "0" ? 0 : parseInt(retention))
    setDone(true)
    window.close()
  }

  if (done) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#854F0B", fontFamily: "Georgia, serif", fontSize: "20px", fontStyle: "italic" }}>
        lastleaf is watching.
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.inner}>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "44px" }}>
          <LeafLogo />
          <div>
            <div style={{ fontSize: "28px", fontWeight: 400, color: "#412402", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1 }}>lastleaf</div>
            <div style={{ fontSize: "13px", color: "#BA7517", marginTop: "3px", letterSpacing: "0.5px" }}>Remember what you closed.</div>
          </div>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 500, color: "#412402", margin: "0 0 10px" }}>Your tabs now have a second life.</h1>
        <p style={{ fontSize: "15px", color: "#854F0B", margin: "0 0 36px", lineHeight: 1.7 }}>
          Every tab you close gets quietly captured. Come back to it anytime from your dashboard — grouped by topic, connected by session.
        </p>

        <div style={s.card}>
          <div style={s.sectionLabel}>HOW IT WORKS</div>
          <div style={s.step}>
            <div style={s.stepIcon}><span style={{ fontSize: "16px" }}>👁</span></div>
            <div>
              <div style={s.label}>lastleaf watches your tabs silently</div>
              <div style={s.sub}>Any tab open for more than 1 minute is tracked. Nothing leaves your device.</div>
            </div>
          </div>
          <div style={s.step}>
            <div style={s.stepIcon}><span style={{ fontSize: "16px" }}>🍂</span></div>
            <div>
              <div style={s.label}>Closed tabs go to the graveyard</div>
              <div style={s.sub}>A toast appears briefly. Rescue it or let it rest.</div>
            </div>
          </div>
          <div style={s.stepLast}>
            <div style={s.stepIcon}><span style={{ fontSize: "16px" }}>🗺</span></div>
            <div>
              <div style={s.label}>Open a new tab to explore</div>
              <div style={s.sub}>Your graveyard appears as a topic graph — clusters of related tabs, connected by session.</div>
            </div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.sectionLabel}>PERMISSIONS — WHY WE NEED THEM</div>
          {[
            { icon: "🗂", title: "Tabs", desc: "To know when tabs open and close, and how long they were open." },
            { icon: "💾", title: "Storage", desc: "To save your tab history locally. Nothing is sent to any server." },
            { icon: "🔄", title: "New tab override", desc: "So your graveyard appears when you open a new tab." }
          ].map((p, i, arr) => (
            <div key={p.title} style={i < arr.length - 1 ? s.step : s.stepLast}>
              <div style={s.stepIcon}><span style={{ fontSize: "15px" }}>{p.icon}</span></div>
              <div>
                <div style={s.label}>{p.title}</div>
                <div style={s.sub}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.sectionLabel}>QUICK SETTINGS</div>
          <div style={s.sub}>Sensible defaults — change anytime from settings.</div>
          <div style={{ height: "12px" }} />

          <div style={s.row}>
            <div><div style={s.label}>Rescue toast</div><div style={s.sub}>Show when a tab is buried</div></div>
            <div
              onClick={() => setToastEnabled(v => !v)}
              style={{ width: "36px", height: "20px", borderRadius: "10px", background: toastEnabled ? "#854F0B" : "#D3D1C7", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: toastEnabled ? "#FAC775" : "#fff", position: "absolute", top: "3px", left: toastEnabled ? "18px" : "3px", transition: "left 0.15s" }} />
            </div>
          </div>

          <div style={{ ...s.row, opacity: toastEnabled ? 1 : 0.4, pointerEvents: toastEnabled ? "auto" : "none" }}>
            <div><div style={s.label}>Toast duration</div><div style={s.sub}>Seconds before auto-dismiss</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="range" min={1} max={10} value={toastDuration} step={1} style={{ width: "90px" }} onChange={e => setToastDuration(Number(e.target.value))} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#854F0B", minWidth: "28px" }}>{toastDuration}s</span>
            </div>
          </div>

          <div style={s.row}>
            <div><div style={s.label}>Minimum tab time</div><div style={s.sub}>Only capture tabs open longer than</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="range" min={0} max={10} value={minTabTime} step={1} style={{ width: "90px" }} onChange={e => setMinTabTime(Number(e.target.value))} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#854F0B", minWidth: "28px" }}>{minTabTime}m</span>
            </div>
          </div>

          <div style={s.rowLast}>
            <div><div style={s.label}>Keep tabs for</div><div style={s.sub}>Auto-compress older records</div></div>
            <select value={retention} onChange={e => setRetention(e.target.value)}
              style={{ fontSize: "12px", padding: "5px 8px", borderRadius: "6px", border: "0.5px solid #BA7517", background: "#FAEEDA", color: "#412402" }}>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="0">Forever</option>
            </select>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button
            onClick={handleStart}
            style={{ background: "#854F0B", color: "#FAC775", border: "none", borderRadius: "8px", padding: "14px 32px", fontSize: "15px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            Start browsing — lastleaf is watching
          </button>
          <div style={{ fontSize: "12px", color: "#BA7517", marginTop: "12px" }}>Open a new tab anytime to see your graveyard.</div>
        </div>

      </div>
    </div>
  )
}
