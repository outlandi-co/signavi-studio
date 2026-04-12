import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

export default function QuoteResponse() {

  const { id } = useParams()

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/quotes/${id}`)

        console.log("🔥 RAW QUOTE:", res.data)

        // ✅ SAFE FORMAT
        const safeQuote =
          res.data?.data || res.data || null

        setQuote(safeQuote)

      } catch (err) {
        console.error("❌ QUOTE LOAD ERROR:", err)
        setQuote(null)
      }
    }

    load()
  }, [id])

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    try {
      setLoading(true)

      // ✅ USE YOUR WORKING STRIPE ROUTE
      const res = await api.post(`/stripe/create-order-session/${id}`)

      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        throw new Error("No checkout URL returned")
      }

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert("Checkout failed")
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

  /* ================= CALC ================= */
  const price = Number(quote.price || 0)
  const cleanup = Number(quote.cleanupFee || 0)
  const quantity = Number(quote.quantity || 1)

  const total = price + cleanup

  /* ================= UI ================= */
  return (
    <div style={container}>

      <h1 style={title}>📄 Review Your Quote</h1>

      <div style={card}>
        <p><b>Name:</b> {quote.customerName || "Unknown"}</p>
        <p><b>Email:</b> {quote.email || "N/A"}</p>
        <p><b>Quantity:</b> {quantity}</p>

        {quote.adminNotes && (
          <p><b>Notes:</b> {quote.adminNotes}</p>
        )}

        <hr style={{ margin: "15px 0", opacity: 0.2 }} />

        <p>Base Price: ${price.toFixed(2)}</p>
        <p>Cleanup Fee: ${cleanup.toFixed(2)}</p>

        <h2 style={totalStyle}>
          Total: ${total.toFixed(2)}
        </h2>

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            ...button,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Redirecting..." : "💳 Pay & Accept"}
        </button>

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

const totalStyle = {
  color: "#22c55e",
  marginTop: 10
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