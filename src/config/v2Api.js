const apiUrl = String(import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "")

if (!apiUrl) {
  throw new Error("VITE_API_URL is required.")
}

let parsed

try {
  parsed = new URL(apiUrl)
} catch {
  throw new Error("VITE_API_URL must be a valid URL.")
}

const isHttps = parsed.protocol === "https:"

const isLocalDev =
  import.meta.env.DEV &&
  parsed.protocol === "http:" &&
  ["localhost", "127.0.0.1"].includes(parsed.hostname) &&
  parsed.port === "5050"

if (
  (!isHttps && !isLocalDev) ||
  parsed.username ||
  parsed.password ||
  parsed.search ||
  parsed.hash ||
  parsed.pathname.replace(/\/+$/, "") !== "/api"
) {
  throw new Error(
    "VITE_API_URL must be an HTTPS /api URL, except localhost:5050 during development."
  )
}

export const SIGNAVI_V2_API_ORIGIN = parsed.origin