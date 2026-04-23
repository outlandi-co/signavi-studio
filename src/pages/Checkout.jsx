import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../services/api"

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* =========================================================
     💳 AUTO CHECKOUT (WORKS WITHOUT LOGIN)
  ========================================================= */
  useEffect(() => {
    const startCheckout = async () => {
      try {
        console.log("🔥 START CHECKOUT:", id)

        if (!id) throw new Error("Missing order ID")

        const res = await api.post(`/square/create-payment/${id}`)

        const url = res?.data?.url

        if (!url) {
          throw new Error("No payment URL returned")
        }

        console.log("✅ REDIRECTING TO:", url)

        window.location.href = url

      } catch (err) {
        console.error("❌ AUTO CHECKOUT ERROR:", err)

        setError(
          err?.response?.data?.message ||
          "Failed to start checkout. Please try again."
        )

        setLoading(false)
      }
    }

    startCheckout()
  }, [id])

  /* =========================================================
     🔁 RETRY
  ========================================================= */
  const handleRetry = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await api.post(`/square/create-payment/${id}`)

      const url = res?.data?.url

      if (!url) {
        throw new Error("No payment URL")
      }

      window.location.href = url

    } catch (err) {
      console.error("❌ RETRY ERROR:", err)

      setError(
        err?.response?.data?.message ||
        "Checkout failed again. Please contact support."
      )

      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1>Checkout</h1>

        <p style={{ fontSize: 12, opacity: 0.6 }}>
          Order ID: {id}
        </p>

        {loading && (
          <p style={{ marginTop: 20 }}>
            🔄 Redirecting to secure payment...
          </p>
        )}

        {error && (
          <>
            <p style={{ color: "red", marginTop: 20 }}>
              {error}
            </p>

            <button onClick={handleRetry} style={btn}>
              🔁 Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0f172a",
  color: "#fff",
  padding: "40px"
}

const card = {
  maxWidth: "400px",
  width: "100%",
  background: "#111827",
  padding: "30px",
  borderRadius: "12px",
  textAlign: "center"
}

const btn = {
  marginTop: "20px",
  padding: "12px 20px",
  borderRadius: "8px",
  background: "#06b6d4",
  color: "#000",
  border: "none",
  cursor: "pointer"
}