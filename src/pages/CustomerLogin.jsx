import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerLogin() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ================= AUTO LOGIN ================= */
  useEffect(() => {
    const token = localStorage.getItem("customerToken")

    if (token) {
      navigate("/store")
    }
  }, [navigate])

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (loading) return

    setError("")

    if (!email || !password) {
      return setError("Please enter email and password")
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/login", { email, password })

      const { token, user } = res.data

      if (remember) {
        localStorage.setItem("customerToken", token)
        localStorage.setItem("customerUser", JSON.stringify(user))
      } else {
        sessionStorage.setItem("customerToken", token)
        sessionStorage.setItem("customerUser", JSON.stringify(user))
      }

      navigate("/store")

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div style={container}>

      {/* GLASS CARD */}
      <div style={card}>

        <h1 style={title}>Welcome Back</h1>
        <p style={subtitle}>Sign in to continue</p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          onKeyDown={handleKey}
          style={input}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            onKeyDown={handleKey}
            style={input}
          />

          <span onClick={()=>setShowPassword(!showPassword)} style={eye}>
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* OPTIONS ROW */}
        <div style={optionsRow}>
          <label style={checkboxWrap}>
            <input
              type="checkbox"
              checked={remember}
              onChange={()=>setRemember(!remember)}
            />
            Remember me
          </label>

          <span
            style={forgot}
            onClick={()=>navigate("/forgot-password")}
          >
            Forgot?
          </span>
        </div>

        {/* ERROR */}
        {error && <p style={errorText}>{error}</p>}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...button,
            transform: loading ? "scale(0.98)" : "scale(1)"
          }}
        >
          {loading ? "⏳ Signing in..." : "Sign In"}
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
  background: "linear-gradient(135deg, #020617, #0f172a)",
  color: "white"
}

const card = {
  background: "rgba(15, 23, 42, 0.7)",
  backdropFilter: "blur(12px)",
  padding: "40px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
  border: "1px solid rgba(255,255,255,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  transition: "all 0.3s ease"
}

const title = {
  fontSize: "26px",
  fontWeight: "600",
  textAlign: "center"
}

const subtitle = {
  textAlign: "center",
  fontSize: "14px",
  opacity: 0.6,
  marginBottom: "10px"
}

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  outline: "none",
  transition: "0.2s",
}

const button = {
  padding: "12px",
  background: "#22c55e",
  border: "none",
  borderRadius: "8px",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease"
}

const errorText = {
  color: "#ef4444",
  textAlign: "center",
  fontSize: "13px"
}

const eye = {
  position: "absolute",
  right: 12,
  top: 12,
  cursor: "pointer",
  opacity: 0.7
}

const optionsRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "12px"
}

const checkboxWrap = {
  display: "flex",
  gap: "6px",
  alignItems: "center"
}

const forgot = {
  color: "#22c55e",
  cursor: "pointer"
}