import {
  trackTabOpen,
  updateTabActiveTime,
  getOpenTab,
  removeOpenTab,
  getAllOpenTabs,
  saveTabRecord,
  getSettings
} from "~lib/storage"
import { extractKeywords } from "~lib/clustering"
import { getCategoryForDomain, extractDomain } from "~lib/domains"
import { trackEvent } from "~lib/analytics"
import { runCompression } from "~lib/compression"

let activeTabId: number | null = null
let activeStartTime: number | null = null

function startTracking(tabId: number) {
  activeTabId = tabId
  activeStartTime = Date.now()
}

async function stopTracking() {
  if (activeTabId !== null && activeStartTime !== null) {
    const elapsed = Date.now() - activeStartTime
    if (elapsed > 0) {
      await updateTabActiveTime(activeTabId, elapsed)
    }
  }
  activeTabId = null
  activeStartTime = null
}

// ── Install ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await trackEvent("install")
    chrome.tabs.create({ url: chrome.runtime.getURL("src/welcome/index.html") })
  }
  chrome.alarms.create("compress", { periodInMinutes: 60 * 24 })
  chrome.alarms.create("dau", { periodInMinutes: 60 * 24 })
})

// ── Tab updated — primary tracking entry point ────────────────────
// onCreated fires before URL is known — onUpdated with status=complete is reliable

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return
  if (!tab.url) return
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url === "about:blank" || tab.url === "about:newtab") return

  const domain = extractDomain(tab.url)
  const settings = await getSettings()

  if (settings.excludedDomains.includes(domain)) return

  const existing = await getOpenTab(tabId)

  await trackTabOpen({
    tabId,
    url: tab.url,
    title: tab.title ?? "",
    domain,
    openedAt: existing?.openedAt ?? Date.now(),
    lastActiveAt: existing?.lastActiveAt ?? Date.now(),
    activeTime: existing?.activeTime ?? 0
  })
})

// ── Tab activated ─────────────────────────────────────────────────

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await stopTracking()
  startTracking(tabId)
})

// ── Window focus ──────────────────────────────────────────────────

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await stopTracking()
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, windowId })
    if (activeTab?.id) startTracking(activeTab.id)
  }
})

// ── Tab closed ────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {

  if (activeTabId === tabId) await stopTracking()

  const meta = await getOpenTab(tabId)
  if (!meta) {
    return
  }

  await removeOpenTab(tabId)

  const settings = await getSettings()
  const totalActiveMs = meta.activeTime
  const minMs = settings.minTabTime * 1000

  if (totalActiveMs < minMs) {
    return
  }

  if (!meta.url || meta.url.startsWith("chrome://")) return

  const keywords = extractKeywords(meta.title)
  const category = getCategoryForDomain(meta.domain)

  const record = {
    url: meta.url,
    title: meta.title || meta.url,
    domain: meta.domain,
    openedAt: meta.openedAt,
    closedAt: Date.now(),
    timeSpent: totalActiveMs,
    topicCluster: category,
    keywords,
    rescued: false,
    buried: false,
    protected: false
  }
  await saveTabRecord(record)
  await trackEvent("tab_buried")
  await updateBadgeCount()

  if (settings.toastEnabled) {
    // Try to send toast to all tabs with content script — broadest coverage
    const allTabs = await chrome.tabs.query({ currentWindow: true })
    const toastPayload = {
      type: "SHOW_TOAST",
      title: meta.title || meta.url,
      url: meta.url,
      tabId,
      duration: settings.toastDuration * 1000
    }

    let sent = false
    for (const t of allTabs) {
      if (!t.id) continue
      if (!t.url || t.url.startsWith("chrome://") || t.url.startsWith("chrome-extension://")) continue
      try {
        await chrome.tabs.sendMessage(t.id, toastPayload)
        sent = true
        break // send to first available tab that responds
      } catch {
        // content script not injected on this tab yet — try next
        continue
      }
    }

    if (!sent) {
    }
  }
})

// ── Badge count ───────────────────────────────────────────────────

async function updateBadgeCount() {
  const settings = await getSettings()
  if (settings.toastEnabled) {
    chrome.action.setBadgeText({ text: "" })
    return
  }
  const { db } = await import("~lib/storage")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const count = await db.tabs.where("closedAt").above(today.getTime()).count()
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" })
  chrome.action.setBadgeBackgroundColor({ color: "#854F0B" })
}

// ── Messages ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "RESCUE_TAB") {
    chrome.tabs.create({ url: message.url })
    trackEvent("tab_rescued")
    sendResponse({ ok: true })
  }
  if (message.type === "TOAST_DISMISSED") {
    trackEvent("toast_dismissed")
    sendResponse({ ok: true })
  }
  return true
})

// ── Suspend ───────────────────────────────────────────────────────

chrome.runtime.onSuspend.addListener(async () => {
  await stopTracking()
  await chrome.storage.local.set({ lastSuspendedAt: Date.now() })
})

// ── Startup — orphan recovery ─────────────────────────────────────

chrome.runtime.onStartup.addListener(async () => {
  const { lastSuspendedAt } = await chrome.storage.local.get("lastSuspendedAt")
  const orphans = await getAllOpenTabs()
  const settings = await getSettings()
  const minMs = settings.minTabTime * 1000

  for (const meta of orphans) {
    const closedAt = lastSuspendedAt ?? Date.now()
    const timeSpent = meta.activeTime + (closedAt - meta.lastActiveAt)

    if (timeSpent < minMs || !meta.url || meta.url.startsWith("chrome://")) {
      await removeOpenTab(meta.tabId)
      continue
    }

    const keywords = extractKeywords(meta.title)
    const category = getCategoryForDomain(meta.domain)

    await saveTabRecord({
      url: meta.url,
      title: meta.title || meta.url,
      domain: meta.domain,
      openedAt: meta.openedAt,
      closedAt,
      timeSpent,
      topicCluster: category,
      keywords,
      rescued: false,
      buried: false,
      protected: false
    })

    await removeOpenTab(meta.tabId)
  }

  await updateBadgeCount()
  await trackEvent("dau")
})

// ── Alarms ────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "compress") await runCompression()
  if (alarm.name === "dau") await trackEvent("dau")
})
