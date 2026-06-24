import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom/client"

interface ToastState {
  visible: boolean
  title: string
  url: string
  duration: number
}

const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 680 680" style={{ flexShrink: 0 }}>
    <g transform="translate(340,340) rotate(30)">
      <path d="M18 -78 Q58 -52 42 -4 Q18 12 -6 -4 Q-26 -36 18 -78 Z" fill="#BA7517" opacity="0.3"/>
      <path d="M6 -88 Q48 -62 32 -12 Q6 4 -20 -12 Q-40 -44 6 -88 Z" fill="#854F0B"/>
      <path d="M6 -80 Q4 -50 2 -16" fill="none" stroke="#FAC775" strokeWidth="10" strokeLinecap="round"/>
      <path d="M2 -14 Q0 2 -2 14" fill="none" stroke="#854F0B" strokeWidth="12" strokeLinecap="round"/>
    </g>
  </svg>
)

function Toast() {
  const [toast, setToast] = useState<ToastState>({ visible: false, title: "", url: "", duration: 3000 })
  const [progress, setProgress] = useState(100)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = () => {
    setToast(t => ({ ...t, visible: false }))
    clearInterval(timerRef.current!)
    clearTimeout(autoHideRef.current!)
    chrome.runtime.sendMessage({ type: "TOAST_DISMISSED" })
  }

  const rescue = () => {
    chrome.runtime.sendMessage({ type: "RESCUE_TAB", url: toast.url })
    setToast(t => ({ ...t, visible: false }))
    clearInterval(timerRef.current!)
    clearTimeout(autoHideRef.current!)
  }

  useEffect(() => {
    const handler = (message: any) => {
      if (message.type !== "SHOW_TOAST") return
      clearInterval(timerRef.current!)
      clearTimeout(autoHideRef.current!)
      setProgress(100)
      setToast({ visible: true, title: message.title, url: message.url ?? "", duration: message.duration ?? 3000 })
      const start = Date.now()
      const dur = message.duration ?? 3000
      timerRef.current = setInterval(() => {
        setProgress(Math.max(0, 100 - ((Date.now() - start) / dur) * 100))
      }, 16)
      autoHideRef.current = setTimeout(() => {
        clearInterval(timerRef.current!)
        setToast(t => ({ ...t, visible: false }))
      }, dur)
    }
    chrome.runtime.onMessage.addListener(handler)
    return () => chrome.runtime.onMessage.removeListener(handler)
  }, [])

  if (!toast.visible) return null

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 2147483647, width: "300px", background: "#ffffff", border: "0.5px solid #D3D1C7", borderRadius: "12px", padding: "12px 14px", boxSizing: "border-box", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
        <LeafIcon />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "11px", color: "#888780", marginBottom: "2px" }}>Buried to lastleaf</div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#2C2C2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toast.title}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={rescue} style={{ background: "#854F0B", color: "#FAC775", border: "none", borderRadius: "7px", padding: "5px 12px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>↩ Rescue</button>
        <button onClick={dismiss} style={{ background: "none", border: "none", color: "#888780", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", padding: "5px 8px" }}>Dismiss</button>
      </div>
      <div style={{ marginTop: "10px", height: "2px", borderRadius: "1px", background: "#F1EFE8", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#BA7517", borderRadius: "1px", width: `${progress}%`, transition: "width 0.016s linear" }} />
      </div>
    </div>
  )
}

// Respond to ping from background so it knows content script is active
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PING") return true
})

// Only mount once — guard against double injection
if (!document.getElementById("lastleaf-toast-root")) {
  const host = document.createElement("div")
  host.id = "lastleaf-toast-root"
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: "open" })
  const mountPoint = document.createElement("div")
  shadow.appendChild(mountPoint)
  ReactDOM.createRoot(mountPoint).render(<Toast />)
}
