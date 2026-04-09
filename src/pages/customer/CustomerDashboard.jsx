import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "")

export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const email = localStorage.getItem("customerEmail")

        if (!email) {
          console.warn("⚠️ No customer email found")
          setLoading(false)
          return
        }

        const res = await api.get(`/customers/orders/${email}`)

        setOrders(res.data || [])

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* ================= REAL-TIME ================= */
  useEffect(() => {

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = (updatedOrder) => {
      setOrders(prev =>
        prev.map(o =>
          o._id === updatedOrder._id ? updatedOrder : o
        )
      )
    }

    const handleCreate = (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    }

    socket.on("jobUpdated", handleUpdate)
    socket.on("jobCreated", handleCreate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
      socket.off("jobCreated", handleCreate)
    }

  }, [])

  /* ================= HELPERS ================= */

  const steps = ["payment_required","paid","production","shipping","delivered"]

  const getIndex = (status) => {
    const i = steps.indexOf(status)
    return i === -1 ? 0 : i
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "production":
        return "#22c55e"
      case "payment_required":
        return "#f59e0b"
      case "shipping":
        return "#3b82f6"
      case "delivered":
        return "#10b981"
      default:
        return "#64748b"
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return <p style={{ padding: 40 }}>Loading your orders...</p>
  }

  return (
    <div style={container}>

      <h1 style={title}>📦 My Orders</h1>

      {orders.length === 0 && (
        <p style={{ opacity: 0.6 }}>No orders yet</p>
      )}

      <div style={grid}>

        {orders.map(order => {
          const current = getIndex(order.status)
          const color = getStatusColor(order.status)

          return (
            <div
              key={order._id}
              onClick={() => navigate(`/order/${order._id}`)}
              style={card}
            >

              <div style={cardHeader}>
                <span style={orderId}>
                  #{order._id.slice(-6)}
                </span>

                <span style={{
                  ...statusBadge,
                  background: color + "22",
                  color
                }}>
                  {order.status}
                </span>
              </div>

              <div style={price}>
                ${(order.finalPrice || order.price || 0).toFixed(2)}
              </div>

              <div style={timeline}>
                {steps.map((step, i) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 4,
                      background: i <= current ? "#22c55e" : "#1e293b"
                    }}
                  />
                ))}
              </div>

              <div style={footer}>
                <span>Qty: {order.quantity}</span>

                {order.status === "payment_required" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/checkout/${order._id}`)
                    }}
                    style={payBtn}
                  >
                    Pay Now
                  </button>
                )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 40,
  maxWidth: 1200,
  margin: "0 auto",
  color: "white"
}

const title = {
  marginBottom: 20,
  fontSize: 28,
  fontWeight: "bold"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20
}

const card = {
  background: "#020617",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #1e293b",
  cursor: "pointer",
  transition: "0.2s"
}

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}

const orderId = {
  fontSize: 12,
  opacity: 0.6
}

const statusBadge = {
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: "bold",
  textTransform: "capitalize"
}

const price = {
  fontSize: 22,
  fontWeight: "bold"
}

const timeline = {
  display: "flex",
  gap: 4,
  marginTop: 5
}

const footer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10
}

const payBtn = {
  padding: "6px 10px",
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: "bold"
}