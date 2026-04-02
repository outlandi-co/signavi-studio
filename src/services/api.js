import axios from "axios"

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5050/api"

const normalizedBase = BASE_URL.replace(/\/$/, "")

const api = axios.create({
  baseURL: normalizedBase
})

console.log("🌐 API BASE:", api.defaults.baseURL)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
    return Promise.reject(err)
  }
)

export default api