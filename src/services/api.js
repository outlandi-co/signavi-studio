import axios from "axios"

/* =========================================================
   🌐 BASE URL
========================================================= */
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const api = axios.create({
  baseURL: BASE_URL.replace(/\/$/, "")
})

console.log("🌐 API BASE:", api.defaults.baseURL)

/* =========================================================
   🔥 GLOBAL LOADING HANDLERS
========================================================= */
let startLoading = null
let stopLoading = null

export const setLoadingHandlers = (start, stop) => {
  startLoading = start
  stopLoading = stop
}

/* =========================================================
   🔥 REQUEST INTERCEPTOR
========================================================= */
api.interceptors.request.use((config) => {

  /* 🔥 START LOADING */
  if (startLoading) startLoading()

  const adminToken =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken")

  const customerToken =
    localStorage.getItem("customerToken") ||
    sessionStorage.getItem("customerToken")

  const token = adminToken || customerToken

  config.headers = {
    ...(config.headers || {})
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  /* ✅ FIX FORM DATA */
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }

  console.log("🔥 REQUEST:", config.baseURL + config.url)

  return config
})

/* =========================================================
   🔁 RESPONSE INTERCEPTOR (SMART RETRY + SAFE LOADER)
========================================================= */
api.interceptors.response.use(
  (res) => {

    /* 🔥 STOP LOADING */
    if (stopLoading) stopLoading()

    console.log("✅ RESPONSE:", res.config.url, res.data)
    return res
  },

  async (err) => {

    /* 🔥 ALWAYS STOP LOADING (CRITICAL) */
    if (stopLoading) stopLoading()

    const status = err?.response?.status
    const url = err?.config?.url || ""

    console.error(
      "❌ API ERROR:",
      status,
      err?.config?.baseURL + url
    )

    const originalRequest = err.config

    /* ================= SAFE ROUTES ================= */
    const safeRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password"
    ]

    const isSafeRoute = safeRoutes.some((r) => url.includes(r))

    /* =========================================================
       🔁 SILENT RETRY (ONLY ONCE)
    ========================================================= */
    if (status === 401 && !isSafeRoute && !originalRequest._retry) {
      originalRequest._retry = true

      console.warn("🔁 Retrying request once...")

      try {
        return await api(originalRequest)
      } catch (retryErr) {
        console.error("❌ Retry failed:", retryErr)
      }
    }

    /* =========================================================
       🔒 FINAL FAIL → LOGOUT
    ========================================================= */
    if (status === 401 && !isSafeRoute) {
      const isCheckout = url.includes("/square")

      const wasAdmin =
        localStorage.getItem("adminUser") ||
        sessionStorage.getItem("adminUser")

      /* 🔥 CLEAR AUTH */
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      localStorage.removeItem("customerToken")
      localStorage.removeItem("customerUser")

      sessionStorage.removeItem("adminToken")
      sessionStorage.removeItem("adminUser")
      sessionStorage.removeItem("customerToken")
      sessionStorage.removeItem("customerUser")

      if (!isCheckout) {
        console.warn("🔒 Redirecting to login")

        if (wasAdmin) {
          window.location.href = "/login"
        } else {
          window.location.href = "/customer-login"
        }
      }
    }

    return Promise.reject(err)
  }
)

export default api