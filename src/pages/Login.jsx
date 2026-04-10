import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async () => {
    if (loading) return // 🔥 prevent double click

    try {
      setLoading(true)

      console.log("🔥 REQUEST: login")

      const res = await api.post("/auth/login", { email, password })

      console.log("✅ RESPONSE:", res.data)

      if (!res.data?.token) {
        throw new Error("No token returned")
      }

      const { token, user } = res.data

      localStorage.setItem("adminToken", token)
      localStorage.setItem("adminUser", JSON.stringify(user))

      console.log("✅ ADMIN LOGGED IN:", user)

      // 🔥 SAFE NAVIGATION (NO CRASH)
      navigate("/admin/production")

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err)

      alert("Server waking up or login failed. Try again in a few seconds.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  )
}