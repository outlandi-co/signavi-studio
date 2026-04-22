import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function CustomerLogin() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("") // 🔥 ADDED
  const [showPassword, setShowPassword] = useState(false) // 🔥 ADDED
  const [error, setError] = useState("")
  const navigate = useNavigate()

  /* 🔥 AUTO REDIRECT IF LOGGED IN */
  useEffect(() => {
    const existing = localStorage.getItem("customerEmail")
    if (existing) {
      navigate("/dashboard")
    }
  }, [navigate])

  const handleLogin = () => {
    setError("")

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      const cleanEmail = email.toLowerCase().trim()

      /* 🔥 STORE SESSION */
      localStorage.setItem("customerEmail", cleanEmail)

      console.log("✅ CUSTOMER LOGGED IN:", cleanEmail)

      navigate("/dashboard")

    } catch (err) {
      console.error(err)
      setError("Login failed")
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Customer Login</h1>

        <p style={subtitle}>
          Enter your email and password to view your orders
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={input}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={input}
          />

          {/* 👁 TOGGLE */}
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={eye}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <button onClick={handleLogin} style={button}>
          Continue
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