import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerLogin() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ================= PREVENT LOOP ================= */
  useEffect(() => {
    const token = localStorage.getItem("customerToken")

    if (token) {
      console.log("✅ Already logged in → redirecting to store")
      navigate("/store")
    }
  }, [navigate])

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (loading) return

    setError("")

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)

      console.log("🔥 CUSTOMER LOGIN REQUEST")

      const res = await api.post("/auth/login", {
        email,
        password
      })

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid login response")
      }

      const { token, user } = res.data

      /* ================= STORE ================= */
      localStorage.setItem("customerToken", token)
      localStorage.setItem("customerUser", JSON.stringify(user))

      /* 🔥 Clear admin session */
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")

      console.log("✅ CUSTOMER LOGGED IN:", user)

      navigate("/store")

    } catch (err) {
      console.error("❌ CUSTOMER LOGIN ERROR:", err)
      setError("Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Customer Login</h1>

        <p style={subtitle}>
          Enter your email and password to access your orders
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={input}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={input}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={eye}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...button,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Logging in..." : "Continue"}
        </button>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617",
  color: "white"
}

const card = {
  background: "#0f172a",
  padding: "40px",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
}

const title = {
  marginBottom: "10px"
}

const subtitle = {
  marginBottom: "20px",
  fontSize: "14px",
  opacity: 0.7
}

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const button = {
  width: "100%",
  padding: "12px",
  background: "#22c55e",
  border: "none",
  borderRadius: "6px",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer"
}

const errorText = {
  color: "#ef4444",
  marginBottom: "10px",
  fontSize: "14px"
}

const eye = {
  position: "absolute",
  right: 12,
  top: 12,
  cursor: "pointer",
  color: "#94a3b8"
}