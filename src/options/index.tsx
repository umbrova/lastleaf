import { useEffect, useRef, useState } from "react"
import { getSettings, setSetting, clearAllData, getStorageStats, formatStorageSize, type Settings } from "~lib/storage"

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
          <LeafLogo size={40} />
          <span style={{ fontSize: "22px", fontWeight: 400, color: "#2C2C2A", fontFamily: "Georgia, serif", fontStyle: "italic" }}>lastleaf</span>
          <span style={{ fontSize: "13px", color: "#B4B2A9", marginLeft: "2px" }}>/ settings</span>
        </div>

        {/* Quick nav */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("src/newtab/index.html") })}
            style={{ fontSize: "13px", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#854F0B", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}
          >
            Open Dashboard
          </button>
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

        {/* Data */}
        <div style={card}>
          <div style={sectionLabel}>DATA</div>

          <div style={row}>
            <div>
              <div style={labelStyle}>Keep full records for</div>
              <div style={subStyle}>Older tabs are permanently deleted after this period</div>
              <div style={{ ...subStyle, marginTop: "2px" }}>You can export everything to CSV from the dashboard header before it expires</div>
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
              <div style={subStyle}>{stats.tabCount} tabs · ~{formatStorageSize(stats.estimatedMB)}</div>
            </div>
            <div style={{ width: "120px" }}>
              <div style={{ height: "4px", background: "#F0EDE6", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${usagePct}%`, height: "100%", background: "#854F0B", borderRadius: "2px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#888780", marginTop: "3px", textAlign: "right" }}>{formatStorageSize(stats.estimatedMB)} / 50 MB</div>
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
            <div style={subStyle}>{chrome.runtime.getManifest().version}</div>
          </div>
          <div style={row}>
            <div style={{ ...labelStyle, fontWeight: 400 }}>Made by</div>
            <div style={subStyle}>Umbrova</div>
          </div>
          <div style={row}>
            <div style={{ ...labelStyle, fontWeight: 400 }}>Feedback</div>
            <a href="mailto:hello@umbrova.com" style={{ fontSize: "12px", color: "#854F0B", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              ✉ hello@umbrova.com
            </a>
          </div>
          <div style={rowLast}>
            <div style={{ ...labelStyle, fontWeight: 400 }}>Onboarding guide</div>
            <button
              onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("src/welcome/index.html") })}
              style={{ fontSize: "12px", color: "#854F0B", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: "2px", padding: 0 }}
            >
              View guide →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
