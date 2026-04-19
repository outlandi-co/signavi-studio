import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

export default function QuoteResponse() {
  const { id } = useParams()

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/quotes/${id}`)

        const data = res?.data?.data || res.data
        setQuote(data)

      } catch (err) {
        console.error("❌ LOAD ERROR:", err.response?.data || err.message)
      }
    }

    load()
  }, [id])

  const handleCheckout = async () => {
    if (quote?.approvalStatus !== "approved") {
      alert("⏳ Awaiting artwork approval")
      return
    }

    try {
      setLoading(true)

      const res = await api.post(`/square/create-payment/${id}`)

      if (!res?.data?.url) {
        throw new Error("No payment URL returned")
      }

      window.location.href = res.data.url

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err.response?.data || err.message)
      alert(err?.response?.data?.message || "Payment blocked")
    } finally {
      setLoading(false)
    }
  }

  if (!quote) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>⏳ Loading quote...</h2>
      </div>
    )
  }

  const price = Number(quote.price || 0)

  return (
    <div style={container}>
      <h1 style={title}>📄 Review Your Quote</h1>

      <div style={card}>
        <p><b>Name:</b> {quote.customerName}</p>
        <p><b>Email:</b> {quote.email}</p>
        <p><b>Quantity:</b> {quote.quantity}</p>

        <h2>${price.toFixed(2)}</h2>

        {quote.approvalStatus !== "approved" && (
          <div style={pendingBox}>
            ⏳ Awaiting artwork approval
          </div>
        )}

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

const title = { marginBottom: 20 }

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