import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerProfile() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        /* ================= GET USER ================= */
        const stored = localStorage.getItem("customerUser")

        if (!stored) {
          navigate("/customer-login")
          return
        }

        let parsedUser = null

        try {
          parsedUser = JSON.parse(stored)
        } catch {
          console.warn("⚠️ Failed to parse customerUser")
          navigate("/customer-login")
          return
        }

        setUser(parsedUser)

        /* ================= GET EMAIL (FIXED) ================= */
        let email = parsedUser?.email || null

        const fallbackEmail = localStorage.getItem("customerEmail")

        if (!email && fallbackEmail) {
          email = fallbackEmail
        }

        if (!email) {
          console.warn("⚠️ No email found for profile")
          setOrders([])
          return
        }

        console.log("📧 PROFILE FETCH EMAIL:", email)

        /* ================= FETCH ORDERS ================= */
        const res = await api.get(`/orders/my-orders?email=${email}`)

        const data =
          res.data?.data ||
          res.data?.orders ||
          res.data ||
          []

        setOrders(Array.isArray(data) ? data : [])

      } catch (err) {
        console.error("❌ PROFILE ERROR:", err.response?.data || err.message)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  /* ================= LOADING ================= */
  if (loading) {
    return <p style={{ padding: 40 }}>Loading profile...</p>
  }

  /* ================= STATS ================= */
  const totalOrders = orders.length
  const totalSpent = orders.reduce(
    (sum, o) => sum + Number(o.finalPrice || 0),
    0
  )

  /* ================= UI ================= */
  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto", color: "white" }}>
      <h1>My Profile</h1>

      <div style={card}>
        <p><strong>Name:</strong> {user?.name || "N/A"}</p>
        <p><strong>Email:</strong> {user?.email || "N/A"}</p>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={card}>
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>

        <div style={card}>
          <h3>Total Spent</h3>
          <p>${totalSpent.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const card = {
  background: "#020617",
  padding: 20,
  borderRadius: 10,
  border: "1px solid #1e293b"
}