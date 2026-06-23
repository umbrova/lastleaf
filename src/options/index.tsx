import { useEffect, useState } from "react"
import { getSettings, setSetting, clearAllData, getStorageStats, type Settings } from "~lib/storage"

const LeafLogo = () => (
  <svg width="28" height="28" viewBox="0 0 680 680">
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#BA7517" opacity="0.22" />
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#854F0B" />
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="12" strokeLinecap="round" />
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#854F0B" strokeWidth="14" strokeLinecap="round" />
    </g>
  </svg>
)

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div onClick={onToggle} style={{ width: "36px", height: "20px", borderRadius: "10px", background: on ? "#854F0B" : "#D3D1C7", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: on ? "#FAC775" : "#fff", position: "absolute", top: "3px", left: on ? "18px" : "3px", transition: "left 0.15s" }} />
  </div>
)

const row: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "0.5px solid #F0D9B5", gap: "16px" }
const rowLast: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: "16px" }
const label: React.CSSProperties = { fontSize: "13px", fontWeight: 500, color: "#412402" }
const sub: React.CSSProperties = { fontSize: "12px", color: "#BA7517", marginTop: "1px" }
const card: React.CSSProperties = { background: "#fff8f0", borderRadius: "12px", border: "0.5px solid #EFD4A0", padding: "20px 24px", marginBottom: "20px" }
const sectionLabel: React.CSSProperties = { fontSize: "11px", fontWeight: 500, color: "#BA7517", letterSpacing: "0.6px", marginBottom: "16px" }

