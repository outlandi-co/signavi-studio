import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

export default function QuoteResponse() {
  const { id } = useParams()

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ================= LOAD QUOTE ================= */
  useEffect(() => {
    const loadQuote = async () => {
      try {
        console.log("📡 Fetching quote:", id)

        const res = await api.get(`/quotes/${id}`)

        const data = res?.data?.data || res.data

        console.log("📄 QUOTE LOADED:", data)

        setQuote(data)
      } catch (err) {
        console.error("❌ LOAD ERROR:", err.response?.data || err.message)
        setError("Failed to load quote")
      }
    }

    if (id) loadQuote()
  }, [id])

  /* ================= PAYMENT ================= */
  const handleCheckout = async () => {
    if (!quote) return

    if (quote.approvalStatus !== "approved") {
      alert("⏳ Awaiting artwork approval")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("💳 REQUEST PAYMENT LINK:", id)

      const res = await api.post(`/square/create-payment/${id}`)

      console.log("🧪 FULL RESPONSE:", res)

      const url = res?.data?.url

      if (!url) {
        console.error("❌ Missing URL:", res.data)
        throw new Error("No payment URL returned")
      }

      console.log("➡️ REDIRECTING TO:", url)

      // 🔥 Use assign (more reliable than href in some cases)
      window.location.assign(url)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR FULL:", err)
      console.error("❌ RESPONSE:", err.response?.data)

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Payment failed"

      setError(msg)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOADING STATE ================= */
  if (!quote) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>⏳ Loading quote...</h2>
      </div>
    )
  }

  const price = Number(quote.price || 0)

  /* ================= UI ================= */
  return (
    <div style={container}>
      <h1 style={title}>📄 Review Your Quote</h1>

      <div style={card}>
        <p><b>Name:</b> {quote.customerName}</p>
        <p><b>Email:</b> {quote.email}</p>
        <p><b>Quantity:</b> {quote.quantity}</p>

        <h2>${price.toFixed(2)}</h2>

        {/* 🔴 ERROR DISPLAY */}
        {error && (
          <p style={{ color: "red", marginTop: 10 }}>
            {error}
          </p>
        )}

        {/* ⏳ NOT APPROVED */}
        {quote.approvalStatus !== "approved" && (
          <div style={pendingBox}>
            ⏳ Awaiting artwork approval
          </div>
        )}

        {/* 💳 APPROVED */}
        {quote.approvalStatus === "approved" && (
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              ...button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Redirecting..." : "💳 Pay Now"}
          </button>
        )}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 40,
  background: "#020617",
  minHeight: "100vh",
  color: "white",
  textAlign: "center"
}

const title = {
  marginBottom: 20
}

const card = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 10,
  maxWidth: 500,
  margin: "0 auto"
}

const pendingBox = {
  marginTop: 15,
  padding: 10,
  background: "#f59e0b",
  borderRadius: 6,
  color: "black",
  fontWeight: "bold"
}

const button = {
  marginTop: 20,
  padding: "12px 24px",
  borderRadius: 6,
  border: "none",
  background: "#06b6d4",
  color: "black",
  fontWeight: "bold"
}

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#020617"
}