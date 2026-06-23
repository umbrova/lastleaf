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
        position: "absolute",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(65,36,2,0.18)",
        cursor: "pointer"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--ll-card-bg, #ffffff)",
          border: "0.5px solid rgba(136,135,128,0.3)",
          borderRadius: "12px",
          padding: "20px 24px",
          maxWidth: "280px",
          textAlign: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        <svg width="32" height="32" viewBox="0 0 680 680" style={{ margin: "0 auto 12px", display: "block" }}>
          <g transform="translate(340,340) rotate(30)">
            <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#BA7517" opacity="0.22"/>
            <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#854F0B"/>
            <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round"/>
            <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#854F0B" strokeWidth="12" strokeLinecap="round"/>
          </g>
        </svg>

        <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ll-text-primary, #2C2C2A)", marginBottom: "6px" }}>
          Your graveyard is ready
        </div>
        <div style={{ fontSize: "12px", color: "var(--ll-text-secondary, #5F5E5A)", lineHeight: 1.6, marginBottom: "16px" }}>
          Each card is a cluster of related tabs. Click any card to explore what's inside.
        </div>

        <button
          onClick={dismiss}
          style={{
            background: "#854F0B",
            color: "#FAC775",
            border: "none",
            borderRadius: "7px",
            padding: "8px 20px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
