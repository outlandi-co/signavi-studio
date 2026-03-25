import { useParams } from "react-router-dom"
import { useState } from "react"
import api from "../services/api" // ✅ make sure this path is correct

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await api.post(`/stripe/create-checkout-session/${id}`)

      if (res?.data?.url) {
        window.location.href = res.data.url
      } else {
        throw new Error("No checkout URL returned")
      }

    } catch (err) {
      console.error("❌ Checkout Error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Checkout</h1>
      <p>Order: {id}</p>

      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleCheckout} // ✅ FIXED (you were missing this)
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Processing..." : "💳 Pay Now"}
      </button>
    </div>
  )
}