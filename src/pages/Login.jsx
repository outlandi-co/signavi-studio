import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        await api.get("/ping").catch(() => {})

        const token =
          localStorage.getItem("adminToken") ||
          sessionStorage.getItem("adminToken")

        if (token) {
          console.log("✅ Existing admin session → redirect")
          navigate("/admin/production", { replace: true })
        }
      } catch {
        console.log("⚠️ Init failed")
      }
    }

    init()
  }, [navigate])

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)
      setError("")

      let res
      let attempts = 0

      while (attempts < 3) {
        try {
          res = await api.post("/auth/login", {
            email: cleanEmail,
            password
          })
          break
        } catch (err) {
          attempts++

          if (attempts < 3 && err?.code === "ERR_NETWORK") {
            console.log("⏳ Waking server...")
            await new Promise((resolve) => setTimeout(resolve, 2500))
          } else {
            throw err
          }
        }
      }

      if (!res?.data?.token || !res?.data?.user) {
        throw new Error("Invalid login response")
      }

      const { token, user } = res.data

      if (user.role !== "admin") {
        throw new Error("This login is for admins only")
      }

      /* 🔥 CLEAR OLD ADMIN/CUSTOMER SESSIONS */
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      sessionStorage.removeItem("adminToken")
      sessionStorage.removeItem("adminUser")

      localStorage.removeItem("customerToken")
      localStorage.removeItem("customerUser")
      localStorage.removeItem("customerEmail")
      sessionStorage.removeItem("customerToken")
      sessionStorage.removeItem("customerUser")

      /* 🔥 STORE BASED ON REMEMBER */
      if (remember) {
        localStorage.setItem("adminToken", token)
        localStorage.setItem("adminUser", JSON.stringify(user))
      } else {
        sessionStorage.setItem("adminToken", token)
        sessionStorage.setItem("adminUser", JSON.stringify(user))
      }

      console.log("✅ ADMIN LOGGED IN:", user)

      navigate("/admin/production", { replace: true })
    } catch (err) {
      console.error("❌ LOGIN ERROR:", err)

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Login failed"

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <form style={card} onSubmit={handleLogin}>
        <h2 style={title}>Admin Login</h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={input}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={input}
        />

        <label style={rememberRow}>
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          Remember Me
        </label>

        <div style={forgotWrap}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={forgotButton}
          >
            Forgot password?
          </button>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <button type="submit" disabled={loading} style={button}>
          {loading ? "🔐 Connecting..." : "Login"}
        </button>
      </form>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const card = {
  background: "#0f172a",
  padding: 30,
  borderRadius: 12,
  width: 350,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  color: "white"
}

const title = {
  textAlign: "center",
  marginBottom: 10
}

const input = {
  padding: 12,
  borderRadius: 6,
  border: "1px solid #1e293b",
  background: "#020617",
  color: "white"
}

const rememberRow = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 14
}

const forgotWrap = {
  textAlign: "right",
  marginTop: -4
}

const forgotButton = {
  background: "transparent",
  border: "none",
  color: "#60a5fa",
  fontSize: 13,
  cursor: "pointer",
  padding: 0
}

const button = {
  padding: 12,
  background: "#06b6d4",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  color: "#000",
  fontWeight: "bold"
}

const errorText = {
  color: "#ef4444",
  textAlign: "center",
  fontSize: 14
}