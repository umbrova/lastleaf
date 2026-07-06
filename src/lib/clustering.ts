import type { TabRecord } from "./storage"
import { getCategoryForDomain } from "./domains"

export interface Cluster {
  id: string
  label: string
  category: string
  tabs: TabRecord[]
  keywords: string[]
  totalTime: number
  color: ColorScheme
}

export interface ColorScheme {
  dot: string
  accent: string
  bg: string
  bc: string
}

const CATEGORY_COLORS: Record<string, ColorScheme> = {
  coding:        { dot: "#BA7517", accent: "#854F0B", bg: "#FAEEDA", bc: "#BA7517" },
  reading:       { dot: "#D85A30", accent: "#993C1D", bg: "#FAECE7", bc: "#D85A30" },
  social:        { dot: "#D4537E", accent: "#993556", bg: "#FBEAF0", bc: "#D4537E" },
  video:         { dot: "#7F77DD", accent: "#534AB7", bg: "#EEEDFE", bc: "#7F77DD" },
  design:        { dot: "#1D9E75", accent: "#0F6E56", bg: "#E1F5EE", bc: "#1D9E75" },
  travel:        { dot: "#1D9E75", accent: "#0F6E56", bg: "#E1F5EE", bc: "#1D9E75" },
  news:          { dot: "#D85A30", accent: "#993C1D", bg: "#FAECE7", bc: "#D85A30" },
  shopping:      { dot: "#378ADD", accent: "#185FA5", bg: "#E6F1FB", bc: "#378ADD" },
  finance:       { dot: "#639922", accent: "#3B6D11", bg: "#EAF3DE", bc: "#639922" },
  docs:          { dot: "#5DCAA5", accent: "#0F6E56", bg: "#E1F5EE", bc: "#5DCAA5" },
  uncategorised: { dot: "#B4B2A9", accent: "#5F5E5A", bg: "#F1EFE8", bc: "#B4B2A9" },
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for",
  "of","with","by","from","is","are","was","were","be","been",
  "have","has","had","do","does","did","will","would","could",
  "should","may","might","this","that","these","those","it",
  "its","my","your","his","her","our","their","what","how",
  "when","where","who","which","why","about","up","out","if",
  "then","than","so","as","into","through","during","before",
  "after","above","below","between","each","more","most","other",
  "some","such","no","not","only","same","also","just","page",
  "home","site","web","new","tab","chapter","ch","part","www"
])

export function extractKeywords(title: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s\-\.]/g, " ")
    .split(/[\s\-\.]+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))

  // deduplicate and take top 5
  return [...new Set(words)].slice(0, 5)
}

function scoreTabForCluster(
  tab: TabRecord,
  clusterKeywords: string[],
  clusterCategory: string
): number {
  let score = 0

  // category match (weight 2)
  if (tab.topicCluster === clusterCategory) score += 2

  // keyword overlap (weight 3 each)
  const tabKw = new Set(tab.keywords ?? [])
  for (const kw of clusterKeywords) {
    if (tabKw.has(kw)) score += 3
  }

  return score
}

export function buildClusters(tabs: TabRecord[]): Cluster[] {
  if (!tabs.length) return []

  // group by domain category first — everything not in the built-in
  // domain map lands in one shared "uncategorised" bucket
  const categoryGroups = new Map<string, TabRecord[]>()

  for (const tab of tabs) {
    const category = tab.topicCluster ?? getCategoryForDomain(tab.domain)
    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, [])
    }
    categoryGroups.get(category)!.push(tab)
  }

  const clusters: Cluster[] = []

  for (const [category, groupTabs] of categoryGroups) {

    // collect all keywords from this group
    const kwFreq = new Map<string, number>()
    for (const tab of groupTabs) {
      for (const kw of tab.keywords ?? []) {
        kwFreq.set(kw, (kwFreq.get(kw) ?? 0) + 1)
      }
    }

    // top keywords by frequency
    const topKeywords = [...kwFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([kw]) => kw)

    // build cluster label from top 2 keywords + category —
    // except uncategorised, which always gets a plain generic label since
    // its tabs can be totally unrelated sites with no shared topic
    const labelParts = topKeywords.slice(0, 2)
    const label = category === "uncategorised"
      ? "Miscellaneous"
      : labelParts.length > 0
        ? labelParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" / ")
        : category.charAt(0).toUpperCase() + category.slice(1)

    const totalTime = groupTabs.reduce((sum, t) => sum + t.timeSpent, 0)
    const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.uncategorised

    clusters.push({
      id: category,
      label,
      category,
      tabs: groupTabs.sort((a, b) => b.closedAt - a.closedAt),
      keywords: topKeywords,
      totalTime,
      color
    })
  }

  // Merge clusters with same id (can happen when category + keyword overlap)
  const merged = new Map<string, Cluster>()
  for (const cluster of clusters) {
    const key = cluster.id
    if (merged.has(key)) {
      const existing = merged.get(key)!
      existing.tabs = [...existing.tabs, ...cluster.tabs]
      existing.totalTime += cluster.totalTime
      // merge keywords, deduplicate
      const kwSet = new Set([...existing.keywords, ...cluster.keywords])
      existing.keywords = [...kwSet].slice(0, 8)
    } else {
      merged.set(key, { ...cluster })
    }
  }

  return [...merged.values()].sort((a, b) => b.tabs.length - a.tabs.length)
}

export function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000)
  const hours = Math.floor(totalSecs / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m`
  return "<1m"
}

export function formatClosedAt(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const day = 24 * 60 * 60 * 1000

  const date = new Date(timestamp)
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (diff < day) return `Today, ${timeStr}`
  if (diff < 2 * day) return `Yesterday, ${timeStr}`

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  return `${days[date.getDay()]}, ${timeStr}`
}