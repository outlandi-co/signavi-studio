import { useState } from "react"
import api from "../services/api"

export default function ForgotPassword() {

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const res = await api.post("/auth/forgot-password", { email })
      setMessage(res.data.message)

    } catch {
      setMessage("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>

      <div style={card}>
        <h2 style={title}>Forgot Password</h2>

        <input
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={input}
        />

        <button onClick={handleSubmit} style={button}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p style={success}>{message}</p>}
      </div>

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
  cursor: "pointer"
}

const success = {
  color: "#22c55e",
  textAlign: "center"
}