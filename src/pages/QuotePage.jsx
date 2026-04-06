import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../services/api"

export default function QuotePage() {
  const { id } = useParams()

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/quotes/${id}`)
        setQuote(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [id])

  /* ================= PAY ================= */
  const handlePay = async () => {
    try {
      setLoading(true)

      const res = await api.post(`/stripe/create-checkout-session`, {
        items: [{
          name: quote.customerName || "Custom Quote",
          price: quote.price / 100,
          quantity: quote.quantity || 1
        }],
        customer: {
          name: quote.customerName,
          email: quote.email,
          orderId: quote._id
        }
      })

      window.location.href = res.data.url

    } catch (err) {
      console.error(err)
      alert("Payment failed")
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return <p>Loading...</p>

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Quote</h1>

      <p><strong>Name:</strong> {quote.customerName}</p>
      <p><strong>Email:</strong> {quote.email}</p>
      <p><strong>Quantity:</strong> {quote.quantity}</p>

      <h2>
        ${ (quote.price / 100).toFixed(2) }
      </h2>

      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          padding: "12px 24px",
          background: "#000",
          color: "#fff",
          border: "none"
        }}
      >
        {loading ? "Processing..." : "💳 Pay Now"}
      </button>
    </div>
  )
}