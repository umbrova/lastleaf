import Dexie, { type Table } from "dexie"

export interface TabRecord {
  id?: number
  url: string
  title: string
  domain: string
  openedAt: number
  closedAt: number
  timeSpent: number        // ms
  topicCluster?: string
  keywords?: string[]
  rescued?: boolean
  buried?: boolean
  protected?: boolean
}

export interface OpenTabMeta {
  tabId: number
  url: string
  title: string
  domain: string
  openedAt: number
  lastActiveAt: number
  activeTime: number       // accumulated active ms
}

export interface ClusterSummary {
  id?: number
  label: string
  keywords: string[]
  tabCount: number
  totalTimeSpent: number
  dateRange: { from: number; to: number }
  compressedAt: number
}

export interface AppSettings {
  key: string
  value: unknown
}

class LastleafDB extends Dexie {
  tabs!: Table<TabRecord>
  openTabs!: Table<OpenTabMeta>
  summaries!: Table<ClusterSummary>
  settings!: Table<AppSettings>

  constructor() {
    super("lastleaf")
    this.version(1).stores({
      tabs:      "++id, domain, openedAt, closedAt, topicCluster, buried",
      openTabs:  "tabId, openedAt",
      summaries: "++id, compressedAt",
      settings:  "key"
    })
  }
}

export const db = new LastleafDB()

// ── Settings helpers ──────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  minTabTime:      60,      // seconds
  retentionDays:   90,
  excludedDomains: [] as string[]
}

export type Settings = typeof DEFAULT_SETTINGS

export async function getSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.local.get("lastleaf_settings", (result) => {
      const saved = result.lastleaf_settings ?? {}
      resolve({ ...DEFAULT_SETTINGS, ...saved } as Settings)
    })
  })
}

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  const current = await getSettings()
  const next = { ...current, [key]: value }
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastleaf_settings: next }, resolve)
  })
}

// ── Tab record helpers ────────────────────────────────────────────

export async function saveTabRecord(record: Omit<TabRecord, "id">): Promise<void> {
  await db.tabs.add(record)
}

export async function getRecentTabs(limitDays = 90): Promise<TabRecord[]> {
  const since = Date.now() - limitDays * 24 * 60 * 60 * 1000
  return db.tabs
    .where("closedAt")
    .above(since)
    .filter(t => !t.rescued && !t.buried)
    .sortBy("closedAt")
    .then(tabs => tabs.reverse())
}

export async function markRescued(id: number): Promise<void> {
  await db.tabs.update(id, { rescued: true })
}

export async function buryTab(id: number): Promise<void> {
  await db.tabs.update(id, { buried: true })
}

export async function deleteTab(id: number): Promise<void> {
  await db.tabs.delete(id)
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.tabs.clear(),
    db.openTabs.clear(),
    db.summaries.clear()
  ])
}

// ── Open tab tracking ─────────────────────────────────────────────

export async function trackTabOpen(meta: OpenTabMeta): Promise<void> {
  await db.openTabs.put(meta)
}

export async function updateTabActiveTime(
  tabId: number,
  additionalMs: number
): Promise<void> {
  const tab = await db.openTabs.get(tabId)
  if (tab) {
    await db.openTabs.update(tabId, {
      activeTime: tab.activeTime + additionalMs,
      lastActiveAt: Date.now()
    })
  }
}

export async function getOpenTab(tabId: number): Promise<OpenTabMeta | undefined> {
  return db.openTabs.get(tabId)
}

export async function removeOpenTab(tabId: number): Promise<void> {
  await db.openTabs.delete(tabId)
}

export async function getAllOpenTabs(): Promise<OpenTabMeta[]> {
  return db.openTabs.toArray()
}

// ── Storage usage estimate ────────────────────────────────────────

export async function getStorageStats(): Promise<{
  tabCount: number
  estimatedMB: number
}> {
  const tabCount = await db.tabs.count()
  // rough estimate: ~500 bytes per tab record — kept at full precision here;
  // use formatStorageSize() for display so tiny amounts don't round to 0
  const estimatedMB = (tabCount * 500) / 1024 / 1024
  return { tabCount, estimatedMB }
}

export function formatStorageSize(mb: number): string {
  const kb = mb * 1024
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  }
  return `${mb.toFixed(1)} MB`
}