import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({ cacheDir: ".vite-signavi-dev",
  plugins: [react()],

  // CRITICAL FOR VERCEL
  base: "/",

  server: {
    port: 5173
  }
})
