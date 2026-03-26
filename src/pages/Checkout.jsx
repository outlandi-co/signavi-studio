import { useParams } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCheckout = async () => {
    /* 🔥 PREVENT DOUBLE CLICK */
    if (loading) return

    try {
      console.log("🚀 Checkout clicked:", id)

      setLoading(true)
      setError("")

      const res = await api.post(
        `/stripe/create-checkout-session/${id}`
      )

      console.log("✅ Stripe response:", res.data)

      if (res?.data?.url) {
        console.log("🌐 Redirecting to Stripe...")
        window.location.href = res.data.url
      } else {
        throw new Error("No checkout URL returned")
      }

    } catch (err) {
      console.error("❌ Checkout Error:", err)
      setError(
        err?.response?.data?.message ||
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Checkout</h1>

      <p style={{ opacity: 0.7 }}>Order ID:</p>
      <p style={{ fontWeight: "bold", marginBottom: 20 }}>
        {id}
      </p>

      {error && (
        <p style={{ color: "red", marginBottom: 15 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
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