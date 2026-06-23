import { useEffect, useState } from "react"
import { getRecentTabs, getSettings } from "~lib/storage"
import { buildClusters, extractKeywords } from "~lib/clustering"
import { getCategoryForDomain } from "~lib/domains"
import type { Cluster } from "~lib/clustering"

export function useClusters() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTabs, setTotalTabs] = useState(0)
  const [totalTime, setTotalTime] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const settings = await getSettings()
      const tabs = await getRecentTabs(settings.retentionDays)

      // enrich tabs that may be missing keywords/cluster
      const enriched = tabs.map(tab => ({
        ...tab,
        keywords: tab.keywords?.length ? tab.keywords : extractKeywords(tab.title),
        topicCluster: tab.topicCluster ?? getCategoryForDomain(tab.domain)
      }))

      const built = buildClusters(enriched)
      setClusters(built)
      setTotalTabs(enriched.length)
      setTotalTime(enriched.reduce((s, t) => s + t.timeSpent, 0))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { clusters, loading, totalTabs, totalTime, reload: load }
}
