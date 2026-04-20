import { useParams } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await api.post(`/square/create-payment/${id}`)

      if (!res?.data?.url) {
        throw new Error("No payment URL")
      }

      window.location.href = res.data.url

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      setError(err?.response?.data?.message || "Checkout failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Checkout</h1>
      <p>Order ID: {id}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          padding: "14px 28px",
          borderRadius: 6,
          background: loading ? "#999" : "#000",
          color: "white"
        }}
      >
        {loading ? "Processing..." : "💳 Pay Now"}
      </button>
    </div>
  )
}