import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../services/api"

export default function Checkout() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* =========================================================
     💳 AUTO CHECKOUT (FROM EMAIL CLICK)
  ========================================================= */
  useEffect(() => {
    const startCheckout = async () => {
      try {
        console.log("🔥 START CHECKOUT:", id)

        const res = await api.post(`/square/create-payment/${id}`)

        const url = res?.data?.url

        if (!url) {
          throw new Error("No payment URL returned")
        }

        console.log("✅ REDIRECTING TO:", url)

        // 🔥 Redirect to Square checkout
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

    if (id) startCheckout()
  }, [id])

  /* =========================================================
     🔁 MANUAL RETRY BUTTON
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

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f172a",
      color: "#fff",
      padding: "40px"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        background: "#111827",
        padding: "30px",
        borderRadius: "12px",
        textAlign: "center"
      }}>
        <h1>Checkout</h1>

        <p style={{ fontSize: "12px", opacity: 0.6 }}>
          Order ID: {id}
        </p>

        {loading && (
          <p style={{ marginTop: "20px" }}>
            🔄 Redirecting to secure payment...
          </p>
        )}

        {error && (
          <>
            <p style={{ color: "red", marginTop: "20px" }}>
              {error}
            </p>

            <button
              onClick={handleRetry}
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                borderRadius: "8px",
                background: "#06b6d4",
                color: "#000",
                border: "none",
                cursor: "pointer"
              }}
            >
              🔁 Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}