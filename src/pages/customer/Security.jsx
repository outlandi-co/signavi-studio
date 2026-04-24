import { useState } from "react"
import CustomerLayout from "../../layouts/CustomerLayout"
import api from "../../services/api"

export default function Security() {

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [show, setShow] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  /* 🔥 PASSWORD STRENGTH */
  const getStrength = (pwd) => {
    if (!pwd) return ""

    let score = 0
    if (pwd.length >= 6) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 1) return "Weak"
    if (score === 2) return "Medium"
    return "Strong"
  }

  const strength = getStrength(newPassword)

  const handleSubmit = async () => {
    setError("")
    setMessage("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("All fields required")
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match")
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      })

      setMessage(res.data.message)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

    } catch (err) {
      setError(err?.response?.data?.message || "Error updating password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerLayout>

      <h2>🔐 Change Password</h2>

      <div style={form}>

        {/* CURRENT */}
        <input
          type={show ? "text" : "password"}
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e)=>setCurrentPassword(e.target.value)}
          style={input}
        />

        {/* NEW */}
        <input
          type={show ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e)=>setNewPassword(e.target.value)}
          style={input}
        />

        {/* STRENGTH */}
        {newPassword && (
          <p style={{
            color:
              strength === "Strong" ? "#22c55e" :
              strength === "Medium" ? "#facc15" :
              "#ef4444"
          }}>
            Strength: {strength}
          </p>
        )}

        {/* CONFIRM */}
        <input
          type={show ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          style={input}
        />

        {/* TOGGLE */}
        <button
          onClick={()=>setShow(!show)}
          style={toggleBtn}
        >
          {show ? "🙈 Hide Passwords" : "👁 Show Passwords"}
        </button>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={button}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && <p style={{ color: "#22c55e" }}>{message}</p>}
        {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      </div>

    </CustomerLayout>
  )
}

/* STYLES */
const form = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 20,
  maxWidth: 400
}

const input = {
  padding: 12,
  background: "#0f172a",
  color: "white",
  borderRadius: 6,
  border: "none"
}

const button = {
  padding: 12,
  background: "#22c55e",
  color: "black",
  borderRadius: 6,
  cursor: "pointer"
}

const toggleBtn = {
  padding: 10,
  background: "#1e293b",
  color: "white",
  borderRadius: 6,
  cursor: "pointer"
}