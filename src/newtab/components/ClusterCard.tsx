import type { Cluster } from "~lib/clustering"

const VISIBLE_TAGS = 3

interface Props {
  cluster: Cluster
  selected: boolean
  style: React.CSSProperties
  onClick: (e: React.MouseEvent) => void
}

export function ClusterCard({ cluster, selected, style, onClick }: Props) {
  const { label, tabs, keywords, totalTime, color } = cluster
  const visibleTags = keywords.slice(0, VISIBLE_TAGS)
  const hasMore = keywords.length > VISIBLE_TAGS

  const hours = Math.floor(totalTime / 3600000)
  const mins = Math.floor((totalTime % 3600000) / 60000)
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : mins > 0 ? `${mins}m` : "<1m"

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        width: "162px",
        background: "#ffffff",
        border: selected
          ? `1.5px solid ${color.dot}`
          : "0.5px solid #E8E5DE",
        borderRadius: "10px",
        padding: "10px 12px",
        boxSizing: "border-box",
        cursor: "pointer",
        userSelect: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: selected
          ? `0 0 0 3px ${color.dot}18`
          : "0 1px 3px rgba(0,0,0,0.04)",
        ...style
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#BA7517"
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#E8E5DE"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color.dot, flexShrink: 0 }} />
          <span style={{ fontSize: "12px", fontWeight: 500, color: "#2C2C2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 500, color: color.dot, flexShrink: 0, marginLeft: "6px" }}>
          {tabs.length}
        </span>
      </div>

      <div style={{ fontSize: "10px", color: "#888780", marginBottom: "6px" }}>
        {timeStr} browsing
      </div>

      <div style={{ display: "flex", gap: "3px", alignItems: "center", flexWrap: "nowrap", overflow: "hidden" }}>
        {visibleTags.map(tag => (
          <span key={tag} style={{
            fontSize: "10px", padding: "2px 6px", borderRadius: "20px",
            whiteSpace: "nowrap", flexShrink: 0,
            background: color.bg, color: color.accent,
            border: `0.5px solid ${color.bc}`
          }}>
            {tag}
          </span>
        ))}
        {hasMore && (
          <span
            data-more="true"
            style={{
              fontSize: "10px", padding: "2px 6px", borderRadius: "20px",
              whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer",
              background: "#F9F8F5", color: "#888780",
              border: "0.5px solid #E0DDD6"
            }}
          >
            ···
          </span>
        )}
      </div>
    </div>
  )
}
