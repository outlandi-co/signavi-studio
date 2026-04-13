import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  /* 🔥 WAKE SERVER */
  useEffect(() => {
    api.get("/ping").catch(() => {})
  }, [])

  const handleLogin = async () => {
    if (loading) return

    /* 🔥 BASIC VALIDATION */
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("📤 SENDING:", { email, password })

      let attempts = 0
      let success = false
      let res

      /* 🔥 RETRY LOOP (fix Render cold start) */
      while (attempts < 3 && !success) {
        try {
          res = await api.post("/auth/login", { email, password })
          success = true
        } catch (err) {
          attempts++

          if (attempts < 3 && err?.code === "ERR_NETWORK") {
            console.log("⏳ Server waking up... retrying")
            await new Promise(r => setTimeout(r, 2500))
          } else {
            throw err
          }
        }
      }

      console.log("✅ RESPONSE:", res.data)

      if (!res?.data?.token) {
        throw new Error("No token returned")
      }

      const { token, user } = res.data

      localStorage.setItem("adminToken", token)
      localStorage.setItem("adminUser", JSON.stringify(user))

      console.log("✅ ADMIN LOGGED IN:", user)

      navigate("/admin/production")

    } catch (err) {
      console.error("❌ LOGIN ERROR FULL:", err)

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Login failed"

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "🔐 Connecting..." : "Login"}
      </button>
    </div>
  )
}