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
        const res = await api.get(`/quotes/${id}`)
        const data = res?.data?.data || res.data
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

      const res = await api.post(`/square/create-payment/${id}`)
      const url = res?.data?.url

      if (!url) throw new Error("No payment URL returned")

      window.location.assign(url)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      setError("Payment failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOADING ================= */
  if (!quote) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>⏳ Loading quote...</h2>
      </div>
    )
  }

  /* ================= PRICE CALC ================= */
  const subtotal = Number(quote.price || 0)

  const TAX_RATE = 0.0825 // 🔥 CHANGE IF NEEDED
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  /* ================= UI ================= */
  return (
    <div style={container}>
      <h1 style={title}>📄 Review Your Quote</h1>

      <div style={card}>
        <p><b>Name:</b> {quote.customerName}</p>
        <p><b>Email:</b> {quote.email}</p>
        <p><b>Quantity:</b> {quote.quantity}</p>

        <hr style={{ margin: "20px 0", opacity: 0.2 }} />

        {/* 💰 PRICING BREAKDOWN */}
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax (8.25%): ${tax.toFixed(2)}</p>

        <h2 style={{ marginTop: 10 }}>
          Total: ${total.toFixed(2)}
        </h2>

        {/* 🔴 ERROR */}
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
              opacity: loading ? 0.6 : 1
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
  fontWeight: "bold",
  cursor: "pointer"
}

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#020617"
}