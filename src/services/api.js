import axios from "axios"

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api"

const normalizedBase = BASE_URL.replace(/\/$/, "")

const api = axios.create({
  baseURL: normalizedBase
})

console.log("🌐 API BASE:", api.defaults.baseURL)

/* 🔥 ADMIN TOKEN ONLY */
api.interceptors.request.use((config) => {

  const adminToken = localStorage.getItem("adminToken")

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  }

  console.log("🔥 REQUEST:", config.baseURL + config.url)

  return config
})

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

    /* 🔥 AUTO CLEAN ADMIN SESSION */
    if (err?.response?.status === 401) {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
    }

    return Promise.reject(err)
  }
)

export default api