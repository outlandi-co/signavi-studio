import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const SOCKET_URL = "http://localhost:5050"

const steps = [
  "pending",
  "payment_required",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

const stepIcons = {
  pending: "🕒",
  payment_required: "💳",
  production: "🏭",
  shipping: "📦",
  shipped: "🚚",
  delivered: "✅"
}

function TrackOrder() {

  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)
  const deliveredRef = useRef(false)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data)

      /* 🔥 SAFE AUTO DELIVER */
      if (
        res.data.status === "shipped" &&
        !deliveredRef.current
      ) {
        deliveredRef.current = true

        await api.patch(`/orders/${id}/status`, {
          status: "delivered"
        })
      }

    } catch (err) {
      console.error("❌ TRACK ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  /* ================= INITIAL ================= */
  useEffect(() => {
    load()
  }, [load])

  /* ================= REAL-TIME ================= */
  useEffect(() => {
    socketRef.current = io(SOCKET_URL)

    socketRef.current.on("jobUpdated", (updated) => {
      if (updated._id === id) {
        setOrder(updated)
      }
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [id])

  if (loading) return <h2 style={{ color: "white" }}>Loading...</h2>
  if (!order) return <h2 style={{ color: "white" }}>Order not found</h2>

  const currentStep = steps.indexOf(order.status)

  /* ================= USE TIMELINE (FIXED) ================= */
  const history = order.timeline?.length
    ? order.timeline
    : steps.slice(0, currentStep + 1).map(step => ({
        status: step,
        date: order.updatedAt || order.createdAt
      }))

  return (
    <div style={{
      padding: 40,
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      textAlign: "center"
    }}>

      <h1>📦 Track Order</h1>

      <h2>{order.customerName}</h2>
      <p>Order ID: {order._id}</p>

      {/* 🔥 PROGRESS BAR */}
      <div style={{
        display: "flex",
        gap: 10,
        marginTop: 30
      }}>
        {steps.map((step, i) => (
          <div key={step} style={{ flex: 1 }}>
            <div style={{
              height: 10,
              borderRadius: 10,
              background: i <= currentStep
                ? "#22c55e"
                : "#1e293b"
            }} />
            <p style={{ fontSize: 12, marginTop: 5 }}>
              {step.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>

      {/* 🔥 STATUS */}
      <div style={{ marginTop: 30 }}>
        <h3>Status: {order.status}</h3>
      </div>

      {/* 🔥 TIMELINE (UPGRADED UI) */}
      <div style={{
        marginTop: 40,
        textAlign: "left",
        maxWidth: 500,
        marginInline: "auto",
        borderLeft: "2px solid #1e293b",
        paddingLeft: 20
      }}>
        <h3>📜 Order Timeline</h3>

        {history.map((h, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              marginBottom: 20
            }}
          >
            {/* DOT */}
            <div style={{
              position: "absolute",
              left: -29,
              top: 5,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#22c55e"
            }} />

            <div style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              background: "#0f172a",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #1e293b"
            }}>
              <span>{stepIcons[h.status] || "📌"}</span>

              <div>
                <div>{h.status.replace("_", " ")}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {new Date(h.date).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 TRACKING */}
      {order.trackingLink && (
        <a
          href={order.trackingLink}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: 20,
            color: "#38bdf8"
          }}
        >
          🚚 Track Shipment
        </a>
      )}

    </div>
  )
}

export default TrackOrder