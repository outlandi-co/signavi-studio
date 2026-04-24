import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Success() {

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get("orderId")

  useEffect(() => {

    if (!orderId) {
      setLoading(false)
      return
    }

    const loadOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`)
        setOrder(res.data)
      } catch (err) {
        console.error("❌ Failed to load order:", err)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()

  }, [orderId])

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>

      <div style={{
        maxWidth: 500,
        width: "100%",
        textAlign: "center"
      }}>

        {loading && <p>Loading...</p>}

        {!loading && (
          <>
            <h1 style={{ fontSize: 28 }}>🎉 Payment Successful</h1>

            <p style={{ marginTop: 10, opacity: 0.7 }}>
              Your order has been received and is now being processed.
            </p>

            {order && (
              <div style={{
                marginTop: 20,
                background: "#111",
                padding: 20,
                borderRadius: 10
              }}>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ${order.finalPrice?.toFixed(2)}</p>
              </div>
            )}

            <button
              onClick={() => navigate(`/track/${orderId}`)}
              style={{
                marginTop: 20,
                padding: "10px 20px",
                background: "#22c55e",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              📦 Track Order
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: 10,
                display: "block",
                width: "100%",
                padding: 10,
                background: "#1e293b",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              🏠 Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}