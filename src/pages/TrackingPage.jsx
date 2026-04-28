import { useState } from "react"
import api from "../services/api"

function TrackingPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    try {
      setError("")
      setOrder(null)

      const res = await api.get(`/orders/${orderId}`)

      // ✅ FIX: correct data access
      setOrder(res.data?.data)

    } catch (err) {
      console.error("❌ TRACKING ERROR:", err)
      setError("Order not found or invalid ID")
    }
  }

  return (
    <div style={{ padding: "40px", color: "white", background: "#020617", minHeight: "100vh" }}>
      <h2>📦 Track Your Order</h2>

      <div style={{ marginTop: "20px" }}>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          style={input}
        />

        <button onClick={handleSearch} style={btn}>
          Track
        </button>
      </div>

      {error && <p style={{ color: "#ef4444", marginTop: "15px" }}>{error}</p>}

      {order && (
        <div style={card}>
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {/* 🔥 STATUS FEEDBACK */}
          {order.status === "production" && <p>🏭 In production</p>}
          {order.status === "shipping" && <p>📦 Preparing shipment</p>}

          {order.status === "shipped" && (
            <>
              <p>🚚 Tracking #: {order.trackingNumber}</p>
              {order.trackingLink && (
                <a href={order.trackingLink} target="_blank" rel="noreferrer" style={link}>
                  Track Shipment
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const input = {
  padding: "10px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const btn = {
  padding: "10px",
  background: "#22c55e",
  border: "none",
  cursor: "pointer",
  borderRadius: "6px"
}

const card = {
  marginTop: "20px",
  padding: "20px",
  border: "1px solid #334155",
  borderRadius: "10px"
}

const link = {
  color: "#22c55e",
  display: "block",
  marginTop: "10px"
}

export default TrackingPage