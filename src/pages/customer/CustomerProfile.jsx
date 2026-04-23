import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerProfile() {

  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate() // 🔥 ADD THIS

  useEffect(() => {
    const load = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null")
        setUser(storedUser)

       const res = await api.get("/orders/my-orders")

const safeOrders = Array.isArray(res.data)
  ? res.data
  : res.data?.data || []

setOrders(safeOrders)

      } catch (err) {
        console.error("❌ PROFILE ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <p style={{ padding: 40 }}>Loading profile...</p>
  }

  /* ================= STATS ================= */
  const totalOrders = orders.length

  const totalSpent = orders.reduce((sum, o) => {
    return sum + (o.finalPrice || o.price || 0)
  }, 0)

  return (
    <div style={{
      padding: 40,
      maxWidth: 1000,
      margin: "0 auto",
      color: "white"
    }}>

      <h1 style={{ marginBottom: 20 }}>My Profile</h1>

      {/* USER INFO */}
      <div style={card}>
        <h2>Account Info</h2>

        <p><strong>Name:</strong> {user?.name || "N/A"}</p>
        <p><strong>Email:</strong> {user?.email || "N/A"}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>

      {/* STATS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginTop: 20
      }}>

        <div style={statCard}>
          <h3>Total Orders</h3>
          <p style={statValue}>{totalOrders}</p>
        </div>

        <div style={statCard}>
          <h3>Total Spent</h3>
          <p style={statValue}>
            ${totalSpent.toFixed(2)}
          </p>
        </div>

      </div>

      {/* QUICK ORDERS */}
      <div style={{
        marginTop: 30,
        background: "#020617",
        padding: 20,
        borderRadius: 10,
        border: "1px solid #1e293b"
      }}>

        <h2 style={{ marginBottom: 15 }}>Recent Orders</h2>

        {orders.length === 0 && (
          <p>No orders yet</p>
        )}

        {orders.slice(0, 5).map(order => (
          <div
            key={order._id}
            onClick={() => navigate(`/order/${order._id}`)} // 🔥 FIXED
            style={{
              padding: 12,
              borderBottom: "1px solid #1e293b",
              cursor: "pointer"
            }}
          >
            <strong>{order.status}</strong>
            <p style={{ fontSize: 12, opacity: 0.6 }}>
              {order._id}
            </p>
          </div>
        ))}

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

const statCard = {
  background: "#020617",
  padding: 20,
  borderRadius: 10,
  border: "1px solid #1e293b"
}

const statValue = {
  fontSize: 28,
  fontWeight: "bold",
  marginTop: 10
}