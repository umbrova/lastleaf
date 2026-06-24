import { useEffect, useRef, useState } from "react"
import { getSettings, setSetting, clearAllData, getStorageStats, type Settings } from "~lib/storage"

const LeafLogo = () => (
  <svg width="26" height="26" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#BA7517" opacity="0.22" />
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#854F0B" />
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="12" strokeLinecap="round" />
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

const card: React.CSSProperties = {
  background: "#ffffff", borderRadius: "12px",
  border: "0.5px solid #E8E5DE", padding: "20px 24px", marginBottom: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
}

const row: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "12px 0", borderBottom: "0.5px solid #F0EDE6", gap: "16px"
}

const rowLast: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "12px 0", gap: "16px"
}

const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 500, color: "#2C2C2A" }
const subStyle: React.CSSProperties = { fontSize: "12px", color: "#888780", marginTop: "2px" }
const sectionLabel: React.CSSProperties = { fontSize: "11px", fontWeight: 600, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "4px" }

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div onClick={onToggle} style={{ width: "36px", height: "20px", borderRadius: "10px", background: on ? "#854F0B" : "#D3D1C7", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: on ? "#FAC775" : "#fff", position: "absolute", top: "3px", left: on ? "18px" : "3px", transition: "left 0.15s" }} />
  </div>
)

