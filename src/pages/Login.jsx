import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email + password")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/login", { email, password })

      const { token, user } = res.data

      if (!token || !user) {
        alert("Invalid backend response")
        return
      }

      /* 🔥 CLEAR OLD STORAGE */
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("customerEmail")

      /* 🔐 STORE ADMIN SESSION */
      localStorage.setItem("adminToken", token)
      localStorage.setItem("adminUser", JSON.stringify(user))

      console.log("✅ ADMIN LOGGED IN:", user)

      /* 🚀 REDIRECT (FIXED PATH) */
      navigate("/production")

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  )
}

export default Login