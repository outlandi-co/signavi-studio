import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")

const STATUS_STEPS = [
  "pending",
  "payment_required",
  "paid",
  "printing",
  "shipped",
  "delivered"
]

function TrackOrder() {

  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  /* ✅ FETCH ORDER */
  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data)
    } catch (err) {
      console.error("❌ Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {

    fetchOrder()

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    })

    socket.on("connect", () => {
      console.log("🟢 Tracking connected:", socket.id)
    })

    socket.on("jobUpdated", (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder)

        setNotification(`Status updated: ${updatedOrder.status}`)

        setTimeout(() => {
          setNotification(null)
        }, 3000)
      }
    })

    return () => socket.disconnect()

  }, [fetchOrder, id])

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading tracking info...
      </div>
    )
  }

  if (!order) {
    return (
      <div style={loadingStyle}>
        Order not found
      </div>
    )
  }

  const currentIndex = Math.max(
    0,
    STATUS_STEPS.indexOf(order.status)
  )

  return (
    <div style={container}>

      {/* 🔔 NOTIFICATION */}
      {notification && (
        <div style={notificationStyle}>
          🔔 {notification}
        </div>
      )}

      <h1>📦 Order Tracking</h1>

      <div style={card}>

        <h2>Order #{order._id.slice(-6)}</h2>
        <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
        <p><strong>Name:</strong> {order.customerName}</p>

        {/* 🔥 SHIPPING INFO */}
        {order.carrier && (
          <p><strong>Carrier:</strong> {order.carrier}</p>
        )}

        {order.serviceLevel && (
          <p><strong>Service:</strong> {order.serviceLevel}</p>
        )}

        {/* ================= PROGRESS BAR ================= */}
        <div style={{ marginTop: "20px" }}>
          <div style={progressLabels}>
            {STATUS_STEPS.map((step, i) => (
              <span
                key={step}
                style={{
                  fontSize: "10px",
                  color: i <= currentIndex ? "#22c55e" : "#64748b"
                }}
              >
                {step.toUpperCase()}
              </span>
            ))}
          </div>

          <div style={progressBar}>
            <div
              style={{
                width: `${((currentIndex + 1) / STATUS_STEPS.length) * 100}%`,
                height: "100%",
                background: "#22c55e",
                transition: "width 0.5s ease"
              }}
            />
          </div>
        </div>

        {/* ================= SHIPPING ================= */}
        {order.trackingNumber && (
          <p style={{ marginTop: "15px" }}>
            📦 Tracking: {order.trackingNumber}
          </p>
        )}

        {order.trackingLink && (
          <a
            href={order.trackingLink}
            target="_blank"
            rel="noreferrer"
            style={link}
          >
            🔗 Track Package
          </a>
        )}

        {/* 🔥 PRINT LABEL BUTTON */}
        {order.shippingLabel && (
          <button
            onClick={() => window.open(order.shippingLabel, "_blank")}
            style={printButton}
          >
            🖨️ Print Shipping Label
          </button>
        )}

      </div>

      {/* ================= TIMELINE ================= */}
      <div style={{ marginTop: "30px" }}>
        <h2>🕒 Timeline</h2>

        {order.timeline?.slice().reverse().map((event, index) => (
          <div key={index} style={timelineItem}>
            <p style={{ fontWeight: "bold" }}>
              {event.status}
            </p>

            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              {new Date(event.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: "40px",
  background: "#020617",
  color: "white",
  minHeight: "100vh"
}

const card = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "20px"
}

const loadingStyle = {
  padding: 40,
  background: "#020617",
  color: "white",
  height: "100vh"
}

const notificationStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  background: "#22c55e",
  color: "black",
  padding: "10px 15px",
  borderRadius: "6px",
  fontWeight: "bold",
  zIndex: 999
}

const progressLabels = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px"
}

const progressBar = {
  height: "6px",
  background: "#1e293b",
  borderRadius: "4px",
  overflow: "hidden"
}

const link = {
  display: "inline-block",
  marginTop: "10px",
  color: "#38bdf8"
}

const printButton = {
  marginTop: "12px",
  padding: "10px",
  background: "#22c55e",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
}

const timelineItem = {
  background: "#020617",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "6px",
  borderLeft: "3px solid #22c55e"
}

export default TrackOrder