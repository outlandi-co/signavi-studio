import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../services/api"

function Success() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const sessionId = searchParams.get("session_id")

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState("processing")

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    let isMounted = true
    let attempts = 0

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/session/${sessionId}`)

        if (!isMounted) return

        if (res.data) {
          setOrder(res.data)

          if (res.data.status === "paid") {
            setStatus("paid")
            setLoading(false)
            return
          } else {
            setStatus("syncing")
          }
        }

      } catch {
        console.log("⚠️ Waiting for webhook...")
      }

      /* 🔁 RETRY */
      if (attempts < 15) {
        attempts++
        setTimeout(fetchOrder, 1500)
      } else {
        if (isMounted) {
          setLoading(false)
          setStatus("timeout")
        }
      }
    }

    fetchOrder()

    return () => {
      isMounted = false
    }
  }, [sessionId])

  /* ================= CLEAR CART ================= */
  useEffect(() => {
    localStorage.removeItem("cart")
  }, [])

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center"
      }}
    >
      <h1>🎉 Payment Successful</h1>

      {loading && (
        <p style={{ marginTop: "20px" }}>
          Processing your order...
        </p>
      )}

      {!loading && status === "syncing" && (
        <div style={{ marginTop: "20px" }}>
          <p>✅ Payment confirmed</p>
          <p>🔄 Finalizing your order...</p>
          <p style={{ fontSize: "12px", color: "#777" }}>
            (Webhook syncing in progress)
          </p>
        </div>
      )}

      {!loading && status === "timeout" && (
        <div style={{ marginTop: "20px" }}>
          <p>⚠️ Payment received</p>
          <p>Your order is still syncing.</p>
          <p style={{ fontSize: "12px", color: "#777" }}>
            Please refresh or check back shortly.
          </p>
        </div>
      )}

      {order && status === "paid" && (
        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <h3>Order ID: {order._id}</h3>

          <div style={{ marginTop: "20px" }}>
            {order.items?.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  padding: "10px 0"
                }}
              >
                <div>
                  <p style={{ margin: 0 }}>{item.name}</p>
                  <small>
                    ${item.price} x {item.quantity}
                  </small>
                </div>

                <strong>
                  ${(item.price * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "20px" }}>
            Total: ${Number(order.total || order.finalPrice || 0).toFixed(2)}
          </h2>

          <p style={{ marginTop: "10px", color: "green" }}>
            ✅ Payment Confirmed
          </p>
        </div>
      )}

      <button
        onClick={() => navigate("/store")}
        style={{
          marginTop: "30px",
          padding: "12px 20px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "6px"
        }}
      >
        Continue Shopping
      </button>
    </div>
  )
}

export default Success