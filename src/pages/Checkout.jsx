import { useParams } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  console.log("🧠 PARAM ID:", id)

  const handleCheckout = async () => {
    console.log("🔥 BUTTON CLICKED")

    if (!id) {
      console.log("❌ NO ID FOUND")
      setError("Invalid order ID")
      return
    }

    if (loading) return

    try {
      setLoading(true)
      setError("")

      const fullUrl = `${api.defaults.baseURL}/stripe/create-checkout-session/${id}`
      console.log("🌐 FULL URL:", fullUrl)

      const res = await api.post(
        `/stripe/create-checkout-session/${id}`
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

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Checkout</h1>

      <p style={{ opacity: 0.7 }}>Order ID:</p>
      <p style={{ fontWeight: "bold", marginBottom: 20 }}>
        {id || "❌ NO ID"}
      </p>

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