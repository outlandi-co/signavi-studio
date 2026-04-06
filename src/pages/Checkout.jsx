import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../services/api"

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState(null)

  console.log("🧠 PARAM ID:", id)

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!id) return

        console.log("📦 LOADING ORDER:", id)

        const res = await api.get(`/orders/${id}`)

        console.log("✅ ORDER LOADED:", res.data)

        setOrder(res.data)

      } catch (err) {
        console.error("❌ LOAD ORDER ERROR:", err)
        setError("Failed to load order")
      }
    }

    loadOrder()
  }, [id])

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    console.log("🔥 BUTTON CLICKED")

    if (!id) {
      console.log("❌ NO ID FOUND")
      setError("Invalid order ID")
      return
    }

    if (!order) {
      setError("Order not loaded")
      return
    }

    if (loading) return

    try {
      setLoading(true)
      setError("")

      /* 🔥 BUILD STRIPE PAYLOAD FROM ORDER */
      const items = [
        {
          name: order.customerName || "Custom Order",
          price: (order.finalPrice || order.price || 0) / 100,
          quantity: order.quantity || 1
        }
      ]

const customer = {
  name: order.customerName,
  email: order.email,
  orderId: order._id   // 🔥 THIS IS REQUIRED
}
      console.log("🟢 SENDING TO STRIPE:", { items, customer })

      const res = await api.post(
        "/stripe/create-checkout-session",
        { items, customer }
      )

      console.log("✅ STRIPE RESPONSE:", res.data)

      if (!res?.data?.url) {
        throw new Error("No checkout URL returned")
      }

      console.log("🚀 REDIRECTING TO STRIPE...")
      window.location.href = res.data.url

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)

      if (err.response) {
        console.error("❌ SERVER RESPONSE:", err.response.data)
      }

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Checkout failed"

      setError(message)

    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Checkout</h1>

      <p style={{ opacity: 0.7 }}>Order ID:</p>
      <p style={{ fontWeight: "bold", marginBottom: 20 }}>
        {id || "❌ NO ID"}
      </p>

      {order && (
        <div style={{ marginBottom: 20 }}>
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p>
            <strong>Total:</strong> $
            {((order.finalPrice || order.price || 0) / 100).toFixed(2)}
          </p>
        </div>
      )}

      {error && (
        <p style={{ color: "red", marginBottom: 15 }}>
          {error}
        </p>
      )}

      <button
        onClick={() => {
          console.log("👆 BUTTON PRESS DETECTED")
          handleCheckout()
        }}
        disabled={loading || !order}
        style={{
          padding: "14px 28px",
          fontSize: "16px",
          borderRadius: "6px",
          border: "none",
          background: loading ? "#999" : "#000",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "0.2s"
        }}
      >
        {loading ? "Processing..." : "💳 Pay Now"}
      </button>
    </div>
  )
}