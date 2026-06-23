import { useState } from "react"
import type { TabRecord } from "~lib/storage"
import { formatTime, formatClosedAt } from "~lib/clustering"
import { markRescued, buryTab } from "~lib/storage"

interface Props {
  tab: TabRecord
  defaultOpen?: boolean
  onAction?: () => void
}

export function TabRow({ tab, defaultOpen = false, onAction }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [actioned, setActioned] = useState<"rescued" | "buried" | null>(null)

  async function handleReopen() {
    if (!tab.id) return
    await markRescued(tab.id)
    chrome.runtime.sendMessage({ type: "RESCUE_TAB", url: tab.url })
    setActioned("rescued")
    onAction?.()
  }

  async function handleBury() {
    if (!tab.id) return
    await buryTab(tab.id)
    setActioned("buried")
    onAction?.()
  }

  if (actioned) {
    return (
      <div style={{
        padding: "7px 0", borderBottom: "0.5px solid var(--ll-border, rgba(136,135,128,0.2))",
        fontSize: "11px", color: actioned === "rescued" ? "#1D9E75" : "var(--ll-text-tertiary, #888780)",
        display: "flex", alignItems: "center", gap: "6px"
      }}>
        <span>{actioned === "rescued" ? "↩ Reopened" : "Buried"}</span>
      </div>
    )
  }

  return (
    <div style={{ borderBottom: "0.5px solid var(--ll-border, rgba(136,135,128,0.2))" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "7px 0", gap: "6px", cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ll-text-tertiary, #888780)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <span style={{
            fontSize: "12px",
            color: "var(--ll-text-secondary, #5F5E5A)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {tab.title || tab.url}
          </span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="var(--ll-text-tertiary, #888780)" strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div style={{ paddingBottom: "8px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ll-text-tertiary, #888780)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span style={{ fontSize: "11px", color: "var(--ll-text-tertiary, #888780)" }}>{tab.domain}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ll-text-tertiary, #888780)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: "11px", color: "var(--ll-text-tertiary, #888780)" }}>{formatTime(tab.timeSpent)} spent</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ll-text-tertiary, #888780)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontSize: "11px", color: "var(--ll-text-tertiary, #888780)" }}>{formatClosedAt(tab.closedAt)}</span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={e => { e.stopPropagation(); handleReopen() }}
              style={{
                fontSize: "11px", background: "none", border: "none", padding: 0,
                cursor: "pointer", color: "var(--ll-text-tertiary, #888780)",
                textDecoration: "underline", textUnderlineOffset: "2px", fontFamily: "inherit"
              }}
            >
              Reopen
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleBury() }}
              style={{
                fontSize: "11px", background: "none", border: "none", padding: 0,
                cursor: "pointer", color: "#A32D2D",
                textDecoration: "underline", textUnderlineOffset: "2px", fontFamily: "inherit"
              }}
            >
              Bury
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
