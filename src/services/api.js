import axios from "axios"

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const api = axios.create({
  baseURL: BASE_URL.replace(/\/$/, "")
})

console.log("🌐 API BASE:", api.defaults.baseURL)

/* ================= REQUEST ================= */
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken")
  const customerToken = localStorage.getItem("customerToken")

  const token = adminToken || customerToken

  config.headers = {
    ...(config.headers || {})
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // ✅ Fix multipart uploads
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }

  console.log("🔥 REQUEST:", config.baseURL + config.url)

  return config
})

/* ================= RESPONSE ================= */
api.interceptors.response.use(
  (res) => {
    console.log("✅ RESPONSE:", res.config.url, res.data)
    return res
  },
  (err) => {
    const status = err?.response?.status

    console.error(
      "❌ API ERROR:",
      status,
      err?.config?.baseURL + err?.config?.url
    )

    // 🔥 ONLY redirect if it's NOT checkout flow
    if (status === 401) {
      const isCheckout = err?.config?.url?.includes("/square")

      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      localStorage.removeItem("customerToken")
      localStorage.removeItem("customerUser")

      if (!isCheckout) {
        console.warn("🔒 Redirecting to login")
        window.location.href = "/customer-login"
      }
    }

    return Promise.reject(err)
  }
)

export default api