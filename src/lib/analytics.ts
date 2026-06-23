// Analytics — fires events to Vercel proxy → Upstash Redis
// All events are anonymous counters only, zero PII

const ANALYTICS_URL = process.env.PLASMO_PUBLIC_ANALYTICS_URL ?? ""

type EventName =
  | "install"
  | "tab_buried"
  | "tab_rescued"
  | "toast_dismissed"
  | "dau"

export async function trackEvent(event: EventName): Promise<void> {
  if (!ANALYTICS_URL) return

  try {
    await fetch(ANALYTICS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event })
    })
  } catch {
    // analytics failure is silent — never breaks the extension
  }
}
