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
     🔥 WAKE SERVER + CHECK SESSION
  ========================================================= */
  useEffect(() => {
    const init = async () => {
      try {
        await api.get("/ping").catch(() => {})

        const token = localStorage.getItem("adminToken")

        if (token) {
          console.log("✅ Existing session → redirect")
          navigate("/admin/production", { replace: true })
        }
      } catch {
        console.log("⚠️ Init failed")
      }
    }

    init()
  }, [navigate])

  /* =========================================================
     🔐 LOGIN HANDLER
  ========================================================= */
  const handleLogin = async (e) => {
    if (e) e.preventDefault()

    if (loading) return

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)
      setError("")

      /* 🔥 FIXED LOG */
      console.log("📤 LOGIN PAYLOAD:", { email, password })

      let attempts = 0
      let res

      while (attempts < 3) {
        try {
          res = await api.post("/auth/login", {
            email,
            password
          })
          break
        } catch (err) {
          attempts++

          if (attempts < 3 && err?.code === "ERR_NETWORK") {
            console.log("⏳ Waking server...")
            await new Promise(r => setTimeout(r, 2500))
          } else {
            throw err
          }
        }
      }

      if (!res?.data?.token || !res?.data?.user) {
        throw new Error("Invalid login response")
      }

      const { token, user } = res.data

      /* 🔥 CLEAR CUSTOMER SESSION */
      localStorage.removeItem("customerUser")
      localStorage.removeItem("customerToken")

      /* 🔐 SAVE ADMIN SESSION */
      localStorage.setItem("adminToken", token)
      localStorage.setItem("adminUser", JSON.stringify(user))

      console.log("✅ ADMIN LOGGED IN:", user)

      navigate("/admin/production", { replace: true })

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
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
      <h2>Admin Login</h2>

      {/* 🔥 FORM WRAPPER FIX */}
      <form onSubmit={handleLogin}>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            display: "block",
            marginBottom: 10,
            width: "100%",
            padding: "10px"
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            display: "block",
            marginBottom: 10,
            width: "100%",
            padding: "10px"
          }}
        />

        {error && (
          <p style={{ color: "red", marginBottom: 10 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            cursor: "pointer",
            background: "#06b6d4",
            border: "none",
            borderRadius: "6px",
            color: "#000",
            fontWeight: "bold"
          }}
        >
          {loading ? "🔐 Connecting..." : "Login"}
        </button>

      </form>
    </div>
  )
}