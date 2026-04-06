import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CustomerLogin() {

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = () => {
    setError("")

    if (!email) {
      setError("Please enter your email")
      return
    }

    try {
      /* 🔥 CREATE SIMPLE CUSTOMER TOKEN */
      const user = {
        email: email.toLowerCase().trim(),
        role: "customer"
      }

      const token = btoa(JSON.stringify(user))

      /* 🔐 STORE SESSION */
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      console.log("✅ CUSTOMER LOGGED IN:", user)

      /* 🚀 REDIRECT */
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
          Enter your email to view your orders
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={input}
        />

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