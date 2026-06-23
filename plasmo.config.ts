import type { PlasmoManifest } from "plasmo"

const manifest: PlasmoManifest = {
  name: "lastleaf",
  description: "Remember what you closed.",
  version: "1.0.0",
  permissions: [
    "tabs",
    "storage",
    "alarms",
    "scripting"
  ],
  host_permissions: ["<all_urls>"],
  chrome_url_overrides: {
    newtab: "tabs/newtab.html"
  },
  action: {
    default_icon: {
      "16": "assets/icon-16.png",
      "32": "assets/icon-32.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  icons: {
    "16": "assets/icon-16.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}

export default manifest
