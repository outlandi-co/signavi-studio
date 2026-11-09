import { decideUnauthorizedSession } from "../utils/unauthorizedSessionDecision.js"
import { SIGNAVI_V2_API_ORIGIN } from "../config/v2Api.js";
import axios from "axios"

/* =========================================================
   🌐 BASE URL
========================================================= */
const BASE_URL = `${SIGNAVI_V2_API_ORIGIN}/api`

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

  if (startLoading) startLoading()

  const adminToken =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken")

  const customerToken =
    localStorage.getItem("customerToken") ||
    sessionStorage.getItem("customerToken")

  const token = adminToken || customerToken

  /* 🔥 ONLY SET JSON IF NOT FORMDATA */
  if (!(config.data instanceof FormData)) {
    config.headers = {
      ...(config.headers || {}),
      "Content-Type": "application/json"
    }
  } else {
    /* 🔥 LET BROWSER HANDLE FORM DATA */
    delete config.headers?.["Content-Type"]
  }

  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`
    }
  }


  return config
})

/* =========================================================
   🔁 RESPONSE INTERCEPTOR
========================================================= */
api.interceptors.response.use(
  (res) => {
    if (stopLoading) stopLoading()
    return res
  },

  async (err) => {

    if (stopLoading) stopLoading()

    const status = err?.response?.status
    const url = err?.config?.url || ""

    console.error(
      "❌ API ERROR:",
      status,
      err?.config?.baseURL + url
    )

    const originalRequest = err.config || {}

    const safeRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password"
    ]

    const isSafeRoute = safeRoutes.some((r) => url.includes(r))

    const headers = originalRequest.headers

    const authorization =
      typeof headers?.get === "function"
        ? headers.get("Authorization")
        : (headers?.Authorization || headers?.authorization)

    const decision = decideUnauthorizedSession({
      method: originalRequest.method,
      url,
      authorization,
      adminToken:
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken"),
      customerToken:
        localStorage.getItem("customerToken") ||
        sessionStorage.getItem("customerToken")
    })

    // Never retry guest checkout or anonymous requests on a 401.
    // Retry only requests carrying a still-current login token.
    if (
      status === 401 &&
      !isSafeRoute &&
      decision.clear &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        return await api(originalRequest)
      } catch (retryErr) {
        console.error("Authenticated request retry failed:", retryErr)
      }
    }

    if (status === 401 && !isSafeRoute && decision.clear) {
      const expiredRole = decision.clear
      const expiredToken = authorization.slice(7)

      const keys = expiredRole === "admin"
        ? ["adminToken", "adminUser"]
        : ["customerToken", "customerUser"]

      // Only clear credentials if the rejected token is still
      // the current one. Do not invalidate a newer login.
      for (const storage of [localStorage, sessionStorage]) {
        const tokenKey = keys[0]

        if (storage.getItem(tokenKey) === expiredToken) {
          for (const key of keys) {
            storage.removeItem(key)
          }
        }
      }

      // Preserve the previous redirect behavior for authenticated
      // requests. Guest checkout never enters this branch.
      if (!url.includes("/square")) {
        window.location.href = expiredRole === "admin"
          ? "/login"
          : "/customer-login"
      }
    }
    return Promise.reject(err)
  }
)

export default api