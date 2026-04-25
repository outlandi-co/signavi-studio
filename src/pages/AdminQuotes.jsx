import { useEffect, useState } from "react"
import api from "../services/api"

const REASONS = [
  "Low resolution",
  "Incorrect file format",
  "Artwork not print-ready",
  "Design needs cleanup",
  "Other"
]

function AdminQuotes() {

  const [quotes, setQuotes] = useState([])
  const [prices, setPrices] = useState({})
  const [shipping, setShipping] = useState({})
  const [loadingId, setLoadingId] = useState(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    reload()
  }, [])

  const reload = async () => {
    const res = await api.get("/quotes")
    const data = res.data

    setQuotes(data)

    // preload values
    const p = {}
    const s = {}

    data.forEach(q => {
      p[q._id] = q.price || ""
      s[q._id] = q.shippingCost || ""
    })

    setPrices(p)
    setShipping(s)
  }

  /* ================= APPROVE ================= */
  const handleApprove = async (id) => {
    try {
      setLoadingId(id)

      await api.patch(`/quotes/${id}/approve`, {
        price: Number(prices[id] || 0),
        shippingCost: Number(shipping[id] || 0)
      })

      alert("✅ Approved — customer notified")
      reload()

    } catch (err) {
      console.error(err)
      alert("Approve failed")
    } finally {
      setLoadingId(null)
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async (id) => {
    try {
      const reason = prompt("Enter reason:\n\n" + REASONS.join("\n"))
      if (!reason) return

      const fee = prompt("Revision fee? (optional)") || 0

      await api.patch(`/quotes/${id}/deny`, {
        reason,
        fee
      })

      alert("❌ Denied — customer notified")
      reload()

    } catch (err) {
      console.error(err)
      alert("Deny failed")
    }
  }

  /* ================= SEND TO PAYMENT ================= */
  const handleSend = async (id) => {
    try {
      setLoadingId(id)

      await api.patch(`/quotes/${id}/send-to-payment`, {
        price: Number(prices[id] || 0),
        shippingCost: Number(shipping[id] || 0)
      })

      alert("💳 Sent to payment")
      reload()

    } catch (err) {
      console.error(err?.response?.data || err.message)

      alert(
        err?.response?.data?.message ||
        "Must approve before sending to payment"
      )
    } finally {
      setLoadingId(null)
    }
  }

  /* ================= STATUS COLORS ================= */
  const getStatusColor = (status) => {
    if (status === "approved") return "#22c55e"
    if (status === "denied") return "#ef4444"
    return "#facc15"
  }

  /* ================= UI ================= */
  return (
    <div style={{
      padding: 40,
      background: "#0f172a",
      color: "#fff"
    }}>

      <h1>📄 Admin Quotes</h1>

      {quotes.map(q => {
        const status = q.approvalStatus || "pending"

        return (
          <div
            key={q._id}
            style={{
              marginBottom: 20,
              padding: 20,
              background: "#1e293b",
              borderRadius: 8
            }}
          >

            <p><b>{q.customerName}</b></p>
            <p>{q.email}</p>
            <p>Qty: {q.quantity}</p>

            <p style={{
              color: getStatusColor(status),
              fontWeight: "bold"
            }}>
              Status: {status}
            </p>

            {/* 💰 PRICE */}
            <input
              type="number"
              placeholder="Set price"
              value={prices[q._id] || ""}
              onChange={(e) => setPrices({
                ...prices,
                [q._id]: e.target.value
              })}
              style={{ marginTop: 10, padding: 6 }}
            />

            {/* 🚚 SHIPPING */}
            <input
              type="number"
              placeholder="Shipping cost"
              value={shipping[q._id] || ""}
              onChange={(e) => setShipping({
                ...shipping,
                [q._id]: e.target.value
              })}
              style={{ marginTop: 10, padding: 6 }}
            />

            <div style={{
              display: "flex",
              gap: 10,
              marginTop: 10
            }}>

              <button
                onClick={() => handleApprove(q._id)}
                disabled={loadingId === q._id}
              >
                ✅ Approve
              </button>

              <button
                onClick={() => handleDeny(q._id)}
                disabled={loadingId === q._id}
              >
                ❌ Deny
              </button>

              <button
                onClick={() => handleSend(q._id)}
                disabled={
                  loadingId === q._id ||
                  status !== "approved"
                }
              >
                💳 Send to Payment
              </button>

            </div>

          </div>
        )
      })}
    </div>
  )
}

export default AdminQuotes