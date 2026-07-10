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
import { runCompression } from "~lib/compression"

// Active-tab tracking state lives in chrome.storage.session, NOT plain
// module variables — MV3 service workers can be terminated by Chrome after
// ~30s of inactivity and restart fresh on the next event, which would wipe
// ordinary in-memory variables. storage.session persists across those
// restarts (but is cleared when the browser itself closes, which is fine —
// the onStartup orphan-recovery logic below handles that case separately).

async function getActiveState(): Promise<{ activeTabId: number | null; activeStartTime: number | null }> {
  const result = await chrome.storage.session.get(["activeTabId", "activeStartTime"])
  return {
    activeTabId: result.activeTabId ?? null,
    activeStartTime: result.activeStartTime ?? null
  }
}

async function startTracking(tabId: number) {
  await chrome.storage.session.set({ activeTabId: tabId, activeStartTime: Date.now() })
}

async function stopTracking() {
  const { activeTabId, activeStartTime } = await getActiveState()
  if (activeTabId !== null && activeStartTime !== null) {
    const elapsed = Date.now() - activeStartTime
    if (elapsed > 0) {
      await updateTabActiveTime(activeTabId, elapsed)
    }
  }
  await chrome.storage.session.set({ activeTabId: null, activeStartTime: null })
}

// ── Install ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/welcome/index.html") })
  }
  chrome.alarms.create("compress", { periodInMinutes: 60 * 24 })
})

// ── Tab updated — primary tracking entry point ────────────────────
// onCreated fires before URL is known — onUpdated with status=complete is reliable

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return
  if (!tab.url) return
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url === "about:blank" || tab.url === "about:newtab") return

  const domain = extractDomain(tab.url)
  const settings = await getSettings()

  const isExcluded = settings.excludedDomains.some(entry => {
    const e = entry.replace(/^www\./, "")
    if (e.startsWith("*.")) {
      const base = e.slice(2)
      return domain === base || domain.endsWith("." + base)
    }
    return domain === e
  })
  if (isExcluded) return

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
  await startTracking(tabId)
})

// ── Window focus ──────────────────────────────────────────────────

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await stopTracking()
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, windowId })
    if (activeTab?.id) await startTracking(activeTab.id)
  }
})

// ── Tab closed ────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {

  const { activeTabId } = await getActiveState()
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
  await updateBadgeCount()


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
})

// ── Alarms ────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "compress") await runCompression()
})