import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function ResetPassword() {

  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setMessage("")

    if (!password || !confirm) {
      return setError("All fields required")
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    if (password !== confirm) {
      return setError("Passwords do not match")
    }

    try {
      setLoading(true)

      const res = await api.post(`/auth/reset-password/${token}`, {
        password
      })

      setMessage(res.data.message || "Password reset successful")

      // 🔥 CLEAN REDIRECT FLOW
      setTimeout(() => {
        navigate("/customer-login", { replace: true })
      }, 1500)

    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>

      <form style={card} onSubmit={handleSubmit}>
        <h2 style={title}>🔐 Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e)=>setConfirm(e.target.value)}
          style={input}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...button,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>

        {message && <p style={success}>{message}</p>}
        {error && <p style={errorText}>{error}</p>}
      </form>

    </div>
  )
}

/* STYLES */
const container = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white"
}

const card = {
  background: "#0f172a",
  padding: 30,
  borderRadius: 10,
  width: 350,
  display: "flex",
  flexDirection: "column",
  gap: 12
}

const title = {
  textAlign: "center"
}

const input = {
  padding: 12,
  background: "#020617",
  border: "1px solid #1e293b",
  color: "white",
  borderRadius: 6
}

const button = {
  padding: 12,
  background: "#22c55e",
  color: "black",
  borderRadius: 6,
  cursor: "pointer",
  border: "none",
  fontWeight: "bold"
}

const success = {
  color: "#22c55e",
  textAlign: "center"
}

const errorText = {
  color: "#ef4444",
  textAlign: "center"
}