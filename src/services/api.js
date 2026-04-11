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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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

    console.error(
      "❌ API ERROR:",
      err?.response?.status,
      err?.config?.baseURL + err?.config?.url
    )

    // 🔥 AUTO CLEANUP ON AUTH FAIL
    if (err?.response?.status === 401) {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      localStorage.removeItem("customerToken")
      localStorage.removeItem("customerUser")
    }

    return Promise.reject(err)
  }
)

export default api