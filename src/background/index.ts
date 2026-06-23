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

// ── Active tab tracking ───────────────────────────────────────────

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

// ── Install handler ───────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await trackEvent("install")
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/welcome.html") })
  }

  // set up daily compression alarm
  chrome.alarms.create("compress", { periodInMinutes: 60 * 24 })

  // set up daily DAU ping
  chrome.alarms.create("dau", { periodInMinutes: 60 * 24 })
})

// ── Extension icon click → open dashboard ────────────────────────

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "chrome://newtab" })
})

// ── Tab opened ───────────────────────────────────────────────────

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id || !tab.url || tab.url.startsWith("chrome://")) return

  const domain = extractDomain(tab.url)
  const settings = await getSettings()

  // check excluded domains
  if (settings.excludedDomains.includes(domain)) return

  await trackTabOpen({
    tabId: tab.id,
    url: tab.url,
    title: tab.title ?? "",
    domain,
    openedAt: Date.now(),
    lastActiveAt: Date.now(),
    activeTime: 0
  })
})

// ── Tab URL updated (SPA navigation) ─────────────────────────────

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return
  if (!tab.url || tab.url.startsWith("chrome://")) return

  const existing = await getOpenTab(tabId)
  if (!existing) return

  // update title and URL on navigation
  const domain = extractDomain(tab.url)
  const settings = await getSettings()

  if (settings.excludedDomains.includes(domain)) {
    await removeOpenTab(tabId)
    return
  }

  await trackTabOpen({
    tabId,
    url: tab.url,
    title: tab.title ?? existing.title,
    domain,
    openedAt: existing.openedAt,
    lastActiveAt: existing.lastActiveAt,
    activeTime: existing.activeTime
  })
})

// ── Tab activated (focus changed) ────────────────────────────────

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await stopTracking()
  startTracking(tabId)
})

// ── Window focus changed ──────────────────────────────────────────

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await stopTracking()
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, windowId })
    if (activeTab?.id) startTracking(activeTab.id)
  }
})

// ── Tab closed ───────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {
  // stop active tracking if this was the active tab
  if (activeTabId === tabId) await stopTracking()

  const meta = await getOpenTab(tabId)
  if (!meta) return

  await removeOpenTab(tabId)

  const settings = await getSettings()
  const totalActiveMs = meta.activeTime
  const minMs = settings.minTabTime * 1000

  // below threshold — don't capture
  if (totalActiveMs < minMs) return

  // skip internal pages
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

  // update badge count
  await updateBadgeCount()

  // notify content script to show toast
  if (settings.toastEnabled) {
    try {
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (currentTab?.id) {
        chrome.tabs.sendMessage(currentTab.id, {
          type: "SHOW_TOAST",
          title: meta.title || meta.url,
          tabId,
          duration: settings.toastDuration * 1000
        })
      }
    } catch {
      // content script may not be injected on some pages — silent fail
    }
  }
})

// ── Badge count ───────────────────────────────────────────────────

async function updateBadgeCount() {
  const settings = await getSettings()
  if (settings.toastEnabled) {
    // toast is on — no badge needed
    chrome.action.setBadgeText({ text: "" })
    return
  }

  // toast is off — show count of tabs buried today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { db } = await import("~lib/storage")
  const count = await db.tabs
    .where("closedAt")
    .above(today.getTime())
    .count()

  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" })
  chrome.action.setBadgeBackgroundColor({ color: "#854F0B" })
}

// ── Rescue handler (message from toast) ──────────────────────────

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

// ── Browser suspend — record last seen time ───────────────────────

chrome.runtime.onSuspend.addListener(async () => {
  await stopTracking()

  // record suspend time for orphan recovery on next launch
  await chrome.storage.local.set({ lastSuspendedAt: Date.now() })
})

// ── Orphan recovery on startup ────────────────────────────────────

chrome.runtime.onStartup.addListener(async () => {
  const { lastSuspendedAt } = await chrome.storage.local.get("lastSuspendedAt")
  const orphans = await getAllOpenTabs()

  const settings = await getSettings()
  const minMs = settings.minTabTime * 1000

  for (const meta of orphans) {
    const closedAt = lastSuspendedAt ?? Date.now()
    const timeSpent = meta.activeTime + (closedAt - meta.lastActiveAt)

    if (timeSpent < minMs) {
      await removeOpenTab(meta.tabId)
      continue
    }

    if (!meta.url || meta.url.startsWith("chrome://")) {
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
