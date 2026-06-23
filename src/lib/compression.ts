import { db, getSettings } from "./storage"
import { buildClusters, extractKeywords } from "./clustering"
import { getCategoryForDomain } from "./domains"

export async function runCompression(): Promise<void> {
  const settings = await getSettings()
  if (settings.retentionDays === 0) return // "Forever" — never compress

  const cutoff = Date.now() - settings.retentionDays * 24 * 60 * 60 * 1000

  // find tabs older than retention window
  const oldTabs = await db.tabs
    .where("closedAt")
    .below(cutoff)
    .toArray()

  if (!oldTabs.length) return

  // enrich with topic data before compressing
  const enriched = oldTabs.map(tab => ({
    ...tab,
    keywords: tab.keywords ?? extractKeywords(tab.title),
    topicCluster: tab.topicCluster ?? getCategoryForDomain(tab.domain)
  }))

  // build clusters from old tabs
  const clusters = buildClusters(enriched)

  // save summaries
  for (const cluster of clusters) {
    const timestamps = cluster.tabs.map(t => t.closedAt)
    await db.summaries.add({
      label: cluster.label,
      keywords: cluster.keywords,
      tabCount: cluster.tabs.length,
      totalTimeSpent: cluster.totalTime,
      dateRange: {
        from: Math.min(...timestamps),
        to: Math.max(...timestamps)
      },
      compressedAt: Date.now()
    })
  }

  // delete the original tab records
  const idsToDelete = oldTabs.map(t => t.id!).filter(Boolean)
  await db.tabs.bulkDelete(idsToDelete)
}
