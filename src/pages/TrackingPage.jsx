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

      setOrder(res.data)

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
          style={{
            padding: "10px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #334155",
            background: "#020617",
            color: "white"
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            padding: "10px",
            background: "#22c55e",
            border: "none",
            cursor: "pointer",
            borderRadius: "6px"
          }}
        >
          Track
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p style={{ color: "#ef4444", marginTop: "15px" }}>
          {error}
        </p>
      )}

      {/* RESULT */}
      {order && (
        <div style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #334155",
          borderRadius: "10px"
        }}>
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {order.trackingLink && (
            <a
              href={order.trackingLink}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#22c55e", display: "block", marginTop: "10px" }}
            >
              📦 Track Shipment
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default TrackingPage