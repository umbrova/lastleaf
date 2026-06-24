import { useEffect, useState } from "react"

const STORAGE_KEY = "lastleaf_hint_seen"

export function OnboardingHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (!result[STORAGE_KEY]) setVisible(true)
    })
  }, [])

  function dismiss() {
    setVisible(false)
    chrome.storage.local.set({ [STORAGE_KEY]: true })
  }

  if (!visible) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(253,252,251,0.85)",
        backdropFilter: "blur(2px)",
        cursor: "pointer"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff",
          border: "0.5px solid #E8E5DE",
          borderRadius: "14px",
          padding: "24px 28px",
          maxWidth: "280px",
          textAlign: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }}
      >
        <svg width="32" height="32" viewBox="0 0 680 680" style={{ margin: "0 auto 12px", display: "block" }}>
          <g transform="translate(340,340) rotate(30)">
            <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#EF9F27" opacity="0.3"/>
            <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#BA7517"/>
            <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round"/>
            <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#BA7517" strokeWidth="12" strokeLinecap="round"/>
          </g>
        </svg>

        <div style={{ fontSize: "14px", fontWeight: 600, color: "#2C2C2A", marginBottom: "6px" }}>
          Your graveyard is ready
        </div>
        <div style={{ fontSize: "12px", color: "#888780", lineHeight: 1.7, marginBottom: "18px" }}>
          Each card is a cluster of related tabs. Click any card to explore what's inside.
        </div>

        <button
          onClick={dismiss}
          style={{
            background: "#854F0B", color: "#FAC775",
            border: "none", borderRadius: "8px",
            padding: "8px 24px", fontSize: "12px",
            fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
