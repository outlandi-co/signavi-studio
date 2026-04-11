import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerLogin() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (loading) return

    try {
      setLoading(true)

      console.log("🔥 CUSTOMER LOGIN REQUEST")

      const res = await api.post("/auth/login", {
        email,
        password
      })

      console.log("✅ LOGIN RESPONSE:", res.data)

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid login response")
      }

      const { token, user } = res.data

      /* 🔥 FIXED STORAGE SYSTEM */
      localStorage.setItem("customerToken", token)
      localStorage.setItem("customerUser", JSON.stringify(user))

      /* OPTIONAL: clear admin session */
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")

      console.log("✅ CUSTOMER LOGGED IN:", user)

      navigate("/store")

    } catch (err) {
      console.error("❌ CUSTOMER LOGIN ERROR:", err)

      alert(
        "Login failed. Server may be waking up — try again in a few seconds."
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={wrap}>

      <div style={card}>
        <h2>Customer Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={input}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={input}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={btn}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const wrap = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "80vh",
  color: "white"
}

const card = {
  background: "#020617",
  padding: 30,
  borderRadius: 12,
  width: 300,
  display: "flex",
  flexDirection: "column",
  gap: 10
}

const input = {
  padding: 10,
  borderRadius: 6,
  background: "#0f172a",
  color: "white",
  border: "1px solid #1e293b"
}

const btn = {
  padding: 10,
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  color: "white",
  cursor: "pointer"
}