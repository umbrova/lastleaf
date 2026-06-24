import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        welcome: "src/welcome/index.html",
        newtab: "src/newtab/index.html",
        popup: "src/popup/index.html",
      }
    }
  },
  resolve: {
    alias: {
      "~lib": path.resolve(__dirname, "src/lib"),
    }
  }
})
