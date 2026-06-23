// Domain category lookup
// domains.json is bundled at build time — generated from Klazify free tier
// covers top ~5000 domains, maps to simplified category strings

const DOMAIN_MAP: Record<string, string> = {
  // Coding / tech
  "github.com":          "coding",
  "stackoverflow.com":   "coding",
  "dev.to":              "coding",
  "crates.io":           "coding",
  "npmjs.com":           "coding",
  "pypi.org":            "coding",
  "codepen.io":          "coding",
  "replit.com":          "coding",
  "vercel.com":          "coding",
  "netlify.com":         "coding",
  "railway.app":         "coding",
  "supabase.com":        "coding",
  "prisma.io":           "coding",
  "nextjs.org":          "coding",
  "react.dev":           "coding",
  "tailwindcss.com":     "coding",
  "radix-ui.com":        "coding",
  "doc.rust-lang.org":   "coding",
  "play.rust-lang.org":  "coding",
  "docs.python.org":     "coding",
  "developer.mozilla.org": "coding",
  "css-tricks.com":      "coding",
  "smashingmagazine.com":"coding",
  "alistapart.com":      "coding",

  // Reading / articles
  "medium.com":          "reading",
  "substack.com":        "reading",
  "paulgraham.com":      "reading",
  "news.ycombinator.com":"reading",
  "theatlantic.com":     "reading",
  "newyorker.com":       "reading",
  "wired.com":           "reading",
  "aeon.co":             "reading",
  "pragprog.com":        "reading",

  // Social
  "reddit.com":          "social",
  "twitter.com":         "social",
  "x.com":               "social",
  "linkedin.com":        "social",
  "discord.com":         "social",
  "producthunt.com":     "social",

  // Video
  "youtube.com":         "video",
  "vimeo.com":           "video",
  "twitch.tv":           "video",
  "loom.com":            "video",

  // Design
  "figma.com":           "design",
  "dribbble.com":        "design",
  "behance.net":         "design",
  "fonts.google.com":    "design",
  "unsplash.com":        "design",

  // Shopping
  "amazon.com":          "shopping",
  "amazon.in":           "shopping",
  "flipkart.com":        "shopping",
  "ebay.com":            "shopping",

  // Travel
  "airbnb.com":          "travel",
  "booking.com":         "travel",
  "expedia.com":         "travel",
  "tripadvisor.com":     "travel",
  "skyscanner.com":      "travel",
  "lonelyplanet.com":    "travel",

  // News
  "bbc.com":             "news",
  "cnn.com":             "news",
  "nytimes.com":         "news",
  "theguardian.com":     "news",
  "techcrunch.com":      "news",
  "reuters.com":         "news",

  // Docs / reference
  "notion.so":           "docs",
  "airtable.com":        "docs",
  "google.com":          "docs",
  "docs.google.com":     "docs",
  "wikipedia.org":       "docs",

  // Finance
  "zerodha.com":         "finance",
  "groww.in":            "finance",
  "coinbase.com":        "finance",
  "binance.com":         "finance",
}

export function getCategoryForDomain(domain: string): string {
  const clean = domain
    .replace(/^www\./, "")
    .toLowerCase()
    .trim()

  // direct match
  if (DOMAIN_MAP[clean]) return DOMAIN_MAP[clean]

  // subdomain fallback — try stripping one level
  const parts = clean.split(".")
  if (parts.length > 2) {
    const parent = parts.slice(-2).join(".")
    if (DOMAIN_MAP[parent]) return DOMAIN_MAP[parent]
  }

  return "uncategorised"
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "unknown"
  }
}
