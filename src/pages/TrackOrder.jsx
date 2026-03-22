import { useState } from "react"
import api from "../services/api"

function TrackOrder() {

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ================= PROGRESS ================= */
  const getProgress = (status) => {
    switch (status) {
      case "pending": return 10
      case "approved": return 25
      case "printing": return 45
      case "ready": return 65
      case "shipping": return 80
      case "shipped": return 90
      case "delivered": return 100
      default: return 10
    }
  }

  /* ================= ETA ================= */
  const getETA = (status) => {
    const now = new Date()

    if (status === "printing") return new Date(now.setDate(now.getDate() + 3))
    if (status === "shipping" || status === "shipped") return new Date(now.setDate(now.getDate() + 5))
    if (status === "delivered") return "Delivered"

    return "Processing"
  }

  /* ================= TRACKING LINK ================= */
  const getTrackingLink = (tracking) => {
    if (!tracking) return null

    if (tracking.startsWith("1Z")) {
      return `https://www.ups.com/track?tracknum=${tracking}`
    }

    if (tracking.length === 22) {
      return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tracking}`
    }

    if (tracking.length === 12) {
      return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`
    }

    return null
  }

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    if (!orderId) return

    try {
      setLoading(true)
      setError("")
      setOrder(null)

      const res = await api.get(`/orders/track/${orderId}`)
      setOrder(res.data)

    } catch (err) {
      console.error(err)
      setError("Order not found")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>

      <h2 style={title}>Track Your Order</h2>

      {/* SEARCH */}
      <div style={searchBox}>
        <input
          style={input}
          placeholder="Enter Order ID (SNV-...)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        <button style={button} onClick={handleSearch}>
          Track
        </button>
      </div>

      {loading && <p style={text}>Loading...</p>}
      {error && <p style={errorText}>{error}</p>}

      {/* RESULT */}
      {order && (
        <div style={card}>

          <h3 style={orderTitle}>{order.orderId || order._id}</h3>

          <p>
            Status:{" "}
            <strong style={{ color: "#06b6d4" }}>
              {order.status.toUpperCase()}
            </strong>
          </p>

          {/* PROGRESS */}
          <div style={progressContainer}>
            <div
              style={{
                ...progressBar,
                width: `${getProgress(order.status)}%`
              }}
            />
          </div>

          {/* ETA */}
          <p style={{ marginTop: "10px", fontSize: "12px" }}>
            📅 Estimated Delivery:{" "}
            <strong>
              {typeof getETA(order.status) === "string"
                ? getETA(order.status)
                : getETA(order.status).toLocaleDateString()}
            </strong>
          </p>

          {/* STATUS LABELS */}
          <div style={statusLabels}>
            <span>Pending</span>
            <span>Approved</span>
            <span>Printing</span>
            <span>Ready</span>
            <span>Shipping</span>
            <span>Delivered</span>
          </div>

          {/* TRACKING */}
          {order.trackingNumber && (
            <div style={section}>
              <h4>Shipping Info</h4>

              <p>{order.trackingNumber}</p>

              {getTrackingLink(order.trackingNumber) && (
                <a
                  href={getTrackingLink(order.trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={trackBtn}
                >
                  🚚 Track Package
                </a>
              )}
            </div>
          )}

          {/* TIMELINE */}
          {order.timeline && order.timeline.length > 0 && (
            <div style={section}>
              <h4>Timeline</h4>

              {order.timeline.map((t, i) => (
                <p key={i} style={timelineItem}>
                  {t.status} — {new Date(t.date).toLocaleString()}
                </p>
              ))}
            </div>
          )}

          {/* ARTWORK */}
          {order.artwork && (
            <div style={section}>
              <h4>Artwork</h4>

              <img
                src={`http://localhost:5050/uploads/${order.artwork}`}
                alt="artwork"
                style={image}
              />

              <a
                href={`http://localhost:5050/uploads/${order.artwork}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={downloadBtn}
              >
                ⬇ Download Artwork
              </a>
            </div>
          )}

        </div>
      )}

    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px",
  background: "#020617",
  minHeight: "100vh",
  color: "#fff"
}

const title = {
  fontSize: "28px",
  marginBottom: "20px"
}

const searchBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px"
}

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff"
}

const button = {
  padding: "10px 16px",
  background: "#2563eb",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer"
}

const card = {
  width: "400px",
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
}

const orderTitle = {
  marginBottom: "10px"
}

const progressContainer = {
  height: "10px",
  background: "#334155",
  borderRadius: "10px",
  overflow: "hidden",
  marginTop: "10px"
}

const progressBar = {
  height: "10px",
  background: "#06b6d4",
  transition: "width 0.3s ease"
}

const statusLabels = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "10px",
  marginTop: "5px",
  opacity: 0.7
}

const section = {
  marginTop: "15px"
}

const timelineItem = {
  fontSize: "12px",
  opacity: 0.8
}

const image = {
  width: "100%",
  borderRadius: "6px",
  marginTop: "10px"
}

const downloadBtn = {
  display: "block",
  marginTop: "10px",
  background: "#06b6d4",
  color: "#fff",
  padding: "10px",
  textAlign: "center",
  borderRadius: "6px",
  textDecoration: "none"
}

const trackBtn = {
  display: "inline-block",
  marginTop: "6px",
  background: "#22c55e",
  padding: "8px",
  borderRadius: "6px",
  color: "#fff",
  textDecoration: "none"
}

const text = { color: "#94a3b8" }
const errorText = { color: "#ef4444" }

export default TrackOrder