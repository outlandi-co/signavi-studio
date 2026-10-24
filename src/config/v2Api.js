const origin = String(import.meta.env.VITE_API_ORIGIN || "")
  .trim()
  .replace(/\/+$/, "")

if (!origin) {
  throw new Error(
    "VITE_API_ORIGIN is required for this deployment."
  )
}

if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin)) {
  throw new Error("VITE_API_ORIGIN must be a valid HTTPS origin.")
}

export const SIGNAVI_V2_API_ORIGIN = origin
