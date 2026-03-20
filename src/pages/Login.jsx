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

      const res = await api.post("/auth/login", {
        email,
        password
      })

      if (!res.data.token) {
        alert("Invalid backend response")
        return
      }

      // 🔥 Save token + user
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify({
        role: res.data.role
      }))

      if (res.data.role === "admin") {
        navigate("/admin/production")
      } else {
        navigate("/")
      }

    } catch (err) {
      alert(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

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