export default function Options() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [stats, setStats] = useState({ tabCount: 0, estimatedMB: 0 })
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [excludedInput, setExcludedInput] = useState("")
  const [saveMsg, setSaveMsg] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setExcludedInput(s.excludedDomains.join("\n"))
    })
    getStorageStats().then(setStats)
  }, [])

  async function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return
    const next = { ...settings, [key]: value }
    setSettings(next)
    await setSetting(key, value)
  }

  async function saveExcluded() {
    const domains = excludedInput
      .split(/[\n,]+/)
      .map(d => d.trim().toLowerCase())
      .filter(Boolean)
    const unique = [...new Set(domains)]
    await update("excludedDomains", unique)
    setExcludedInput(unique.join("\n"))
    setSaveMsg("Saved")
    setTimeout(() => setSaveMsg(""), 2000)
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const newDomains = text
        .split(/[\n,]+/)
        .map(d => d.trim().toLowerCase())
        .filter(Boolean)
      const existing = excludedInput
        .split(/[\n,]+/)
        .map(d => d.trim().toLowerCase())
        .filter(Boolean)
      const merged = [...new Set([...existing, ...newDomains])]
      setExcludedInput(merged.join("\n"))
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  async function handleClear() {
    await clearAllData()
    setCleared(true)
    setShowConfirm(false)
    setStats({ tabCount: 0, estimatedMB: 0 })
  }

  if (!settings) return (
    <div style={{ background: "#F9F8F5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ fontSize: "13px", color: "#888780" }}>Loading...</div>
    </div>
  )

  const usagePct = Math.min(100, Math.round((stats.estimatedMB / 50) * 100))

  return (
    <div style={{ background: "#F9F8F5", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <LeafLogo />
          <span style={{ fontSize: "18px", fontWeight: 400, color: "#2C2C2A", fontFamily: "Georgia, serif", fontStyle: "italic" }}>lastleaf</span>
          <span style={{ fontSize: "13px", color: "#B4B2A9", marginLeft: "2px" }}>/ settings</span>
        </div>

        {/* Capture */}
        <div style={card}>
          <div style={sectionLabel}>CAPTURE</div>

          <div style={row}>
            <div>
              <div style={labelStyle}>Minimum tab time</div>
              <div style={subStyle}>Only capture tabs open longer than this</div>
            </div>
            <select
              value={String(settings.minTabTime)}
              onChange={e => update("minTabTime", parseInt(e.target.value))}
              style={dd}
            >
              <option value="0">Off — capture everything</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="120">2 minutes</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </div>

          <div style={{ ...rowLast, flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
            <div>
              <div style={labelStyle}>Excluded domains</div>
              <div style={subStyle}>Never capture tabs from these sites — one domain per line</div>
            </div>
            <textarea
              value={excludedInput}
              onChange={e => setExcludedInput(e.target.value)}
              placeholder={"bank.com\nmail.google.com\ninternal.company.com"}
              rows={4}
              style={{ width: "100%", fontSize: "12px", padding: "8px 10px", borderRadius: "7px", border: "0.5px solid #E0DDD6", background: "#ffffff", color: "#2C2C2A", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={saveExcluded}
                style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "7px", border: "0.5px solid #854F0B", background: "#854F0B", color: "#FAC775", cursor: "pointer", fontFamily: "inherit" }}
              >
                Save
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "7px", border: "0.5px solid #E0DDD6", background: "#ffffff", color: "#2C2C2A", cursor: "pointer", fontFamily: "inherit" }}
              >
                Upload CSV
              </button>
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleCSVUpload} />
              {saveMsg && <span style={{ fontSize: "12px", color: "#1D9E75" }}>{saveMsg}</span>}
            </div>
          </div>
        </div>

        {/* Toast */}
        <div style={card}>
          <div style={sectionLabel}>TOAST</div>

          <div style={row}>
            <div>
              <div style={labelStyle}>Show rescue toast</div>
              <div style={subStyle}>Brief notification when a tab is buried</div>
            </div>
            <Toggle on={settings.toastEnabled} onToggle={() => update("toastEnabled", !settings.toastEnabled)} />
          </div>

          <div style={{ ...rowLast, opacity: settings.toastEnabled ? 1 : 0.4, pointerEvents: settings.toastEnabled ? "auto" : "none" }}>
            <div>
              <div style={labelStyle}>Toast duration</div>
              <div style={subStyle}>How long before it auto-dismisses</div>
            </div>
            <select
              value={String(settings.toastDuration)}
              onChange={e => update("toastDuration", parseInt(e.target.value))}
              style={dd}
            >
              <option value="1">1 second</option>
              <option value="2">2 seconds</option>
              <option value="3">3 seconds</option>
              <option value="5">5 seconds</option>
              <option value="8">8 seconds</option>
              <option value="10">10 seconds</option>
            </select>
          </div>
        </div>

        {/* Data */}
        <div style={card}>
          <div style={sectionLabel}>DATA</div>

          <div style={row}>
            <div>
              <div style={labelStyle}>Keep full records for</div>
              <div style={subStyle}>Older tabs are compressed to summaries</div>
            </div>
            <select
              value={settings.retentionDays === 0 ? "0" : String(settings.retentionDays)}
              onChange={e => update("retentionDays", parseInt(e.target.value))}
              style={dd}
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="0">Forever</option>
            </select>
          </div>

          <div style={row}>
            <div>
              <div style={labelStyle}>Storage used</div>
              <div style={subStyle}>{stats.tabCount} tabs · ~{stats.estimatedMB} MB</div>
            </div>
            <div style={{ width: "120px" }}>
              <div style={{ height: "4px", background: "#F0EDE6", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${usagePct}%`, height: "100%", background: "#854F0B", borderRadius: "2px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#888780", marginTop: "3px", textAlign: "right" }}>{stats.estimatedMB} MB / 50 MB</div>
            </div>
          </div>

          <div style={{ ...rowLast, position: "relative" }}>
            <div>
              <div style={{ ...labelStyle, color: cleared ? "#1D9E75" : "#993C1D" }}>
                {cleared ? "Data cleared" : "Clear all data"}
              </div>
              <div style={{ ...subStyle, color: cleared ? "#1D9E75" : "#D85A30" }}>
                {cleared ? "Your graveyard is empty." : "Permanently delete your entire graveyard"}
              </div>
            </div>
            {!cleared && (
              <button
                onClick={() => setShowConfirm(true)}
                style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "7px", border: "0.5px solid #D85A30", color: "#993C1D", background: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                Clear data
              </button>
            )}
            {showConfirm && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(44,44,42,0.6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", padding: "20px", boxSizing: "border-box" }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#ffffff", textAlign: "center", lineHeight: 1.6 }}>
                  Permanently delete all {stats.tabCount} buried tabs? This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setShowConfirm(false)} style={{ fontSize: "12px", padding: "7px 16px", borderRadius: "7px", background: "#ffffff", color: "#2C2C2A", border: "none", cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleClear} style={{ fontSize: "12px", padding: "7px 16px", borderRadius: "7px", background: "#993C1D", color: "#fff", border: "none", cursor: "pointer" }}>Yes, delete all</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div style={card}>
          <div style={sectionLabel}>ABOUT</div>
          <div style={row}>
            <div style={{ ...labelStyle, fontWeight: 400 }}>Version</div>
            <div style={subStyle}>1.0.0</div>
          </div>
          <div style={row}>
            <div style={{ ...labelStyle, fontWeight: 400 }}>Made by</div>
            <div style={subStyle}>Sylvora Labs</div>
          </div>
          <div style={rowLast}>
            <div style={{ ...labelStyle, fontWeight: 400 }}>Feedback</div>
            <a href="mailto:hello@sylvoralabs.com" style={{ fontSize: "12px", color: "#854F0B", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              ✉ hello@sylvoralabs.com
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
