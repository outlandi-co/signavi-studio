import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],

  // 🔥 CRITICAL FOR VERCEL
  base: "/",

  server: {
    port: 5173
  }
})