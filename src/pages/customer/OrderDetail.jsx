import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"

export default function OrderDetail() {

  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const steps = [
    { key: "payment_required", label: "Payment" },
    { key: "paid", label: "Paid" },
    { key: "production", label: "Production" },
    { key: "shipping", label: "Shipping" },
    { key: "delivered", label: "Delivered" }
  ]

  const getIndex = (status) => {
    const i = steps.findIndex(s => s.key === status)
    return i === -1 ? 0 : i
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>
  if (!order) return <p style={{ padding: 40 }}>Order not found</p>

  const current = getIndex(order.status)

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900, margin: "0 auto" }}>

      <h1>Order Details</h1>

      {/* TIMELINE */}
      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {steps.map((step, i) => (
          <div
            key={step.key}
            style={{
              flex: 1,
              height: 8,
              background: i <= current ? "#22c55e" : "#1e293b"
            }}
          />
        ))}
      </div>

      {/* INFO */}
      <p><strong>ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Qty:</strong> {order.quantity}</p>
      <p><strong>Type:</strong> {order.printType}</p>

      <p style={{ fontSize: 20, fontWeight: "bold" }}>
        💰 ${(order.finalPrice || order.price || 0).toFixed(2)}
      </p>

      {/* 🔥 BUTTONS */}
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>

        {/* INVOICE */}
        <button
          onClick={() => {
            window.open(`http://localhost:5050/api/orders/${order._id}/invoice`)
          }}
          style={btnBlue}
        >
          📄 Invoice
        </button>

        {/* REORDER */}
        <button
          onClick={async () => {
            try {
              const res = await api.post(`/orders/${order._id}/reorder`)
              window.location.href = `/checkout/${res.data.orderId}`
            } catch (err) {
              console.error(err)
              alert("Reorder failed")
            }
          }}
          style={btnGreen}
        >
          🔁 Reorder
        </button>

      </div>

    </div>
  )
}

const btnBlue = {
  padding: "10px 14px",
  background: "#3b82f6",
  border: "none",
  borderRadius: 6,
  color: "white",
  cursor: "pointer"
}

const btnGreen = {
  padding: "10px 14px",
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  color: "black",
  cursor: "pointer"
}