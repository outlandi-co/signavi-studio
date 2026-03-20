import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function QuoteResponse() {

  const { id } = useParams()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/quotes/${id}`)
      .then(res => setQuote(res.data))
  }, [id])

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const res = await api.post(`/stripe/create-quote-checkout/${id}`)
      window.location.href = res.data.url
    } catch (err) {
      console.error(err)
      alert("Checkout failed")
    }

    setLoading(false)
  }

  if (!quote) return <p>Loading...</p>

  const total = (quote.price || 0) + (quote.cleanupFee || 0)

  return (
    <div style={{ padding: "40px" }}>
      <h1>Review Your Quote</h1>

      <p><b>Name:</b> {quote.customerName}</p>
      <p><b>Notes:</b> {quote.adminNotes}</p>

      <p>Price: ${quote.price}</p>
      <p>Cleanup Fee: ${quote.cleanupFee}</p>

      <h2>Total: ${total}</h2>

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Redirecting..." : "Pay & Accept"}
      </button>
    </div>
  )
}

export default QuoteResponse