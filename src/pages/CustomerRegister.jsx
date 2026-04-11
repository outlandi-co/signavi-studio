import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function CustomerRegister() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    try {
      setLoading(true)

      console.log("🔥 CUSTOMER REGISTER REQUEST")

      const res = await api.post("/auth/register", {
        ...form,
        role: "customer"
      })

      console.log("✅ REGISTER RESPONSE:", res.data)

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid server response")
      }

      const { token, user } = res.data

      /* ================= 🔥 FIXED AUTH STORAGE ================= */
      localStorage.setItem("customerToken", token)
      localStorage.setItem("customerUser", JSON.stringify(user))

      /* OPTIONAL: clear admin if switching */
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")

      console.log("✅ CUSTOMER STORED:", user)

      navigate("/store")

    } catch (err) {
      console.error("❌ REGISTER ERROR:", err)

      alert(
        "Registration failed. Server may be waking up — try again in a few seconds."
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={wrap}>
      <form onSubmit={handleSubmit} style={card}>

        <h2>Create Account</h2>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={input}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={input}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={input}
        />

        <button
          type="submit"
          style={btn}
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>

      </form>
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