export default function Options() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [stats, setStats] = useState({ tabCount: 0, estimatedMB: 0 })
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [excludedInput, setExcludedInput] = useState("")

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setExcludedInput(s.excludedDomains.join(", "))
    })
    getStorageStats().then(setStats)
  }, [])

  async function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return
    const next = { ...settings, [key]: value }
    setSettings(next)
    await setSetting(key, value)
  }

  async function handleClear() {
    await clearAllData()
    setCleared(true)
    setShowConfirm(false)
    setStats({ tabCount: 0, estimatedMB: 0 })
  }

  async function saveExcluded() {
    const domains = excludedInput.split(",").map(d => d.trim()).filter(Boolean)
    await update("excludedDomains", domains)
  }

  if (!settings) return (
    <div style={{ background: "#FAEEDA", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#BA7517", fontSize: "14px" }}>Loading...</div>
    </div>
  )

  const usagePct = Math.min(100, Math.round((stats.estimatedMB / 50) * 100))

  return (
    <div style={{ background: "#FAEEDA", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "32px 24px 48px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <LeafLogo />
          <span style={{ fontSize: "20px", fontWeight: 400, color: "#412402", fontFamily: "Georgia, serif", fontStyle: "italic" }}>lastleaf</span>
          <span style={{ fontSize: "13px", color: "#BA7517", marginLeft: "4px" }}>/ settings</span>
        </div>

        <div style={card}>
          <div style={sectionLabel}>CAPTURE</div>

          <div style={row}>
            <div>
              <div style={label}>Minimum tab time</div>
              <div style={sub}>Only capture tabs open longer than this</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <input type="range" min={0} max={10} value={settings.minTabTime / 60} step={1} style={{ width: "90px" }}
                onChange={e => update("minTabTime", Number(e.target.value) * 60)} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#854F0B", minWidth: "28px" }}>{settings.minTabTime / 60}m</span>
            </div>
          </div>

          <div style={rowLast}>
            <div>
              <div style={label}>Excluded domains</div>
              <div style={sub}>Never capture tabs from these sites</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <input value={excludedInput} onChange={e => setExcludedInput(e.target.value)}
                placeholder="bank.com, mail.com"
                style={{ width: "150px", fontSize: "12px", padding: "5px 8px", borderRadius: "6px", border: "0.5px solid #BA7517", background: "#FAEEDA", color: "#412402" }} />
              <button onClick={saveExcluded}
                style={{ fontSize: "12px", padding: "5px 10px", borderRadius: "6px", border: "0.5px solid #BA7517", background: "transparent", color: "#854F0B", cursor: "pointer" }}>
                Save
              </button>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={sectionLabel}>TOAST</div>

          <div style={row}>
            <div>
              <div style={label}>Show rescue toast</div>
              <div style={sub}>Appear briefly when a tab is buried</div>
            </div>
            <Toggle on={settings.toastEnabled} onToggle={() => update("toastEnabled", !settings.toastEnabled)} />
          </div>

          <div style={{ ...rowLast, opacity: settings.toastEnabled ? 1 : 0.4, pointerEvents: settings.toastEnabled ? "auto" : "none" }}>
            <div>
              <div style={label}>Toast duration</div>
              <div style={sub}>How long before it auto-dismisses</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <input type="range" min={1} max={10} value={settings.toastDuration} step={1} style={{ width: "90px" }}
                onChange={e => update("toastDuration", Number(e.target.value))} />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#854F0B", minWidth: "28px" }}>{settings.toastDuration}s</span>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={sectionLabel}>DATA</div>

          <div style={row}>
            <div>
              <div style={label}>Keep full records for</div>
              <div style={sub}>Older tabs are compressed to summaries</div>
            </div>
            <select value={settings.retentionDays === 0 ? "0" : String(settings.retentionDays)}
              onChange={e => update("retentionDays", Number(e.target.value))}
              style={{ fontSize: "12px", padding: "5px 8px", borderRadius: "6px", border: "0.5px solid #BA7517", background: "#FAEEDA", color: "#412402" }}>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="0">Forever</option>
            </select>
          </div>

          <div style={row}>
            <div>
              <div style={label}>Storage used</div>
              <div style={sub}>{stats.tabCount} tabs · ~{stats.estimatedMB} MB</div>
            </div>
            <div style={{ width: "120px" }}>
              <div style={{ height: "4px", background: "#EFD4A0", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${usagePct}%`, height: "100%", background: "#854F0B", borderRadius: "2px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#BA7517", marginTop: "3px", textAlign: "right" }}>{stats.estimatedMB} MB / 50 MB</div>
            </div>
          </div>

          <div style={{ ...rowLast, position: "relative" }}>
            <div>
              <div style={{ ...label, color: cleared ? "#1D9E75" : "#993C1D" }}>
                {cleared ? "Data cleared" : "Clear all data"}
              </div>
              <div style={{ ...sub, color: cleared ? "#1D9E75" : "#D85A30" }}>
                {cleared ? "Your graveyard is empty." : "Permanently delete your entire graveyard"}
              </div>
            </div>
            {!cleared && (
              <button onClick={() => setShowConfirm(true)}
                style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "7px", border: "0.5px solid #D85A30", color: "#993C1D", background: "none", cursor: "pointer" }}>
                Clear data
              </button>
            )}

            {showConfirm && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(65,36,2,0.5)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", padding: "20px", boxSizing: "border-box" }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#FAC775", textAlign: "center", lineHeight: 1.6 }}>
                  This will permanently delete all {stats.tabCount} buried tabs. Cannot be undone.
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setShowConfirm(false)}
                    style={{ fontSize: "12px", padding: "7px 16px", borderRadius: "7px", background: "#FAEEDA", color: "#412402", border: "none", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={handleClear}
                    style={{ fontSize: "12px", padding: "7px 16px", borderRadius: "7px", background: "#993C1D", color: "#fff", border: "none", cursor: "pointer" }}>
                    Yes, delete all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={card}>
          <div style={sectionLabel}>ABOUT</div>
          {[
            { k: "Version", v: "1.0.0" },
            { k: "Made by", v: "Sylvora Labs" },
          ].map(({ k, v }) => (
            <div key={k} style={row}>
              <div style={{ ...label, fontWeight: 400 }}>{k}</div>
              <div style={sub}>{v}</div>
            </div>
          ))}
          <div style={rowLast}>
            <div style={{ ...label, fontWeight: 400 }}>Feedback</div>
            <a href="mailto:hello@sylvoralabs.com"
              style={{ fontSize: "12px", color: "#854F0B", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
              ✉ hello@sylvoralabs.com
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
