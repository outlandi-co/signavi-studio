import { useEffect, useState } from "react"
import api from "../../services/api"

export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders/my-orders")
        setOrders(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const steps = ["payment_required","paid","production","shipping","delivered"]

  const getIndex = (status) => steps.indexOf(status)

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

  if (loading) {
    return <p style={{ padding: 40 }}>Loading your orders...</p>
  }

  return (
    <div style={container}>

      <h1 style={title}>My Orders</h1>

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
              onClick={() => window.location.href = `/order/${order._id}`}
              style={card}
            >

              {/* HEADER */}
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

              {/* PRICE */}
              <div style={price}>
                ${(order.finalPrice || order.price || 0).toFixed(2)}
              </div>

              {/* TIMELINE */}
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

              {/* FOOTER */}
              <div style={footer}>
                <span>Qty: {order.quantity}</span>

                {order.status === "payment_required" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/checkout/${order._id}`
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
  transition: "0.2s",
  display: "flex",
  flexDirection: "column",
  gap: 10
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