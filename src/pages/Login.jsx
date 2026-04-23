import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  /* =========================================================
     🔥 WAKE SERVER + AUTO LOGIN CHECK
  ========================================================= */
  useEffect(() => {
    const init = async () => {
      try {
        // Wake backend (Render cold start)
        await api.get("/ping").catch(() => {})

        // Check if already logged in
        const res = await api.get("/auth/profile")

        if (res?.data?.user) {
          console.log("✅ Already logged in:", res.data.user)

          localStorage.setItem(
            "adminUser",
            JSON.stringify(res.data.user)
          )

          navigate("/admin/production")
        }
      } catch {
        console.log("ℹ️ Not logged in yet")
      }
    }

    init()
  }, [navigate])

  /* =========================================================
     🔐 LOGIN HANDLER
  ========================================================= */
  const handleLogin = async () => {
    if (loading) return

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("📤 SENDING:", { email })

      let attempts = 0
      let res

      /* 🔁 RETRY LOOP (Render wake fix) */
      while (attempts < 3) {
        try {
          res = await api.post("/auth/login", { email, password })
          break
        } catch (err) {
          attempts++

          if (attempts < 3 && err?.code === "ERR_NETWORK") {
            console.log("⏳ Server waking... retrying")
            await new Promise(r => setTimeout(r, 2500))
          } else {
            throw err
          }
        }
      }

      console.log("✅ RESPONSE:", res.data)

      if (!res?.data?.token || !res?.data?.user) {
        throw new Error("Invalid login response")
      }

      const { token, user } = res.data

      /* 🔐 SAVE SESSION */
      localStorage.setItem("adminToken", token)
      localStorage.setItem("adminUser", JSON.stringify(user))

      console.log("✅ ADMIN LOGGED IN:", user)

      navigate("/admin/production")

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err)

      let message = "Login failed"

      if (err?.response?.data) {
        const data = err.response.data

        if (typeof data === "string") {
          message = data
        } else {
          message = data.message || data.error || message
        }
      } else if (err.message) {
        message = err.message
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Admin Login</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />

      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          cursor: "pointer"
        }}
      >
        {loading ? "🔐 Connecting..." : "Login"}
      </button>
    </div>
  )
}