import axios from "axios"

/* ================= BASE URL ================= */
const BASE_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "http://localhost:5050/api"

/* 🔥 FORCE /api IF MISSING */
const normalizedBase =
  BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`

const api = axios.create({
  baseURL: normalizedBase
})

/* ================= DEBUG ================= */
console.log("🌐 API BASE:", api.defaults.baseURL)

/* ================= AUTH ================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* ================= ERROR DEBUG ================= */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ API ERROR:", err?.response?.status, err?.config?.url)
    return Promise.reject(err)
  }
)

export default api