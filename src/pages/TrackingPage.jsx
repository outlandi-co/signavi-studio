import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import { getSocket } from "../services/socket"

const steps = [
  "payment_required",
  "paid",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

function TrackingPage() {
  const { id: paramId } = useParams()

  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const storedId = localStorage.getItem("lastOrderId")

    const finalId =
      paramId && paramId !== "null" && paramId !== "undefined"
        ? paramId
        : storedId

    if (!finalId) {
      setError("Missing order ID")
      return
    }

    fetchOrder(finalId)
  }, [paramId])

  const fetchOrder = async (id) => {
    try {
      setLoading(true)
      setError("")

      const res = await api.get(`/orders/${id}`)
      const data = res.data?.data || res.data

      setOrder(data)
    } catch  {
      setError("Order not found")
    } finally {
      setLoading(false)
    }
  }

  /* ================= REALTIME SOCKET ================= */
  useEffect(() => {
    if (!order?._id) return

    const socket = getSocket()

    socket.on("orderUpdated", (data) => {
      if (data.orderId === order._id) {
        console.log("⚡ LIVE UPDATE:", data)
        setOrder(data.order)
      }
    })

    return () => {
      socket.off("orderUpdated")
    }
  }, [order?._id])

  const getStepIndex = () => {
    const index = steps.indexOf(order?.status)
    return index === -1 ? 0 : index
  }

  const progress = ((getStepIndex() + 1) / steps.length) * 100

  return (
    <div style={wrapper}>
      <div style={card}>
        <h1 style={title}>📦 Track Your Order</h1>

        {loading && <p>Loading order...</p>}
        {error && <p style={errorStyle}>{error}</p>}

        {order && (
          <>
            <div style={infoBox}>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ${order.finalPrice?.toFixed(2)}</p>
            </div>

            <div style={{ marginTop: 25 }}>
              <div style={progressBar}>
                <div style={{ ...progressFill, width: `${progress}%` }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* STYLES */
const wrapper = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const card = {
  background: "#111",
  padding: 25,
  borderRadius: 12,
  width: 500
}

const title = { textAlign: "center" }

const infoBox = { marginTop: 15 }

const progressBar = {
  height: 8,
  background: "#1e293b",
  borderRadius: 5
}

const progressFill = {
  height: "100%",
  background: "#22c55e"
}

const errorStyle = { color: "red" }

export default TrackingPage